// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Engine
// 11-state canonical state machine with transition validation
// Canonical contracts: WorkflowStatus from _contract-scaffold
// ═══════════════════════════════════════════════════════════════

import type { WorkflowStatus as CanonicalWorkflowStatus } from "@/packages/contracts";

/** Re-export canonical status for consumers */
export type { CanonicalWorkflowStatus };

export type ServiceWorkflowState =
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
  state: ServiceWorkflowState;
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
  fromState: ServiceWorkflowState;
  toState: ServiceWorkflowState;
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

const VALID_TRANSITIONS: Record<ServiceWorkflowState, ServiceWorkflowState[]> = {
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
    toState: ServiceWorkflowState,
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
    states: ServiceWorkflowState[],
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

  getWorkflowsByState(state: ServiceWorkflowState): WorkflowInstance[] {
    return Array.from(this.workflows.values()).filter((w) => w.state === state);
  }

  getAllWorkflows(): WorkflowInstance[] {
    return Array.from(this.workflows.values());
  }

  getValidTransitions(workflowId: string): ServiceWorkflowState[] {
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

// ── Action Queue (merged from action-queue service) ─────────────────────────

export type ActionPriority = "critical" | "high" | "normal" | "low";
export type ActionQueueStatus = "pending" | "scheduled" | "executing" | "completed" | "failed" | "cancelled";

export interface QueuedAction {
  id: string;
  workflowId?: string;
  capabilityId: string;
  priority: ActionPriority;
  status: ActionQueueStatus;
  payload: Record<string, unknown>;
  scheduledAt?: string;
  maxRetries: number;
  retryCount: number;
  retryBackoffMs: number;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

const PRIORITY_ORDER: Record<ActionPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };

export class ActionQueue {
  private queue: QueuedAction[] = [];

  enqueue(capabilityId: string, payload: Record<string, unknown>, options?: {
    priority?: ActionPriority; scheduledAt?: string; maxRetries?: number; workflowId?: string;
  }): QueuedAction {
    const action: QueuedAction = {
      id: `aq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workflowId: options?.workflowId,
      capabilityId,
      priority: options?.priority ?? "normal",
      status: options?.scheduledAt ? "scheduled" : "pending",
      payload,
      scheduledAt: options?.scheduledAt,
      maxRetries: options?.maxRetries ?? 3,
      retryCount: 0,
      retryBackoffMs: 1000,
      createdAt: new Date().toISOString(),
    };
    this.queue.push(action);
    this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return action;
  }

  dequeue(): QueuedAction | null {
    const now = new Date().toISOString();
    const idx = this.queue.findIndex(a =>
      (a.status === "pending" || (a.status === "scheduled" && a.scheduledAt && a.scheduledAt <= now))
    );
    if (idx === -1) return null;
    const action = this.queue[idx];
    action.status = "executing";
    action.executedAt = new Date().toISOString();
    return action;
  }

  complete(actionId: string, result?: Record<string, unknown>): QueuedAction | null {
    const action = this.queue.find(a => a.id === actionId);
    if (!action) return null;
    action.status = "completed";
    action.completedAt = new Date().toISOString();
    return action;
  }

  fail(actionId: string, errorMessage: string): QueuedAction | null {
    const action = this.queue.find(a => a.id === actionId);
    if (!action) return null;
    action.retryCount++;
    if (action.retryCount >= action.maxRetries) {
      action.status = "failed";
      action.errorMessage = errorMessage;
    } else {
      action.status = "scheduled";
      action.scheduledAt = new Date(Date.now() + action.retryBackoffMs * Math.pow(2, action.retryCount)).toISOString();
    }
    return action;
  }

  cancel(actionId: string): boolean {
    const action = this.queue.find(a => a.id === actionId);
    if (!action || action.status === "completed" || action.status === "failed") return false;
    action.status = "cancelled";
    return true;
  }

  getPending(): QueuedAction[] { return this.queue.filter(a => a.status === "pending" || a.status === "scheduled"); }
  getAll(): QueuedAction[] { return [...this.queue]; }
  getByWorkflow(workflowId: string): QueuedAction[] { return this.queue.filter(a => a.workflowId === workflowId); }
}

// ── Autonomous Executor (merged from operating-autopilot) ───────────────────

export type AutonomyLevel = "observe" | "draft" | "simulate" | "approve" | "execute";

export interface AutonomyConfig {
  level: AutonomyLevel;
  trustThreshold: number;
  maxAutoAmount: number;
  requiresReceiptProof: boolean;
  allowedCapabilities: string[];
}

const AUTONOMY_TRUST_REQUIREMENTS: Record<AutonomyLevel, number> = {
  observe: 0, draft: 30, simulate: 50, approve: 75, execute: 90,
};

export class AutonomousExecutor {
  private config: AutonomyConfig = {
    level: "observe", trustThreshold: 80, maxAutoAmount: 10000,
    requiresReceiptProof: true, allowedCapabilities: [],
  };

  setConfig(config: Partial<AutonomyConfig>): void {
    Object.assign(this.config, config);
  }

  getConfig(): AutonomyConfig { return { ...this.config }; }

  canAutoAdvance(currentTrustScore: number, targetLevel: AutonomyLevel): boolean {
    return currentTrustScore >= AUTONOMY_TRUST_REQUIREMENTS[targetLevel] &&
           currentTrustScore >= this.config.trustThreshold;
  }

  getMaxAutoLevel(trustScore: number): AutonomyLevel {
    const levels: AutonomyLevel[] = ["execute", "approve", "simulate", "draft", "observe"];
    for (const level of levels) {
      if (trustScore >= AUTONOMY_TRUST_REQUIREMENTS[level]) return level;
    }
    return "observe";
  }

  isCapabilityAllowed(capabilityId: string): boolean {
    return this.config.allowedCapabilities.length === 0 || this.config.allowedCapabilities.includes(capabilityId);
  }

  shouldAutoExecute(trustScore: number, capabilityId: string, amountCents?: number): boolean {
    if (this.config.level !== "execute") return false;
    if (!this.canAutoAdvance(trustScore, "execute")) return false;
    if (!this.isCapabilityAllowed(capabilityId)) return false;
    if (amountCents !== undefined && amountCents > this.config.maxAutoAmount) return false;
    return true;
  }
}

// ── Workflow Recovery Manager ───────────────────────────────────────────────

export interface WorkflowCheckpoint {
  id: string;
  workflowId: string;
  state: ServiceWorkflowState;
  payload: Record<string, unknown>;
  eventLog: WorkflowEvent[];
  result?: Record<string, unknown>;
  createdAt: number;
  checkpointReason: string;
}

export interface WorkflowDeadLetterEntry {
  workflowId: string;
  lastState: ServiceWorkflowState;
  failureReason: string;
  recoveryAttempts: number;
  deadLetteredAt: number;
  payload: Record<string, unknown>;
}

export class WorkflowRecoveryManager {
  private checkpoints = new Map<string, WorkflowCheckpoint[]>();
  private deadLetterQueue: WorkflowDeadLetterEntry[] = [];
  private maxRecoveryAttempts = 5;

  createCheckpoint(workflow: WorkflowInstance, reason: string): WorkflowCheckpoint {
    const cp: WorkflowCheckpoint = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      state: workflow.state,
      payload: structuredClone(workflow.payload),
      eventLog: structuredClone(workflow.eventLog),
      result: workflow.result ? structuredClone(workflow.result) : undefined,
      createdAt: Date.now(),
      checkpointReason: reason,
    };
    const existing = this.checkpoints.get(workflow.id) ?? [];
    existing.push(cp);
    if (existing.length > 20) existing.splice(0, existing.length - 20);
    this.checkpoints.set(workflow.id, existing);
    return cp;
  }

  getCheckpoints(workflowId: string): WorkflowCheckpoint[] {
    return this.checkpoints.get(workflowId) ?? [];
  }

  getLatestCheckpoint(workflowId: string): WorkflowCheckpoint | undefined {
    const cps = this.checkpoints.get(workflowId);
    return cps?.[cps.length - 1];
  }

  recoverFromCheckpoint(
    engine: WorkflowEngine,
    checkpointId: string
  ): { recovered: boolean; workflow?: WorkflowInstance; error?: string } {
    for (const [, cps] of this.checkpoints) {
      const cp = cps.find(c => c.id === checkpointId);
      if (cp) {
        const existing = engine.getWorkflow(cp.workflowId);
        if (existing && existing.recoveryAttempts >= this.maxRecoveryAttempts) {
          this.moveToDeadLetter(existing, "Max recovery attempts exceeded");
          return { recovered: false, error: "Moved to dead-letter queue — max retries exceeded" };
        }
        const w = engine.createWorkflow(cp.payload.capabilityId as string ?? "recovered", cp.payload, cp.workflowId);
        return { recovered: true, workflow: w };
      }
    }
    return { recovered: false, error: "Checkpoint not found" };
  }

  moveToDeadLetter(workflow: WorkflowInstance, reason: string): void {
    this.deadLetterQueue.push({
      workflowId: workflow.id,
      lastState: workflow.state,
      failureReason: reason,
      recoveryAttempts: workflow.recoveryAttempts,
      deadLetteredAt: Date.now(),
      payload: structuredClone(workflow.payload),
    });
  }

  getDeadLetterQueue(): WorkflowDeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetter(workflowId: string): boolean {
    const idx = this.deadLetterQueue.findIndex(e => e.workflowId === workflowId);
    if (idx === -1) return false;
    this.deadLetterQueue.splice(idx, 1);
    return true;
  }
}

// ── Workflow Replay Engine ──────────────────────────────────────────────────

export interface ReplayResult {
  workflowId: string;
  originalEvents: WorkflowEvent[];
  replayedEvents: WorkflowEvent[];
  replayStartedAt: number;
  replayCompletedAt: number;
  verdict: "identical" | "divergent" | "non-reproducible";
  divergencePoint?: { eventIndex: number; expected: ServiceWorkflowState; got: ServiceWorkflowState };
}

export class WorkflowReplayEngine {
  replay(engine: WorkflowEngine, workflowId: string): ReplayResult {
    const original = engine.getWorkflow(workflowId);
    if (!original || original.eventLog.length === 0) {
      return {
        workflowId, originalEvents: [], replayedEvents: [],
        replayStartedAt: Date.now(), replayCompletedAt: Date.now(),
        verdict: "non-reproducible",
      };
    }

    const replayEngine = new WorkflowEngine();
    const replayWf = replayEngine.createWorkflow(original.capabilityId, original.payload);
    const replayedEvents: WorkflowEvent[] = [];
    let divergence: ReplayResult["divergencePoint"];

    for (let i = 0; i < original.eventLog.length; i++) {
      const origEvent = original.eventLog[i];
      const result = replayEngine.transition(replayWf.id, origEvent.toState, origEvent.reason, origEvent.metadata);
      if (result.success && result.event) {
        replayedEvents.push(result.event);
      } else {
        divergence = { eventIndex: i, expected: origEvent.toState, got: replayWf.state };
        break;
      }
    }

    const identical = !divergence && replayedEvents.length === original.eventLog.length;

    return {
      workflowId,
      originalEvents: [...original.eventLog],
      replayedEvents,
      replayStartedAt: Date.now(),
      replayCompletedAt: Date.now(),
      verdict: divergence ? "divergent" : identical ? "identical" : "non-reproducible",
      divergencePoint: divergence,
    };
  }
}

// ── Workflow Timeout Manager ────────────────────────────────────────────────

export type SLAStatus = "on-track" | "warning" | "breached";

export interface WorkflowDeadline {
  workflowId: string;
  deadlineMs: number;
  registeredAt: number;
  slaStatus: SLAStatus;
  warningThresholdPct: number;
  escalated: boolean;
  timeoutHandle?: ReturnType<typeof setTimeout>;
}

export class WorkflowTimeoutManager {
  private deadlines = new Map<string, WorkflowDeadline>();
  private onTimeout?: (workflowId: string) => void;
  private onWarning?: (workflowId: string, remainingMs: number) => void;

  constructor(handlers?: {
    onTimeout?: (workflowId: string) => void;
    onWarning?: (workflowId: string, remainingMs: number) => void;
  }) {
    this.onTimeout = handlers?.onTimeout;
    this.onWarning = handlers?.onWarning;
  }

  register(workflowId: string, deadlineMs: number, warningThresholdPct = 0.8): WorkflowDeadline {
    this.clear(workflowId);

    const deadline: WorkflowDeadline = {
      workflowId, deadlineMs, registeredAt: Date.now(),
      slaStatus: "on-track", warningThresholdPct, escalated: false,
    };

    const warningMs = deadlineMs * warningThresholdPct;
    if (this.onWarning) {
      const remaining = deadlineMs - warningMs;
      setTimeout(() => {
        const d = this.deadlines.get(workflowId);
        if (d && d.slaStatus === "on-track") {
          d.slaStatus = "warning";
          this.onWarning?.(workflowId, remaining);
        }
      }, warningMs);
    }

    deadline.timeoutHandle = setTimeout(() => {
      const d = this.deadlines.get(workflowId);
      if (d && !d.escalated) {
        d.slaStatus = "breached";
        d.escalated = true;
        this.onTimeout?.(workflowId);
      }
    }, deadlineMs);

    this.deadlines.set(workflowId, deadline);
    return deadline;
  }

  clear(workflowId: string): void {
    const existing = this.deadlines.get(workflowId);
    if (existing?.timeoutHandle) clearTimeout(existing.timeoutHandle);
    this.deadlines.delete(workflowId);
  }

  getStatus(workflowId: string): WorkflowDeadline | undefined {
    const d = this.deadlines.get(workflowId);
    if (!d) return undefined;
    const elapsed = Date.now() - d.registeredAt;
    if (elapsed >= d.deadlineMs) d.slaStatus = "breached";
    else if (elapsed >= d.deadlineMs * d.warningThresholdPct) d.slaStatus = "warning";
    return { ...d, timeoutHandle: undefined };
  }

  getAllActive(): WorkflowDeadline[] {
    return Array.from(this.deadlines.values()).map(d => ({ ...d, timeoutHandle: undefined }));
  }

  clearAll(): void {
    for (const [id] of this.deadlines) this.clear(id);
  }
}

// ── Transition Validator ────────────────────────────────────────────────────

export interface TransitionGuard {
  id: string;
  name: string;
  fromStates: ServiceWorkflowState[] | "*";
  toStates: ServiceWorkflowState[] | "*";
  validate: (workflow: WorkflowInstance, toState: ServiceWorkflowState) => TransitionValidationResult;
}

export interface TransitionValidationResult {
  allowed: boolean;
  blockers: string[];
  warnings: string[];
}

export class TransitionValidator {
  private guards: TransitionGuard[] = [];

  addGuard(guard: TransitionGuard): void {
    this.guards.push(guard);
  }

  removeGuard(guardId: string): boolean {
    const idx = this.guards.findIndex(g => g.id === guardId);
    if (idx === -1) return false;
    this.guards.splice(idx, 1);
    return true;
  }

  validate(workflow: WorkflowInstance, toState: ServiceWorkflowState): TransitionValidationResult {
    const applicable = this.guards.filter(g => {
      const fromMatch = g.fromStates === "*" || g.fromStates.includes(workflow.state);
      const toMatch = g.toStates === "*" || g.toStates.includes(toState);
      return fromMatch && toMatch;
    });

    const blockers: string[] = [];
    const warnings: string[] = [];

    for (const guard of applicable) {
      const result = guard.validate(workflow, toState);
      blockers.push(...result.blockers);
      warnings.push(...result.warnings);
    }

    return { allowed: blockers.length === 0, blockers, warnings };
  }

  getGuards(): TransitionGuard[] {
    return [...this.guards];
  }
}

// ── Verification Hooks ──────────────────────────────────────────────────────

export type VerificationHookTrigger = "on-complete" | "on-fail" | "on-verify" | "on-rollback";

export interface VerificationHook {
  id: string;
  name: string;
  trigger: VerificationHookTrigger;
  timeoutMs: number;
  execute: (workflow: WorkflowInstance) => VerificationHookResult;
}

export interface VerificationHookResult {
  hookId: string;
  passed: boolean;
  message: string;
  trustDelta?: number;
  metadata?: Record<string, unknown>;
}

const TRIGGER_STATE_MAP: Record<VerificationHookTrigger, ServiceWorkflowState> = {
  "on-complete": "completed",
  "on-fail": "failed",
  "on-verify": "verified",
  "on-rollback": "rolled-back",
};

export class WorkflowVerificationHooks {
  private hooks: VerificationHook[] = [];

  register(hook: VerificationHook): void {
    this.hooks.push(hook);
  }

  unregister(hookId: string): boolean {
    const idx = this.hooks.findIndex(h => h.id === hookId);
    if (idx === -1) return false;
    this.hooks.splice(idx, 1);
    return true;
  }

  executeForState(workflow: WorkflowInstance): VerificationHookResult[] {
    const applicable = this.hooks.filter(h => TRIGGER_STATE_MAP[h.trigger] === workflow.state);
    return applicable.map(hook => {
      try {
        return hook.execute(workflow);
      } catch (err) {
        return {
          hookId: hook.id, passed: false,
          message: `Hook threw: ${err instanceof Error ? err.message : String(err)}`,
          trustDelta: -5,
        };
      }
    });
  }

  getRegistered(): VerificationHook[] {
    return [...this.hooks];
  }

  computeTrustImpact(results: VerificationHookResult[]): number {
    return results.reduce((sum, r) => sum + (r.trustDelta ?? 0), 0);
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine();
}

export function createActionQueue(): ActionQueue {
  return new ActionQueue();
}

export function createAutonomousExecutor(): AutonomousExecutor {
  return new AutonomousExecutor();
}

export function createWorkflowRecoveryManager(): WorkflowRecoveryManager {
  return new WorkflowRecoveryManager();
}

export function createWorkflowReplayEngine(): WorkflowReplayEngine {
  return new WorkflowReplayEngine();
}

export function createWorkflowTimeoutManager(handlers?: {
  onTimeout?: (workflowId: string) => void;
  onWarning?: (workflowId: string, remainingMs: number) => void;
}): WorkflowTimeoutManager {
  return new WorkflowTimeoutManager(handlers);
}

export function createTransitionValidator(): TransitionValidator {
  return new TransitionValidator();
}

export function createWorkflowVerificationHooks(): WorkflowVerificationHooks {
  return new WorkflowVerificationHooks();
}

export function getStateTransitionMap(): Record<ServiceWorkflowState, ServiceWorkflowState[]> {
  return { ...VALID_TRANSITIONS };
}

export function isTerminalState(state: ServiceWorkflowState): boolean {
  return state === "verified" || (VALID_TRANSITIONS[state]?.length === 0);
}

// ── Re-export modular layer (lib/services/workflow-engine) ────
// WorkflowEngineService conflicts with local WorkflowEngine class
// Re-export as aliased to avoid clash
export {
  type WorkflowDefinition, type WorkflowStepDef, type WorkflowTrigger,
  type WorkflowGuard, type RetryPolicy, type WorkflowRun, type WorkflowStepRun,
  WorkflowEngineService, createWorkflowEngine as createModularWorkflowEngine,
} from "@/lib/services/workflow-engine";
