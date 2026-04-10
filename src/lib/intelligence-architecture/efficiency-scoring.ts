// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Efficiency Scoring (3.9)
// Scores every agent/workflow on quality, cost efficiency,
// acceptance rate, and outcome value.
// ═══════════════════════════════════════════════════════════════

// ── Efficiency Score ────────────────────────────────────────

export interface EfficiencyScore {
  entityId: string;
  entityType: "agent" | "workflow" | "advisor" | "reasoning-path";
  period: string;

  qualityScore: number;               // 0-100
  costEfficiency: number;             // 0-100 (higher = cheaper per quality unit)
  acceptanceRate: number;             // 0-1
  overrideRate: number;               // 0-1 (lower = better)
  falsePositiveRate: number;          // 0-1 (lower = better)
  cacheReuseRate: number;             // 0-1
  intelligenceReuseRate: number;      // 0-1
  verificationSuccessRate: number;    // 0-1
  outcomeValueScore: number;          // 0-100
  downstreamUtility: number;          // 0-100

  compositeScore: number;             // weighted aggregate
  trend: "improving" | "stable" | "degrading";
  recommendation: string;
}

export type OutcomeType =
  | "incident-prevented"
  | "bug-resolved"
  | "lead-recovered"
  | "customer-retained"
  | "self-heal-success"
  | "release-approved"
  | "strategic-recommendation-accepted"
  | "operator-decision-made"
  | "automation-completed"
  | "cost-saved"
  | "revenue-generated"
  | "risk-mitigated";

export function computeEfficiencyScore(
  entityId: string,
  entityType: EfficiencyScore["entityType"],
  metrics: Omit<EfficiencyScore, "entityId" | "entityType" | "compositeScore" | "trend" | "recommendation" | "period">,
  previousComposite?: number,
): EfficiencyScore {
  const composite = Math.round(
    metrics.qualityScore * 0.2 +
    metrics.costEfficiency * 0.2 +
    metrics.acceptanceRate * 100 * 0.1 +
    (1 - metrics.overrideRate) * 100 * 0.1 +
    (1 - metrics.falsePositiveRate) * 100 * 0.05 +
    metrics.cacheReuseRate * 100 * 0.05 +
    metrics.intelligenceReuseRate * 100 * 0.1 +
    metrics.verificationSuccessRate * 100 * 0.05 +
    metrics.outcomeValueScore * 0.1 +
    metrics.downstreamUtility * 0.05
  );

  let trend: EfficiencyScore["trend"] = "stable";
  if (previousComposite !== undefined) {
    if (composite > previousComposite + 3) trend = "improving";
    else if (composite < previousComposite - 3) trend = "degrading";
  }

  let recommendation = "Maintain current configuration";
  if (composite < 40) recommendation = "Review agent configuration — low efficiency";
  else if (metrics.overrideRate > 0.3) recommendation = "High override rate — retrain or adjust prompts";
  else if (metrics.intelligenceReuseRate < 0.2) recommendation = "Low intelligence reuse — check asset library coverage";
  else if (metrics.costEfficiency < 30) recommendation = "Poor cost efficiency — consider model tier downgrade";
  else if (composite > 85) recommendation = "Excellent — consider expanding scope";

  return {
    entityId,
    entityType,
    period: new Date().toISOString().slice(0, 7),
    ...metrics,
    compositeScore: composite,
    trend,
    recommendation,
  };
}
