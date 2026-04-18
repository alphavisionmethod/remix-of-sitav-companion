// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Architecture Types (Phase 7)
// Unified types that aggregate Phase 1–6 registries into a single
// queryable lattice for admin surfaces and the integrity validator.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextEntry, BoundedContextId } from "@/lib/architecture/bounded-context-types";
import type { KillSwitchEntry } from "@/lib/control-plane/kill-switch-types";
import type { RunbookEntry } from "@/lib/support/runbook-types";
import type { GoldenPathEntry, GoldenPathId } from "@/lib/operations/golden-path-types";

/**
 * Aggregate health classification for a single bounded context.
 * Computed by combining live kill-switch state, golden-path
 * evaluation, and runbook coverage signals.
 */
export type MetaContextHealth = "healthy" | "degraded" | "blocked" | "unknown";

export interface MetaContextSummary {
  readonly contextId: BoundedContextId;
  readonly contextName: string;
  readonly owner: string;
  readonly killSwitches: readonly string[];
  readonly armedKillSwitches: readonly string[];
  readonly runbooks: readonly string[];
  readonly goldenPaths: readonly GoldenPathId[];
  readonly blockedGoldenPaths: readonly GoldenPathId[];
  readonly degradedGoldenPaths: readonly GoldenPathId[];
  readonly health: MetaContextHealth;
}

export interface MetaArchSnapshot {
  readonly capturedAt: string;
  readonly armedSwitchIds: readonly string[];
  readonly contexts: readonly MetaContextSummary[];
  readonly totals: {
    readonly contexts: number;
    readonly killSwitches: number;
    readonly runbooks: number;
    readonly goldenPaths: number;
    readonly armedKillSwitches: number;
    readonly blockedGoldenPaths: number;
    readonly degradedGoldenPaths: number;
  };
}

export interface RegistryIntegrityIssue {
  readonly severity: "error" | "warning";
  readonly registry:
    | "bounded-context"
    | "kill-switch"
    | "runbook"
    | "golden-path"
    | "cross-link";
  readonly subject: string;
  readonly message: string;
}

export interface RegistryIntegrityReport {
  readonly checkedAt: string;
  readonly contextCount: number;
  readonly killSwitchCount: number;
  readonly runbookCount: number;
  readonly goldenPathCount: number;
  readonly issues: readonly RegistryIntegrityIssue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly ok: boolean;
}

export type AnyRegistryEntry =
  | BoundedContextEntry
  | KillSwitchEntry
  | RunbookEntry
  | GoldenPathEntry;
