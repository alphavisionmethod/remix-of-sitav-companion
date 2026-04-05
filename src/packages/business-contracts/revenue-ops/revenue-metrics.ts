// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Revenue Ops — Revenue Metrics
// ═══════════════════════════════════════════════════════════════

export interface RevenueMetricsSnapshot {
  period: string;
  mrr: number;
  arr: number;
  totalRevenueCents: number;
  newRevenueCents: number;
  expansionRevenueCents: number;
  churnedRevenueCents: number;
  contractionRevenueCents: number;
  netRevenueRetention: number;
  grossRevenueRetention: number;
  avgRevenuePerAccount: number;
  avgDealSizeCents: number;
  revenueGrowthRate: number;
  cashCollectedCents: number;
  outstandingReceivablesCents: number;
  dso: number;
  generatedAt: string;
}

export interface RevenueWaterfall {
  periodStart: string;
  periodEnd: string;
  startingMrr: number;
  newBusiness: number;
  expansion: number;
  reactivation: number;
  contraction: number;
  churn: number;
  endingMrr: number;
  netChange: number;
  netChangePct: number;
}

export interface CohortAnalysis {
  cohortMonth: string;
  initialCustomers: number;
  initialRevenueCents: number;
  retentionByMonth: Array<{ month: number; customers: number; revenueCents: number; retentionPct: number }>;
  ltv: number;
  paybackMonths: number;
}
