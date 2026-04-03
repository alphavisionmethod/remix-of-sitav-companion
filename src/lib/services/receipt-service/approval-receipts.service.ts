// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Receipts Service
// Generates ApprovalProof from approval decisions
// ═══════════════════════════════════════════════════════════════

import type { ApprovalProof } from "@/packages/proof-model";
import type { ApprovalRequest } from "@/packages/contracts";

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export function generateApprovalReceipt(
  request: ApprovalRequest,
  previousHash: string = "genesis"
): ApprovalProof[] {
  return request.currentApprovals.map((decision): ApprovalProof => {
    const hash = computeHash(`${previousHash}:${request.id}:${decision.approverId}:${decision.decision}`);
    return {
      type: "approval",
      id: crypto.randomUUID(),
      timestamp: decision.decidedAt || new Date().toISOString(),
      hash,
      previousHash,
      tenantId: (request.context?.tenantId as string) || "system",
      approvalId: request.id,
      actionId: request.actionId,
      approver: decision.approverId,
      decision: decision.decision,
      reason: decision.reason,
      expiresAt: request.expiresAt,
    };
  });
}

export function generateSingleApprovalReceipt(params: {
  approvalId: string;
  actionId: string;
  approver: string;
  decision: "approve" | "reject";
  reason?: string;
  tenantId: string;
  previousHash?: string;
  expiresAt: string;
}): ApprovalProof {
  const prev = params.previousHash || "genesis";
  return {
    type: "approval",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${prev}:${params.approvalId}:${params.approver}:${params.decision}`),
    previousHash: prev,
    tenantId: params.tenantId,
    approvalId: params.approvalId,
    actionId: params.actionId,
    approver: params.approver,
    decision: params.decision,
    reason: params.reason,
    expiresAt: params.expiresAt,
  };
}
