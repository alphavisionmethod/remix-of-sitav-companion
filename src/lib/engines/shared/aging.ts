// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Aging Utilities
// Single source of aging computation. Used by trust debt,
// execution debt, and founder bottleneck engines.
// ═══════════════════════════════════════════════════════════════

import type { AgingModel, AgingTier } from "../../types/meta-governance.types";

export interface AgingThresholds {
  aging: number;
  stale: number;
  critical: number;
}

export const TRUST_AGING_MS: AgingThresholds = {
  aging: 24 * 60 * 60 * 1000,
  stale: 7 * 24 * 60 * 60 * 1000,
  critical: 30 * 24 * 60 * 60 * 1000,
};

export const EXECUTION_AGING_MS: AgingThresholds = {
  aging: 4 * 60 * 60 * 1000,
  stale: 24 * 60 * 60 * 1000,
  critical: 72 * 60 * 60 * 1000,
};

export function computeAgingTier(ageMs: number, thresholds: AgingThresholds): AgingTier {
  if (ageMs >= thresholds.critical) return "critical";
  if (ageMs >= thresholds.stale) return "stale";
  if (ageMs >= thresholds.aging) return "aging";
  return "fresh";
}

export function computeAging(detectedAt: string, thresholds: AgingThresholds): AgingModel {
  const ageMs = Date.now() - new Date(detectedAt).getTime();
  return { detectedAt, ageMs, tier: computeAgingTier(ageMs, thresholds) };
}

