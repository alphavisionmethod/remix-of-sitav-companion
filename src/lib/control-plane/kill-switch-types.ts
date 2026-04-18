// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Types
// Canonical type surface for the kill-switch control plane.
// Kept separate from the registry so enforcement maps, dependency
// maps, and runtime hooks can import types without pulling the
// full registry data graph.
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextId } from "@/platform/architecture/bounded-context-types";

/** Operational state of a kill switch */
export type KillSwitchState = "active" | "armed" | "disarmed" | "testing";

/** User-visible / business impact of activating a switch */
export type ImpactLevel =
  | "minimal"
  | "moderate"
  | "significant"
  | "severe"
  | "total";

/** Where the switch is enforced in the runtime stack */
export type EnforcementLayer =
  | "edge-function"
  | "domain-service"
  | "ui-gate"
  | "scheduler"
  | "connector"
  | "ai-gateway"
  | "release-pipeline"
  | "appliance-update"
  | "self-healing";

/** Which automated/UX consequence fires when the switch flips active */
export type RuntimeConsequenceClass =
  | "block-mutation"
  | "queue-and-defer"
  | "show-degraded-banner"
  | "hide-feature"
  | "force-refusal"
  | "stop-scheduled-runs"
  | "rollback-release"
  | "freeze-ingestion";

export interface KillSwitchEntry {
  readonly switchId: string;
  readonly target: string;
  readonly displayName: string;
  readonly description: string;
  readonly impactLevel: ImpactLevel;
  readonly affectedServices: readonly string[];
  readonly affectedTables: readonly string[];
  readonly affectedEdgeFunctions: readonly string[];
  readonly userFacingImpact: string;
  readonly rollbackProcedure: string;
  readonly requiresDualApproval: boolean;
  readonly cooldownMs: number;
  readonly runbookRef: string | null;
  readonly defaultState: KillSwitchState;
  /** Bounded context this switch primarily protects (Phase 1 cross-link) */
  readonly boundedContextId: BoundedContextId;
  /** Layers where this switch is enforced */
  readonly enforcementLayers: readonly EnforcementLayer[];
  /** Other switches that should also be considered when this one trips */
  readonly dependsOn: readonly string[];
  /** Switches that become redundant when this one is active */
  readonly supersedes: readonly string[];
  /** Owner team responsible for the protected subsystem */
  readonly ownerTeam: string;
}

export interface EnforcementPoint {
  readonly switchId: string;
  readonly layer: EnforcementLayer;
  /** File or edge function that performs the gate check */
  readonly enforcedAt: string;
  /** Symbol or function name that performs the check */
  readonly symbol: string;
  /** Plain-language description of what is blocked */
  readonly blocks: string;
}

export interface SwitchDependencyEdge {
  readonly fromSwitchId: string;
  readonly toSwitchId: string;
  readonly relation: "depends-on" | "supersedes" | "co-activates";
  readonly rationale: string;
}

export interface RuntimeConsequence {
  readonly switchId: string;
  readonly consequenceClass: RuntimeConsequenceClass;
  readonly userMessage: string;
  readonly bannerSeverity: "info" | "warning" | "critical";
  /** UI surface(s) that should display the consequence */
  readonly surfaces: readonly ("web" | "desktop" | "mobile" | "admin")[];
  /** Should affected mutations emit a structured negative receipt? */
  readonly emitsNegativeReceipt: boolean;
}

export interface KillSwitchGateResult {
  readonly switchId: string;
  readonly allowed: boolean;
  readonly state: KillSwitchState;
  readonly reason: string;
  readonly consequence: RuntimeConsequence | null;
  readonly checkedAt: string;
}
