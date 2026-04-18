// SITA OS — Demo Data: Calendar Workspace
import { addDays } from "date-fns";

export interface CalWorkspaceEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  domain: "personal" | "business" | "household" | "finance";
  type: "meeting" | "task" | "reminder" | "appointment" | "deadline" | "travel";
  location?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  overlapWarning?: boolean;
}

export const DEMO_CALENDAR_EVENTS: CalWorkspaceEvent[] = [
  { id: "1", title: "Team Standup", date: new Date().toISOString(), time: "09:00", endTime: "09:30", domain: "business", type: "meeting", location: "Zoom" },
  { id: "2", title: "Client Proposal Review", date: new Date().toISOString(), time: "11:00", endTime: "12:00", domain: "business", type: "meeting", priority: "high" },
  { id: "3", title: "Dentist Appointment", date: new Date().toISOString(), time: "14:30", endTime: "15:30", domain: "personal", type: "appointment", location: "Downtown Dental" },
  { id: "4", title: "Invoice Due: #4521", date: addDays(new Date(), 1).toISOString(), time: "17:00", domain: "finance", type: "deadline", priority: "high" },
  { id: "5", title: "Grocery Run", date: addDays(new Date(), 1).toISOString(), time: "10:00", endTime: "11:00", domain: "household", type: "task" },
  { id: "6", title: "Quarterly Review", date: addDays(new Date(), 2).toISOString(), time: "13:00", endTime: "15:00", domain: "business", type: "meeting", priority: "urgent" },
  { id: "7", title: "School Pickup", date: addDays(new Date(), 2).toISOString(), time: "15:30", domain: "household", type: "reminder", overlapWarning: true },
  { id: "8", title: "Flight to NYC", date: addDays(new Date(), 4).toISOString(), time: "07:00", domain: "personal", type: "travel", location: "JFK Airport" },
  { id: "9", title: "Board Meeting", date: addDays(new Date(), 5).toISOString(), time: "10:00", endTime: "12:00", domain: "business", type: "meeting", priority: "urgent" },
  { id: "10", title: "Pay Rent", date: addDays(new Date(), 6).toISOString(), domain: "finance", type: "deadline" },
];
