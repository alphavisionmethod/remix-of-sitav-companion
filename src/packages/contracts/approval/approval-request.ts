// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Contracts: Approval Request
// ═══════════════════════════════════════════════════════════════

import type { ApprovalStatus } from "../_contract-scaffold";

export interface ApprovalDecision {
  approverId: string;
  decision: "approve" | "reject";
  reason?: string;
  decidedAt: string;
}

export interface ApprovalRequest {
  id: string;
  actionId: string;
  actionType: string;
  requestedBy: string;
  requestedAt: string;
  expiresAt: string;
  context: Record<string, unknown>;
  requiredApprovers: number;
  currentApprovals: ApprovalDecision[];
  status: ApprovalStatus;
}
