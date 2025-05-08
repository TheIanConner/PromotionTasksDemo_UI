/// <reference types="vite/client" />

import axios, { AxiosError } from "axios";
import { User, Release, PromotionTask, TaskStatus } from "../types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to safely execute API calls with error handling
const executeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorContext: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error in ${errorContext}:`, axiosError.message);
    throw error;
  }
};

export const api = {
  // User endpoints
  getUserByName: async (name: string): Promise<User> => {
    return executeApiCall(async () => {
      const response = await apiClient.get(`/User/name/${name}`);
      return response.data;
    }, "getUserByName");
  },

  getUserById: async (userId: number): Promise<User> => {
    return executeApiCall(async () => {
      const response = await apiClient.get(`/User/${userId}`);
      return response.data;
    }, "getUserById");
  },

  // Release endpoints
  getReleasesByUserId: async (userId: number): Promise<Release[]> => {
    return executeApiCall(async () => {
      const response = await apiClient.get(`/Release/user/${userId}`);
      return response.data;
    }, "getReleasesByUserId");
  },

  createRelease: async (
    release: Omit<Release, "releaseId">
  ): Promise<Release> => {
    return executeApiCall(async () => {
      const response = await apiClient.post("/Release", release);
      return response.data;
    }, "createRelease");
  },

  updateRelease: async (
    releaseId: number,
    release: Partial<Release>
  ): Promise<void> => {
    return executeApiCall(async () => {
      await apiClient.put(`/Release/${releaseId}`, release);
    }, "updateRelease");
  },

  deleteRelease: async (releaseId: number): Promise<void> => {
    return executeApiCall(async () => {
      await apiClient.delete(`/Release/${releaseId}`);
    }, "deleteRelease");
  },

  // Promotion Task endpoints
  getPromotionTasks: async (): Promise<PromotionTask[]> => {
    return executeApiCall(async () => {
      const response = await apiClient.get("/PromotionTasks");
      return response.data;
    }, "getPromotionTasks");
  },

  createPromotionTask: async (
    task: Omit<PromotionTask, "taskId">
  ): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.post("/PromotionTasks", task);
      return response.data;
    }, "createPromotionTask");
  },

  updateTask: async (task: PromotionTask): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.post("/PromotionTasks", task);
      return response.data;
    }, "updateTask");
  },

  updateTaskStatus: async (
    taskId: number,
    status: TaskStatus
  ): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.put(
        `/PromotionTasks/${taskId}/status`,
        status
      );
      return response.data;
    }, "updateTaskStatus");
  },

  updateTaskPriority: async (
    taskId: number,
    priority: number
  ): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.put(
        `/PromotionTasks/${taskId}/priority`,
        priority
      );
      return response.data;
    }, "updateTaskPriority");
  },
};
