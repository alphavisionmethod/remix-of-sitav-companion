// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Canonical Lifecycle Authority
// Boot targets, restart strategy, retries, quarantine, crash-loop,
// dependency-pressure, replay requirements — single source of truth
// ═══════════════════════════════════════════════════════════════

// ── Boot Target Policy ──────────────────────────────────────

export type BootTarget =
  | "firmware-init"
  | "secure-boot-verify"
  | "initramfs"
  | "dm-verity-root"
  | "systemd-init"
  | "sita-runtime"
  | "first-boot-provisioning"
  | "capability-services"
  | "desktop-surface"
  | "recovery-shell";

export interface BootTargetPolicy {
  target: BootTarget;
  order: number;
  required: boolean;
  timeoutMs: number;
  dependsOn: BootTarget[];
  fallbackTarget?: BootTarget;
  requiresAttestation: boolean;
  proofRequired: boolean;
}

// ── Restart Strategy ────────────────────────────────────────

export type RestartReason =
  | "crash"
  | "oom-kill"
  | "watchdog-timeout"
  | "dependency-failure"
  | "update-applied"
  | "user-requested"
  | "operator-commanded"
  | "quarantine-exit"
  | "rollback-completed";

export type RestartMode = "immediate" | "graceful" | "deferred" | "scheduled";

export interface RestartStrategy {
  reason: RestartReason;
  mode: RestartMode;
  backoffPolicy: BackoffPolicy;
  maxConsecutiveRestarts: number;
  cooldownMs: number;
  notifyOperator: boolean;
  emitReceipt: boolean;
  preserveState: boolean;
}

export interface BackoffPolicy {
  type: "linear" | "exponential" | "fixed";
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitterMs: number;
}

// ── Retry Budget ────────────────────────────────────────────

export interface RetryBudget {
  scope: "per-service" | "per-boot-target" | "global";
  maxRetries: number;
  windowMs: number;
  currentRetries: number;
  lastResetAt: string;
  exhaustedAction: "quarantine" | "operator-alert" | "safe-mode" | "halt";
}

export interface CumulativeRetryState {
  budgets: Record<string, RetryBudget>;
  globalBudget: RetryBudget;
  escalationThreshold: number;
  escalatedAt?: string;
}

// ── Quarantine Behavior ─────────────────────────────────────

export type QuarantineReason =
  | "retry-budget-exhausted"
  | "crash-loop-detected"
  | "dependency-chain-broken"
  | "trust-violation"
  | "integrity-check-failed"
  | "operator-commanded"
  | "security-incident";

export type QuarantineExitCondition =
  | "operator-release"
  | "auto-heal-success"
  | "dependency-restored"
  | "timeout-expired"
  | "update-applied";

export interface QuarantineBehavior {
  reason: QuarantineReason;
  affectedServices: string[];
  isolationLevel: "service" | "capability-group" | "full-system";
  exitConditions: QuarantineExitCondition[];
  maxDurationMs: number;
  notifyOperator: boolean;
  preserveDiagnostics: boolean;
  degradedCapabilities: string[];
}

// ── Crash-Loop Triggers ─────────────────────────────────────

export interface CrashLoopTrigger {
  service: string;
  threshold: number;
  windowMs: number;
  escalation: CrashLoopEscalation;
}

export type CrashLoopEscalation =
  | { type: "quarantine"; quarantineReason: QuarantineReason }
  | { type: "operator-intervention"; urgency: "normal" | "high" | "critical" }
  | { type: "safe-mode"; preserveServices: string[] }
  | { type: "halt"; reason: string };

// ── Dependency Pressure ─────────────────────────────────────

export type DependencyPressureSource =
  | "memory-pressure"
  | "cpu-saturation"
  | "disk-io-saturation"
  | "network-degradation"
  | "upstream-timeout"
  | "downstream-backlog"
  | "license-exhaustion";

export interface DependencyPressureTrigger {
  source: DependencyPressureSource;
  threshold: number;
  unit: "percent" | "ms" | "count" | "bytes";
  windowMs: number;
  action: "shed-load" | "degrade-gracefully" | "quarantine-downstream" | "operator-alert";
  affectedCapabilities: string[];
}

// ── Replay Packet Requirements ──────────────────────────────

export interface ReplayPacketRequirement {
  event: string;
  requiresReplayPacket: boolean;
  retentionDays: number;
  redactableFields: string[];
  supportBundleEligible: boolean;
  auditTrailRequired: boolean;
}

// ── Lifecycle Transition Record ─────────────────────────────

export type LifecycleState =
  | "booting"
  | "running"
  | "degraded"
  | "quarantined"
  | "restarting"
  | "updating"
  | "rolling-back"
  | "recovery"
  | "safe-mode"
  | "halted"
  | "shutting-down";

export interface LifecycleTransitionRecord {
  id: string;
  from: LifecycleState;
  to: LifecycleState;
  reason: string;
  triggeredBy: "system" | "operator" | "watchdog" | "policy" | "user";
  timestamp: string;
  metadata: Record<string, unknown>;
  proofId?: string;
  correlationId: string;
  durationMs?: number;
}

// ── Restart Decision ────────────────────────────────────────

export interface RestartDecision {
  id: string;
  service: string;
  reason: RestartReason;
  strategy: RestartStrategy;
  retryBudget: RetryBudget;
  decidedAt: string;
  executedAt?: string;
  outcome?: "success" | "failed" | "quarantined" | "escalated";
  proofId?: string;
}

// ── Quarantine Action ───────────────────────────────────────

export interface QuarantineAction {
  id: string;
  type: "enter" | "exit";
  reason: QuarantineReason | QuarantineExitCondition;
  services: string[];
  behavior: QuarantineBehavior;
  timestamp: string;
  operatorId?: string;
  proofId?: string;
  diagnosticBundleId?: string;
}

// ── Lifecycle Proof Receipt ─────────────────────────────────

export type LifecycleReceiptType =
  | "boot-completed"
  | "restart-executed"
  | "quarantine-entered"
  | "quarantine-exited"
  | "rollback-decided"
  | "rollback-executed"
  | "rollback-verified"
  | "update-applied"
  | "crash-loop-detected"
  | "safe-mode-entered"
  | "recovery-completed";

export interface LifecycleProofReceipt {
  id: string;
  type: LifecycleReceiptType;
  timestamp: string;
  service?: string;
  lifecycleState: LifecycleState;
  previousState?: LifecycleState;
  evidence: Record<string, unknown>;
  correlationId: string;
  chainPreviousId?: string;
  operatorVisible: boolean;
  supportBundleEligible: boolean;
}

// ── Canonical Authority Registry ────────────────────────────

export const LIFECYCLE_AUTHORITY = {
  bootTargets: [
    { target: "firmware-init", order: 0, required: true, timeoutMs: 10_000, dependsOn: [], requiresAttestation: true, proofRequired: true },
    { target: "secure-boot-verify", order: 1, required: true, timeoutMs: 5_000, dependsOn: ["firmware-init"], requiresAttestation: true, proofRequired: true },
    { target: "initramfs", order: 2, required: true, timeoutMs: 15_000, dependsOn: ["secure-boot-verify"], requiresAttestation: true, proofRequired: true },
    { target: "dm-verity-root", order: 3, required: true, timeoutMs: 30_000, dependsOn: ["initramfs"], requiresAttestation: true, proofRequired: true },
    { target: "systemd-init", order: 4, required: true, timeoutMs: 20_000, dependsOn: ["dm-verity-root"], requiresAttestation: false, proofRequired: true },
    { target: "sita-runtime", order: 5, required: true, timeoutMs: 30_000, dependsOn: ["systemd-init"], requiresAttestation: false, proofRequired: true },
    { target: "first-boot-provisioning", order: 6, required: false, timeoutMs: 300_000, dependsOn: ["sita-runtime"], fallbackTarget: "desktop-surface", requiresAttestation: false, proofRequired: true },
    { target: "capability-services", order: 7, required: true, timeoutMs: 60_000, dependsOn: ["sita-runtime"], requiresAttestation: false, proofRequired: true },
    { target: "desktop-surface", order: 8, required: true, timeoutMs: 15_000, dependsOn: ["capability-services"], requiresAttestation: false, proofRequired: true },
  ] satisfies BootTargetPolicy[],

  restartStrategies: {
    crash: { reason: "crash", mode: "immediate", backoffPolicy: { type: "exponential", initialDelayMs: 1000, maxDelayMs: 60_000, multiplier: 2, jitterMs: 500 }, maxConsecutiveRestarts: 5, cooldownMs: 300_000, notifyOperator: true, emitReceipt: true, preserveState: true },
    oomKill: { reason: "oom-kill", mode: "graceful", backoffPolicy: { type: "exponential", initialDelayMs: 2000, maxDelayMs: 120_000, multiplier: 2, jitterMs: 1000 }, maxConsecutiveRestarts: 3, cooldownMs: 600_000, notifyOperator: true, emitReceipt: true, preserveState: false },
    updateApplied: { reason: "update-applied", mode: "graceful", backoffPolicy: { type: "fixed", initialDelayMs: 0, maxDelayMs: 0, multiplier: 1, jitterMs: 0 }, maxConsecutiveRestarts: 1, cooldownMs: 0, notifyOperator: false, emitReceipt: true, preserveState: true },
    userRequested: { reason: "user-requested", mode: "graceful", backoffPolicy: { type: "fixed", initialDelayMs: 0, maxDelayMs: 0, multiplier: 1, jitterMs: 0 }, maxConsecutiveRestarts: 10, cooldownMs: 0, notifyOperator: false, emitReceipt: true, preserveState: true },
  } satisfies Record<string, RestartStrategy>,

  crashLoopTriggers: [
    { service: "*", threshold: 5, windowMs: 300_000, escalation: { type: "quarantine", quarantineReason: "crash-loop-detected" } },
    { service: "sita-runtime", threshold: 3, windowMs: 180_000, escalation: { type: "operator-intervention", urgency: "critical" } },
    { service: "capability-services", threshold: 4, windowMs: 240_000, escalation: { type: "safe-mode", preserveServices: ["sita-runtime", "desktop-surface"] } },
  ] satisfies CrashLoopTrigger[],

  dependencyPressureTriggers: [
    { source: "memory-pressure", threshold: 90, unit: "percent", windowMs: 60_000, action: "shed-load", affectedCapabilities: ["non-essential-advisors", "background-sync"] },
    { source: "cpu-saturation", threshold: 95, unit: "percent", windowMs: 30_000, action: "degrade-gracefully", affectedCapabilities: ["ai-inference", "real-time-analytics"] },
    { source: "disk-io-saturation", threshold: 85, unit: "percent", windowMs: 120_000, action: "operator-alert", affectedCapabilities: ["proof-chain-write", "memory-persistence"] },
    { source: "network-degradation", threshold: 5000, unit: "ms", windowMs: 60_000, action: "degrade-gracefully", affectedCapabilities: ["cloud-sync", "connector-refresh"] },
  ] satisfies DependencyPressureTrigger[],

  replayRequirements: [
    { event: "restart", requiresReplayPacket: true, retentionDays: 90, redactableFields: ["memory-snapshot"], supportBundleEligible: true, auditTrailRequired: true },
    { event: "quarantine", requiresReplayPacket: true, retentionDays: 180, redactableFields: [], supportBundleEligible: true, auditTrailRequired: true },
    { event: "rollback", requiresReplayPacket: true, retentionDays: 365, redactableFields: [], supportBundleEligible: true, auditTrailRequired: true },
    { event: "crash-loop", requiresReplayPacket: true, retentionDays: 180, redactableFields: ["heap-dump"], supportBundleEligible: true, auditTrailRequired: true },
    { event: "update", requiresReplayPacket: true, retentionDays: 365, redactableFields: [], supportBundleEligible: false, auditTrailRequired: true },
  ] satisfies ReplayPacketRequirement[],

  retryBudgetDefaults: {
    perService: { scope: "per-service", maxRetries: 5, windowMs: 300_000, currentRetries: 0, lastResetAt: "", exhaustedAction: "quarantine" },
    perBootTarget: { scope: "per-boot-target", maxRetries: 3, windowMs: 600_000, currentRetries: 0, lastResetAt: "", exhaustedAction: "safe-mode" },
    global: { scope: "global", maxRetries: 15, windowMs: 600_000, currentRetries: 0, lastResetAt: "", exhaustedAction: "operator-alert" },
  } satisfies Record<string, RetryBudget>,
} as const;
