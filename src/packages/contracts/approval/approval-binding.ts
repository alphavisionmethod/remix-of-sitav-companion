// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Contracts: Approval Binding
// Binds approvals to specific actions, scopes, or policy decisions
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type ApprovalBindingType = "one-time" | "recurring" | "blanket" | "conditional";

export interface ApprovalBinding {
  id: string;
  approvalId: string;
  bindingType: ApprovalBindingType;
  scope: {
    domain?: DomainId;
    capabilityId?: string;
    entityId?: string;
    maxValueCents?: number;
  };
  validFrom: string;
  validUntil?: string;
  usageCount: number;
  maxUsages?: number;
  conditions: string[];
  revokedAt?: string;
  revokedBy?: string;
}
