// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Capital Index
// Treats reusable intelligence as an asset base with ROI tracking.
// ═══════════════════════════════════════════════════════════════

export interface IntelligenceCapitalSnapshot {
  snapshotId: string;
  measuredAt: string;
  totalAssetCount: number;
  activeAssetCount: number;
  staleAssetCount: number;
  weightedAssetValue: number;       // composite: confidence × reuse × freshness
  reuseRate: number;                // 0-1
  costAvoidedCents: number;
  valueCreatedCents: number;
  assetFreshnessAvg: number;        // 0-100
  decayRate: number;                // % assets decaying per period
  domainRichness: Record<string, DomainCapitalScore>;
  roiMultiple: number;              // value created / cost of asset creation
  capitalGrowthTrend: "growing" | "stable" | "declining";
  periodLabel: string;
}

export interface DomainCapitalScore {
  domain: string;
  assetCount: number;
  activeCount: number;
  reuseRate: number;
  costAvoided: number;
  valueCreated: number;
  freshness: number;
  richness: number;                 // 0-100 composite
}

export interface AssetValuation {
  assetId: string;
  intrinsicValue: number;           // based on confidence + evidence
  reuseValue: number;               // based on usage count × avg savings
  freshnessPenalty: number;         // decay discount
  netValue: number;
  contributionToCapital: number;    // % of total
}

// ── Capital Computation ────────────────────────────────────

export function computeCapitalIndex(
  assets: Array<{
    assetId: string;
    domain: string;
    confidence: number;
    usageCount: number;
    qualityScore: number;
    freshnessTTLMinutes: number;
    createdAt: string;
    status: "active" | "stale" | "invalidated";
    costToCreateCents: number;
    savingsPerReuseCents: number;
  }>,
  periodLabel: string = "current",
): IntelligenceCapitalSnapshot {
  const now = new Date();
  const active = assets.filter(a => a.status === "active");
  const stale = assets.filter(a => a.status === "stale");

  const domainMap: Record<string, DomainCapitalScore> = {};
  let totalCostAvoided = 0;
  let totalValueCreated = 0;
  let totalWeightedValue = 0;
  let totalFreshness = 0;
  let totalReuseCount = 0;

  for (const a of assets) {
    const savings = a.usageCount * a.savingsPerReuseCents;
    totalCostAvoided += savings;
    totalValueCreated += savings;
    totalReuseCount += a.usageCount;

    const ageMinutes = (now.getTime() - new Date(a.createdAt).getTime()) / 60000;
    const freshness = Math.max(0, Math.min(100, 100 - (ageMinutes / a.freshnessTTLMinutes) * 100));
    totalFreshness += freshness;

    const weight = (a.confidence / 100) * (freshness / 100) * Math.min(a.usageCount, 50) / 50;
    totalWeightedValue += weight * 100;

    if (!domainMap[a.domain]) {
      domainMap[a.domain] = { domain: a.domain, assetCount: 0, activeCount: 0, reuseRate: 0, costAvoided: 0, valueCreated: 0, freshness: 0, richness: 0 };
    }
    const d = domainMap[a.domain];
    d.assetCount++;
    if (a.status === "active") d.activeCount++;
    d.costAvoided += savings;
    d.valueCreated += savings;
    d.freshness += freshness;
  }

  for (const d of Object.values(domainMap)) {
    d.freshness = d.assetCount > 0 ? Math.round(d.freshness / d.assetCount) : 0;
    d.reuseRate = d.assetCount > 0 ? d.activeCount / d.assetCount : 0;
    d.richness = Math.min(100, Math.round((d.assetCount * 5 + d.activeCount * 10 + d.freshness) / 3));
  }

  const totalCostToCreate = assets.reduce((s, a) => s + a.costToCreateCents, 0);
  const roi = totalCostToCreate > 0 ? totalValueCreated / totalCostToCreate : 0;

  return {
    snapshotId: `ic-${Date.now()}`,
    measuredAt: now.toISOString(),
    totalAssetCount: assets.length,
    activeAssetCount: active.length,
    staleAssetCount: stale.length,
    weightedAssetValue: Math.round(totalWeightedValue),
    reuseRate: assets.length > 0 ? totalReuseCount / (assets.length * 10) : 0,
    costAvoidedCents: totalCostAvoided,
    valueCreatedCents: totalValueCreated,
    assetFreshnessAvg: assets.length > 0 ? Math.round(totalFreshness / assets.length) : 0,
    decayRate: assets.length > 0 ? (stale.length / assets.length) * 100 : 0,
    domainRichness: domainMap,
    roiMultiple: Math.round(roi * 10) / 10,
    capitalGrowthTrend: roi > 5 ? "growing" : roi > 2 ? "stable" : "declining",
    periodLabel,
  };
}

export function valuateAsset(
  asset: { assetId: string; confidence: number; usageCount: number; savingsPerReuseCents: number; freshnessTTLMinutes: number; createdAt: string },
  totalCapitalValue: number,
): AssetValuation {
  const ageMinutes = (Date.now() - new Date(asset.createdAt).getTime()) / 60000;
  const freshness = Math.max(0, 1 - ageMinutes / asset.freshnessTTLMinutes);
  const intrinsic = asset.confidence;
  const reuseVal = asset.usageCount * asset.savingsPerReuseCents;
  const penalty = 1 - freshness;
  const net = Math.round((intrinsic + reuseVal) * freshness);

  return {
    assetId: asset.assetId,
    intrinsicValue: intrinsic,
    reuseValue: reuseVal,
    freshnessPenalty: Math.round(penalty * 100),
    netValue: net,
    contributionToCapital: totalCapitalValue > 0 ? Math.round((net / totalCapitalValue) * 10000) / 100 : 0,
  };
}
