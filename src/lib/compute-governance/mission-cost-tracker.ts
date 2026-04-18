// ═══════════════════════════════════════════════════════════════
// SITA OS — Mission Cost Tracker
// Tracks true cost per mission for margin analysis,
// low-value/high-cost detection, and plan tuning.
// ═══════════════════════════════════════════════════════════════

import type { CostClass, ComputeModelTier } from "./model-routing-engine";

// ── Mission Cost Record ─────────────────────────────────────

export interface MissionCostRecord {
  missionId: string;
  tenantId: string;
  workspaceId?: string;
  title: string;
  domain: "finance-os" | "business-os" | "concierge-os" | "admin";
  status: "active" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;

  // Agent invocations
  agentInvocations: AgentInvocation[];
  totalAgentCalls: number;

  // Cost breakdown
  modelTiersUsed: ComputeModelTier[];
  costClassDistribution: Record<CostClass, number>;  // count per class
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;

  // Budget
  estimatedCostCents: number;         // pre-mission estimate
  actualCostCents: number;            // running actual
  contextCompressionSavingsCents: number;
  cacheSavingsCents: number;
  retryCostCents: number;

  // Async & verification
  asyncJobCount: number;
  asyncJobCostCents: number;
  verificationCostCents: number;
  evidenceExportCostCents: number;

  // Value / outcome
  valueScore?: number;                // 0-100, optional human or auto rating
  outcomeClassification?: "high-value" | "standard" | "low-value" | "waste" | "unrated";
  costEfficiencyRatio?: number;       // value / cost, higher = better

  // Derived
  isOverBudget: boolean;
  marginImpactCents: number;          // positive = profitable
}

export interface AgentInvocation {
  invocationId: string;
  agentId: string;
  agentName: string;
  modelUsed: string;
  tier: ComputeModelTier;
  costClass: CostClass;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  latencyMs: number;
  wasRetry: boolean;
  wasAsync: boolean;
  wasCached: boolean;
  timestamp: string;
}

// ── Mission Cost Analysis ───────────────────────────────────

export interface MissionCostAnalysis {
  totalMissions: number;
  totalCostCents: number;
  avgCostPerMissionCents: number;
  highValueMissions: number;
  lowValueHighCostMissions: number;
  wasteMissions: number;
  costByDomain: Record<string, number>;
  costByModelTier: Record<ComputeModelTier, number>;
  costByCostClass: Record<CostClass, number>;
  topExpensiveMissions: MissionCostRecord[];
  topWasteMissions: MissionCostRecord[];
  totalSavingsFromCacheCents: number;
  totalSavingsFromCompressionCents: number;
  overallCostEfficiency: number;
  recommendations: string[];
}

export function analyzeMissionCosts(missions: MissionCostRecord[]): MissionCostAnalysis {
  const totalCost = missions.reduce((s, m) => s + m.actualCostCents, 0);
  const completed = missions.filter(m => m.status === "completed");

  const costByDomain: Record<string, number> = {};
  const costByTier: Record<ComputeModelTier, number> = { utility: 0, standard: 0, premium: 0, exceptional: 0 };
  const costByClass: Record<CostClass, number> = { A: 0, B: 0, C: 0, D: 0 };

  for (const m of missions) {
    costByDomain[m.domain] = (costByDomain[m.domain] || 0) + m.actualCostCents;
    for (const inv of m.agentInvocations) {
      costByTier[inv.tier] += inv.costCents;
      costByClass[inv.costClass] += inv.costCents;
    }
  }

  const lowValueHighCost = completed.filter(
    m => m.outcomeClassification === "low-value" && m.actualCostCents > 100
  );
  const waste = completed.filter(m => m.outcomeClassification === "waste");
  const highValue = completed.filter(m => m.outcomeClassification === "high-value");

  const totalCache = missions.reduce((s, m) => s + m.cacheSavingsCents, 0);
  const totalCompression = missions.reduce((s, m) => s + m.contextCompressionSavingsCents, 0);

  const recs: string[] = [];
  if (lowValueHighCost.length > 3) recs.push(`${lowValueHighCost.length} low-value missions costing >$1 — review agent routing`);
  if (waste.length > 0) recs.push(`${waste.length} waste missions detected — check autonomy config`);
  if (totalCache < totalCost * 0.1) recs.push("Cache savings under 10% — improve cache strategy");

  const scored = completed.filter(m => m.costEfficiencyRatio !== undefined);
  const avgEfficiency = scored.length > 0
    ? scored.reduce((s, m) => s + (m.costEfficiencyRatio ?? 0), 0) / scored.length
    : 0;

  return {
    totalMissions: missions.length,
    totalCostCents: totalCost,
    avgCostPerMissionCents: missions.length > 0 ? Math.round(totalCost / missions.length) : 0,
    highValueMissions: highValue.length,
    lowValueHighCostMissions: lowValueHighCost.length,
    wasteMissions: waste.length,
    costByDomain,
    costByModelTier: costByTier,
    costByCostClass: costByClass,
    topExpensiveMissions: [...missions].sort((a, b) => b.actualCostCents - a.actualCostCents).slice(0, 5),
    topWasteMissions: waste.slice(0, 5),
    totalSavingsFromCacheCents: totalCache,
    totalSavingsFromCompressionCents: totalCompression,
    overallCostEfficiency: avgEfficiency,
    recommendations: recs,
  };
}

// ── Mission Cost Factory ────────────────────────────────────

export function createMissionCostRecord(
  missionId: string,
  tenantId: string,
  title: string,
  domain: MissionCostRecord["domain"],
  estimatedCostCents: number,
): MissionCostRecord {
  return {
    missionId, tenantId, title, domain,
    status: "active",
    startedAt: new Date().toISOString(),
    agentInvocations: [],
    totalAgentCalls: 0,
    modelTiersUsed: [],
    costClassDistribution: { A: 0, B: 0, C: 0, D: 0 },
    totalInputTokens: 0, totalOutputTokens: 0, totalCachedTokens: 0,
    estimatedCostCents, actualCostCents: 0,
    contextCompressionSavingsCents: 0, cacheSavingsCents: 0, retryCostCents: 0,
    asyncJobCount: 0, asyncJobCostCents: 0,
    verificationCostCents: 0, evidenceExportCostCents: 0,
    outcomeClassification: "unrated",
    isOverBudget: false, marginImpactCents: 0,
  };
}

export function recordInvocation(
  mission: MissionCostRecord,
  invocation: AgentInvocation,
): MissionCostRecord {
  const updated = { ...mission };
  updated.agentInvocations = [...updated.agentInvocations, invocation];
  updated.totalAgentCalls += 1;
  updated.actualCostCents += invocation.costCents;
  updated.totalInputTokens += invocation.inputTokens;
  updated.totalOutputTokens += invocation.outputTokens;
  if (invocation.wasCached) updated.totalCachedTokens += invocation.inputTokens + invocation.outputTokens;
  if (invocation.wasRetry) updated.retryCostCents += invocation.costCents;
  if (invocation.wasAsync) { updated.asyncJobCount += 1; updated.asyncJobCostCents += invocation.costCents; }

  updated.costClassDistribution = { ...updated.costClassDistribution };
  updated.costClassDistribution[invocation.costClass] += 1;

  if (!updated.modelTiersUsed.includes(invocation.tier)) {
    updated.modelTiersUsed = [...updated.modelTiersUsed, invocation.tier];
  }

  updated.isOverBudget = updated.actualCostCents > updated.estimatedCostCents;
  return updated;
}
