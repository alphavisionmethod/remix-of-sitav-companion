// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Advisor Orchestration Runtime
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type OrchestratorMode = "sequential" | "parallel" | "round-robin" | "priority";

export interface AdvisorOrchestrationRuntime {
  sessionId: string;
  activeAdvisors: string[];
  primaryAdvisor: string;
  mode: OrchestratorMode;
  domain: DomainId;
  tokensConsumed: number;
  tokenBudget: number;
  turnCount: number;
  latencyMs: number;
  isHealthy: boolean;
  lastHeartbeat: string;
  pendingHandoffs: string[];
}
