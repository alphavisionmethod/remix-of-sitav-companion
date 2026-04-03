export interface GroceryItem {
  id: string;
  name: string;
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "beverage" | "household" | "personal-care" | "other";
  quantity: number;
  unit: string;
  store?: string;
  addedBy: string;
  addedAt: string;
  purchased: boolean;
  purchasedAt?: string;
  estimatedPriceCents?: number;
  isRecurring: boolean;
}

export interface RecurringSupplyItem {
  id: string;
  name: string;
  category: string;
  frequencyDays: number;
  lastPurchasedAt: string;
  nextExpectedAt: string;
  autoAdd: boolean;
  preferredStore?: string;
  preferredBrand?: string;
  avgPriceCents: number;
  quantity: number;
  unit: string;
}

export interface ContinuityAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: "running-low" | "overdue-purchase" | "price-increase" | "out-of-stock";
  severity: "info" | "warning" | "urgent";
  message: string;
  suggestedAction: string;
  createdAt: string;
  dismissedAt?: string;
}
