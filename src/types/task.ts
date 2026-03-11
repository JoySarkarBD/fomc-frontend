import type { LucideIcon } from "lucide-react";

/** Possible statuses for a task (matches API enum) */
export type TaskStatus =
  | "PENDING"
  | "WORK_IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "DELIVERED";

/** A single task from the API */
export interface Task {
  _id: string;
  name: string;
  project: string | { _id: string; name: string };
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description?: string;
  status: TaskStatus;
  assignTo?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Pipeline step displayed in the task flow */
export interface TaskPipelineStepData {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  bgColor: string;
  arrowColor?: string;
}

/** Filter tab for the task list */
export interface TaskFilterTab {
  label: string;
  value: TaskStatus | "all";
  count: number;
}
