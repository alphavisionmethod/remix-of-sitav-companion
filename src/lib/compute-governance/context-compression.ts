// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Compression Layer
// Prevents unnecessary long-context cost through intelligent
// compression, summaries, and context tiering.
// ═══════════════════════════════════════════════════════════════

import type { CostClass } from "./model-routing-engine";

export type CompressionMethod =
  | "rolling-summary"
  | "entity-snapshot"
  | "mission-packet"
  | "issue-fingerprint"
  | "compact-memory"
  | "retrieval-slice"
  | "evidence-bundle"
  | "context-tier";

export interface CompressionConfig {
  method: CompressionMethod;
  maxTokens: number;
  preserveRecency: boolean;
  preserveEntities: boolean;
  qualityTarget: number;       // 0-1, higher = more info preserved
}

export interface CompressionResult {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  method: CompressionMethod;
  qualityScore: number;
  tokensSaved: number;
  costSavedCents: number;
}

// ── Compression Strategies by Cost Class ────────────────────

export const CLASS_COMPRESSION: Record<CostClass, CompressionConfig> = {
  A: { method: "issue-fingerprint", maxTokens: 1000, preserveRecency: true, preserveEntities: false, qualityTarget: 0.6 },
  B: { method: "rolling-summary", maxTokens: 4000, preserveRecency: true, preserveEntities: true, qualityTarget: 0.75 },
  C: { method: "evidence-bundle", maxTokens: 16000, preserveRecency: true, preserveEntities: true, qualityTarget: 0.9 },
  D: { method: "context-tier", maxTokens: 48000, preserveRecency: true, preserveEntities: true, qualityTarget: 0.95 },
};

export function estimateCompression(
  originalTokens: number,
  costClass: CostClass,
  costPerToken: number,
): CompressionResult {
  const config = CLASS_COMPRESSION[costClass];
  const compressedTokens = Math.min(originalTokens, config.maxTokens);
  const ratio = originalTokens > 0 ? compressedTokens / originalTokens : 1;
  const saved = originalTokens - compressedTokens;

  return {
    originalTokens,
    compressedTokens,
    compressionRatio: ratio,
    method: config.method,
    qualityScore: config.qualityTarget,
    tokensSaved: saved,
    costSavedCents: Math.ceil((saved / 1000) * costPerToken),
  };
}

// ── Inference Cache ─────────────────────────────────────────

export interface CacheEntry {
  cacheKey: string;
  tenantId: string;
  scope: "tenant" | "workspace" | "agent" | "global";
  resultHash: string;
  result: string;
  modelUsed: string;
  tokensOriginal: number;
  createdAt: string;
  expiresAt: string;
  hitCount: number;
  lastHitAt?: string;
  tags: string[];
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  tokensSaved: number;
  costSavedCents: number;
  topHitEntries: Array<{ key: string; hits: number }>;
  staleEntries: number;
  invalidatedToday: number;
}

export function shouldUseCache(
  entry: CacheEntry | null,
  maxAgeSec: number,
  requiresFresh: boolean,
): { useCache: boolean; reason: string } {
  if (!entry) return { useCache: false, reason: "No cached result" };
  if (requiresFresh) return { useCache: false, reason: "Fresh result required" };

  const ageMs = Date.now() - new Date(entry.createdAt).getTime();
  const ageSec = ageMs / 1000;

  if (ageSec > maxAgeSec) return { useCache: false, reason: `Cache expired (${Math.round(ageSec)}s old)` };
  return { useCache: true, reason: `Cached result available (${Math.round(ageSec)}s old, ${entry.hitCount} hits)` };
}

// ── Deep Reasoning Escalation ───────────────────────────────

export type DeepReasoningMode = "explicit-deep" | "strategic-review" | "premium-debate" | "async-compute" | "mission-escalation";

export interface DeepReasoningRequest {
  requestId: string;
  mode: DeepReasoningMode;
  tenantId: string;
  planTier: string;
  estimatedMinutes: number;
  estimatedCostCents: number;
  justification: string;
  approved: boolean;
  approvedBy?: string;
  planCapRemaining: number;
  timestamp: string;
}

export function checkDeepReasoningEligibility(
  planMaxMinutes: number,
  usedMinutes: number,
  estimatedMinutes: number,
  isOperatorOverride: boolean,
): { eligible: boolean; reason: string; remainingMinutes: number } {
  if (planMaxMinutes === -1) return { eligible: true, reason: "Unlimited plan", remainingMinutes: -1 };
  if (isOperatorOverride) return { eligible: true, reason: "Operator override", remainingMinutes: planMaxMinutes - usedMinutes };

  const remaining = planMaxMinutes - usedMinutes;
  if (estimatedMinutes > remaining) {
    return { eligible: false, reason: `Need ${estimatedMinutes}min, only ${remaining}min remaining`, remainingMinutes: remaining };
  }
  return { eligible: true, reason: "Within allowance", remainingMinutes: remaining - estimatedMinutes };
}
