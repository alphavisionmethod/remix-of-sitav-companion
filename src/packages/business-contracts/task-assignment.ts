// SITA OS — Business Contracts: Task Assignment
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "assigned" | "in-progress" | "blocked" | "completed" | "cancelled";

export interface TaskAssignment {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  entityType: string;
  entityId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  blockerDescription?: string;
  completedAt?: string;
  outcome?: string;
  proofId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskWorkload {
  userId: string;
  activeTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  avgCompletionMinutes: number;
  capacityUtilization: number;
}
