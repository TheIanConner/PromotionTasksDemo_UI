import { useState, useEffect, useCallback } from "react";
import { User, Release, TaskStatus, PromotionTask } from "../types";
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

  const handleTaskUpdate = async (task: PromotionTask) => {
    try {
      await api.updateTask(task);
      // No need to reload all data, the UI is updated immediately in ReleaseCard
    } catch (err) {
      setError("Failed to update task");
      throw err; // Re-throw to allow ReleaseCard to handle the error
    }
  };

  const handleTaskCreate = async (task: Omit<PromotionTask, "taskId">) => {
    try {
      const createdTask = await api.createPromotionTask(task);
      return createdTask;
    } catch (err) {
      setError("Failed to create task");
      throw err; // Re-throw to allow ReleaseCard to handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-blue-400" aria-live="polite">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header with Logout Button */}
      <header className="bg-[#111111] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-white font-medium">Welcome, {user.name}</div>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-black bg-white hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 mr-1" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">
            <div className="max-w-2xl">
              <span className="inline-block text-blue-400 text-sm font-medium tracking-wider uppercase mb-3">
                How it works
              </span>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Manage promotion <br /> tasks for your releases
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Un:hurd works around the clock so you don't have to. From
                building hype before your release to keeping the momentum going
                after, we take the stress out of promotion. More time for music.
                More real fans. Less guesswork.
              </p>
            </div>

            {/* Music-themed Image - Hidden on mobile, visible on md and up */}
            <div className="hidden md:block md:w-[22.5%] flex-shrink-0 relative self-center">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10"
                  aria-hidden="true"
                ></div>
                <div
                  className="absolute inset-0 bg-gradient-to-l from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10"
                  aria-hidden="true"
                ></div>
                <img
                  src="https://img.freepik.com/premium-photo/young-female-musician-headphones-performing-dark-background-neon-light-concept-music-hobby-festival-entertainment-emotions-neoned-modern-artwork_1028938-461020.jpg"
                  alt="Musician with headphones in neon lighting"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Releases Section */}
        <section
          className="max-w-7xl mx-auto px-6 py-6"
          aria-labelledby="releases-heading"
        >
          <div className="mb-4">
            <h2
              id="releases-heading"
              className="inline-block text-blue-400 text-sm font-medium tracking-wider uppercase"
            >
              Your Releases
            </h2>
          </div>
          <div className="mb-6">
            <p className="text-gray-400 text-lg leading-relaxed">
              Manage your promotion tasks for each release
            </p>
          </div>
          {error && (
            <div
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6"
              role="alert"
              aria-live="assertive"
            >
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
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
              />
            ))}
          </div>
          {releases.length === 0 && (
            <div
              className="text-center text-gray-400 mt-8 p-8 border border-gray-800 rounded-2xl bg-[#111111]"
              aria-live="polite"
            >
              No releases found. Create your first release to get started!
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm"
              aria-label="Terms and conditions"
            >
              Terms and conditions
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
          </div>
          <div className="flex space-x-5">
            <a
              href="#"
              className="text-gray-400 hover:text-white"
              aria-label="LinkedIn"
            >
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                aria-hidden="true"
              >
                <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white"
              aria-label="Instagram"
            >
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white"
              aria-label="Twitter X"
            >
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white"
              aria-label="YouTube"
            >
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white"
              aria-label="TikTok"
            >
              <svg
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
