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
