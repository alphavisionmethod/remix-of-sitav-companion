// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Contracts: Approval Receipt
// Canonical proof that approval occurred
// ═══════════════════════════════════════════════════════════════

import type { ApprovalStatus } from "../_contract-scaffold";

export interface ApprovalReceipt {
  id: string;
  approvalRequestId: string;
  actionId: string;
  status: ApprovalStatus;
  decisions: Array<{
    approverId: string;
    decision: "approve" | "reject";
    reason?: string;
    decidedAt: string;
  }>;
  finalDecision: "approved" | "rejected";
  decidedAt: string;
  hash: string;
  previousHash: string;
  proofBundleId?: string;
}
