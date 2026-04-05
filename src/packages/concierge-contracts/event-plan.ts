// SITA OS — Concierge: Event Plan
export interface EventPlan {
  id: string;
  eventReminderId: string;
  title: string;
  eventDate: string;
  type: "birthday" | "anniversary" | "holiday" | "graduation" | "reunion" | "dinner-party" | "custom";
  venue?: string;
  guestCount?: number;
  budgetCents: number;
  spentCents: number;
  tasks: Array<{ task: string; assignedTo?: string; dueDate: string; completed: boolean }>;
  vendors: Array<{ name: string; service: string; costCents: number; confirmed: boolean }>;
  menu?: string[];
  decorTheme?: string;
  status: "planning" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
