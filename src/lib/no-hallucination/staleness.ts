// ============================================================
// SITA OS — Staleness Engine
// Per-source freshness tracking and threshold enforcement
// ============================================================

import type { StalenessState, SourceFreshness, FreshnessLevel } from "./types";

// Domain-specific staleness thresholds in milliseconds
const DOMAIN_THRESHOLDS: Record<string, number> = {
  finance: 4 * 60 * 60 * 1000,       // 4h — financial data must be very fresh
  business: 24 * 60 * 60 * 1000,     // 24h — CRM data acceptable within a day
  concierge: 12 * 60 * 60 * 1000,    // 12h — scheduling data semi-fresh
  trust: 1 * 60 * 60 * 1000,         // 1h — policy/approval state must be current
  connector: 6 * 60 * 60 * 1000,     // 6h — external connector data
  default: 24 * 60 * 60 * 1000,      // 24h fallback
};

const AGING_RATIO = 0.7; // >70% of threshold = aging

export function evaluateStaleness(
  sources: Array<{ id: string; name: string; domain: string; lastUpdated: string }>,
  thresholdOverrides?: Record<string, number>
): StalenessState {
  const now = Date.now();

  const evaluated: SourceFreshness[] = sources.map(s => {
    const threshold = thresholdOverrides?.[s.id]
      ?? DOMAIN_THRESHOLDS[s.domain]
      ?? DOMAIN_THRESHOLDS.default;
    const lastMs = new Date(s.lastUpdated).getTime();
    const ageMs = now - lastMs;

    return {
      id: s.id,
      name: s.name,
      lastUpdated: s.lastUpdated,
      ageMs,
      threshold,
      isStale: ageMs > threshold,
    };
  });

  const overallFreshness = computeOverallFreshness(evaluated);

  return { sources: evaluated, overallFreshness };
}

function computeOverallFreshness(sources: SourceFreshness[]): FreshnessLevel {
  if (sources.length === 0) return "critical";

  const staleCount = sources.filter(s => s.isStale).length;
  const staleRatio = staleCount / sources.length;

  if (staleRatio >= 0.5) return "critical";
  if (staleRatio > 0) return "stale";

  const agingCount = sources.filter(s => s.ageMs > s.threshold * AGING_RATIO).length;
  if (agingCount / sources.length > 0.5) return "aging";

  return "fresh";
}

export function getStaleSourceNames(state: StalenessState): string[] {
  return state.sources.filter(s => s.isStale).map(s => s.name);
}

export function shouldBlockOnStaleness(state: StalenessState): boolean {
  return state.overallFreshness === "critical";
}
