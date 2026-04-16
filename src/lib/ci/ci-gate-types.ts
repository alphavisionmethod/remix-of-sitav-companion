// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate Types (Phase 8)
// Canonical type surface for the CI Manifests Umbrella. Every CI
// validation script in `scripts/architecture/checks/` is registered
// as a CIGateEntry, classified by phase (1–7), severity, and the
// downstream artifact it produces or consumes.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/lib/architecture/bounded-context-types";

/** Architectural phase a CI gate enforces. */
export type CIPhase =
  | "phase-1-bounded-context"
  | "phase-2-architecture-invariants"
  | "phase-3-feature-integration"
  | "phase-4-control-plane"
  | "phase-5-runbooks"
  | "phase-6-golden-paths"
  | "phase-7-meta-arch"
  | "phase-8-ci-umbrella"
  | "cross-cutting";

/** Severity of a gate failure. */
export type CIGateSeverity = "blocker" | "high" | "medium" | "advisory";

/** When a gate is expected to run. */
export type CITrigger =
  | "pr-required"
  | "pr-advisory"
  | "nightly"
  | "release-gate"
  | "deploy-gate"
  | "manual";

/** Stable kebab-case CI gate identifier (e.g. "CI-RUNBOOK-COVERAGE"). */
export type CIGateId = string;

/** Health classification of an individual gate. */
export type CIGateHealth =
  | "passing"
  | "failing"
  | "stale"
  | "unknown";

export interface CIGateEntry {
  readonly gateId: CIGateId;
  readonly title: string;
  readonly description: string;
  readonly phase: CIPhase;
  readonly severity: CIGateSeverity;
  readonly trigger: CITrigger;
  /** Path to the validator script, relative to repo root. */
  readonly scriptPath: string;
  /** Generated artifact this gate validates against (if any). */
  readonly producesArtifact: string | null;
  /** Other generated artifacts the gate reads (read-side dependency). */
  readonly readsArtifacts: readonly string[];
  /** Bounded context primarily protected by this gate. */
  readonly boundedContextId: BoundedContextId | null;
  /** Owning team/boundary. */
  readonly owner: string;
  /** Whether this gate blocks the production release pipeline. */
  readonly blocksRelease: boolean;
  /** Whether this gate blocks PR merges. */
  readonly blocksMerge: boolean;
}

export interface CIPhaseSummary {
  readonly phase: CIPhase;
  readonly displayName: string;
  readonly description: string;
  readonly totalGates: number;
  readonly blockerGates: number;
  readonly releaseBlockingGates: number;
  readonly mergeBlockingGates: number;
}

export interface CIUmbrellaSnapshot {
  readonly capturedAt: string;
  readonly totals: {
    readonly gates: number;
    readonly blockers: number;
    readonly releaseBlocking: number;
    readonly mergeBlocking: number;
    readonly phases: number;
  };
  readonly phases: readonly CIPhaseSummary[];
  readonly gates: readonly CIGateEntry[];
}

export interface CIGateIntegrityIssue {
  readonly severity: "error" | "warning";
  readonly gateId: CIGateId | null;
  readonly kind:
    | "missing-script"
    | "duplicate-id"
    | "orphan-artifact"
    | "unknown-context"
    | "phase-mismatch";
  readonly message: string;
}

export interface CIGateIntegrityReport {
  readonly checkedAt: string;
  readonly gateCount: number;
  readonly issues: readonly CIGateIntegrityIssue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly ok: boolean;
}
