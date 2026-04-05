// SITA OS — Concierge: Prep Sequence
export interface PrepSequence {
  id: string;
  linkedEventId: string;
  linkedEventType: "calendar" | "appointment" | "travel" | "school" | "event";
  title: string;
  steps: PrepStep[];
  totalEstimatedMinutes: number;
  startBy: string;
  completionPercent: number;
  status: "not-started" | "in-progress" | "completed" | "overdue";
  createdAt: string;
}

export interface PrepStep {
  id: string;
  order: number;
  task: string;
  category: "documents" | "supplies" | "transport" | "food" | "clothing" | "communication" | "other";
  estimatedMinutes: number;
  assignedTo?: string;
  dueBy: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}
