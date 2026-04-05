// SITA OS — Concierge: Schedule Item
export interface ScheduleItem {
  id: string;
  memberId: string;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  type: "event" | "task" | "appointment" | "school" | "work" | "personal" | "travel" | "errand";
  location?: string;
  recurring: boolean;
  recurrenceRule?: string;
  reminders: number[];
  color?: string;
  source: "manual" | "calendar-sync" | "auto-generated" | "school" | "work";
  linkedEntityId?: string;
  linkedEntityType?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}
