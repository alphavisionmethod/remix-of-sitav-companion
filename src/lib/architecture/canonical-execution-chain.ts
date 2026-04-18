// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Execution Chain
// The ONE execution path. No side effects outside this chain.
//
// Intent → Brain Core → Policy Engine → Capability Router →
// Executor → Receipt → Event Bus → Read Models / Memory / Graph
// ═══════════════════════════════════════════════════════════════

export type ExecutionStage =
  | "intent"
  | "brain-core"
  | "policy-engine"
  | "capability-router"
  | "executor"
  | "receipt"
  | "event-bus"
  | "projections";

export const EXECUTION_CHAIN: ExecutionStage[] = [
  "intent",
  "brain-core",
  "policy-engine",
  "capability-router",
  "executor",
  "receipt",
  "event-bus",
  "projections",
];

export interface ExecutionEnvelope {
  envelopeId: string;
  intentId: string;
  tenantId: string;
  userId: string;
  capabilityContract: string;
  policyDecisionId: string;
  approvalState: "not-required" | "approved" | "pending" | "denied";
  approvalProofId?: string;
  policyHash: string;
  signature: string;
  evidenceGrade: "high" | "medium" | "low";
  budgetCheckPassed: boolean;
  idempotencyKey: string;
  currentStage: ExecutionStage;
  createdAt: string;
  expiresAt: string;
}

export interface ExecutionReceipt {
  receiptId: string;
  envelopeId: string;
  stage: ExecutionStage;
  result: "success" | "failure" | "refused" | "rolled-back";
  durationMs: number;
  outputHash: string;
  connectorId?: string;
  rollbackRef?: string;
  immutableEventId: string;
  createdAt: string;
}

export interface RefusalReceipt {
  receiptId: string;
  envelopeId: string;
  refusedAt: ExecutionStage;
  reason: string;
  policyRef?: string;
  evidenceGrade: string;
  createdAt: string;
}

// ── Validation ──────────────────────────────────────────────

export function validateEnvelope(envelope: ExecutionEnvelope): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!envelope.envelopeId) errors.push("Missing envelopeId");
  if (!envelope.tenantId) errors.push("Missing tenantId");
  if (!envelope.capabilityContract) errors.push("Missing capabilityContract");
  if (!envelope.policyDecisionId) errors.push("Missing policyDecisionId");
  if (!envelope.policyHash) errors.push("Missing policyHash");
  if (!envelope.signature) errors.push("Missing signature");
  if (!envelope.idempotencyKey) errors.push("Missing idempotencyKey");
  if (envelope.approvalState === "pending") errors.push("Approval still pending — cannot execute");
  if (envelope.approvalState === "denied") errors.push("Approval denied — execution blocked");
  if (!envelope.budgetCheckPassed) errors.push("Budget check failed");
  return { valid: errors.length === 0, errors };
}

export function isStageReachable(current: ExecutionStage, target: ExecutionStage): boolean {
  return EXECUTION_CHAIN.indexOf(target) >= EXECUTION_CHAIN.indexOf(current);
}
