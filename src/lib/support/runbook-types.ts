// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Types
// Canonical type surface for the support runbook control plane.
// Kept separate from the registry so subsystem maps, CI checks,
// and admin UIs can import types without pulling registry data.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/platform/architecture/bounded-context-types";

export type RunbookSeverity = "low" | "medium" | "high" | "critical";
export type RunbookStatus = "draft" | "reviewed" | "approved" | "tested";

/** Operational subsystem a runbook covers — used for cross-linking. */
export type RunbookSubsystem =
  | "auth"
  | "ai-providers"
  | "sync"
  | "workflow"
  | "proof"
  | "manifest-drift"
  | "push"
  | "desktop-host"
  | "release"
  | "ai-degradation"
  | "connectors"
  | "setup"
  | "approvals"
  | "db"
  | "rls"
  | "mobile-push"
  | "runtime-probe"
  | "support-escalation"
  | "ingress";

export interface RunbookStep {
  readonly order: number;
  readonly action: string;
  readonly command: string | null;
  readonly expectedOutcome: string;
  readonly rollbackAction: string | null;
  readonly timeoutMs: number;
}

export interface RunbookEntry {
  readonly runbookId: string;
  readonly title: string;
  readonly description: string;
  readonly severity: RunbookSeverity;
  readonly status: RunbookStatus;
  readonly triggerCondition: string;
  readonly affectedServices: readonly string[];
  readonly killSwitchRef: string | null;
  readonly messageCodeRef: string | null;
  readonly steps: readonly RunbookStep[];
  readonly escalationTarget: string;
  readonly estimatedResolutionMs: number;
  readonly lastTestedAt: string | null;
  readonly owner: string;
  /** Bounded context this runbook protects (Phase 1 cross-link). */
  readonly boundedContextId: BoundedContextId;
  /** Operational subsystem (used by `runbook-subsystem-map`). */
  readonly subsystem: RunbookSubsystem;
  /** Path to the human-readable markdown runbook (relative to repo root). */
  readonly markdownRef: string;
}
