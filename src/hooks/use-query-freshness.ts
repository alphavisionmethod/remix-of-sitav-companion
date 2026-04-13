// ═══════════════════════════════════════════════════════════════
// SITA OS — Query Freshness Hook
// Extracts freshness metadata from React Query results
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export interface QueryFreshnessProps {
  lastFetchedAt: Date | null;
  onRefresh: () => void;
  label: string;
}

export function useQueryFreshness(queryResult: UseQueryResult<any, any>): QueryFreshnessProps {
  return useMemo(() => {
    const lastFetchedAt = queryResult.dataUpdatedAt ? new Date(queryResult.dataUpdatedAt) : null;
    let label = "unknown";
    if (lastFetchedAt) {
      const age = Date.now() - lastFetchedAt.getTime();
      label = age < 30_000 ? "fresh" : age < 120_000 ? "aging" : age < 600_000 ? "stale" : "expired";
    }
    return { lastFetchedAt, onRefresh: () => queryResult.refetch(), label };
  }, [queryResult.dataUpdatedAt, queryResult.refetch]);
}
