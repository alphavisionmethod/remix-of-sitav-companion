// ═══════════════════════════════════════════════════
// SITA OS — Internal AI Workforce Type System
// Canonical contracts for 40 agents, 6 councils, 7 supervisors
// ═══════════════════════════════════════════════════

export type InternalAgentCouncil =
  | "product-build"
  | "reliability-ops"
  | "security-trust"
  | "runtime-cost"
  | "architecture-governance"
  | "knowledge-coordination";

export type AgentRightsLevel =
  | "observe"          // L0
  | "diagnose"         // L1
  | "recommend"        // L2
  | "draft"            // L3
  | "simulate"         // L4
  | "approval_ready"   // L5
  | "constrained_action_ready"; // L6

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
  quorum: number; // percentage
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

// Runtime state tracked per agent
export interface AgentRuntimeState {
  agentId: string;
  status: "active" | "paused" | "cooldown" | "error";
  invocationCount: number;
  lastAction: string;
  lastActionTimestamp: string;
  confidenceAvg: number;
  costTokens: number;
  costCompute: number;
  escalationCount: number;
  failureCount: number;
  simulationOnly: boolean;
}

export interface SupervisorRuntimeState {
  supervisorId: string;
  status: "active" | "paused";
  overrideCount: number;
  activeEscalations: number;
  lastOverride: string | null;
}

// Action pipeline tracking (Section 13)
export type ActionPipelinePhase = "proposal" | "simulation" | "approval-ready" | "executed";

export interface AgentActionRecord {
  actionId: string;
  agentId: string;
  phase: ActionPipelinePhase;
  summary: string;
  timestamp: string;
  correlationId: string;
  approvedBy?: string;
  rollbackAvailable: boolean;
}
