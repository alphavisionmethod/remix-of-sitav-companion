// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Repeat Purchase Timing
// ═══════════════════════════════════════════════════════════════

export interface RepeatPurchaseTiming {
  customerId: string;
  avgPurchaseIntervalDays: number;
  lastPurchaseDate: string;
  predictedNextPurchaseDate: string;
  confidence: number;
  purchaseHistory: Array<{ date: string; valueCents: number; category: string }>;
  isOverdue: boolean;
  overdueDays?: number;
  suggestedAction: "send-reminder" | "offer-discount" | "check-in" | "upsell" | "wait";
  revenueAtRiskCents: number;
  churnRiskFromInactivity: number;
  analyzedAt: string;
}

export interface PurchasePatternAnalysis {
  customerId: string;
  totalPurchases: number;
  totalSpentCents: number;
  avgOrderValueCents: number;
  preferredProducts: Array<{ category: string; frequency: number; avgValueCents: number }>;
  seasonalPatterns: Array<{ month: number; indexVsAverage: number }>;
  dayOfWeekPreference: Record<string, number>;
  growthRate: number;
  clvProjectionCents: number;
  analyzedAt: string;
}
