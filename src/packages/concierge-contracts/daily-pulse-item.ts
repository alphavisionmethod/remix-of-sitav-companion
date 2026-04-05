// SITA OS — Concierge: Daily Pulse Item
export type PulseCategory = "task" | "event" | "reminder" | "alert" | "prep" | "errand" | "school" | "health" | "travel" | "grocery";

export interface DailyPulseItem {
  id: string;
  category: PulseCategory;
  title: string;
  subtitle?: string;
  time?: string;
  memberIds: string[];
  priority: "critical" | "high" | "medium" | "low";
  actionRequired: boolean;
  actionLabel?: string;
  linkedEntityId?: string;
  linkedEntityType?: string;
  completed: boolean;
  dismissed: boolean;
}

export interface DailyPulse {
  date: string;
  greeting: string;
  items: DailyPulseItem[];
  topPriority?: DailyPulseItem;
  weatherSummary?: string;
  totalTasks: number;
  completedTasks: number;
  emotionalTone: "calm" | "busy" | "hectic" | "light";
}
