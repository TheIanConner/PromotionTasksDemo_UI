import axios from "axios";
import { User, Release, PromotionTask, TaskStatus } from "../types";

const apiClient = axios.create({
  baseURL: "/api", // TODO: Change to the correct URL based on the environment
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // User endpoints
  getUserByName: async (name: string): Promise<User> => {
    const response = await apiClient.get(`/User/name/${name}`);
    return response.data;
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/User/${userId}`);
    return response.data;
  },

  // Release endpoints
  getReleasesByUserId: async (userId: number): Promise<Release[]> => {
    const response = await apiClient.get(`/Release/user/${userId}`);
    return response.data;
  },

  createRelease: async (
    release: Omit<Release, "releaseId">
  ): Promise<Release> => {
    const response = await apiClient.post("/Release", release);
    return response.data;
  },

  updateRelease: async (
    releaseId: number,
    release: Partial<Release>
  ): Promise<void> => {
    await apiClient.put(`/Release/${releaseId}`, release);
  },

  deleteRelease: async (releaseId: number): Promise<void> => {
    await apiClient.delete(`/Release/${releaseId}`);
  },

  // Promotion Task endpoints
  getPromotionTasks: async (): Promise<PromotionTask[]> => {
    const response = await apiClient.get("/PromotionTasks");
    return response.data;
  },

  createPromotionTask: async (
    task: Omit<PromotionTask, "taskId">
  ): Promise<PromotionTask> => {
    const response = await apiClient.post("/PromotionTasks", task);
    return response.data;
  },

  updateTask: async (task: PromotionTask): Promise<PromotionTask> => {
    const response = await apiClient.post("/PromotionTasks", task);
    return response.data;
  },

  updateTaskStatus: async (
    taskId: number,
    status: TaskStatus
  ): Promise<PromotionTask> => {
    const response = await apiClient.put(
      `/PromotionTasks/${taskId}/status`,
      status
    );
    return response.data;
  },

  updateTaskPriority: async (
    taskId: number,
    priority: number
  ): Promise<PromotionTask> => {
    const response = await apiClient.put(
      `/PromotionTasks/${taskId}/priority`,
      priority
    );
    return response.data;
  },
};
