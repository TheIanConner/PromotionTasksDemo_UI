import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { User, Release, PromotionTask, TaskStatus } from "../types";

// Custom logger to handle API debugging
const logApiCall = (method: string, url: string, data?: any) => {
  console.log(
    `🚀 API Call: ${method.toUpperCase()} ${url}`,
    data ? { data } : ""
  );
};

const logApiResponse = (response: AxiosResponse) => {
  console.log(`✅ API Response (${response.status}):`, {
    url: response.config.url,
    method: response.config.method?.toUpperCase(),
    data: response.data,
    headers: response.headers,
    duration: response.headers["x-response-time"] || "not available",
  });
};

const logApiError = (error: AxiosError) => {
  console.error(`❌ API Error:`, {
    url: error.config?.url,
    method: error.config?.method?.toUpperCase(),
    statusCode: error.response?.status,
    statusText: error.response?.statusText,
    message: error.message,
    data: error.response?.data,
    request: {
      headers: error.config?.headers,
      data: error.config?.data,
    },
  });
};

const apiClient = axios.create({
  baseURL: "/api", // TODO: Change to the correct URL based on the environment
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logApiCall(
      config.method || "unknown",
      config.url || "unknown",
      config.data
    );
    return config;
  },
  (error) => {
    logApiError(error as AxiosError);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    logApiResponse(response);
    return response;
  },
  (error: AxiosError) => {
    logApiError(error);
    return Promise.reject(error);
  }
);

// Helper function to safely execute API calls with detailed error handling
const executeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorContext: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`🔍 Detailed API Error in ${errorContext}:`, {
      message: axiosError.message,
      isNetworkError:
        axiosError.code === "ECONNABORTED" || !axiosError.response,
      timeout: axiosError.code === "ECONNABORTED",
      requestConfig: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers,
        data: axiosError.config?.data,
        timeout: axiosError.config?.timeout,
      },
      response: axiosError.response
        ? {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data,
            headers: axiosError.response.headers,
          }
        : "No response received",
      stack: axiosError.stack,
    });
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
