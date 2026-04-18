// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Collector Helpers
// Small shared utilities used by every collector.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";
import { detectActiveRuntimeTier } from "@/runtimes/runtime-detection";

/** Build a baseline record with a single tier probe and timestamp. */
export function makeRecord(
  collectorId: string,
  manifestId: string,
  payload: Record<string, unknown>,
  opts: { itemCount: number; ok?: boolean; warnings?: string[]; errors?: string[] },
): RuntimeEvidenceRecord {
  return {
    collectorId,
    manifestId,
    capturedAt: new Date().toISOString(),
    runtimeTier: detectActiveRuntimeTier(),
    ok: opts.ok ?? (opts.errors == null || opts.errors.length === 0),
    itemCount: opts.itemCount,
    payload,
    warnings: opts.warnings ?? [],
    errors: opts.errors ?? [],
  };
}

/** Safely access a property from a global runtime singleton. */
export function safeGet<T>(getter: () => T, fallback: T): T {
  try {
    return getter();
  } catch {
    return fallback;
  }
}
