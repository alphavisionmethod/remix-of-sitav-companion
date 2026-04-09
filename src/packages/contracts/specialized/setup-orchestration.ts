// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Orchestration Contracts
// Full type system for the setup lifecycle engine
// ═══════════════════════════════════════════════════════════════

/** Clean 38-phase setup flow */
export type SetupPhaseId =
  | "boot" | "secure-foundation" | "language-region" | "network-setup" | "device-readiness" | "device-ownership"
  | "account-environment" | "restore-preview" | "setup-style" | "access-protection" | "recover-first"
  | "privacy-transparency" | "memory-consent" | "quick-identity" | "operating-context" | "want-less-of" | "protect-most" | "deep-world-modeling" | "household-graph"
  | "relationship-sensitivity"
  | "life-rhythm" | "stress-slippage" | "communications-context" | "planning-style"
  | "explanation-style" | "presence-style" | "interruption-style" | "rituals" | "home-composition" | "desktop-preview"
  | "primary-use-mode" | "trust-calibration" | "advisor-activation"
  | "environment-summary" | "first-connections" | "first-win-setup" | "first-simulation" | "first-actions"
  | "arrival-prep" | "desktop-transition" | "system-check" | "trust-certificate";

/** 12-state per-phase status */
export type SetupPhaseStatus =
  | "idle"
  | "preparing"
  | "active"
  | "validating"
  | "syncing"
  | "success"
  | "warning"
  | "degraded"
  | "blocked"
  | "skipped"
  | "resumed"
  | "completed";

/** Valid transition map — enforced at runtime */
export const VALID_PHASE_TRANSITIONS: Record<SetupPhaseStatus, SetupPhaseStatus[]> = {
  idle:       ["preparing", "skipped"],
  preparing:  ["active", "blocked", "skipped"],
  active:     ["validating", "warning", "skipped", "blocked"],
  validating: ["syncing", "success", "warning", "blocked"],
  syncing:    ["success", "warning", "degraded", "blocked"],
  success:    ["completed"],
  warning:    ["degraded", "active", "resumed", "blocked", "skipped"],
  degraded:   ["blocked", "resumed", "skipped"],
  blocked:    ["resumed", "skipped"],
  skipped:    ["completed"],
  resumed:    ["preparing", "active"],
  completed:  [],
};

/** Terminal states that count as "resolved" for dependency checks */
export const RESOLVED_STATUSES: SetupPhaseStatus[] = ["completed", "skipped"];

/** Icon state for UI rendering */
export type PhaseIconState = "pending" | "spinner" | "check" | "warning" | "error" | "skip" | "active";

/** UX metadata per status */
export interface PhaseStatusUX {
  userMessage: string;
  allowedActions: SetupPhaseAction[];
  iconState: PhaseIconState;
}

export type SetupPhaseAction = "continue" | "retry" | "skip" | "rollback" | "view-details" | "cancel";

/** Timeout and retry configuration */
export interface PhaseTimeoutConfig {
  timeoutMs: number;
  autoRetry: boolean;
  maxRetries: number;
  backoffBaseMs: number;
  backoffCap: number;
}

/** Branch condition types */
export type BranchConditionType = "role" | "device-type" | "hardware" | "domain-selection" | "setup-style" | "custom";

export interface SetupBranchCondition {
  type: BranchConditionType;
  description: string;
  evaluatorKey: string;
  /** If true, phase is included when condition passes; if false, phase is skipped */
  includeWhen: boolean;
}

/** Background task for a phase */
export interface SetupBackgroundTask {
  id: string;
  phaseId: SetupPhaseId;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number; // 0-100
  error?: string;
  blocking: boolean;
}

/** Full phase definition */
export interface SetupPhaseDefinition {
  id: SetupPhaseId;
  title: string;
  description: string;
  /** Phase IDs that must be in RESOLVED_STATUSES before this phase can start */
  dependencies: SetupPhaseId[];
  /** If true, all downstream phases wait until this completes */
  blocking: boolean;
  /** If true, this phase is required and cannot be skipped */
  required: boolean;
  /** Background tasks to launch when phase enters "preparing" */
  backgroundTaskIds: string[];
  /** Conditions that determine if this phase is included in the active path */
  branchConditions: SetupBranchCondition[];
  /** Required hardware capabilities (e.g., "camera", "biometric") */
  requiredHardware: string[];
  /** Timeout configuration */
  timeout: PhaseTimeoutConfig;
  /** Phase to rollback to if this phase fails unrecoverably */
  rollbackTarget?: SetupPhaseId;
  /** UX metadata for each status */
  statusUX: Record<SetupPhaseStatus, PhaseStatusUX>;
  /** Order within the full phase list (for topological tiebreaking) */
  order: number;
  /** Excluded from step count in progress rail */
  excludedFromSteps: boolean;
}

/** Per-phase runtime state */
export interface SetupPhaseState {
  phaseId: SetupPhaseId;
  status: SetupPhaseStatus;
  enteredAt: number;
  exitedAt?: number;
  retryCount: number;
  lastError?: string;
  timeoutHandle?: ReturnType<typeof setTimeout>;
}

/** Branch path for the entire session */
export type SetupBranchPath = "personal" | "family" | "managed" | "enterprise";

/** Rollback point snapshot */
export interface SetupRollbackPoint {
  phaseId: SetupPhaseId;
  timestamp: number;
  phaseStates: Record<string, SetupPhaseState>;
  reason?: string;
}

/** Hardware capabilities detected at boot */
export interface HardwareCapabilities {
  hasCamera: boolean;
  hasBiometric: boolean;
  hasGeolocation: boolean;
  screenSize: "small" | "medium" | "large";
  connectionType: "fast" | "slow" | "offline";
  storageAvailable: boolean;
  notificationsSupported: boolean;
  performanceTier: "low" | "medium" | "high";
}

/** Full session state */
export interface SetupSession {
  id: string;
  userId: string;
  deviceId: string;
  startedAt: number;
  updatedAt: number;
  currentPhaseId: SetupPhaseId;
  phaseStates: Record<string, SetupPhaseState>;
  completedPhases: SetupPhaseId[];
  skippedPhases: SetupPhaseId[];
  rollbackStack: SetupRollbackPoint[];
  branchPath: SetupBranchPath;
  hardwareCapabilities: HardwareCapabilities;
  interrupted: boolean;
  interruptionReason?: "reload" | "network-loss" | "timeout" | "unknown";
  resumable: boolean;
  completionPct: number;
  backgroundTasks: SetupBackgroundTask[];
}

/** Serializable snapshot for persistence (no functions/timers) */
export interface SetupSessionSnapshot {
  id: string;
  userId: string;
  deviceId: string;
  startedAt: number;
  updatedAt: number;
  currentPhaseId: SetupPhaseId;
  phaseStates: Record<string, Omit<SetupPhaseState, "timeoutHandle">>;
  completedPhases: SetupPhaseId[];
  skippedPhases: SetupPhaseId[];
  rollbackStack: SetupRollbackPoint[];
  branchPath: SetupBranchPath;
  hardwareCapabilities: HardwareCapabilities;
  interrupted: boolean;
  interruptionReason?: string;
  completionPct: number;
}
