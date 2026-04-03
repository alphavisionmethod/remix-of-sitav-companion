// ═══════════════════════════════════════════════════════════════
// SITA OS — Replay, Rollback, & Recovery Types
// Deep integration between proof, policy, approvals, connectors
// ═══════════════════════════════════════════════════════════════

import type { ActionState, OSDomain, ProofRecord, EntityScope } from "./os-unified.types";
import type { PolicyRule } from "./policy-depth.types";

// ── Replay Packet ───────────────────────────────────────────────
export interface ReplayPacket {
  id: string;
  workflowId: string;
  correlationId: string;
  domain: OSDomain;
  entityScope: EntityScope;
  createdAt: string;

  /** What happened — ordered timeline */
  timeline: ReplayTimelineEntry[];

  /** Policy snapshot at time of execution */
  policySnapshot: PolicySnapshotRef;

  /** Approval chain that authorized the action */
  approvalChain: ApprovalChainEntry[];

  /** Connector actions fired */
  connectorActions: ConnectorActionRecord[];

  /** Proof records created */
  proofRecords: string[];

  /** Postcondition verification results */
  verificationResults: VerificationResult[];

  /** Whether replay is safe to re-execute */
  replayEligible: boolean;
  replayBlockers: string[];

  /** Whether rollback is possible */
  rollbackEligible: boolean;
  rollbackBlockers: string[];

  /** Recovery recommendations if failed */
  recoveryRecommendations: RecoveryAction[];
}

export interface ReplayTimelineEntry {
  sequence: number;
  state: ActionState;
  actor: string;
  actorType: "user" | "advisor" | "system" | "device";
  action: string;
  timestamp: string;
  confidence: number;
  duration: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  proofId?: string;
  error?: string;
}

export interface PolicySnapshotRef {
  snapshotId: string;
  policies: { id: string; name: string; scope: PolicyRule["scope"]; effect: PolicyRule["effect"]; version: number }[];
  capturedAt: string;
}

export interface ApprovalChainEntry {
  approver: string;
  approverType: "user" | "advisor" | "system" | "delegation";
  action: "approved" | "rejected" | "auto_approved" | "delegated";
  reason: string;
  timestamp: string;
  delegationId?: string;
  proofId?: string;
}

export interface ConnectorActionRecord {
  connectorId: string;
  connectorName: string;
  action: string;
  direction: "inbound" | "outbound";
  status: "success" | "failed" | "timeout" | "rate_limited";
  requestAt: string;
  responseAt?: string;
  latencyMs: number;
  requestPayloadHash: string;
  responsePayloadHash?: string;
  receiptId: string;
  retryable: boolean;
  retryCount: number;
}

export interface VerificationResult {
  id: string;
  type: "precondition" | "postcondition" | "invariant" | "calculation";
  description: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  checkedAt: string;
  method: "exact_match" | "range" | "dual_pass" | "hash_compare";
}

// ── Rollback Packet ─────────────────────────────────────────────
export interface RollbackPacket {
  id: string;
  workflowId: string;
  replayPacketId: string;
  initiatedBy: string;
  initiatedAt: string;
  reason: string;

  /** Steps to undo, in reverse order */
  undoSteps: RollbackStep[];

  /** Current state of the rollback */
  status: "pending" | "in_progress" | "completed" | "partial" | "failed" | "blocked";

  /** Steps that cannot be undone */
  irreversibleSteps: { step: string; reason: string }[];

  /** New proof records from the rollback itself */
  rollbackProofIds: string[];

  /** Side effects that need manual resolution */
  manualResolutionRequired: ManualResolution[];
}

export interface RollbackStep {
  sequence: number;
  action: string;
  target: string;
  previousValue: unknown;
  currentValue: unknown;
  status: "pending" | "completed" | "failed" | "skipped";
  executedAt?: string;
  error?: string;
}

export interface ManualResolution {
  id: string;
  description: string;
  affectedSystem: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestedAction: string;
  assignedTo?: string;
  resolvedAt?: string;
}

// ── Recovery Action ─────────────────────────────────────────────
export interface RecoveryAction {
  id: string;
  type: "retry" | "rollback" | "manual" | "escalate" | "skip" | "compensate";
  title: string;
  description: string;
  risk: "low" | "medium" | "high";
  estimatedDuration: string;
  automated: boolean;
  requiresApproval: boolean;
  prerequisites: string[];
  affectedEntities: string[];
}

// ── Diagnostic Bundle ───────────────────────────────────────────
export interface DiagnosticBundle {
  id: string;
  workflowId: string;
  correlationId: string;
  createdAt: string;
  createdFor: "support" | "audit" | "debug" | "incident";

  replayPacket: ReplayPacket;
  rollbackPacket?: RollbackPacket;
  trustSnapshot: { score: number; posture: string; incidents: string[] };
  memorySnapshot: { relatedMemories: string[]; contradictions: string[] };
  connectorHealth: { id: string; status: string; lastSync: string }[];
  advisorDecisions: { advisorId: string; decision: string; confidence: number }[];
  systemMetrics: { cpu: number; memory: number; latency: number; errorRate: number };

  /** Human-readable explanation */
  explanation: string;

  /** Redacted for external sharing */
  redacted: boolean;
}
