// SITA OS — Concierge: Household Responsibility
export interface HouseholdResponsibility {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  backupOwnerId?: string;
  category: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "as-needed";
  estimatedMinutes: number;
  lastCompletedAt?: string;
  completionStreak: number;
  rotatable: boolean;
  rotationSchedule?: Array<{ memberId: string; startDate: string; endDate: string }>;
  status: "active" | "paused" | "transferred";
  createdAt: string;
}
