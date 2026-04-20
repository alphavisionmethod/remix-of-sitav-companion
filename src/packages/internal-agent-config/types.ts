// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Config Package
// Types, rights, councils, and 40 agent definitions
// ═══════════════════════════════════════════════════════════════

export type InternalAgentCouncil =
  | "product-build"
  | "reliability-ops"
  | "security-trust"
  | "runtime-cost"
  | "architecture-governance"
  | "knowledge-coordination";

export type AgentRightsLevel =
  | "observe"
  | "diagnose"
  | "recommend"
  | "draft"
  | "simulate"
  | "approval_ready"
  | "constrained_action_ready";

export type AgentScheduleType = "continuous" | "hourly" | "daily" | "on-event";
export type AgentMaturity = "scaffold" | "alpha" | "beta" | "production";

/**
 * Explicit runtime wiring status for each registry agent.
 * - "wired"            — agent has a real edge-function invocation path
 * - "scheduled-only"   — pg_cron row exists but executor body not yet implemented
 * - "ui-surface-only"  — agent renders in admin UI but is not on a scheduler
 * - "deferred"         — registered for completeness; runtime intentionally postponed
 */
export type AgentRuntimeStatus =
  | "wired"
  | "scheduled-only"
  | "ui-surface-only"
  | "deferred";

export interface AgentRuntimeStatusEntry {
  runtimeStatus: AgentRuntimeStatus;
  /** Edge function path (relative to repo root) when status === "wired". */
  runtimeInvocationPath?: string;
  /** Required when status === "deferred". */
  deferredReason?: string;
  /** Required when status === "deferred". ISO date or human label like "post-launch". */
  deferredEta?: string;
  /** Optional alias the runtime addresses this agent by (e.g. legacy "st-*"). */
  runtimeAliasId?: string;
}

export interface ConfidenceRules {
  minConfidenceToAct: number;
  minConfidenceToRecommend: number;
}

export interface InternalAgentDefinition {
  agentId: string;
  name: string;
  council: InternalAgentCouncil;
  mission: string;
  specialAbility: string;
  scope: string[];
  outOfScope: string[];
  toolsAllowed: string[];
  toolsForbidden: string[];
  memoryScope: string;
  triggerConditions: string[];
  escalationTargets: string[];
  receivesEscalationsFrom: string[];
  confidenceRules: ConfidenceRules;
  simulationRequirements: string[];
  humanApprovalRequirements: string[];
  maxAutonomyLevel: AgentRightsLevel;
  rollbackAuthority: string;
  reportingOutputs: string[];
  measurableKpis: string[];
  costBudgetGuidance: string;
  failureHandlingRules: string[];
  relatedServices: string[];
  relatedDocs: string[];
  schedule: AgentScheduleType;
  triggerEvents: string[];
  maturity: AgentMaturity;
  tags: string[];
}

export interface CouncilDefinition {
  councilId: InternalAgentCouncil;
  name: string;
  purpose: string;
  agentCount: number;
  supervisorId: string;
  quorum: number;
  vetoAuthority: boolean;
}

export interface SupervisorDefinition {
  supervisorId: string;
  name: string;
  council: InternalAgentCouncil | "all";
  maxConcurrentEscalations: number;
  canOverride: boolean;
  canSuspend: boolean;
  responsibilities: string[];
}
