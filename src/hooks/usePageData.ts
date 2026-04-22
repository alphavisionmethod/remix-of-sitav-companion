// ═══════════════════════════════════════════════════════════════
// SITA OS — usePageData Hook
// Canonical wrapper for page-level data fetching with built-in
// loading, error, and empty state resolution.
// ═══════════════════════════════════════════════════════════════

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export type PageDataState = "loading" | "error" | "empty" | "ready";

export interface PageDataResult<T> {
  data: T;
  state: PageDataState;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isReady: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Wraps useQuery with standardized page-level state resolution.
 * Returns a `state` enum that maps directly to canonical components:
 * - "loading" → <PageSkeleton />
 * - "error" → <PremiumEmptyState variant="degraded" />
 * - "empty" → <PremiumEmptyState variant="no-data" />
 * - "ready" → render content
 */
export function usePageData<T>(
  options: UseQueryOptions<T, Error> & { emptyCheck?: (data: T) => boolean }
): PageDataResult<T> {
  const { emptyCheck, ...queryOpts } = options;
  const query = useQuery<T, Error>(queryOpts);

  const isEmpty = query.data !== undefined && (
    emptyCheck
      ? emptyCheck(query.data)
      : Array.isArray(query.data)
        ? query.data.length === 0
        : query.data === null
  );

  const state: PageDataState = query.isLoading
    ? "loading"
    : query.isError
      ? "error"
      : isEmpty
        ? "empty"
        : "ready";

  return {
    data: query.data as T,
    state,
    isLoading: state === "loading",
    isError: state === "error",
    isEmpty: state === "empty",
    isReady: state === "ready",
    error: query.error,
    refetch: query.refetch,
  };
}