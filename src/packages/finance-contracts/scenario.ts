// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Contracts: Scenario Planning
// ═══════════════════════════════════════════════════════════════

export interface ScenarioInput {
  id: string;
  name: string;
  type: "cut-subscription" | "increase-savings" | "revenue-change" | "debt-payoff" | "hire" | "custom";
  parameters: Record<string, number>;
  description: string;
}

export interface ScenarioOutput {
  scenarioId: string;
  scenarioName: string;
  baselineCashflow: number[];
  projectedCashflow: number[];
  baselineSafeToSpend: number;
  projectedSafeToSpend: number;
  netImpactMonthlyCents: number;
  netImpactAnnualCents: number;
  runwayChangeMonths: number;
  riskLevel: "low" | "moderate" | "high";
  tradeoffs: string[];
  recommendations: string[];
  confidenceScore: number;
}
