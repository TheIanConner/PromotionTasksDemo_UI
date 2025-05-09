/// <reference types="vite/client" />

import axios, { AxiosError } from "axios";
import {
  User,
  Release,
  ReleaseType,
  PromotionTask,
  TaskStatus,
  TaskPriority,
} from "../types";

// Get the API base URL from environment or use a default for testing
const getApiBaseUrl = (): string => {
  // Check if import.meta.env is available (Vite environment)
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL
  ) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback for test environment
  return "http://localhost:5110";
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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

  createRelease: async (release: {
    userId: number;
    title: string;
    type: ReleaseType;
    releaseDate: string;
  }): Promise<Release> => {
    return executeApiCall(async () => {
      const response = await apiClient.post("/Release", release);
      return response.data;
    }, "createRelease");
  },

  updateRelease: async (
    releaseId: number,
    release: Partial<Omit<Release, "releaseId">>
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

  createPromotionTask: async (task: {
    releaseId: number;
    status: TaskStatus;
    priority: TaskPriority;
    description: string;
  }): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.post("/PromotionTasks", task);
      return response.data;
    }, "createPromotionTask");
  },

  updateTask: async (task: PromotionTask): Promise<PromotionTask> => {
    return executeApiCall(async () => {
      const response = await apiClient.post(`/PromotionTasks`, task);
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
    priority: TaskPriority
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
