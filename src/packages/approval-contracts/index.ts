// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Contracts (Re-export Facade)
// Domain-specific import path for approval types.
// Canonical source: @/packages/contracts/approval/
// ═══════════════════════════════════════════════════════════════

export type { ApprovalDecision, ApprovalRequest } from "@/packages/contracts/approval/approval-request";
export type { ApprovalReceipt } from "@/packages/contracts/approval/approval-receipt";
export type { ApprovalBindingType, ApprovalBinding } from "@/packages/contracts/approval/approval-binding";
export type {
  ConsentScope, ConsentDuration, ConsentDomain,
  ConsentGrant, ConsentCondition, ConsentPrompt, ConsentAlternative,
  PermissionFreeze, DelegationRule,
} from "@/packages/contracts/approval/consent";
