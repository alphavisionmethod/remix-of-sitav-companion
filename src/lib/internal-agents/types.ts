// ═══════════════════════════════════════════════════
// SITA OS — Internal AI Workforce Type System
// Re-exports canonical types + runtime-only extensions
// ═══════════════════════════════════════════════════

// Re-export all shared types from the canonical package
export type {
  InternalAgentCouncil,
  AgentRightsLevel,
  AgentScheduleType,
  AgentMaturity,
  ConfidenceRules,
  InternalAgentDefinition,
  CouncilDefinition,
  SupervisorDefinition,
} from "@/packages/internal-agent-config/types";

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
