// ═══════════════════════════════════════════════════════════════
// SITA OS — useModeData: Universal Mode-Aware Data Hook
// In demo mode → returns demo data
// In real mode → queries Supabase, returns real data or empty state
// NEVER silently falls back to mock data in real mode.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DataSource = "real" | "demo" | "empty";

export interface ModeDataResult<T> {
  data: T;
  source: DataSource;
  isDemo: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Universal mode-aware data hook.
 * @param key - React Query key
 * @param demoData - Data to return in demo mode
 * @param realFetcher - Async function that returns real data from Supabase
 * @param emptyDefault - Fallback for real mode when no data exists
 */
export function useModeData<T>(
  key: string | string[],
  demoData: T,
  realFetcher: () => Promise<T>,
  emptyDefault: T,
): ModeDataResult<T> {
  const { isDemoMode } = useDataMode();
  const queryKey = Array.isArray(key) ? ["mode-data", ...key] : ["mode-data", key];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, isDemoMode ? "demo" : "real"],
    queryFn: async () => {
      if (isDemoMode) return demoData;
      try {
        const result = await realFetcher();
        // If result is an empty array, return emptyDefault
        if (Array.isArray(result) && result.length === 0) return emptyDefault;
        if (result === null || result === undefined) return emptyDefault;
        return result;
      } catch {
        return emptyDefault;
      }
    },
    staleTime: isDemoMode ? Infinity : 30_000,
    refetchOnWindowFocus: !isDemoMode,
  });

  const resolved = data ?? (isDemoMode ? demoData : emptyDefault);
  const source: DataSource = isDemoMode ? "demo" : (resolved === emptyDefault ? "empty" : "real");

  return {
    data: resolved,
    source,
    isDemo: isDemoMode,
    isLoading: !isDemoMode && isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Simple mode gate — returns demo or empty depending on mode.
 * For pages that don't have real data yet.
 */
export function useModeGate<T>(demoData: T, emptyDefault: T): { data: T; isDemo: boolean; source: DataSource } {
  const { isDemoMode } = useDataMode();
  return {
    data: isDemoMode ? demoData : emptyDefault,
    isDemo: isDemoMode,
    source: isDemoMode ? "demo" : "empty",
  };
}
