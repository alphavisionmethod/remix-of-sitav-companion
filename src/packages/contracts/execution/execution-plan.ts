// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Contracts: Execution Plan
// Planned step sequence for governed execution
// ═══════════════════════════════════════════════════════════════

export interface ExecutionPlanStep {
  stepId: string;
  capabilityId: string;
  input: Record<string, unknown>;
  dependsOn: string[];
  estimatedDurationMs?: number;
  rollbackCapabilityId?: string;
}

export interface ExecutionPlan {
  id: string;
  workflowId: string;
  steps: ExecutionPlanStep[];
  estimatedTotalMs?: number;
  requiresApproval: boolean;
  simulationRequired: boolean;
  createdAt: string;
}
