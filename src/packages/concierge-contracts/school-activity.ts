// SITA OS — Concierge: School Activity
export interface SchoolActivity {
  id: string;
  childId: string;
  schoolName: string;
  activityType: "class" | "sport" | "club" | "event" | "field-trip" | "conference" | "exam" | "performance" | "practice";
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  requiresVolunteer: boolean;
  requiresPayment: boolean;
  paymentAmountCents?: number;
  paymentStatus?: "pending" | "paid";
  transportNeeded: boolean;
  uniformRequired?: string;
  equipmentNeeded: string[];
  notes: string;
  createdAt: string;
}
