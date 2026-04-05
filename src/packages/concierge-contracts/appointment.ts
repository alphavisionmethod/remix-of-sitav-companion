// SITA OS — Concierge: Appointment
export type AppointmentType = "medical" | "dental" | "legal" | "financial" | "school" | "veterinary" | "therapy" | "wellness" | "government" | "other";

export interface Appointment {
  id: string;
  memberId: string;
  type: AppointmentType;
  title: string;
  provider: string;
  location?: string;
  dateTime: string;
  durationMinutes: number;
  prepItems: string[];
  documentsRequired: string[];
  reminderMinutesBefore: number[];
  notes: string;
  copayAmountCents?: number;
  insuranceVerified: boolean;
  status: "scheduled" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show" | "rescheduled";
  followUpDate?: string;
  resultSummary?: string;
  proofId?: string;
  createdAt: string;
  updatedAt: string;
}
