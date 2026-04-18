// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Proof Builder (Proof Layer)
// Records approval decisions as proof
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";

export interface ApprovalProofRecord {
  proofId: string;
  envelopeId: string;
  approvalRequired: boolean;
  approvalStatus: string;
  approvalId?: string;
  riskTier: string;
  policyDecisions: Array<{ policyId: string; decision: string; reason: string }>;
  timestamp: string;
}

export function buildApprovalProof(envelope: OrchestrationEnvelope): ApprovalProofRecord {
  return {
    proofId: crypto.randomUUID(),
    envelopeId: envelope.envelopeId,
    approvalRequired: envelope.planningState?.approvalRequired ?? false,
    approvalStatus: envelope.planningState?.approvalStatus ?? "not_required",
    approvalId: envelope.planningState?.approvalId,
    riskTier: envelope.intentState?.riskTier ?? "standard",
    policyDecisions: envelope.policySnapshot?.decisions ?? [],
    timestamp: new Date().toISOString(),
  };
}
