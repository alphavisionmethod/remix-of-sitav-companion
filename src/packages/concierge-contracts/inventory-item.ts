// SITA OS — Concierge: Inventory Item
export interface InventoryItem {
  id: string;
  name: string;
  category: "pantry" | "cleaning" | "bathroom" | "medicine" | "pet" | "office" | "seasonal" | "other";
  location: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expiresAt?: string;
  lastRestockedAt?: string;
  preferredBrand?: string;
  preferredStore?: string;
  avgPriceCents: number;
  autoReorder: boolean;
  status: "stocked" | "low" | "out" | "expired";
  barcode?: string;
  createdAt: string;
}
