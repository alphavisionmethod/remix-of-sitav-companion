// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Execution Contract (Wave 21)
// Canonical execution state machine and step contract types.
// ═══════════════════════════════════════════════════════════════

export const RECOVERY_EXECUTION_STATES = [
  "REGISTERED",
  "READY",
  "TRIAGED",
  "EXECUTION_PENDING",
  "AWAITING_CONFIRMATION",
  "AUTOMATED_STEP_RUNNING",
  "MANUAL_STEP_REQUIRED",
  "PARTIALLY_REMEDIATED",
  "RECOVERED",
  "FAILED",
  "ESCALATED",
  "POSTMORTEM_PENDING",
  "CLOSED",
] as const;

export type RecoveryExecutionState = (typeof RECOVERY_EXECUTION_STATES)[number];

export const VALID_TRANSITIONS: Record<RecoveryExecutionState, readonly RecoveryExecutionState[]> = {
  REGISTERED: ["READY"],
  READY: ["TRIAGED"],
  TRIAGED: ["EXECUTION_PENDING", "ESCALATED"],
  EXECUTION_PENDING: ["AWAITING_CONFIRMATION", "AUTOMATED_STEP_RUNNING", "MANUAL_STEP_REQUIRED"],
  AWAITING_CONFIRMATION: ["AUTOMATED_STEP_RUNNING", "MANUAL_STEP_REQUIRED", "ESCALATED", "FAILED"],
  AUTOMATED_STEP_RUNNING: ["PARTIALLY_REMEDIATED", "RECOVERED", "FAILED", "AWAITING_CONFIRMATION", "MANUAL_STEP_REQUIRED"],
  MANUAL_STEP_REQUIRED: ["PARTIALLY_REMEDIATED", "RECOVERED", "FAILED", "AWAITING_CONFIRMATION"],
  PARTIALLY_REMEDIATED: ["AUTOMATED_STEP_RUNNING", "MANUAL_STEP_REQUIRED", "AWAITING_CONFIRMATION", "RECOVERED", "FAILED", "ESCALATED"],
  RECOVERED: ["POSTMORTEM_PENDING", "CLOSED"],
  FAILED: ["ESCALATED", "POSTMORTEM_PENDING", "CLOSED"],
  ESCALATED: ["EXECUTION_PENDING", "FAILED", "POSTMORTEM_PENDING", "CLOSED"],
  POSTMORTEM_PENDING: ["CLOSED"],
  CLOSED: [],
};

export type StepAutomation = "fully-automated" | "semi-automated" | "manual-only";
export type StepSafetyLevel = "safe" | "requires-confirmation" | "destructive" | "irreversible";

export interface RecoveryStepContract {
  readonly stepId: string;
  readonly label: string;
  readonly runbookRef: string;
  readonly order: number;
  readonly automation: StepAutomation;
  readonly safetyLevel: StepSafetyLevel;
  readonly inputs: readonly string[];
  readonly preconditions: readonly string[];
  readonly operatorRoleRequired: string | null;
  readonly evidenceEmitted: readonly string[];
  readonly rollbackAction: string | null;
  readonly abortSemantics: string;
  readonly nextStepRules: string;
  readonly timeoutMs: number;
}

export interface RecoveryExecutionInstance {
  readonly executionId: string;
  readonly runbookId: string;
  currentState: RecoveryExecutionState;
  readonly startedAt: string;
  completedAt: string | null;
  readonly stateHistory: Array<{ state: RecoveryExecutionState; at: string; reason: string }>;
  readonly stepResults: Array<{ stepId: string; status: "success" | "failed" | "skipped"; message: string; durationMs: number }>;
}

export function isValidTransition(from: RecoveryExecutionState, to: RecoveryExecutionState): boolean {
  return (VALID_TRANSITIONS[from] as readonly string[]).includes(to);
}

export function createExecutionInstance(runbookId: string): RecoveryExecutionInstance {
  return {
    executionId: `rex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    runbookId,
    currentState: "REGISTERED",
    startedAt: new Date().toISOString(),
    completedAt: null,
    stateHistory: [{ state: "REGISTERED", at: new Date().toISOString(), reason: "Execution created" }],
    stepResults: [],
  };
}

export function transitionState(
  instance: RecoveryExecutionInstance,
  to: RecoveryExecutionState,
  reason: string,
): void {
  if (!isValidTransition(instance.currentState, to)) {
    throw new Error(`Invalid transition: ${instance.currentState} → ${to}`);
  }
  instance.currentState = to;
  instance.stateHistory.push({ state: to, at: new Date().toISOString(), reason });
  if (to === "CLOSED" || to === "FAILED") {
    instance.completedAt = new Date().toISOString();
  }
}