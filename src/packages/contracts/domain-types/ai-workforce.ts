// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Workforce Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped, DomainId, RiskTier } from "../_contract-scaffold";

export type AgentAutonomyLevel = "L0-observe" | "L1-suggest" | "L2-draft" | "L3-simulate" | "L4-auto-reversible" | "L5-auto-irreversible" | "L6-constrained-action";

export type AgentStatus = "idle" | "assigned" | "executing" | "paused" | "suspended" | "retired";

export type AgentCapabilityType = "analysis" | "generation" | "execution" | "monitoring" | "communication" | "verification";

export interface AgentDefinition extends Timestamped, TenantScoped {
  name: string;
  description: string;
  domain: DomainId;
  autonomyLevel: AgentAutonomyLevel;
  capabilities: AgentCapability[];
  tools: string[];
  maxConcurrentTasks: number;
  costBudgetPerHour: number;
  riskTier: RiskTier;
  status: AgentStatus;
  supervisorId?: string;
  councilId?: string;
  maturityScore: number;
  kpis: AgentKPI[];
}

export interface AgentCapability {
  id: string;
  type: AgentCapabilityType;
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  requiresApproval: boolean;
  costPerInvocation: number;
}

export interface AgentTask extends Timestamped, TenantScoped {
  agentId: string;
  taskType: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "queued" | "assigned" | "executing" | "completed" | "failed" | "cancelled";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  costIncurred: number;
  tokensUsed: number;
  retryCount: number;
  maxRetries: number;
  correlationId: string;
  parentTaskId?: string;
}

export interface AgentTeam extends BaseContract, TenantScoped {
  name: string;
  purpose: string;
  agentIds: string[];
  supervisorAgentId: string;
  domain: DomainId;
  maxBudgetPerDay: number;
  activeTaskCount: number;
}

export interface AgentKPI {
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: "improving" | "stable" | "degrading";
}

export interface CouncilDefinition extends BaseContract {
  name: string;
  purpose: string;
  domain: DomainId;
  memberAgentIds: string[];
  supervisorId: string;
  votingPolicy: "majority" | "unanimous" | "supervisor-override";
  escalationTarget?: string;
}
