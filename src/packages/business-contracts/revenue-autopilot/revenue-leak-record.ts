export type LeakCategory = "uncollected-invoice" | "expired-quote" | "no-show" | "underpriced" | "scope-creep" | "churn-risk";

export interface RevenueLeakRecord {
  id: string;
  category: LeakCategory;
  entityId: string;
  entityType: "invoice" | "quote" | "opportunity" | "subscription";
  leakAmountCents: number;
  detectedAt: string;
  confidence: number; // 0-100
  description: string;
  suggestedRecoveryAction: string;
  status: "detected" | "in-recovery" | "recovered" | "written-off";
  resolvedAt?: string;
  recoveredCents?: number;
}
