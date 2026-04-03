// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Engine
// 11-state canonical state machine with transition validation
// ═══════════════════════════════════════════════════════════════

export type WorkflowState =
  | "detected"
  | "proposed"
  | "drafted"
  | "simulated"
  | "approval-requested"
  | "approved"
  | "queued"
  | "executing"
  | "completed"
  | "verified"
  | "failed"
  | "rolled-back";

export interface WorkflowInstance {
  id: string;
  correlationId: string;
  state: WorkflowState;
  capabilityId: string;
  payload: Record<string, unknown>;
  eventLog: WorkflowEvent[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  errorDetails?: Record<string, unknown>;
  result?: Record<string, unknown>;
  recoveryAttempts: number;
}

export interface WorkflowEvent {
  id: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  timestamp: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionResult {
  success: boolean;
  workflow: WorkflowInstance;
  event?: WorkflowEvent;
  error?: string;
}

// ── State Transition Map ────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  "detected": ["proposed", "failed"],
  "proposed": ["drafted", "failed"],
  "drafted": ["simulated", "approval-requested", "failed"],
  "simulated": ["approval-requested", "queued", "failed"],
  "approval-requested": ["approved", "failed"],
  "approved": ["queued", "failed"],
  "queued": ["executing", "failed"],
  "executing": ["completed", "failed"],
  "completed": ["verified", "rolled-back"],
  "verified": [],
  "failed": ["detected", "rolled-back"], // Recovery path
  "rolled-back": ["detected"], // Re-attempt path
};

// ── Workflow Engine Class ───────────────────────────────────────────────────

export class WorkflowEngine {
  private workflows = new Map<string, WorkflowInstance>();

  createWorkflow(
    capabilityId: string,
    payload: Record<string, unknown>,
    correlationId?: string
  ): WorkflowInstance {
    const workflow: WorkflowInstance = {
      id: crypto.randomUUID(),
      correlationId: correlationId || crypto.randomUUID(),
      state: "detected",
      capabilityId,
      payload,
      eventLog: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      recoveryAttempts: 0,
    };
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  transition(
    workflowId: string,
    toState: WorkflowState,
    reason?: string,
    metadata?: Record<string, unknown>
  ): TransitionResult {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, workflow: {} as WorkflowInstance, error: `Workflow ${workflowId} not found` };
    }

    const validTargets = VALID_TRANSITIONS[workflow.state];
    if (!validTargets || !validTargets.includes(toState)) {
      return {
        success: false,
        workflow,
        error: `Invalid transition: ${workflow.state} → ${toState}. Valid: [${validTargets?.join(", ")}]`,
      };
    }

    const event: WorkflowEvent = {
      id: crypto.randomUUID(),
      fromState: workflow.state,
      toState,
      timestamp: Date.now(),
      reason,
      metadata,
    };

    workflow.state = toState;
    workflow.updatedAt = Date.now();
    workflow.eventLog.push(event);

    if (toState === "completed" || toState === "verified" || toState === "failed" || toState === "rolled-back") {
      workflow.completedAt = Date.now();
    }
    if (toState === "failed" && metadata?.errorDetails) {
      workflow.errorDetails = metadata.errorDetails as Record<string, unknown>;
    }
    if (toState === "completed" && metadata?.result) {
      workflow.result = metadata.result as Record<string, unknown>;
    }
    if (toState === "detected" && workflow.recoveryAttempts !== undefined) {
      workflow.recoveryAttempts++;
    }

    return { success: true, workflow, event };
  }

  advanceThrough(
    workflowId: string,
    states: WorkflowState[],
    reason?: string
  ): TransitionResult {
    let lastResult: TransitionResult | null = null;
    for (const state of states) {
      lastResult = this.transition(workflowId, state, reason);
      if (!lastResult.success) return lastResult;
    }
    return lastResult!;
  }

  getWorkflow(workflowId: string): WorkflowInstance | undefined {
    return this.workflows.get(workflowId);
  }

  getWorkflowsByState(state: WorkflowState): WorkflowInstance[] {
    return Array.from(this.workflows.values()).filter((w) => w.state === state);
  }

  getAllWorkflows(): WorkflowInstance[] {
    return Array.from(this.workflows.values());
  }

  getValidTransitions(workflowId: string): WorkflowState[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];
    return VALID_TRANSITIONS[workflow.state] || [];
  }

  replay(workflowId: string): WorkflowEvent[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];
    return [...workflow.eventLog];
  }

  recover(workflowId: string, reason?: string): TransitionResult {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, workflow: {} as WorkflowInstance, error: "Workflow not found" };
    }
    if (workflow.state !== "failed") {
      return { success: false, workflow, error: "Can only recover from failed state" };
    }
    return this.transition(workflowId, "detected", reason || "Recovery attempt");
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine();
}

export function getStateTransitionMap(): Record<WorkflowState, WorkflowState[]> {
  return { ...VALID_TRANSITIONS };
}

export function isTerminalState(state: WorkflowState): boolean {
  return state === "verified" || (VALID_TRANSITIONS[state]?.length === 0);
}
