// SITA OS — Concierge: Gift Plan
export interface GiftPlan {
  id: string;
  eventReminderId: string;
  recipientName: string;
  recipientId?: string;
  occasion: string;
  date: string;
  budgetCents: number;
  preferences: string[];
  previousGifts: Array<{ year: number; gift: string; reaction?: string }>;
  suggestions: Array<{ item: string; priceCents: number; source: string; confidence: number; url?: string }>;
  selectedGift?: string;
  purchasedCents?: number;
  purchasedAt?: string;
  wrappingNotes?: string;
  deliveryMethod: "in-person" | "shipped" | "digital" | "experience";
  status: "brainstorming" | "shopping" | "purchased" | "wrapped" | "delivered";
  notes: string[];
  createdAt: string;
}
