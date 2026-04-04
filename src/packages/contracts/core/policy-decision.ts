// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Policy Decision
// ═══════════════════════════════════════════════════════════════

import type { ApprovalType } from "../_contract-scaffold";

export interface PolicyConstraint {
  type: string;
  description: string;
  limit?: number | string;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  requiredApprovals: number;
  approvalType: ApprovalType;
  constraints: PolicyConstraint[];
  trustScore: number;
}
