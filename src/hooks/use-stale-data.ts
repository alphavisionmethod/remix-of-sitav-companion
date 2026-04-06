// ═══════════════════════════════════════════════════════════════
// SITA OS — Stale Data Indicator Hook
// Shows when data hasn't been refreshed and may be outdated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";

export type DataFreshness = "fresh" | "aging" | "stale" | "expired";

export interface UseStaleDataReturn {
  freshness: DataFreshness;
  lastFetchedAt: Date | null;
  ageMs: number;
  ageLabel: string;
  isFresh: boolean;
}

const FRESHNESS_THRESHOLDS = {
  aging: 60_000,       // 1 min
  stale: 300_000,      // 5 min
  expired: 1_800_000,  // 30 min
};

function getAgeLabel(ageMs: number): string {
  if (ageMs < 5_000) return "just now";
  if (ageMs < 60_000) return `${Math.floor(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.floor(ageMs / 60_000)}m ago`;
  return `${Math.floor(ageMs / 3_600_000)}h ago`;
}

function getFreshness(ageMs: number): DataFreshness {
  if (ageMs < FRESHNESS_THRESHOLDS.aging) return "fresh";
  if (ageMs < FRESHNESS_THRESHOLDS.stale) return "aging";
  if (ageMs < FRESHNESS_THRESHOLDS.expired) return "stale";
  return "expired";
}

export function useStaleData(lastFetchedAt: Date | null | undefined): UseStaleDataReturn {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!lastFetchedAt) {
      return {
        freshness: "expired" as DataFreshness,
        lastFetchedAt: null,
        ageMs: Infinity,
        ageLabel: "never",
        isFresh: false,
      };
    }
    const ageMs = now - lastFetchedAt.getTime();
    return {
      freshness: getFreshness(ageMs),
      lastFetchedAt,
      ageMs,
      ageLabel: getAgeLabel(ageMs),
      isFresh: ageMs < FRESHNESS_THRESHOLDS.aging,
    };
  }, [lastFetchedAt, now]);
}
