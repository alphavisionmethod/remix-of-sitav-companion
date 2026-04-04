// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Host Lifecycle Supervision
// Boot target progression, restart backoff, cumulative retry budgets,
// quarantine entry/exit policy, dependency-pressure detection,
// crash-loop governance, operator intervention
// ═══════════════════════════════════════════════════════════════

import type {
  BootTarget,
  BootTargetPolicy,
  RestartStrategy,
  BackoffPolicy,
  RetryBudget,
  CumulativeRetryState,
  QuarantineBehavior,
  QuarantineReason,
  QuarantineExitCondition,
  CrashLoopTrigger,
  CrashLoopEscalation,
  DependencyPressureSource,
  DependencyPressureTrigger,
  LifecycleState,
  LifecycleTransitionRecord,
  RestartDecision,
  QuarantineAction,
  LifecycleProofReceipt,
  LifecycleReceiptType,
} from "./lifecycle-authority";

// ── Boot Target Progression ─────────────────────────────────

export type BootProgressionStatus = "pending" | "in-progress" | "completed" | "failed" | "skipped" | "timed-out";

export interface BootTargetProgressionEntry {
  target: BootTarget;
  policy: BootTargetPolicy;
  status: BootProgressionStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
  attestationHash?: string;
  proofId?: string;
  retryCount: number;
}

export interface BootProgressionState {
  id: string;
  deviceId: string;
  startedAt: string;
  completedAt?: string;
  currentTarget: BootTarget;
  entries: BootTargetProgressionEntry[];
  overallStatus: "in-progress" | "completed" | "failed" | "recovery";
  failedTarget?: BootTarget;
  recoveryAction?: string;
}

// ── Restart Backoff Engine ──────────────────────────────────

export interface RestartBackoffState {
  service: string;
  consecutiveRestarts: number;
  lastRestartAt?: string;
  nextAllowedRestartAt?: string;
  currentDelayMs: number;
  backoffPolicy: BackoffPolicy;
  budgetConsumed: number;
  budgetMax: number;
  inCooldown: boolean;
}

export function computeNextDelay(policy: BackoffPolicy, attempt: number): number {
  let delay: number;
  switch (policy.type) {
    case "fixed":
      delay = policy.initialDelayMs;
      break;
    case "linear":
      delay = policy.initialDelayMs + attempt * policy.multiplier * 1000;
      break;
    case "exponential":
      delay = policy.initialDelayMs * Math.pow(policy.multiplier, attempt);
      break;
  }
  const jitter = Math.random() * policy.jitterMs;
  return Math.min(delay + jitter, policy.maxDelayMs);
}

// ── Cumulative Retry Budget Manager ─────────────────────────

export interface RetryBudgetCheckResult {
  allowed: boolean;
  remainingRetries: number;
  exhaustedAction?: RetryBudget["exhaustedAction"];
  resetIn?: number;
}

export function checkRetryBudget(budget: RetryBudget, now: number): RetryBudgetCheckResult {
  const windowStart = new Date(budget.lastResetAt).getTime();
  const windowExpired = now - windowStart > budget.windowMs;

  if (windowExpired) {
    return { allowed: true, remainingRetries: budget.maxRetries };
  }

  const remaining = budget.maxRetries - budget.currentRetries;
  if (remaining <= 0) {
    return {
      allowed: false,
      remainingRetries: 0,
      exhaustedAction: budget.exhaustedAction,
      resetIn: budget.windowMs - (now - windowStart),
    };
  }

  return { allowed: true, remainingRetries: remaining };
}

// ── Quarantine Policy Engine ────────────────────────────────

export interface QuarantineEntryDecision {
  shouldQuarantine: boolean;
  reason?: QuarantineReason;
  behavior?: QuarantineBehavior;
  diagnosticRequired: boolean;
}

export interface QuarantineExitDecision {
  canExit: boolean;
  unmetConditions: QuarantineExitCondition[];
  exitAction?: "restore-services" | "partial-restore" | "escalate";
}

export interface QuarantineState {
  active: boolean;
  enteredAt?: string;
  reason?: QuarantineReason;
  behavior?: QuarantineBehavior;
  elapsedMs: number;
  exitAttempts: number;
  diagnosticBundleIds: string[];
  operatorNotified: boolean;
}

// ── Dependency Pressure Detection ───────────────────────────

export interface DependencyPressureReading {
  source: DependencyPressureSource;
  currentValue: number;
  threshold: number;
  unit: DependencyPressureTrigger["unit"];
  exceeded: boolean;
  sampledAt: string;
}

export interface DependencyPressureState {
  readings: DependencyPressureReading[];
  activePressures: DependencyPressureSource[];
  shedCapabilities: string[];
  degradedCapabilities: string[];
  lastEvaluatedAt: string;
}

export function evaluatePressure(
  readings: DependencyPressureReading[],
  triggers: DependencyPressureTrigger[],
): { action: DependencyPressureTrigger["action"]; capabilities: string[] }[] {
  const actions: { action: DependencyPressureTrigger["action"]; capabilities: string[] }[] = [];
  for (const trigger of triggers) {
    const reading = readings.find(r => r.source === trigger.source);
    if (reading && reading.currentValue >= trigger.threshold) {
      actions.push({ action: trigger.action, capabilities: trigger.affectedCapabilities });
    }
  }
  return actions;
}

// ── Crash-Loop Governance ───────────────────────────────────

export interface CrashEvent {
  service: string;
  timestamp: string;
  exitCode?: number;
  signal?: string;
  oomKilled: boolean;
}

export interface CrashLoopDetectionState {
  service: string;
  recentCrashes: CrashEvent[];
  loopDetected: boolean;
  loopDetectedAt?: string;
  escalation?: CrashLoopEscalation;
  operatorInterventionRequested: boolean;
}

export interface OperatorInterventionThreshold {
  service: string;
  crashCount: number;
  quarantineDurationMs: number;
  requiresManualRelease: boolean;
  escalationLevel: "info" | "warning" | "critical" | "emergency";
}

export function detectCrashLoop(
  events: CrashEvent[],
  triggers: CrashLoopTrigger[],
  now: number,
): CrashLoopDetectionState | null {
  for (const trigger of triggers) {
    const matchingEvents = events.filter(e => {
      if (trigger.service !== "*" && e.service !== trigger.service) return false;
      return now - new Date(e.timestamp).getTime() <= trigger.windowMs;
    });
    if (matchingEvents.length >= trigger.threshold) {
      return {
        service: trigger.service,
        recentCrashes: matchingEvents,
        loopDetected: true,
        loopDetectedAt: new Date(now).toISOString(),
        escalation: trigger.escalation,
        operatorInterventionRequested: trigger.escalation.type === "operator-intervention",
      };
    }
  }
  return null;
}

// ── Lifecycle Governance Events ──────────────────────────────

export type LifecycleGovernanceEventType =
  | "boot-target-advanced"
  | "boot-target-failed"
  | "restart-initiated"
  | "restart-backoff-applied"
  | "retry-budget-warning"
  | "retry-budget-exhausted"
  | "quarantine-entered"
  | "quarantine-exit-attempted"
  | "quarantine-exited"
  | "crash-loop-detected"
  | "crash-loop-escalated"
  | "dependency-pressure-detected"
  | "dependency-pressure-resolved"
  | "load-shed-activated"
  | "operator-intervention-requested"
  | "safe-mode-entered"
  | "rollback-initiated"
  | "rollback-completed"
  | "rollback-failed";

export interface LifecycleGovernanceEvent {
  id: string;
  type: LifecycleGovernanceEventType;
  timestamp: string;
  service?: string;
  severity: "info" | "warning" | "error" | "critical";
  details: Record<string, unknown>;
  correlationId: string;
  operatorVisible: boolean;
  diagnosticChannels: ("mission-control" | "operator-log" | "support-bundle" | "audit-trail")[];
}

// ── Host Supervision State ──────────────────────────────────

export interface HostSupervisionState {
  deviceId: string;
  lifecycleState: LifecycleState;
  bootProgression: BootProgressionState;
  restartStates: Record<string, RestartBackoffState>;
  retryBudgets: CumulativeRetryState;
  quarantine: QuarantineState;
  pressureState: DependencyPressureState;
  crashLoopStates: Record<string, CrashLoopDetectionState>;
  recentTransitions: LifecycleTransitionRecord[];
  recentGovernanceEvents: LifecycleGovernanceEvent[];
  lastHeartbeat: string;
  uptimeMs: number;
}
