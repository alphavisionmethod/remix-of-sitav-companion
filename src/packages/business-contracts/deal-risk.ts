// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Deal Risk Assessment
// ═══════════════════════════════════════════════════════════════

export type DealRiskCategory =
  | "stale-deal" | "single-threaded" | "no-champion" | "budget-uncertainty"
  | "competitor-threat" | "legal-delay" | "scope-creep" | "pricing-pressure"
  | "decision-delay" | "stakeholder-change";

export interface DealRisk {
  dealId: string;
  category: DealRiskCategory;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  impact: "deal-loss" | "value-reduction" | "timeline-slip" | "margin-erosion";
  impactAmountCents?: number;
  detectedAt: string;
  suggestedMitigation: string;
  autoDetected: boolean;
  resolvedAt?: string;
}

export interface DealRiskAssessment {
  dealId: string;
  overallRiskScore: number;
  risks: DealRisk[];
  healthIndicator: "green" | "yellow" | "orange" | "red";
  assessedAt: string;
  recommendation: string;
}
