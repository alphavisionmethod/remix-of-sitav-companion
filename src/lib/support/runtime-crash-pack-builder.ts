// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Crash Pack Builder
// Captures structured crash/failure diagnostics for support.
// ═══════════════════════════════════════════════════════════════

import type { BundlePack, RedactionRecord } from "./support-bundle-contract";
import { applyRedactionPolicy } from "./support-redaction-policy";

export interface CrashMetadata {
  readonly crashId: string;
  readonly timestamp: string;
  readonly source: "shell" | "bridge" | "app-window" | "runtime-provider" | "startup" | "recovery" | "unknown";
  readonly errorMessage: string;
  readonly stackTrace: string | null;
  readonly componentName: string | null;
  readonly routePath: string | null;
  readonly appId: string | null;
}

export interface RuntimeCrashPack {
  readonly recentCrashes: readonly CrashMetadata[];
  readonly restartAttempts: number;
  readonly recoveryState: "none" | "in-progress" | "completed" | "failed";
  readonly runtimeHealthSignals: Record<string, string>;
  readonly linkedRunbookIds: readonly string[];
  readonly capturedAt: string;
}

/**
 * Build a runtime crash pack from collected crash events.
 */
export function buildRuntimeCrashPack(options: {
  crashes: CrashMetadata[];
  restartAttempts?: number;
  recoveryState?: RuntimeCrashPack["recoveryState"];
  healthSignals?: Record<string, string>;
  linkedRunbookIds?: string[];
}): RuntimeCrashPack {
  return {
    recentCrashes: options.crashes.slice(0, 50),
    restartAttempts: options.restartAttempts ?? 0,
    recoveryState: options.recoveryState ?? "none",
    runtimeHealthSignals: options.healthSignals ?? {},
    linkedRunbookIds: options.linkedRunbookIds ?? [],
    capturedAt: new Date().toISOString(),
  };
}

/** Convert to a redacted BundlePack. */
export function toCrashPack(pack: RuntimeCrashPack): BundlePack {
  const raw = pack as unknown as Record<string, unknown>;
  const { data, redactions } = applyRedactionPolicy(raw);
  return {
    packType: "runtime-crash",
    capturedAt: pack.capturedAt,
    data,
    redactedFields: redactions,
  };
}