// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Efficiency Scoring & Outcome Economics
// Scores every agent/workflow on quality, cost efficiency,
// acceptance rate, and outcome value. Tracks cost per useful
// outcome for routing optimization.
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

// ── Outcome Economics ───────────────────────────────────────

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

export interface OutcomeRecord {
  outcomeId: string;
  outcomeType: OutcomeType;
  domain: string;
  description: string;
  costCents: number;                  // total AI cost to achieve
  estimatedValueCents: number;        // estimated business value
  roi: number;                        // value / cost
  agentsInvolved: string[];
  intelligenceAssetsUsed: string[];   // reused asset IDs
  modelTiersUsed: string[];
  timestamp: string;
  tenantId: string;
  verified: boolean;
}

export interface OutcomeEconomicsReport {
  period: string;
  totalOutcomes: number;
  totalCostCents: number;
  totalValueCents: number;
  overallROI: number;
  byOutcomeType: Record<string, { count: number; costCents: number; valueCents: number; avgROI: number }>;
  byDomain: Record<string, { count: number; costCents: number; valueCents: number }>;
  topHighROI: OutcomeRecord[];
  topLowROI: OutcomeRecord[];
  costPerOutcomeType: Record<string, number>;
  recommendations: string[];
}

export function computeOutcomeEconomics(outcomes: OutcomeRecord[]): OutcomeEconomicsReport {
  const totalCost = outcomes.reduce((s, o) => s + o.costCents, 0);
  const totalValue = outcomes.reduce((s, o) => s + o.estimatedValueCents, 0);

  const byType: Record<string, { count: number; costCents: number; valueCents: number; avgROI: number }> = {};
  const byDomain: Record<string, { count: number; costCents: number; valueCents: number }> = {};
  const costPerType: Record<string, number> = {};

  for (const o of outcomes) {
    if (!byType[o.outcomeType]) byType[o.outcomeType] = { count: 0, costCents: 0, valueCents: 0, avgROI: 0 };
    byType[o.outcomeType].count++;
    byType[o.outcomeType].costCents += o.costCents;
    byType[o.outcomeType].valueCents += o.estimatedValueCents;

    if (!byDomain[o.domain]) byDomain[o.domain] = { count: 0, costCents: 0, valueCents: 0 };
    byDomain[o.domain].count++;
    byDomain[o.domain].costCents += o.costCents;
    byDomain[o.domain].valueCents += o.estimatedValueCents;
  }

  for (const [type, stats] of Object.entries(byType)) {
    stats.avgROI = stats.costCents > 0 ? stats.valueCents / stats.costCents : 0;
    costPerType[type] = stats.count > 0 ? Math.round(stats.costCents / stats.count) : 0;
  }

  const sorted = [...outcomes].sort((a, b) => b.roi - a.roi);
  const recs: string[] = [];
  const lowROI = sorted.filter(o => o.roi < 1);
  if (lowROI.length > 3) recs.push(`${lowROI.length} outcomes with ROI < 1x — review if these are worth the compute`);
  const highReuse = outcomes.filter(o => o.intelligenceAssetsUsed.length > 0);
  if (highReuse.length < outcomes.length * 0.3) recs.push("Low intelligence reuse rate — expand asset library");

  return {
    period: new Date().toISOString().slice(0, 7),
    totalOutcomes: outcomes.length,
    totalCostCents: totalCost,
    totalValueCents: totalValue,
    overallROI: totalCost > 0 ? Math.round((totalValue / totalCost) * 100) / 100 : 0,
    byOutcomeType: byType,
    byDomain,
    topHighROI: sorted.slice(0, 5),
    topLowROI: sorted.slice(-5).reverse(),
    costPerOutcomeType: costPerType,
    recommendations: recs,
  };
}

// ── Cross-Tenant Pattern Learning ───────────────────────────

export interface AnonymizedPattern {
  patternId: string;
  patternType: "issue-signature" | "regression" | "crm-leakage" | "trust-gap" | "deployment-failure" | "self-heal-outcome" | "low-value-loop";
  description: string;
  frequency: number;
  confidence: number;
  tenantCount: number;                // anonymized
  applicableDomains: string[];
  suggestedAction: string;
  createdAt: string;
  lastSeenAt: string;
}
