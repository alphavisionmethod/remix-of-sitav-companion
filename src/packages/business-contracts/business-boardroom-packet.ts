// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Business Boardroom Packet
// ═══════════════════════════════════════════════════════════════

import type { MonetaryAmount } from "./_contract-scaffold";

export interface RevenueSnapshot {
  totalRevenueCents: number;
  mrr: number;
  arr: number;
  growthRatePct: number;
  periodStart: string;
  periodEnd: string;
}

export interface BusinessBoardroomPacket {
  id: string;
  generatedAt: string;
  revenueSnapshot: RevenueSnapshot;
  pipelineHealth: { totalOpportunities: number; weightedValueCents: number; avgDaysInStage: number; conversionRate: number };
  topRisks: Array<{ id: string; title: string; severity: "critical" | "high" | "medium" | "low"; impact: MonetaryAmount; description: string }>;
  topOpportunities: Array<{ id: string; title: string; valueCents: number; probability: number; expectedCloseDate: string }>;
  customerConcentration: { topCustomerRevenuePct: number; top5RevenuePct: number; herfindahlIndex: number };
  advisorNotes: string[];
  confidenceScore: number;
}
