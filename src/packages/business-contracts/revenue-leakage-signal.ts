// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Revenue Leakage Signal
// ═══════════════════════════════════════════════════════════════

export type RevenueLeakType =
  | "unbilled-work" | "underpriced-contract" | "scope-creep-unbilled"
  | "expired-quote" | "overdue-invoice" | "missed-renewal"
  | "unused-credits" | "discount-abuse" | "free-tier-abuse"
  | "failed-upsell" | "churn-revenue";

export interface RevenueLeakageSignal {
  id: string;
  type: RevenueLeakType;
  entityId: string;
  entityType: string;
  accountId: string;
  accountName: string;
  leakAmountCents: number;
  recoverableAmountCents: number;
  confidence: number;
  urgency: "immediate" | "this-week" | "this-month" | "monitor";
  description: string;
  rootCause: string;
  suggestedAction: string;
  detectedAt: string;
  status: "detected" | "acknowledged" | "in-recovery" | "recovered" | "accepted-loss";
  resolvedAt?: string;
  recoveredCents?: number;
  proofId?: string;
}

export interface RevenueLeakageDashboard {
  period: string;
  totalLeakageCents: number;
  totalRecoveredCents: number;
  recoveryRate: number;
  byType: Array<{ type: RevenueLeakType; count: number; amountCents: number; recoveredCents: number }>;
  topLeakingAccounts: Array<{ accountId: string; name: string; leakCents: number }>;
  trendVsPreviousPeriod: number;
  projectedLeakageCents: number;
  generatedAt: string;
}
