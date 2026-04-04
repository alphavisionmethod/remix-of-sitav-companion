// ═══════════════════════════════════════════════════════════════
// SITA OS — Memory: No-Hallucination: Staleness State
// ═══════════════════════════════════════════════════════════════

export type FreshnessLevel = "fresh" | "aging" | "stale" | "critical";

export interface SourceFreshness {
  id: string;
  name: string;
  lastUpdated: string;
  ageMs: number;
  threshold: number;
  isStale: boolean;
}

export interface StalenessState {
  sources: SourceFreshness[];
  overallFreshness: FreshnessLevel;
}
