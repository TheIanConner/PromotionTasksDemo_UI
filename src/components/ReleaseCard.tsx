import { useState } from "react";
import {
  Release,
  PromotionTask,
  TaskStatus,
  TaskPriority,
  ReleaseType,
} from "../types";
import {
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Circle,
  Clock,
  Disc,
  Album as AlbumIcon,
  Radio,
  Disc3,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  ListTodo,
} from "lucide-react";
import toast from "react-hot-toast";
import TaskCelebration from "./TaskCelebration";

interface ReleaseCardProps {
  release: Release;
  onTaskStatusUpdate: (taskId: number, status: TaskStatus) => void;
  onTaskPriorityUpdate: (taskId: number, priority: number) => void;
}

const generatePlaceholderArt = (
  releaseId: number,
  type: ReleaseType,
  title: string
) => {
  // Create a deterministic but unique color palette for each release
  const hue1 = (releaseId * 137.5) % 360;
  const hue2 = (hue1 + 40) % 360;

  // Base styles that will be common across all types
  const baseColor = `hsla(${hue1}, 70%, 50%, 0.8)`;
  const accentColor = `hsla(${hue2}, 70%, 50%, 0.8)`;

  const commonStyles = {
    background: `#0A0A0A`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    width: "100%",
    height: "100%",
    position: "relative" as const,
  };

  // Get first letter or first two letters of title
  const initials = title
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  switch (type) {
    case ReleaseType.Single:
      return (
        <div style={commonStyles} className="group">
          <Disc3
            className="w-12 h-12 absolute opacity-20"
            style={{ color: baseColor }}
          />
          <span className="text-xl font-bold" style={{ color: accentColor }}>
            {initials}
          </span>
        </div>
      );

    case ReleaseType.EP:
      return (
        <div style={commonStyles} className="group">
          <Disc
            className="w-12 h-12 absolute opacity-20"
            style={{ color: baseColor }}
          />
          <span className="text-xl font-bold" style={{ color: accentColor }}>
            EP
          </span>
        </div>
      );

    case ReleaseType.Album:
      return (
        <div style={commonStyles} className="group">
          <AlbumIcon
            className="w-12 h-12 absolute opacity-20"
            style={{ color: baseColor }}
          />
          <span className="text-xl font-bold" style={{ color: accentColor }}>
            {initials}
          </span>
        </div>
      );

    case ReleaseType.Mixtape:
      return (
        <div style={commonStyles} className="group">
          <Radio
            className="w-12 h-12 absolute opacity-20"
            style={{ color: baseColor }}
          />
          <span className="text-xl font-bold" style={{ color: accentColor }}>
            MIX
          </span>
        </div>
      );
  }
};

const generateGradient = (releaseId: number, title: string) => {
  // Create a deterministic but unique color palette for each release
  const hue1 = (releaseId * 137.5) % 360; // Golden ratio * 360
  const hue2 = (hue1 + 40) % 360; // Complementary color
  const hue3 = (hue1 + 80) % 360; // Triadic color

  // Use the title length to influence the gradient pattern
  const patternOffset = (title.length * 15) % 100;

  return {
    background: `linear-gradient(${45 + patternOffset}deg, 
      hsla(${hue1}, 70%, 50%, 0.1) 0%,
      hsla(${hue2}, 70%, 50%, 0.15) 50%,
      hsla(${hue3}, 70%, 50%, 0.2) 100%)`,
    filter: "blur(0px)",
    opacity: 0.8,
  };
};

export default function ReleaseCard({
  release,
  onTaskStatusUpdate,
  onTaskPriorityUpdate,
}: ReleaseCardProps) {
  const [tasks, setTasks] = useState<PromotionTask[]>(
    release.promotionTasks?.sort((a, b) => a.priority - b.priority) || []
  );
  const [showTasks, setShowTasks] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<number | null>(
    null
  );
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);

  // Calculate task statistics
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatus.Done
  ).length;
  const totalTasks = tasks.length;

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Done:
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case TaskStatus.InProgress:
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Done:
        return "Done";
      case TaskStatus.InProgress:
        return "In Progress";
      default:
        return "To Do";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Urgent:
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case TaskPriority.High:
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case TaskPriority.Medium:
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  const handleStatusUpdate = async (
    taskId: number,
    currentStatus: TaskStatus
  ) => {
    const newStatus = (currentStatus + 1) % 3;

    // Update UI immediately
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskId === taskId ? { ...task, status: newStatus } : task
      )
    );

    // Trigger celebration if the task is marked as done
    if (newStatus === TaskStatus.Done) {
      setCelebratingTaskId(taskId);
      setAnimatingTaskId(taskId);
      setTimeout(() => setAnimatingTaskId(null), 600); // Slightly longer than animation duration
    }

    // Call the API to update the backend
    try {
      await onTaskStatusUpdate(taskId, newStatus);
      toast.success(`Task status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      // Revert the UI change if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: currentStatus } : task
        )
      );
      toast.error("Failed to update task status");

      // Clear celebration effects if there was an error
      if (celebratingTaskId === taskId) {
        setCelebratingTaskId(null);
      }
      if (animatingTaskId === taskId) {
        setAnimatingTaskId(null);
      }
    }
  };

  const handlePriorityUpdate = async (taskId: number, newPriority: number) => {
    // Find the current task
    const currentTask = tasks.find((task) => task.taskId === taskId);
    if (!currentTask) return;

    // Update UI immediately
    setTasks((prevTasks) =>
      prevTasks
        .map((task) =>
          task.taskId === taskId ? { ...task, priority: newPriority } : task
        )
        .sort((a, b) => a.priority - b.priority)
    );

    // Call the API to update the backend
    try {
      await onTaskPriorityUpdate(taskId, newPriority);
      toast.success(`Task priority updated to ${newPriority + 1}`);
    } catch (error) {
      // Revert the UI change if the API call fails
      setTasks((prevTasks) =>
        prevTasks
          .map((task) =>
            task.taskId === taskId
              ? { ...task, priority: currentTask.priority }
              : task
          )
          .sort((a, b) => a.priority - b.priority)
      );
      toast.error("Failed to update task priority");
    }
  };

  return (
    <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 backdrop-blur-xl transition-colors hover:border-gray-700">
      {/* Generated Graphic with Album Art */}
      <div
        className="h-24 -mx-6 -mt-6 mb-6 rounded-t-2xl relative"
        style={generateGradient(release.releaseId, release.title)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111111]" />

        {/* Album Art Container */}
        <div className="absolute right-6 -bottom-6 w-24 h-24 rounded-xl overflow-hidden border-2 border-[#111111] shadow-lg">
          {release.coverArt ? (
            <img
              src={release.coverArt}
              alt={`${release.title} cover art`}
              className="w-full h-full object-cover"
            />
          ) : (
            generatePlaceholderArt(
              release.releaseId,
              release.type,
              release.title
            )
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {release.title}
        </h3>
        <p className="text-gray-400 text-sm">
          Release Date: {new Date(release.releaseDate).toLocaleDateString()}
        </p>
        {release.description && (
          <p className="text-gray-500 mt-2 text-sm">{release.description}</p>
        )}
      </div>

      {/* Task management toggle button */}
      <button
        onClick={() => setShowTasks(!showTasks)}
        className="flex items-center justify-between w-full bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 mb-3 hover:border-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <ListTodo className="w-5 h-5 text-blue-400" />
          <span className="text-gray-300">Promotion Tasks</span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Task counter badge */}
          {totalTasks > 0 && (
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                {completedTasks} / {totalTasks} completed
              </span>
            </div>
          )}
          {showTasks ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {showTasks && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className={`bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gray-700 transition-colors relative ${
                animatingTaskId === task.taskId
                  ? "task-complete-animation task-complete-shimmer"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleStatusUpdate(task.taskId, task.status)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  {getStatusIcon(task.status)}
                </button>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {task.description}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ml-1 ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  Priority&nbsp;{task.priority + 1}
                </span>
                <div className="flex flex-col">
                  <button
                    onClick={() =>
                      handlePriorityUpdate(task.taskId, task.priority - 1)
                    }
                    disabled={task.priority === 0}
                    className="text-gray-600 hover:text-gray-300 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handlePriorityUpdate(task.taskId, task.priority + 1)
                    }
                    disabled={task.priority === 3}
                    className="text-gray-600 hover:text-gray-300 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Celebration container */}
              <div
                id="task-celebration-container"
                className="absolute inset-0 overflow-hidden pointer-events-none z-10"
              >
                <TaskCelebration
                  isActive={celebratingTaskId === task.taskId}
                  onComplete={() => setCelebratingTaskId(null)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No tasks message when list is expanded but empty */}
      {showTasks && tasks.length === 0 && (
        <div className="text-center text-gray-400 py-6 border border-gray-800 rounded-xl bg-[#0A0A0A]">
          No tasks found for this release
        </div>
      )}
    </div>
  );
}
