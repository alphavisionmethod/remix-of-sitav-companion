// ═══════════════════════════════════════════════════════════════
// SITA OS — Value-Risk Matrix
// Scores tasks on value vs risk to drive routing decisions.
// ═══════════════════════════════════════════════════════════════

export interface ValueRiskInput {
  taskId: string;
  taskClass: string;
  domain: string;
  expectedValueCents: number;
  expectedCostCents: number;
  confidence: number;
  blastRadius: "none" | "local" | "domain" | "system-wide";
  reversibility: "fully" | "partially" | "irreversible";
  urgency: "low" | "medium" | "high" | "critical";
  regulatoryRisk: boolean;
  trustRisk: boolean;
}

export interface ValueRiskScore {
  taskId: string;
  valueScore: number;               // 0-100
  riskScore: number;                 // 0-100
  netScore: number;                  // value - risk weighted
  quadrant: ValueRiskQuadrant;
  recommendedRoute: RouteRecommendation;
  routeReason: string;
}

export type ValueRiskQuadrant =
  | "high_value_low_risk"            // go fast
  | "high_value_high_risk"           // invest carefully
  | "low_value_low_risk"             // automate cheaply
  | "low_value_high_risk";           // avoid or minimize

export type RouteRecommendation =
  | "fast_cheap_route"
  | "standard_route"
  | "premium_careful_route"
  | "premium_with_insurance"
  | "defer_or_skip"
  | "human_required";

// ── Scoring ────────────────────────────────────────────────

const BLAST_SCORES: Record<string, number> = { none: 0, local: 15, domain: 35, "system-wide": 60 };
const REVERSIBILITY_SCORES: Record<string, number> = { fully: 0, partially: 20, irreversible: 50 };
const URGENCY_SCORES: Record<string, number> = { low: 0, medium: 10, high: 25, critical: 40 };

export function scoreValueRisk(input: ValueRiskInput): ValueRiskScore {
  // Value score
  const roi = input.expectedCostCents > 0 ? input.expectedValueCents / input.expectedCostCents : 0;
  const valueScore = Math.min(100, Math.round(
    (Math.min(roi, 20) / 20) * 40 +
    (input.confidence / 100) * 30 +
    (input.expectedValueCents > 10000 ? 30 : input.expectedValueCents / 10000 * 30)
  ));

  // Risk score
  const riskScore = Math.min(100, Math.round(
    (BLAST_SCORES[input.blastRadius] || 0) +
    (REVERSIBILITY_SCORES[input.reversibility] || 0) +
    (URGENCY_SCORES[input.urgency] || 0) * (input.urgency === "critical" ? 0.5 : 1) +
    (input.regulatoryRisk ? 20 : 0) +
    (input.trustRisk ? 15 : 0) +
    ((100 - input.confidence) / 100) * 15
  ));

  // Quadrant
  let quadrant: ValueRiskQuadrant;
  if (valueScore >= 50 && riskScore < 50) quadrant = "high_value_low_risk";
  else if (valueScore >= 50 && riskScore >= 50) quadrant = "high_value_high_risk";
  else if (valueScore < 50 && riskScore < 50) quadrant = "low_value_low_risk";
  else quadrant = "low_value_high_risk";

  // Route
  let route: RouteRecommendation;
  let reason: string;

  switch (quadrant) {
    case "high_value_low_risk":
      route = "fast_cheap_route";
      reason = "High value, low risk — execute quickly and cheaply";
      break;
    case "high_value_high_risk":
      route = input.regulatoryRisk || input.trustRisk ? "premium_with_insurance" : "premium_careful_route";
      reason = "High value but significant risk — invest carefully with insurance";
      break;
    case "low_value_low_risk":
      route = "standard_route";
      reason = "Low value, low risk — automate with standard routing";
      break;
    case "low_value_high_risk":
      route = input.reversibility === "irreversible" ? "human_required" : "defer_or_skip";
      reason = "Low value with high risk — defer, minimize, or require human approval";
      break;
  }

  return {
    taskId: input.taskId,
    valueScore, riskScore,
    netScore: Math.round(valueScore - riskScore * 0.7),
    quadrant, recommendedRoute: route, routeReason: reason,
  };
}

export function batchScoreValueRisk(inputs: ValueRiskInput[]): ValueRiskScore[] {
  return inputs.map(scoreValueRisk).sort((a, b) => b.netScore - a.netScore);
}
