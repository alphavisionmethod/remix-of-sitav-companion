// SITA OS — Concierge: Pantry Replenishment
export interface PantryReplenishment {
  id: string;
  itemName: string;
  category: string;
  currentQuantity: number;
  minThreshold: number;
  suggestedQuantity: number;
  estimatedCostCents: number;
  preferredStore?: string;
  preferredBrand?: string;
  frequency: "weekly" | "biweekly" | "monthly" | "as-needed";
  lastPurchasedAt?: string;
  urgency: "immediate" | "soon" | "routine";
  addedToList: boolean;
  status: "needed" | "on-list" | "purchased" | "stocked";
  createdAt: string;
}
