// SITA OS — Concierge: Reservation
export interface Reservation {
  id: string;
  tripId?: string;
  type: "flight" | "hotel" | "car" | "restaurant" | "activity" | "train" | "ferry" | "bus";
  provider: string;
  confirmationNumber: string;
  guestNames: string[];
  checkIn?: string;
  checkOut?: string;
  departureTime?: string;
  arrivalTime?: string;
  location: string;
  costCents: number;
  currency: string;
  cancellationDeadline?: string;
  cancellationPolicy?: string;
  status: "confirmed" | "pending" | "cancelled" | "modified" | "checked-in" | "completed";
  sourceEmail?: string;
  loyaltyProgram?: string;
  loyaltyNumber?: string;
  notes?: string;
  proofId?: string;
  ingestedAt: string;
  updatedAt: string;
}
