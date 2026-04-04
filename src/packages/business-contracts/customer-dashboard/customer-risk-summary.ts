// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Risk Summary
// ═══════════════════════════════════════════════════════════════

export interface CustomerRiskSummary {
  customerId: string;
  churnProbability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  topRiskFactors: string[];
  suggestedInterventions: string[];
  lastAssessedAt: string;
}
