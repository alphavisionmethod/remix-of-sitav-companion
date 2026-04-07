// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: NegativeReceipt
// Proof that execution was REFUSED, BLOCKED, or REJECTED.
// Every denial is a receipt. Nothing disappears silently.
// ═══════════════════════════════════════════════════════════════

export type NegativeReceiptReason =
  | "policy-denied"
  | "approval-rejected"
  | "approval-expired"
  | "budget-exceeded"
  | "kill-switch-active"
  | "circuit-breaker-open"
  | "governance-failed"
  | "constitution-denied"
  | "lease-violated"
  | "capability-not-found"
  | "envelope-invalid"
  | "evidence-insufficient";

export interface NegativeReceipt {
  id: string;
  envelopeId: string;
  correlationId: string;
  capabilityId: string;
  reason: NegativeReceiptReason;
  detail: string;
  policyRef?: string;
  approvalId?: string;
  evidenceGrade?: string;
  blockedAt: string;
  actorId: string;
  domain: string;
}

export function createNegativeReceipt(params: {
  envelopeId: string;
  correlationId: string;
  capabilityId: string;
  reason: NegativeReceiptReason;
  detail: string;
  actorId: string;
  domain: string;
  policyRef?: string;
  approvalId?: string;
}): NegativeReceipt {
  return {
    id: crypto.randomUUID(),
    ...params,
    blockedAt: new Date().toISOString(),
  };
}
