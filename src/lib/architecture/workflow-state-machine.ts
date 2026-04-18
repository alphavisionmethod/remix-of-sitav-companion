// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow State Machine
// Explicit, policy-aware lifecycle for every important process.
// No hidden execution paths. No "best effort" background magic.
// ═══════════════════════════════════════════════════════════════

export type WorkflowState =
  | "draft"
  | "proposed"
  | "policy-checked"
  | "awaiting-approval"
  | "approved"
  | "scheduled"
  | "executing"
  | "succeeded"
  | "failed"
  | "partially-completed"
  | "refused"
  | "rolled-back"
  | "cancelled"
  | "timed-out"
  | "closed";

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  guard?: string;           // policy rule that must pass
  requiresApproval?: boolean;
  emitsEvent: string;       // event name emitted on transition
  replayable: boolean;
}

// ── Canonical Transition Table ──────────────────────────────

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: "draft", to: "proposed", emitsEvent: "workflow.proposed", replayable: true },
  { from: "proposed", to: "policy-checked", guard: "policy-engine.evaluate", emitsEvent: "workflow.policy-checked", replayable: true },
  { from: "policy-checked", to: "awaiting-approval", guard: "approval-required-check", requiresApproval: true, emitsEvent: "workflow.awaiting-approval", replayable: true },
  { from: "policy-checked", to: "approved", guard: "no-approval-required", emitsEvent: "workflow.auto-approved", replayable: true },
  { from: "awaiting-approval", to: "approved", requiresApproval: true, emitsEvent: "workflow.approved", replayable: true },
  { from: "awaiting-approval", to: "refused", emitsEvent: "workflow.refused", replayable: true },
  { from: "approved", to: "scheduled", emitsEvent: "workflow.scheduled", replayable: true },
  { from: "approved", to: "executing", emitsEvent: "workflow.executing", replayable: true },
  { from: "scheduled", to: "executing", emitsEvent: "workflow.executing", replayable: true },
  { from: "executing", to: "succeeded", emitsEvent: "workflow.succeeded", replayable: true },
  { from: "executing", to: "failed", emitsEvent: "workflow.failed", replayable: true },
  { from: "executing", to: "partially-completed", emitsEvent: "workflow.partially-completed", replayable: true },
  { from: "executing", to: "timed-out", emitsEvent: "workflow.timed-out", replayable: true },
  { from: "failed", to: "rolled-back", emitsEvent: "workflow.rolled-back", replayable: true },
  { from: "partially-completed", to: "rolled-back", emitsEvent: "workflow.rolled-back", replayable: true },
  { from: "timed-out", to: "rolled-back", emitsEvent: "workflow.rolled-back", replayable: true },
  { from: "failed", to: "executing", guard: "retry-policy", emitsEvent: "workflow.retrying", replayable: true },
  { from: "timed-out", to: "executing", guard: "retry-policy", emitsEvent: "workflow.retrying", replayable: true },
  // Cancellation from any active state
  { from: "draft", to: "cancelled", emitsEvent: "workflow.cancelled", replayable: true },
  { from: "proposed", to: "cancelled", emitsEvent: "workflow.cancelled", replayable: true },
  { from: "awaiting-approval", to: "cancelled", emitsEvent: "workflow.cancelled", replayable: true },
  { from: "scheduled", to: "cancelled", emitsEvent: "workflow.cancelled", replayable: true },
  // Closing terminal states
  { from: "succeeded", to: "closed", emitsEvent: "workflow.closed", replayable: true },
  { from: "refused", to: "closed", emitsEvent: "workflow.closed", replayable: true },
  { from: "rolled-back", to: "closed", emitsEvent: "workflow.closed", replayable: true },
  { from: "cancelled", to: "closed", emitsEvent: "workflow.closed", replayable: true },
];

// ── Workflow Instance ───────────────────────────────────────

export interface WorkflowInstance {
  workflowId: string;
  workflowType: string;
  tenantId: string;
  userId: string;
  state: WorkflowState;
  capabilityContractId?: string;
  policyDecisionId?: string;
  approvalId?: string;
  envelopeId?: string;
  receiptId?: string;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  escalationPolicy?: string;
  transitionLog: WorkflowTransitionLog[];
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowTransitionLog {
  id: string;
  from: WorkflowState;
  to: WorkflowState;
  guardResult?: { passed: boolean; reason?: string };
  eventEmitted: string;
  actorId: string;
  timestamp: string;
  durationMs?: number;
}

// ── State Machine Engine ────────────────────────────────────

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS.some(t => t.from === from && t.to === to);
}

export function getValidTransitions(from: WorkflowState): WorkflowState[] {
  return WORKFLOW_TRANSITIONS
    .filter(t => t.from === from)
    .map(t => t.to);
}

export function getTransitionDef(from: WorkflowState, to: WorkflowState): WorkflowTransition | undefined {
  return WORKFLOW_TRANSITIONS.find(t => t.from === from && t.to === to);
}

export function isTerminal(state: WorkflowState): boolean {
  return state === "closed";
}

export function isFailureState(state: WorkflowState): boolean {
  return ["failed", "partially-completed", "timed-out", "refused"].includes(state);
}

export function transition(
  workflow: WorkflowInstance,
  to: WorkflowState,
  actorId: string,
  guardResult?: { passed: boolean; reason?: string },
): { workflow: WorkflowInstance; event: string } | { error: string } {
  const def = getTransitionDef(workflow.state, to);
  if (!def) {
    return { error: `Invalid transition: ${workflow.state} → ${to}` };
  }
  if (def.guard && guardResult && !guardResult.passed) {
    return { error: `Guard failed for ${def.guard}: ${guardResult.reason}` };
  }

  const log: WorkflowTransitionLog = {
    id: crypto.randomUUID(),
    from: workflow.state,
    to,
    guardResult,
    eventEmitted: def.emitsEvent,
    actorId,
    timestamp: new Date().toISOString(),
  };

  const updated: WorkflowInstance = {
    ...workflow,
    state: to,
    transitionLog: [...workflow.transitionLog, log],
    updatedAt: new Date().toISOString(),
    ...(to === "executing" ? { startedAt: new Date().toISOString() } : {}),
    ...(isTerminal(to) || to === "succeeded" ? { completedAt: new Date().toISOString() } : {}),
  };

  return { workflow: updated, event: def.emitsEvent };
}

export function createWorkflow(
  type: string,
  input: Record<string, unknown>,
  opts: { tenantId: string; userId: string; maxRetries?: number; timeoutMs?: number },
): WorkflowInstance {
  return {
    workflowId: crypto.randomUUID(),
    workflowType: type,
    tenantId: opts.tenantId,
    userId: opts.userId,
    state: "draft",
    retryCount: 0,
    maxRetries: opts.maxRetries ?? 3,
    timeoutMs: opts.timeoutMs ?? 300_000,
    transitionLog: [],
    input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
