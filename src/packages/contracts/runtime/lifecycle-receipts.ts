// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Lifecycle Receipts & Replay Packets
// Canonical chain-compliant receipts for all lifecycle events,
// support-safe replay packet generation
// ═══════════════════════════════════════════════════════════════

import type {
  LifecycleReceiptType,
  LifecycleState,
  RestartReason,
  QuarantineReason,
  QuarantineExitCondition,
} from "./lifecycle-authority";

// ── Receipt Payloads (per receipt type) ──────────────────────

export interface BootCompletedPayload {
  deviceId: string;
  bootSequenceId: string;
  bootTargetsCompleted: string[];
  bootDurationMs: number;
  attestationResult: "full" | "partial" | "software-only" | "failed";
  trustBaseline: number;
  isFirstBoot: boolean;
}

export interface RestartExecutedPayload {
  service: string;
  reason: RestartReason;
  attemptNumber: number;
  backoffDelayMs: number;
  previousState: string;
  outcome: "success" | "failed" | "quarantined";
  restartDurationMs: number;
}

export interface QuarantineEnteredPayload {
  reason: QuarantineReason;
  services: string[];
  isolationLevel: "service" | "capability-group" | "full-system";
  degradedCapabilities: string[];
  diagnosticBundleId?: string;
  operatorNotified: boolean;
}

export interface QuarantineExitedPayload {
  originalReason: QuarantineReason;
  exitCondition: QuarantineExitCondition;
  quarantineDurationMs: number;
  servicesRestored: string[];
  operatorId?: string;
  verificationPassed: boolean;
}

export interface RollbackDecidedPayload {
  trigger: string;
  fromVersion: string;
  toVersion: string;
  affectedPartitions: string[];
  evidenceIds: string[];
  riskAssessment: "low" | "medium" | "high";
  requiresOperatorApproval: boolean;
}

export interface RollbackExecutedPayload {
  fromVersion: string;
  toVersion: string;
  partitionsSwitched: string[];
  rollbackDurationMs: number;
  dataPreserved: boolean;
  servicesRestarted: string[];
}

export interface RollbackVerifiedPayload {
  rollbackId: string;
  verificationChecks: { name: string; passed: boolean; details?: string }[];
  allPassed: boolean;
  newBootAttestationId?: string;
  rollbackChainComplete: boolean;
}

// ── Typed Lifecycle Receipt ─────────────────────────────────

export type LifecycleReceiptPayload =
  | { type: "boot-completed"; data: BootCompletedPayload }
  | { type: "restart-executed"; data: RestartExecutedPayload }
  | { type: "quarantine-entered"; data: QuarantineEnteredPayload }
  | { type: "quarantine-exited"; data: QuarantineExitedPayload }
  | { type: "rollback-decided"; data: RollbackDecidedPayload }
  | { type: "rollback-executed"; data: RollbackExecutedPayload }
  | { type: "rollback-verified"; data: RollbackVerifiedPayload }
  | { type: "update-applied"; data: { version: string; partition: string; durationMs: number; rebootRequired: boolean } }
  | { type: "crash-loop-detected"; data: { service: string; crashCount: number; windowMs: number; escalationType: string } }
  | { type: "safe-mode-entered"; data: { preservedServices: string[]; reason: string; operatorNotified: boolean } }
  | { type: "recovery-completed"; data: { recoveryType: string; durationMs: number; dataLoss: boolean; servicesRestored: string[] } };

export interface TypedLifecycleReceipt {
  id: string;
  timestamp: string;
  lifecycleState: LifecycleState;
  previousState?: LifecycleState;
  payload: LifecycleReceiptPayload;
  correlationId: string;
  chainPreviousId?: string;
  operatorVisible: boolean;
  supportBundleEligible: boolean;
  auditTrailRequired: boolean;
  deviceId: string;
  tenantId: string;
}

// ── Canonical Chain Compliance ───────────────────────────────

export interface LifecycleChainEntry {
  receiptId: string;
  sequenceNumber: number;
  previousHash: string;
  currentHash: string;
  timestamp: string;
  receiptType: LifecycleReceiptType;
}

export interface LifecycleChainState {
  chainId: string;
  deviceId: string;
  headSequence: number;
  headHash: string;
  entries: LifecycleChainEntry[];
  lastVerifiedAt: string;
  integrityStatus: "valid" | "broken" | "unverified";
}

// ── Support-Safe Replay Packet ──────────────────────────────

export interface LifecycleReplayPacket {
  id: string;
  deviceId: string;
  generatedAt: string;
  generatedFor: "support" | "audit" | "debug" | "incident";

  /** Restart/rollback lineage — ordered chain of lifecycle events */
  lineage: {
    receipts: TypedLifecycleReceipt[];
    chainState: LifecycleChainState;
    transitionCount: number;
    totalDowntimeMs: number;
  };

  /** Current system state snapshot */
  currentState: {
    lifecycleState: LifecycleState;
    uptimeMs: number;
    lastBootAttestation: string;
    activeQuarantine: boolean;
    activePressures: string[];
    crashLoopServices: string[];
  };

  /** Diagnostic context */
  diagnostics: {
    recentErrors: { service: string; error: string; timestamp: string }[];
    resourceMetrics: { cpu: number; memory: number; disk: number; network: number };
    dependencyHealth: { service: string; healthy: boolean; latencyMs: number }[];
  };

  /** Redaction for external sharing */
  redacted: boolean;
  redactedFields: string[];

  /** Human-readable summary */
  summary: string;
}

// ── Factory helpers ─────────────────────────────────────────

export function createLifecycleReceipt(
  payload: LifecycleReceiptPayload,
  context: {
    deviceId: string;
    tenantId: string;
    lifecycleState: LifecycleState;
    previousState?: LifecycleState;
    correlationId: string;
    chainPreviousId?: string;
  },
): TypedLifecycleReceipt {
  return {
    id: `lcr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    lifecycleState: context.lifecycleState,
    previousState: context.previousState,
    payload,
    correlationId: context.correlationId,
    chainPreviousId: context.chainPreviousId,
    operatorVisible: true,
    supportBundleEligible: true,
    auditTrailRequired: true,
    deviceId: context.deviceId,
    tenantId: context.tenantId,
  };
}
