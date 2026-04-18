// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Execution Registry
// Layer 3 · The canonical action-taking layer
// Companion doc: docs/architecture/EXECUTION_MODEL.md
// ═══════════════════════════════════════════════════════════════

export type ExecutionMode = "synchronous" | "asynchronous" | "queued" | "scheduled";
export type ExecutionRiskTier = "low" | "medium" | "high" | "critical";
export type ExecutionState =
  | "queued"
  | "validating"
  | "running"
  | "awaiting-approval"
  | "compensating"
  | "completed"
  | "failed"
  | "rolled-back"
  | "cancelled"
  | "killed";

export interface ExecutionRegistryEntry {
  readonly executorId: string;
  readonly displayName: string;
  readonly mode: ExecutionMode;
  readonly riskTier: ExecutionRiskTier;
  readonly maxConcurrent: number;
  readonly defaultTimeoutMs: number;
  readonly retryPolicy: { readonly maxAttempts: number; readonly backoffMs: number; readonly retryableErrors: readonly string[] };
  readonly rollbackCapable: boolean;
  readonly killSwitchTarget: string;
  readonly postconditionCheckRequired: boolean;
  readonly emitsProofs: readonly string[];
  readonly ownedBy: string;
}

export const EXECUTION_REGISTRY: readonly ExecutionRegistryEntry[] = [
  {
    executorId: "core.action-executor",
    displayName: "Core Action Executor",
    mode: "synchronous",
    riskTier: "high",
    maxConcurrent: 32,
    defaultTimeoutMs: 30_000,
    retryPolicy: { maxAttempts: 3, backoffMs: 500, retryableErrors: ["RATE_LIMITED", "TRANSIENT_NETWORK"] },
    rollbackCapable: true,
    killSwitchTarget: "executor-kill",
    postconditionCheckRequired: true,
    emitsProofs: ["execution-binding", "execution-event", "audit-event"],
    ownedBy: "platform.execution",
  },
  {
    executorId: "core.workflow-runner",
    displayName: "Workflow Runner",
    mode: "asynchronous",
    riskTier: "medium",
    maxConcurrent: 16,
    defaultTimeoutMs: 120_000,
    retryPolicy: { maxAttempts: 5, backoffMs: 2_000, retryableErrors: ["RATE_LIMITED", "TRANSIENT_NETWORK", "DEP_BUSY"] },
    rollbackCapable: true,
    killSwitchTarget: "workflow-kill",
    postconditionCheckRequired: true,
    emitsProofs: ["execution-event", "outcome-verification"],
    ownedBy: "platform.execution",
  },
  {
    executorId: "advisor.action-runner",
    displayName: "Advisor Action Runner",
    mode: "queued",
    riskTier: "high",
    maxConcurrent: 8,
    defaultTimeoutMs: 60_000,
    retryPolicy: { maxAttempts: 2, backoffMs: 1_000, retryableErrors: ["TRANSIENT_NETWORK"] },
    rollbackCapable: true,
    killSwitchTarget: "advisor-kill",
    postconditionCheckRequired: true,
    emitsProofs: ["approval-decision", "execution-binding", "execution-event"],
    ownedBy: "platform.execution",
  },
  {
    executorId: "connector.runner",
    displayName: "Connector Runner",
    mode: "asynchronous",
    riskTier: "medium",
    maxConcurrent: 24,
    defaultTimeoutMs: 45_000,
    retryPolicy: { maxAttempts: 4, backoffMs: 1_500, retryableErrors: ["RATE_LIMITED", "TRANSIENT_NETWORK", "AUTH_REFRESH"] },
    rollbackCapable: false,
    killSwitchTarget: "connector-kill",
    postconditionCheckRequired: false,
    emitsProofs: ["execution-event", "audit-event"],
    ownedBy: "platform.execution",
  },
  {
    executorId: "system.kill-switch",
    displayName: "Kill Switch Executor",
    mode: "synchronous",
    riskTier: "critical",
    maxConcurrent: 1,
    defaultTimeoutMs: 5_000,
    retryPolicy: { maxAttempts: 1, backoffMs: 0, retryableErrors: [] },
    rollbackCapable: true,
    killSwitchTarget: "self",
    postconditionCheckRequired: true,
    emitsProofs: ["audit-event", "consent-record"],
    ownedBy: "platform.execution",
  },
  {
    executorId: "scheduled.cron",
    displayName: "Scheduled Job Runner",
    mode: "scheduled",
    riskTier: "low",
    maxConcurrent: 4,
    defaultTimeoutMs: 300_000,
    retryPolicy: { maxAttempts: 3, backoffMs: 5_000, retryableErrors: ["TRANSIENT_NETWORK"] },
    rollbackCapable: false,
    killSwitchTarget: "cron-kill",
    postconditionCheckRequired: false,
    emitsProofs: ["execution-event"],
    ownedBy: "platform.execution",
  },
] as const;

export const EXECUTION_STATE_TRANSITIONS: ReadonlyArray<{ from: ExecutionState; to: ExecutionState; reason: string }> = [
  { from: "queued",            to: "validating",        reason: "picked up by runner" },
  { from: "validating",        to: "awaiting-approval", reason: "approval gate required" },
  { from: "validating",        to: "running",           reason: "preconditions met" },
  { from: "validating",        to: "failed",            reason: "precondition violation" },
  { from: "awaiting-approval", to: "running",           reason: "approved" },
  { from: "awaiting-approval", to: "cancelled",         reason: "rejected" },
  { from: "running",           to: "completed",         reason: "postcondition pass" },
  { from: "running",           to: "compensating",      reason: "postcondition fail" },
  { from: "running",           to: "killed",            reason: "kill switch fired" },
  { from: "compensating",      to: "rolled-back",       reason: "rollback complete" },
  { from: "compensating",      to: "failed",            reason: "rollback failed" },
] as const;

export function getExecutor(executorId: string): ExecutionRegistryEntry | undefined {
  return EXECUTION_REGISTRY.find((e) => e.executorId === executorId);
}

export function canExecutionTransition(from: ExecutionState, to: ExecutionState): boolean {
  return EXECUTION_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

export function executorsByRisk(tier: ExecutionRiskTier): readonly ExecutionRegistryEntry[] {
  return EXECUTION_REGISTRY.filter((e) => e.riskTier === tier);
}
