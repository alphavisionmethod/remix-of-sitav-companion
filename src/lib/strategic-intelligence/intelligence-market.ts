// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Market / Internal Exchange
// Capital allocation for AI intelligence spend.
// ═══════════════════════════════════════════════════════════════

export interface MarketAllocation {
  domain: string;
  currentSpendCents: number;
  roiMultiple: number;
  qualityScore: number;
  reuseRate: number;
  acceptanceRate: number;
  overrideRate: number;
  budgetAllocationPercent: number;
  recommendation: AllocationRecommendation;
  recommendedAdjustment: number;     // + or - percent
}

export type AllocationRecommendation =
  | "increase_allocation"
  | "maintain_allocation"
  | "decrease_allocation"
  | "rebalance_to_reuse"
  | "investigate_waste";

export interface MarketSnapshot {
  snapshotId: string;
  measuredAt: string;
  totalSpendCents: number;
  allocations: MarketAllocation[];
  overfundedDomains: string[];
  underfundedDomains: string[];
  highestROIDomain: string;
  lowestROIDomain: string;
  reallocationOpportunityCents: number;
}

export interface AllocationInput {
  domain: string;
  spendCents: number;
  roiMultiple: number;
  qualityScore: number;
  reuseRate: number;
  acceptanceRate: number;
  overrideRate: number;
}

// ── Market Analysis ────────────────────────────────────────

export function analyzeMarket(inputs: AllocationInput[]): MarketSnapshot {
  const totalSpend = inputs.reduce((s, i) => s + i.spendCents, 0);
  const avgROI = inputs.reduce((s, i) => s + i.roiMultiple, 0) / Math.max(inputs.length, 1);

  const allocations: MarketAllocation[] = inputs.map(i => {
    const budgetPct = totalSpend > 0 ? (i.spendCents / totalSpend) * 100 : 0;
    let rec: AllocationRecommendation = "maintain_allocation";
    let adjustment = 0;

    if (i.roiMultiple > avgROI * 1.5 && i.qualityScore > 75) {
      rec = "increase_allocation";
      adjustment = Math.min(15, Math.round((i.roiMultiple / avgROI - 1) * 10));
    } else if (i.roiMultiple < avgROI * 0.5) {
      rec = "decrease_allocation";
      adjustment = -Math.min(15, Math.round((1 - i.roiMultiple / avgROI) * 10));
    } else if (i.reuseRate < 0.3 && i.qualityScore > 70) {
      rec = "rebalance_to_reuse";
      adjustment = -5;
    } else if (i.overrideRate > 0.2 || i.acceptanceRate < 0.7) {
      rec = "investigate_waste";
      adjustment = -10;
    }

    return { ...i, budgetAllocationPercent: Math.round(budgetPct * 10) / 10, recommendation: rec, recommendedAdjustment: adjustment };
  });

  const sorted = [...allocations].sort((a, b) => b.roiMultiple - a.roiMultiple);
  const overfunded = allocations.filter(a => a.recommendation === "decrease_allocation" || a.recommendation === "investigate_waste").map(a => a.domain);
  const underfunded = allocations.filter(a => a.recommendation === "increase_allocation").map(a => a.domain);
  const reallocationOpp = allocations.filter(a => a.recommendedAdjustment < 0).reduce((s, a) => s + Math.abs(a.recommendedAdjustment) * totalSpend / 100, 0);

  return {
    snapshotId: `mkt-${Date.now()}`,
    measuredAt: new Date().toISOString(),
    totalSpendCents: totalSpend,
    allocations,
    overfundedDomains: overfunded,
    underfundedDomains: underfunded,
    highestROIDomain: sorted[0]?.domain || "",
    lowestROIDomain: sorted[sorted.length - 1]?.domain || "",
    reallocationOpportunityCents: Math.round(reallocationOpp),
  };
}
