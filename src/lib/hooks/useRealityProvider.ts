// ═══════════════════════════════════════════════════════════════
// SITA OS — useRealityProvider Hook
// Central hook for mode-aware data fetching across all domains.
// In real mode: returns real DB data or honest empty states.
// In demo mode: returns scenario-backed demo data.
// NEVER silently falls back to mock in real mode.
// ═══════════════════════════════════════════════════════════════

import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";

export interface ModeAwareResult<T> {
  data: T;
  source: "real" | "demo" | "empty";
  mode: RealityModeKey;
  isDemo: boolean;
}

/**
 * Returns current reality mode for data service resolution.
 * Data services use this to decide: real query vs demo data vs empty.
 */
export function useRealityProvider() {
  const ctx = useRealityModeSafe();
  return {
    mode: ctx.mode,
    isDemo: ctx.isDemo,
    isReal: ctx.isReal,
    scenarioKey: ctx.scenarioKey,
  };
}

/**
 * Helper: resolve data based on mode.
 * - real mode + has data → return real data
 * - real mode + no data → return empty default
 * - demo mode → return demo data
 */
export function resolveByMode<T>(opts: {
  mode: RealityModeKey;
  realData: T | null | undefined;
  demoData: T;
  emptyDefault: T;
}): ModeAwareResult<T> {
  const isDemo = opts.mode === "demo" || opts.mode === "dev_demo" || opts.mode === "sandbox";

  if (isDemo) {
    return { data: opts.demoData, source: "demo", mode: opts.mode, isDemo: true };
  }

  // Real mode: use real data or honest empty state — NEVER mock fallback
  if (opts.realData !== null && opts.realData !== undefined) {
    // Check if it's an empty array
    if (Array.isArray(opts.realData) && opts.realData.length === 0) {
      return { data: opts.emptyDefault, source: "empty", mode: opts.mode, isDemo: false };
    }
    return { data: opts.realData, source: "real", mode: opts.mode, isDemo: false };
  }

  return { data: opts.emptyDefault, source: "empty", mode: opts.mode, isDemo: false };
}
