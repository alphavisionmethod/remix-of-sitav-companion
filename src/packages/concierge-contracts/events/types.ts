export interface EventReminder {
  id: string;
  eventType: "birthday" | "anniversary" | "holiday" | "graduation" | "reunion" | "custom";
  title: string;
  date: string;
  recurring: boolean;
  memberIds: string[];
  reminderDaysBefore: number[];
  giftBudgetCents?: number;
  notes: string;
  status: "upcoming" | "reminded" | "acknowledged" | "past";
}

export interface GiftOpportunity {
  id: string;
  eventReminderId: string;
  recipientName: string;
  recipientId?: string;
  occasion: string;
  date: string;
  budgetCents: number;
  preferences: string[];
  previousGifts: { year: number; gift: string; reaction?: string }[];
  suggestions: { item: string; priceCents: number; source: string; confidence: number }[];
  status: "upcoming" | "shopping" | "purchased" | "wrapped" | "given";
  purchasedItem?: string;
  purchasedCents?: number;
}
