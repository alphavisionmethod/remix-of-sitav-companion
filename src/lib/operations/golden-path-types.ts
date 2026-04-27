// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Types
// Canonical types for the Golden Path Registry. Every Golden Path
// is a critical, end-to-end customer or operator journey that the
// platform MUST keep green for launch readiness.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/platform/architecture/bounded-context-types";

/** Stable, kebab-case Golden Path identifier (e.g. "GP-SIGN-IN"). */
export type GoldenPathId =
  | "GP-FIRST-BOOT"
  | "GP-SIGN-IN"
  | "GP-RESTORE"
  | "GP-SETUP-CONTINUATION"
  | "GP-CONNECT-CRM"
  | "GP-OAUTH-AND-SYNC"
  | "GP-RECOVER-STALE-LEADS"
  | "GP-APPROVE-OUTBOUND-FOLLOWUP"
  | "GP-REVIEW-PROOF"
  | "GP-WORKFLOW-REPLAY"
  | "GP-MOBILE-APPROVAL"
  | "GP-PUSH-TO-APPROVAL"
  | "GP-OWNER-INTERVENTION"
  | "GP-LAUNCH-READINESS"
  | "GP-ENV-RECOVERY"
  // Phase 10 — End-to-end flow continuity Golden Paths
  | "GP-OPPORTUNITY-TO-PAID-INVOICE"
  | "GP-LEAD-TO-RECOVERED-VALUE"
  | "GP-SUPPORT-TO-HEALTH-SIGNAL"
  | "GP-CRM-CONCIERGE-LINKAGE"
  | "GP-BACKGROUND-TASK-SOURCE-NAV";

/** Persona executing the path. */
export type GoldenPathPersona =
  | "new-user"
  | "owner"
  | "operator"
  | "admin"
  | "advisor"
  | "support";

/** Launch criticality classifier. */
export type GoldenPathCriticality = "P0" | "P1" | "P2";

/** Surface families a Golden Path step can land on. */
export type GoldenPathSurface =
  | "web"
  | "desktop"
  | "mobile-pwa"
  | "ios"
  | "android"
  | "appliance"
  | "admin-console";

/** Verification mechanism that proves a step actually works. */
export type GoldenPathVerificationKind =
  | "playwright-e2e"
  | "runtime-probe"
  | "receipt-emitted"
  | "workflow-state-transition"
  | "manifest-evidence"
  | "manual-attestation";

/** A single step inside a Golden Path. */
export interface GoldenPathStep {
  readonly stepId: string;
  readonly order: number;
  readonly title: string;
  readonly description: string;
  /** Route or surface entry the step takes place on. */
  readonly surface: GoldenPathSurface;
  /** Route pattern (e.g. "/login", "/admin/runbooks"). */
  readonly routePattern: string;
  /** Bounded context that owns this step. */
  readonly contextId: BoundedContextId;
  /** Mutations expected to be issued during the step. */
  readonly expectedMutations: readonly string[];
  /** Receipts the step must emit on success. */
  readonly expectedReceipts: readonly string[];
  /** Verification mechanisms covering this step. */
  readonly verifications: readonly GoldenPathVerificationKind[];
  /** Optional kill switches that, if armed, MUST block this step. */
  readonly blockingKillSwitches: readonly string[];
  /** Optional runbook IDs that recover this step on failure. */
  readonly recoveryRunbookRefs: readonly string[];

  // ── Phase 29: 11-Dimension Reality Map ──────────────────────
  /** React component file backing this screen, e.g. "src/pages/Login.tsx". */
  readonly screenComponentRef?: string;
  /** Edge function names invoked by this step (resolves in EDGE_FUNCTION_REGISTRY). */
  readonly edgeFunctionRefs: readonly string[];
  /** Canonical service IDs touched (resolves in CANONICAL_SERVICES). */
  readonly serviceRefs: readonly string[];
  /** DB table names mutated/read (resolves in DB_SCHEMA_REGISTRY). */
  readonly tableRefs: readonly string[];
  /** RLS policy refs in form "table.policy_key" — informational; not all migrations are indexed. */
  readonly policyRefs: readonly string[];
}

/** Verification artifact bound to a Golden Path. */
export interface GoldenPathVerification {
  readonly kind: GoldenPathVerificationKind;
  /** File path or test glob backing the verification. */
  readonly artifactRef: string;
  /** Owner team responsible for keeping the verification green. */
  readonly owner: string;
  /** Last green run timestamp (ISO) or null if never run. */
  readonly lastGreenAt: string | null;
}

/** Full Golden Path entry. */
export interface GoldenPathEntry {
  readonly pathId: GoldenPathId;
  readonly title: string;
  readonly summary: string;
  readonly persona: GoldenPathPersona;
  readonly criticality: GoldenPathCriticality;
  /** Primary bounded context that owns the path. */
  readonly primaryContextId: BoundedContextId;
  /** All bounded contexts traversed by the path. */
  readonly contextIds: readonly BoundedContextId[];
  /** Owning team responsible for keeping the path green. */
  readonly ownerTeam: string;
  /** Surfaces the path runs on. */
  readonly surfaces: readonly GoldenPathSurface[];
  /** Ordered list of steps. */
  readonly steps: readonly GoldenPathStep[];
  /** Cross-cutting verifications (full-journey level). */
  readonly verifications: readonly GoldenPathVerification[];
  /** Kill switches that, if armed, must block the path entirely. */
  readonly blockingKillSwitches: readonly string[];
  /** Runbook IDs that recover the path on incident. */
  readonly recoveryRunbookRefs: readonly string[];
  /** Receipts emitted when the full path completes. */
  readonly completionReceipts: readonly string[];
  /** Maximum allowed end-to-end latency (ms). */
  readonly slaLatencyMsP95: number;
  /** Required coverage (0–100). */
  readonly requiredCoveragePct: number;
  /** Whether a runtime probe is required to keep the path certified. */
  readonly runtimeProbeRequired: boolean;
  /** Last full-path certification timestamp (ISO). */
  readonly lastCertifiedAt: string | null;

  // ── Phase 29: Path-level Reality Map fields ─────────────────
  /** Launch readiness gate IDs that must be green before this path can ship. */
  readonly releaseGateRefs: readonly string[];
  /** Deep-link operators follow when a path fails (FCC04 / runbook center). */
  readonly supportFallbackUrl: string;
}

/** Ownership binding: who owns the path end-to-end. */
export interface GoldenPathOwnership {
  readonly pathId: GoldenPathId;
  readonly primaryContextId: BoundedContextId;
  readonly ownerTeam: string;
  readonly escalationTarget: string;
  readonly slo: {
    readonly p95LatencyMs: number;
    readonly successRatePct: number;
    readonly weeklyExecutions: number;
  };
}

/** Step → bounded-context binding (denormalized for fast lookup). */
export interface GoldenPathStepBinding {
  readonly pathId: GoldenPathId;
  readonly stepId: string;
  readonly contextId: BoundedContextId;
}
