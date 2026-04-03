// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Model Contracts (Barrel)
// ═══════════════════════════════════════════════════════════════

// ── Proof Pack ───────────────────────────────────────────────

export interface ProofPack {
  id: string;
  intentId: string;
  tenantId: string;
  generatedAt: string;
  chainHash: string;
  receipts: TypedReceipt[];
  summary: string;
  domain: string;
  relatedEntities: string[];
}

// ── Typed Receipts ───────────────────────────────────────────

export type TypedReceipt =
  | ActionReceipt
  | ApprovalProof
  | ExecutionProof
  | VerificationProof
  | RollbackProof
  | BoardroomDecisionProof
  | CommunicationReceipt
  | PaymentReceipt
  | SystemReceipt
  | RefusalProofReceipt;

interface BaseReceipt {
  id: string;
  timestamp: string;
  hash: string;
  previousHash: string;
  tenantId: string;
}

export interface ActionReceipt extends BaseReceipt {
  type: "action";
  actionId: string;
  actionType: string;
  executor: string;
  inputHash: string;
  outputHash: string;
  status: "completed" | "failed";
}

export interface ApprovalProof extends BaseReceipt {
  type: "approval";
  approvalId: string;
  actionId: string;
  approver: string;
  decision: "approve" | "reject";
  reason?: string;
  expiresAt: string;
}

export interface ExecutionProof extends BaseReceipt {
  type: "execution";
  envelopeId: string;
  capabilityId: string;
  mode: "live" | "dry-run" | "simulation";
  inputHash: string;
  resultHash: string;
  durationMs: number;
}

export interface VerificationProof extends BaseReceipt {
  type: "verification";
  actionId: string;
  expected: string; // hash of expected
  actual: string; // hash of actual
  match: boolean;
  recommendation: "accept" | "review" | "rollback";
}

export interface RollbackProof extends BaseReceipt {
  type: "rollback";
  originalActionId: string;
  reason: string;
  rollbackSteps: string[];
  restoredState: string; // hash
}

export interface BoardroomDecisionProof extends BaseReceipt {
  type: "boardroom-decision";
  sessionId: string;
  topic: string;
  decision: string;
  advisorInputIds: string[];
  confidenceScore: number;
}

export interface CommunicationReceipt extends BaseReceipt {
  type: "communication";
  communicationType: "email" | "sms" | "phone";
  recipientId: string;
  subject?: string;
  deliveryStatus: "sent" | "delivered" | "failed" | "bounced";
}

export interface PaymentReceipt extends BaseReceipt {
  type: "payment";
  paymentId: string;
  amountCents: number;
  currency: string;
  payee: string;
  method: string;
  confirmationId: string;
}

export interface SystemReceipt extends BaseReceipt {
  type: "system";
  action: string;
  scope: string;
  details: Record<string, unknown>;
}

export interface RefusalProofReceipt extends BaseReceipt {
  type: "refusal";
  refusalReason: string;
  blockedAction: string;
  policyId: string;
  advisorId: string;
  confidenceAtRefusal: number;
  requiredForRetry: string[];
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./receipts";
export * from "./agentic-and-investment-proof";
