// SITA OS — Concierge: Itinerary
export interface Itinerary {
  id: string;
  tripId: string;
  days: ItineraryDay[];
  totalCostCents: number;
  totalTravelMinutes: number;
  currency: string;
  generatedAt: string;
  version: number;
  status: "draft" | "confirmed" | "active" | "completed";
}

export interface ItineraryDay {
  date: string;
  activities: ItineraryActivity[];
  totalCostCents: number;
  travelMinutes: number;
  notes: string[];
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  location?: string;
  durationMinutes: number;
  costCents: number;
  type: "transport" | "accommodation" | "meal" | "activity" | "rest" | "transit" | "checkin" | "checkout";
  bookingRequired: boolean;
  bookingStatus?: "confirmed" | "pending" | "suggested";
  notes?: string;
}
