// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Asset Generation Layer (3.3)
// Turns useful reasoning outputs into reusable intelligence assets.
// ═══════════════════════════════════════════════════════════════

import type { IntelligenceAssetType, IntelligenceAsset } from "./intelligence-reuse-engine";

export type AssetGenerationSource =
  | "accepted_diagnosis" | "successful_change_plan" | "approved_strategic_memo"
  | "successful_mission_plan" | "accepted_design_proposal" | "successful_self_heal"
  | "accepted_revenue_recommendation" | "launch_packet" | "release_analysis"
  | "workflow_template" | "automation_playbook";

export interface AssetGenerationInput {
  source: AssetGenerationSource;
  domain: string;
  title: string;
  content: string;
  evidenceRefs: string[];
  entityRefs: string[];
  actionRefs: string[];
  environment?: string;
  confidence: number;
  agentId: string;
  tenantId: string;
}

export interface AssetGenerationResult {
  asset: IntelligenceAsset;
  invalidationTriggers: string[];
  freshnessEstimate: number;        // minutes TTL
  reuseEligibility: boolean;
  qualityEstimate: number;          // 0-100
}

// ── Source → AssetType mapping ───────────────────────────────

const SOURCE_TO_TYPE: Record<AssetGenerationSource, IntelligenceAssetType> = {
  accepted_diagnosis: "root-cause-analysis",
  successful_change_plan: "change-plan",
  approved_strategic_memo: "strategic-summary",
  successful_mission_plan: "mission-decomposition",
  accepted_design_proposal: "design-recommendation",
  successful_self_heal: "issue-fingerprint",
  accepted_revenue_recommendation: "growth-recommendation",
  launch_packet: "release-readiness-packet",
  release_analysis: "rollout-analysis",
  workflow_template: "workflow-template",
  automation_playbook: "automation-playbook",
};

// ── Invalidation trigger inference ──────────────────────────

function inferInvalidationTriggers(source: AssetGenerationSource, domain: string): string[] {
  const triggers: string[] = ["schema_change", "policy_change"];

  if (domain === "engineering") triggers.push("deployment", "dependency_update", "architecture_change");
  if (domain === "revenue-business") triggers.push("pricing_change", "competitor_change", "market_shift");
  if (domain === "digital-presence") triggers.push("layout_change", "content_update", "analytics_shift");
  if (domain === "investment-finance") triggers.push("market_event", "portfolio_rebalance", "regulatory_change");
  if (source === "successful_self_heal") triggers.push("recurrence", "escalation");
  if (source === "launch_packet" || source === "release_analysis") triggers.push("new_release", "blocker_change");

  return triggers;
}

// ── Freshness estimation ────────────────────────────────────

function estimateFreshness(source: AssetGenerationSource): number {
  const ttlMap: Record<AssetGenerationSource, number> = {
    accepted_diagnosis: 10080,           // 7 days
    successful_change_plan: 4320,        // 3 days
    approved_strategic_memo: 43200,      // 30 days
    successful_mission_plan: 10080,
    accepted_design_proposal: 20160,     // 14 days
    successful_self_heal: 20160,
    accepted_revenue_recommendation: 10080,
    launch_packet: 1440,                 // 1 day
    release_analysis: 2880,              // 2 days
    workflow_template: 43200,
    automation_playbook: 43200,
  };
  return ttlMap[source] || 10080;
}

// ── Public API ──────────────────────────────────────────────

export function generateAsset(input: AssetGenerationInput): AssetGenerationResult {
  const now = new Date().toISOString();
  const assetType = SOURCE_TO_TYPE[input.source] || "pattern";
  const freshness = estimateFreshness(input.source);
  const invalidationTriggers = inferInvalidationTriggers(input.source, input.domain);
  const qualityEstimate = Math.min(100, input.confidence + 10);

  const asset: IntelligenceAsset = {
    assetId: `ia-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: assetType,
    domain: input.domain,
    title: input.title,
    content: input.content,
    tags: [input.source, input.domain],
    confidence: input.confidence,
    verifiedAt: now,
    createdAt: now,
    updatedAt: now,
    createdByAgent: input.agentId,
    usageCount: 0,
    qualityScore: qualityEstimate,
    acceptanceRate: 0,
    applicableContextHash: "",
    tenantId: input.tenantId,
    scope: "tenant",
    status: "active",
    freshnessTTLMinutes: freshness,
    metadata: {
      evidenceRefs: input.evidenceRefs,
      entityRefs: input.entityRefs,
      actionRefs: input.actionRefs,
      environment: input.environment,
      generationSource: input.source,
    },
  };

  return {
    asset,
    invalidationTriggers,
    freshnessEstimate: freshness,
    reuseEligibility: input.confidence >= 60,
    qualityEstimate,
  };
}

export function shouldGenerateAsset(
  source: AssetGenerationSource,
  confidence: number,
  accepted: boolean,
): boolean {
  // Only generate assets from accepted/successful outcomes with sufficient confidence
  if (!accepted) return false;
  if (confidence < 50) return false;
  return true;
}
