// ═══════════════════════════════════════════════════════════════
// SITA OS — useModedData Hook
// Canonical helper for choosing between real and demo data based
// on the active data mode. Centralises the runtime enforcement
// pattern so individual pages no longer need to repeat the
// `isDemoMode ? demo : real` ternary inline.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useDataMode } from "@/contexts/DataModeContext";

export interface ModedDataResult<T> {
  data: T;
  isDemo: boolean;
  isLive: boolean;
  source: "demo" | "live" | "empty";
}

/**
 * Returns demo data in demo mode, real data in live mode.
 * If real data is null/undefined in live mode, returns the
 * `emptyDefault` (or demo data wrapped as `empty` source).
 *
 * NEVER silently falls back from real → demo. If `realData` is
 * null in live mode, source becomes "empty" so the caller can
 * render an honest EmptyState.
 */
export function useModedData<T>(
  realData: T | null | undefined,
  demoData: T,
  emptyDefault?: T,
): ModedDataResult<T> {
  const { isDemoMode } = useDataMode();

  return useMemo<ModedDataResult<T>>(() => {
    if (isDemoMode) {
      return { data: demoData, isDemo: true, isLive: false, source: "demo" };
    }
    if (realData === null || realData === undefined) {
      const fallback = (emptyDefault ?? (Array.isArray(demoData) ? ([] as unknown as T) : demoData));
      return { data: fallback, isDemo: false, isLive: true, source: "empty" };
    }
    return { data: realData, isDemo: false, isLive: true, source: "live" };
  }, [isDemoMode, realData, demoData, emptyDefault]);
}
