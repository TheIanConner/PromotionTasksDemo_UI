import { useState, useEffect, useCallback } from "react";
import { User, Release, TaskStatus } from "../types";
import { api } from "../api/client";
import ReleaseCard from "./ReleaseCard";
import { LogOut } from "lucide-react";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUserData = useCallback(async () => {
    try {
      const userData = await api.getUserById(user.userId);
      setReleases(userData.releases || []);
    } catch (err) {
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleTaskStatusUpdate = async (
    taskId: number,
    newStatus: TaskStatus
  ) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      // No need to reload all data, the UI is updated immediately in ReleaseCard
    } catch (err) {
      setError("Failed to update task status");
      throw err; // Re-throw to allow ReleaseCard to handle the error
    }
  };

  const handleTaskPriorityUpdate = async (
    taskId: number,
    newPriority: number
  ) => {
    try {
      await api.updateTaskPriority(taskId, newPriority);
      // No need to reload all data, the UI is updated immediately in ReleaseCard
    } catch (err) {
      setError("Failed to update task priority");
      throw err; // Re-throw to allow ReleaseCard to handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-blue-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header with Logout Button */}
      <header className="bg-[#111111] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-white font-medium">Welcome, {user.name}</div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
          <div className="max-w-2xl">
            <span className="inline-block text-blue-400 text-sm font-medium tracking-wider uppercase mb-3">
              How it works
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Manage your promotion <br /> tasks for your releases
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Un:hurd works around the clock so you don't have to. From building
              hype before your release to keeping the momentum going after, we
              take the stress out of promotion. More time for music. More real
              fans. Less guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* Releases Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-4">
          <h2 className="inline-block text-blue-400 text-sm font-medium tracking-wider uppercase">
            Your Releases
          </h2>
        </div>
        <div className="mb-6">
          <h2 className="text-gray-400 text-lg leading-relaxed">
            Manage your promotion tasks for each release
          </h2>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {releases.map((release) => (
            <ReleaseCard
              key={release.releaseId}
              release={release}
              onTaskStatusUpdate={handleTaskStatusUpdate}
              onTaskPriorityUpdate={handleTaskPriorityUpdate}
            />
          ))}
        </div>
        {releases.length === 0 && (
          <div className="text-center text-gray-400 mt-8 p-8 border border-gray-800 rounded-2xl bg-[#111111]">
            No releases found. Create your first release to get started!
          </div>
        )}
      </section>
    </div>
  );
}
