// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Reuse Engine
// Captures, indexes, and reuses prior reasoning artifacts to
// avoid expensive re-computation and improve consistency.
// ═══════════════════════════════════════════════════════════════

// ── Intelligence Asset Types ────────────────────────────────

export type IntelligenceAssetType =
  | "root-cause-analysis"
  | "issue-fingerprint"
  | "advisor-memo"
  | "mission-decomposition"
  | "change-plan"
  | "design-recommendation"
  | "approval-justification"
  | "strategic-summary"
  | "rollout-analysis"
  | "growth-recommendation"
  | "investment-thesis"
  | "scenario-framework"
  | "website-diagnostic"
  | "cro-finding"
  | "automation-playbook"
  | "workflow-template"
  | "release-readiness-packet"
  | "pattern"
  | "decision-frame"
  | "domain-heuristic"
  | "warning-fingerprint"
  | "optimization-pattern"
  | "mission-archetype";

export interface IntelligenceAsset {
  assetId: string;
  type: IntelligenceAssetType;
  domain: string;
  title: string;
  content: string;                    // structured reasoning artifact
  embedding?: number[];               // for similarity search
  tags: string[];
  confidence: number;                 // 0-100
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
  createdByAgent: string;
  usageCount: number;
  lastUsedAt?: string;
  qualityScore: number;               // 0-100
  acceptanceRate: number;             // 0-1
  applicableContextHash: string;      // for staleness detection
  expiresAt?: string;
  tenantId: string;
  scope: "tenant" | "workspace" | "global" | "cross-tenant-anonymized";
  status: "active" | "stale" | "invalidated" | "archived";
  freshnessTTLMinutes: number;
  parentAssetId?: string;             // for versioning
  metadata: Record<string, unknown>;
}

// ── Similarity & Reuse ──────────────────────────────────────

export interface ReuseCandidate {
  asset: IntelligenceAsset;
  similarityScore: number;            // 0-1
  freshnessScore: number;             // 0-1
  applicabilityScore: number;         // 0-1
  compositeScore: number;             // weighted combination
  adaptationRequired: boolean;
  adaptationComplexity: "none" | "trivial" | "moderate" | "significant";
  estimatedSavingsCents: number;
}

export interface ReuseDecision {
  reuse: boolean;
  candidate?: ReuseCandidate;
  reason: string;
  costIfReused: number;
  costIfFresh: number;
  qualityRisk: "none" | "low" | "medium" | "high";
}

export function evaluateReuse(
  candidates: ReuseCandidate[],
  minSimilarity: number = 0.75,
  maxStalenessMinutes: number = 1440,
): ReuseDecision {
  const viable = candidates
    .filter(c => c.similarityScore >= minSimilarity && c.freshnessScore > 0.3)
    .sort((a, b) => b.compositeScore - a.compositeScore);

  if (viable.length === 0) {
    return { reuse: false, reason: "No viable candidates above thresholds", costIfReused: 0, costIfFresh: 100, qualityRisk: "none" };
  }

  const best = viable[0];
  const qualityRisk = best.adaptationComplexity === "significant" ? "medium"
    : best.freshnessScore < 0.5 ? "low" : "none";

  return {
    reuse: true,
    candidate: best,
    reason: `Reusing ${best.asset.type} (similarity: ${(best.similarityScore * 100).toFixed(0)}%, freshness: ${(best.freshnessScore * 100).toFixed(0)}%)`,
    costIfReused: Math.round(best.estimatedSavingsCents * 0.2), // adaptation cost
    costIfFresh: best.estimatedSavingsCents,
    qualityRisk,
  };
}

// ── Asset Library Operations ────────────────────────────────

export interface AssetLibraryStats {
  totalAssets: number;
  activeAssets: number;
  staleAssets: number;
  byType: Record<IntelligenceAssetType, number>;
  byDomain: Record<string, number>;
  totalReuses: number;
  avgQualityScore: number;
  avgAcceptanceRate: number;
  topReusedAssets: IntelligenceAsset[];
  estimatedTotalSavingsCents: number;
}

export function computeLibraryStats(assets: IntelligenceAsset[]): AssetLibraryStats {
  const active = assets.filter(a => a.status === "active");
  const stale = assets.filter(a => a.status === "stale");

  const byType: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  let totalReuses = 0;
  let qualitySum = 0;
  let acceptSum = 0;

  for (const a of assets) {
    byType[a.type] = (byType[a.type] || 0) + 1;
    byDomain[a.domain] = (byDomain[a.domain] || 0) + 1;
    totalReuses += a.usageCount;
    qualitySum += a.qualityScore;
    acceptSum += a.acceptanceRate;
  }

  const topReused = [...assets].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
  const avgSavingsPerReuse = 45; // cents

  return {
    totalAssets: assets.length,
    activeAssets: active.length,
    staleAssets: stale.length,
    byType: byType as Record<IntelligenceAssetType, number>,
    byDomain,
    totalReuses,
    avgQualityScore: assets.length > 0 ? Math.round(qualitySum / assets.length) : 0,
    avgAcceptanceRate: assets.length > 0 ? acceptSum / assets.length : 0,
    topReusedAssets: topReused,
    estimatedTotalSavingsCents: totalReuses * avgSavingsPerReuse,
  };
}

export function createAsset(
  type: IntelligenceAssetType,
  domain: string,
  title: string,
  content: string,
  agentId: string,
  tenantId: string,
  tags: string[] = [],
  ttlMinutes: number = 1440,
): IntelligenceAsset {
  const now = new Date().toISOString();
  return {
    assetId: `ia-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type, domain, title, content,
    tags,
    confidence: 80,
    verifiedAt: now,
    createdAt: now,
    updatedAt: now,
    createdByAgent: agentId,
    usageCount: 0,
    qualityScore: 75,
    acceptanceRate: 0,
    applicableContextHash: "",
    tenantId,
    scope: "tenant",
    status: "active",
    freshnessTTLMinutes: ttlMinutes,
    metadata: {},
  };
}
