// SITA OS — Concierge: Trip Leg
export interface TripLeg {
  id: string;
  tripId: string;
  order: number;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  mode: "flight" | "train" | "car" | "bus" | "ferry" | "walking";
  carrier?: string;
  flightNumber?: string;
  seatAssignments?: Record<string, string>;
  reservationId?: string;
  durationMinutes: number;
  distanceKm?: number;
  costCents: number;
  terminal?: string;
  gate?: string;
  status: "planned" | "booked" | "checked-in" | "boarding" | "in-transit" | "arrived" | "cancelled" | "delayed";
}
