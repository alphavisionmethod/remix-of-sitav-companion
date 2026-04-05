// SITA OS — Concierge: Packing Plan
export interface PackingPlan {
  id: string;
  tripId: string;
  memberIds: string[];
  categories: PackingCategory[];
  totalItems: number;
  packedItems: number;
  completionPercent: number;
  weatherForecast?: string;
  tripType: "beach" | "business" | "adventure" | "city" | "winter" | "camping" | "family" | "other";
  durationDays: number;
  specialNotes: string[];
  createdAt: string;
}

export interface PackingCategory {
  name: string;
  items: Array<{ name: string; quantity: number; packed: boolean; essential: boolean; memberId?: string }>;
}
