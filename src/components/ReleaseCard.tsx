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
  ListTodo,
  Trash2,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import TaskCelebration from "./TaskCelebration";

interface ReleaseCardProps {
  release: Release;
  onTaskStatusUpdate: (taskId: number, status: TaskStatus) => void;
  onTaskPriorityUpdate: (taskId: number, priority: number) => void;
  onTaskUpdate: (task: PromotionTask) => void;
  onTaskCreate: (task: Omit<PromotionTask, "taskId">) => Promise<PromotionTask>;
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
  onTaskUpdate,
  onTaskCreate,
}: ReleaseCardProps) {
  const [tasks, setTasks] = useState<PromotionTask[]>(
    release.promotionTasks?.sort((a, b) => a.priority - b.priority) || []
  );
  const [showTasks, setShowTasks] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<number | null>(
    null
  );
  const [animatingTaskId, setAnimatingTaskId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(TaskPriority.Low);

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
      setAnimatingTaskId(taskId);
      setTimeout(() => setAnimatingTaskId(null), 500);
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

  const startEditingTask = (taskId: number, description: string) => {
    setEditingTaskId(taskId);
    setEditText(description);
  };

  const handleDescriptionUpdate = async (taskId: number) => {
    // Find the current task
    const currentTask = tasks.find((task) => task.taskId === taskId);
    if (!currentTask) return;

    const currentDescription = currentTask.description;
    if (editText === currentDescription) {
      setEditingTaskId(null);
      return;
    }

    // Create updated task
    const updatedTask = {
      ...currentTask,
      description: editText,
    };

    // Update UI immediately
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.taskId === taskId ? updatedTask : task))
    );

    setEditingTaskId(null);

    // Call the API to update the backend
    try {
      await onTaskUpdate(updatedTask);
      toast.success("Task description updated");
    } catch (error) {
      // Revert the UI change if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId
            ? { ...task, description: currentDescription }
            : task
        )
      );
      toast.error("Failed to update task description");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    // Find the current task
    const currentTask = tasks.find((task) => task.taskId === taskId);
    if (!currentTask) return;

    // TODO: Add a confirmation modal instead of a simple alert
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    // Create updated task with deleted set to true
    const updatedTask = {
      ...currentTask,
      deleted: true,
    };

    // Update UI immediately by removing the task
    setTasks((prevTasks) => prevTasks.filter((task) => task.taskId !== taskId));

    // Call the API to update the backend
    try {
      await onTaskUpdate(updatedTask);
      toast.success("Task deleted successfully");
    } catch (error) {
      // Revert the UI change if the API call fails
      setTasks((prevTasks) =>
        [...prevTasks, currentTask].sort((a, b) => a.priority - b.priority)
      );
      toast.error("Failed to delete task");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) {
      toast.error("Task description cannot be empty");
      return;
    }

    const newTask: Omit<PromotionTask, "taskId"> = {
      releaseId: release.releaseId,
      status: TaskStatus.ToDo,
      priority: newTaskPriority,
      description: newTaskDescription.trim(),
      deleted: false,
    };

    try {
      const createdTask = await onTaskCreate(newTask);
      setTasks((prevTasks) =>
        [...prevTasks, createdTask].sort((a, b) => a.priority - b.priority)
      );
      setNewTaskDescription("");
      setIsAddingTask(false);
      setNewTaskPriority(TaskPriority.Low);
      toast.success("New task added successfully");
    } catch (error) {
      toast.error("Failed to add new task");
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
        className={`flex items-center justify-between w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-3 hover:border-blue-500/30 transition-all duration-300 ${
          showTasks ? "shadow-[0_0_15px_rgba(59,130,246,0.2)]" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          <ListTodo className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-medium">Promotion Tasks</span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Task counter badge - keep this in the button */}
          {totalTasks > 0 && (
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full text-xs font-medium">
                {completedTasks} / {totalTasks} completed
              </span>
            </div>
          )}
          <div className="bg-blue-500/20 rounded-full p-1">
            <ChevronRight
              className={`w-4 h-4 text-blue-300 transition-transform duration-500 ease-in-out ${
                showTasks ? "transform rotate-90" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Add Task Button - Always visible */}
      <div className="mb-3">
        {isAddingTask ? (
          <div className="bg-[#0D0D0D] border border-blue-500/20 rounded-xl p-3">
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description..."
              className="w-full bg-[#1A1A1A] text-gray-300 px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 resize-none mb-3"
              rows={3}
              autoFocus
            />
            <div className="flex flex-wrap items-center justify-between mb-3">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="text-gray-400 text-sm">Priority:</span>
                {[
                  TaskPriority.Low,
                  TaskPriority.Medium,
                  TaskPriority.High,
                  TaskPriority.Urgent,
                ].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTaskPriority(priority)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      newTaskPriority === priority
                        ? getPriorityColor(priority) +
                          " ring-2 ring-offset-1 ring-offset-[#0D0D0D] ring-opacity-60"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {priority === TaskPriority.Low
                      ? "Low"
                      : priority === TaskPriority.Medium
                      ? "Medium"
                      : priority === TaskPriority.High
                      ? "High"
                      : "Urgent"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskDescription("");
                  setNewTaskPriority(TaskPriority.Low);
                }}
                className="px-3 py-1 text-sm text-gray-400 bg-[#0A0A0A] hover:bg-[#161616] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-3 py-1 text-sm text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-md transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center justify-center w-full px-4 py-2 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add New Task</span>
          </button>
        )}
      </div>

      {showTasks && (
        <div className="mt-4 mb-2">
          <div className="space-y-3 bg-[#0D0D0D]">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className={`bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 flex flex-wrap items-start justify-between group hover:border-gray-700 transition-colors relative ${
                  animatingTaskId === task.taskId
                    ? "task-complete-animation task-complete-shimmer"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleStatusUpdate(task.taskId, task.status)}
                    className="focus:outline-none transition-transform hover:scale-110 flex-shrink-0 mt-0.5"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  {editingTaskId === task.taskId ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => handleDescriptionUpdate(task.taskId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleDescriptionUpdate(task.taskId);
                        } else if (e.key === "Escape") {
                          setEditingTaskId(null);
                        }
                      }}
                      className="flex-1 w-full min-w-0 bg-[#1A1A1A] text-gray-300 px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-gray-300 group-hover:text-white transition-colors cursor-pointer hover:underline flex-1 break-words whitespace-normal ${
                        task.status === TaskStatus.Done
                          ? "line-through text-gray-500"
                          : ""
                      }`}
                      style={{ wordBreak: "break-word" }}
                      onClick={() =>
                        startEditingTask(task.taskId, task.description)
                      }
                    >
                      {task.description}
                    </span>
                  )}
                </div>

                {/* Task Priority */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (task.priority > TaskPriority.Urgent) {
                        handlePriorityUpdate(task.taskId, task.priority - 1);
                      }
                    }}
                    className="text-gray-600 hover:text-white transition-colors p-1 focus:outline-none rounded"
                    disabled={task.priority <= TaskPriority.Urgent}
                    aria-label="Increase priority"
                  >
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <div
                    className={`px-2 py-1 rounded-md text-xs ${getPriorityColor(
                      task.priority as TaskPriority
                    )}`}
                    aria-label={`Priority: ${task.priority + 1}`}
                  >
                    {task.priority + 1}
                  </div>

                  <button
                    onClick={() => {
                      if (task.priority < TaskPriority.Low) {
                        handlePriorityUpdate(task.taskId, task.priority + 1);
                      }
                    }}
                    className="text-gray-600 hover:text-white transition-colors p-1 focus:outline-none rounded"
                    disabled={task.priority >= TaskPriority.Low}
                    aria-label="Decrease priority"
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleDeleteTask(task.taskId)}
                    className="text-gray-500 hover:text-red-400 transition-colors focus:outline-none p-1 ml-1 rounded-full hover:bg-red-500/10"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

          {/* Progress bar at bottom of task list */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-gray-500 text-xs">Task Progress</span>
                <span className="text-gray-400 text-xs font-medium">
                  {completedTasks} of {totalTasks} completed
                </span>
              </div>
              <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    totalTasks === 0
                      ? "bg-gray-700"
                      : completedTasks === totalTasks
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      totalTasks === 0
                        ? 0
                        : Math.round((completedTasks / totalTasks) * 100)
                    }%`,
                  }}
                  role="progressbar"
                  aria-valuenow={
                    totalTasks === 0
                      ? 0
                      : Math.round((completedTasks / totalTasks) * 100)
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No tasks message when list is expanded but empty */}
      {showTasks && tasks.length === 0 && (
        <div className="mt-4 mb-2">
          <div className="text-center text-gray-400 py-8 border border-gray-800/50 rounded-xl bg-[#0D0D0D]">
            No tasks found for this release
          </div>
        </div>
      )}
    </div>
  );
}
