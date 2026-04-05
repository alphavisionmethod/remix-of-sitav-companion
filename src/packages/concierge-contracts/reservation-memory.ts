// SITA OS — Concierge: Reservation Memory
export interface ReservationMemory {
  id: string;
  provider: string;
  type: string;
  usageCount: number;
  lastUsedAt: string;
  avgRating: number;
  avgCostCents: number;
  preferences: Record<string, string>;
  positiveNotes: string[];
  negativeNotes: string[];
  preferredRoomType?: string;
  preferredSeatType?: string;
  loyaltyTier?: string;
  doNotBookAgain: boolean;
  reason?: string;
}
