// ═══════════════════════════════════════════════════════════════
// SITA OS — usePageData Hook
// Canonical wrapper for page-level data fetching with built-in
// loading, error, empty, and ready state resolution.
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
 * Universal empty check that handles every shape:
 * - null / undefined → empty
 * - Array → length === 0
 * - Plain object → Object.keys().length === 0
 * - Anything else → falsy check
 */
function defaultEmptyCheck<T>(data: T): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object") return Object.keys(data as object).length === 0;
  return !data;
}

/**
 * Wraps useQuery with standardized page-level state resolution.
 * Returns a `state` enum that maps directly to canonical components:
 * - "loading" → <PageSkeleton />
 * - "error"   → <PageErrorState /> with retry
 * - "empty"   → <PremiumEmptyState variant="no-data" />
 * - "ready"   → render content
 */
export function usePageData<T>(
  options: UseQueryOptions<T, Error> & { emptyCheck?: (data: T) => boolean }
): PageDataResult<T> {
  const { emptyCheck, ...queryOpts } = options;
  const query = useQuery<T, Error>(queryOpts);

  const isEmpty =
    query.data !== undefined &&
    (emptyCheck ? emptyCheck(query.data) : defaultEmptyCheck(query.data));

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