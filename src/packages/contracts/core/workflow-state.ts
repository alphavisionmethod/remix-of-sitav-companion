// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Workflow State
// ═══════════════════════════════════════════════════════════════

import type { WorkflowStatus } from "../_contract-scaffold";

export interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  output?: Record<string, unknown>;
}

export interface WorkflowState {
  id: string;
  workflowType: string;
  status: WorkflowStatus;
  currentStep: string;
  steps: WorkflowStep[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
}
