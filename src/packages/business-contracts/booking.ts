// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Booking
// ═══════════════════════════════════════════════════════════════

export type BookingStatus = "requested" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";

export interface Booking {
  id: string;
  customerId: string;
  serviceType: string;
  datetime: string;
  durationMinutes: number;
  status: BookingStatus;
  provider: string;
  location?: string;
  notes?: string;
  recurrenceRule?: string;
  createdAt: string;
  updatedAt: string;
}
