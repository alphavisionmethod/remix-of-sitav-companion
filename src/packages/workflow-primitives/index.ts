// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Primitives Package
// ═══════════════════════════════════════════════════════════════

export type WorkflowStepType = "action" | "condition" | "approval" | "delay" | "notification" | "transformation" | "external-call";
export type WorkflowTrigger = "event" | "schedule" | "manual" | "webhook" | "threshold" | "state-change";

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: { type: WorkflowTrigger; config: Record<string, unknown> };
  steps: WorkflowStepDefinition[];
  retryPolicy: RetryPolicy;
  timeout: number;
  domain: "business" | "finance" | "concierge" | "system";
}

export interface WorkflowStepDefinition {
  id: string;
  type: WorkflowStepType;
  name: string;
  config: Record<string, unknown>;
  onSuccess?: string;
  onFailure?: string;
  timeout?: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface WorkflowExecutionContext {
  workflowId: string;
  runId: string;
  currentStepIndex: number;
  variables: Record<string, unknown>;
  startedAt: number;
  correlationId: string;
  userId: string;
}

export interface WorkflowTransition {
  fromStep: string;
  toStep: string;
  condition?: string;
  timestamp: number;
}

export const createWorkflowContext = (workflowId: string, userId: string): WorkflowExecutionContext => ({
  workflowId,
  runId: crypto.randomUUID(),
  currentStepIndex: 0,
  variables: {},
  startedAt: Date.now(),
  correlationId: crypto.randomUUID(),
  userId,
});

// ── Compensation / Rollback (Saga) ──────────────────────────

export interface CompensationStep {
  readonly stepId: string;
  readonly compensationAction: string;
  readonly config: Record<string, unknown>;
  readonly timeout: number;
  readonly retryPolicy: RetryPolicy;
}

export interface RollbackPlan {
  readonly workflowId: string;
  readonly runId: string;
  readonly steps: CompensationStep[];
  readonly reason: string;
  readonly initiatedAt: number;
  readonly initiatedBy: "system" | "user" | "policy";
}

export const createRollbackPlan = (workflowId: string, runId: string, steps: CompensationStep[], reason: string): RollbackPlan => ({
  workflowId,
  runId,
  steps,
  reason,
  initiatedAt: Date.now(),
  initiatedBy: "system",
});

// ── Workflow Diagnostics ────────────────────────────────────

export interface StuckDetection {
  readonly stepId: string;
  readonly stuckSince: number;
  readonly durationMs: number;
  readonly thresholdMs: number;
  readonly isStuck: boolean;
}

export interface RetryHistoryEntry {
  readonly attempt: number;
  readonly timestamp: number;
  readonly error: string;
  readonly nextRetryAt?: number;
}

export interface WorkflowDiagnostic {
  readonly workflowId: string;
  readonly runId: string;
  readonly stuckDetections: StuckDetection[];
  readonly retryHistory: RetryHistoryEntry[];
  readonly totalDurationMs: number;
  readonly stepDurations: Record<string, number>;
}

// ── Workflow SLA ─────────────────────────────────────────────

export interface WorkflowSLA {
  readonly workflowId: string;
  readonly maxDurationMs: number;
  readonly escalationAfterMs: number;
  readonly escalationTarget: string;
  readonly alertOnBreach: boolean;
}
