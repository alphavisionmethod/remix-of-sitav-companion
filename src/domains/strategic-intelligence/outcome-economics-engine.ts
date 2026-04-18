// ═══════════════════════════════════════════════════════════════
// SITA OS — Outcome Economics Engine (3.10)
// Ties AI spend to actual business value. Identifies high-value
// and low-value reasoning paths for optimization.
// ═══════════════════════════════════════════════════════════════

export type OutcomeCategory =
  | "incident_prevented" | "issue_resolved" | "lead_recovered"
  | "retention_saved" | "self_heal_success" | "release_approved"
  | "launch_saved" | "design_improvement_accepted" | "strategic_accepted"
  | "automation_completed" | "cost_saved" | "revenue_generated"
  | "risk_mitigated" | "other";

export interface OutcomeEconomicsInput {
  outcomeId: string;
  outcomeCategory: OutcomeCategory;
  domain: string;
  tenantId: string;
  missionId?: string;
  aiCostCents: number;
  verificationCostCents: number;
  estimatedValueCents: number;
  confidence: number;
  reasoningPathLabel: string;
  agentsInvolved: string[];
  intelligenceAssetsUsed: string[];
  modelTiersUsed: string[];
  accepted: boolean;
}

export interface OutcomeEconomicsResult {
  totalCostCents: number;
  paybackRatio: number;
  costPerOutcome: number;
  valueClass: "high_value" | "moderate_value" | "low_value" | "negative_value";
  recommendation: string;
}

export interface ReasoningPathEconomics {
  pathLabel: string;
  outcomeCount: number;
  totalCostCents: number;
  totalValueCents: number;
  avgPaybackRatio: number;
  avgAcceptanceRate: number;
  avgConfidence: number;
  recommendation: "expand" | "maintain" | "optimize" | "downgrade" | "eliminate";
}

// ── Single outcome evaluation ───────────────────────────────

export function evaluateOutcomeEconomics(input: OutcomeEconomicsInput): OutcomeEconomicsResult {
  const totalCost = input.aiCostCents + input.verificationCostCents;
  const payback = totalCost > 0 ? input.estimatedValueCents / totalCost : 0;

  let valueClass: OutcomeEconomicsResult["valueClass"];
  if (payback >= 5) valueClass = "high_value";
  else if (payback >= 2) valueClass = "moderate_value";
  else if (payback >= 1) valueClass = "low_value";
  else valueClass = "negative_value";

  let recommendation = "Maintain current approach";
  if (valueClass === "high_value") recommendation = "High ROI — consider expanding scope";
  else if (valueClass === "low_value") recommendation = "Review cost — consider model tier downgrade or asset reuse";
  else if (valueClass === "negative_value") recommendation = "Negative ROI — evaluate if this reasoning path is justified";

  if (!input.accepted) {
    recommendation = "Outcome not accepted — review reasoning quality and relevance";
    valueClass = "negative_value";
  }

  return {
    totalCostCents: totalCost,
    paybackRatio: Math.round(payback * 100) / 100,
    costPerOutcome: totalCost,
    valueClass,
    recommendation,
  };
}

// ── Reasoning path analysis ─────────────────────────────────

export function analyzeReasoningPaths(outcomes: OutcomeEconomicsInput[]): ReasoningPathEconomics[] {
  const byPath: Record<string, OutcomeEconomicsInput[]> = {};
  for (const o of outcomes) {
    if (!byPath[o.reasoningPathLabel]) byPath[o.reasoningPathLabel] = [];
    byPath[o.reasoningPathLabel].push(o);
  }

  return Object.entries(byPath).map(([pathLabel, items]) => {
    const totalCost = items.reduce((s, o) => s + o.aiCostCents + o.verificationCostCents, 0);
    const totalValue = items.reduce((s, o) => s + o.estimatedValueCents, 0);
    const avgPayback = totalCost > 0 ? totalValue / totalCost : 0;
    const accepted = items.filter(o => o.accepted).length;
    const avgAcceptance = items.length > 0 ? accepted / items.length : 0;
    const avgConf = items.length > 0 ? items.reduce((s, o) => s + o.confidence, 0) / items.length : 0;

    let recommendation: ReasoningPathEconomics["recommendation"];
    if (avgPayback >= 5 && avgAcceptance >= 0.8) recommendation = "expand";
    else if (avgPayback >= 2) recommendation = "maintain";
    else if (avgPayback >= 1) recommendation = "optimize";
    else if (avgAcceptance < 0.4) recommendation = "eliminate";
    else recommendation = "downgrade";

    return {
      pathLabel,
      outcomeCount: items.length,
      totalCostCents: totalCost,
      totalValueCents: totalValue,
      avgPaybackRatio: Math.round(avgPayback * 100) / 100,
      avgAcceptanceRate: Math.round(avgAcceptance * 100) / 100,
      avgConfidence: Math.round(avgConf),
      recommendation,
    };
  }).sort((a, b) => b.avgPaybackRatio - a.avgPaybackRatio);
}

// ── Value benchmarks ────────────────────────────────────────

export const OUTCOME_VALUE_BENCHMARKS: Record<OutcomeCategory, number> = {
  incident_prevented: 50000,
  issue_resolved: 20000,
  lead_recovered: 15000,
  retention_saved: 30000,
  self_heal_success: 10000,
  release_approved: 25000,
  launch_saved: 40000,
  design_improvement_accepted: 8000,
  strategic_accepted: 35000,
  automation_completed: 5000,
  cost_saved: 12000,
  revenue_generated: 20000,
  risk_mitigated: 18000,
  other: 5000,
};

export function estimateOutcomeValue(category: OutcomeCategory, confidence: number): number {
  const base = OUTCOME_VALUE_BENCHMARKS[category] || 5000;
  return Math.round(base * (confidence / 100));
}
