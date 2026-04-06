// ═══════════════════════════════════════════════════════════════
// SITA OS — Query Freshness Hook
// Extracts freshness metadata from React Query results
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export interface QueryFreshnessProps {
  lastFetchedAt: Date | null;
  onRefresh: () => void;
}

export function useQueryFreshness(queryResult: UseQueryResult<any, any>): QueryFreshnessProps {
  return useMemo(() => ({
    lastFetchedAt: queryResult.dataUpdatedAt ? new Date(queryResult.dataUpdatedAt) : null,
    onRefresh: () => queryResult.refetch(),
  }), [queryResult.dataUpdatedAt, queryResult.refetch]);
}
