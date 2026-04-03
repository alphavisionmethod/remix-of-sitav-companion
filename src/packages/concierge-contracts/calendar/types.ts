export interface FamilyCalendarItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  memberIds: string[];
  source: "google" | "apple" | "manual" | "school" | "work";
  category: "school" | "medical" | "social" | "sports" | "work" | "travel" | "household" | "other";
  location?: string;
  reminders: { minutesBefore: number; channel: "push" | "email" | "sms" }[];
  prepItems: string[];
  conflictsWith?: string[];
}

export interface ReconciliationConflict {
  itemAId: string;
  itemBId: string;
  type: "time-overlap" | "location-impossible" | "resource-conflict" | "member-double-booked";
  severity: "hard" | "soft";
  suggestion: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface PrepItem {
  id: string;
  calendarItemId: string;
  task: string;
  assignedTo?: string;
  dueBy: string;
  completed: boolean;
  category: "documents" | "supplies" | "transport" | "food" | "clothing" | "other";
}
