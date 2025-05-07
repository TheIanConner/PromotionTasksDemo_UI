export enum TaskPriority {
  Urgent = 0,
  High = 1,
  Medium = 2,
  Low = 3,
}

export enum TaskStatus {
  ToDo = 0,
  InProgress = 1,
  Done = 2,
}

export enum ReleaseType {
  Single = 0,
  EP = 1,
  Album = 2,
  Mixtape = 3,
}

export interface User {
  userId: number;
  name: string;
  createdDate: string;
  lastActiveDate: string;
  deleted: boolean;
  releases?: Release[];
}

export interface Release {
  releaseId: number;
  userId: number;
  title: string;
  type: ReleaseType;
  releaseDate: string;
  description?: string;
  coverArt?: string;
  deleted: boolean;
  promotionTasks?: PromotionTask[];
}

export interface PromotionTask {
  taskId: number;
  releaseId: number;
  release?: Release;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  dueDate?: string;
  deleted: boolean;
}
