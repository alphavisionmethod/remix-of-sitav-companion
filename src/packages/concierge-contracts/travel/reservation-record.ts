export interface ReservationRecord {
  id: string;
  tripId?: string;
  type: "flight" | "hotel" | "car" | "restaurant" | "activity" | "train" | "ferry";
  provider: string;
  confirmationNumber: string;
  checkIn?: string;
  checkOut?: string;
  departureTime?: string;
  arrivalTime?: string;
  location: string;
  costCents: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled" | "modified";
  sourceEmail?: string;
  ingestedAt: string;
  rawData?: Record<string, unknown>;
}
