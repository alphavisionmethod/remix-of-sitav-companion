// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Policy Snapshot
// Immutable record of the policy state applied at execution time
// ═══════════════════════════════════════════════════════════════

import type { DomainId, ApprovalType } from "../_contract-scaffold";

export interface PolicySnapshotRule {
  ruleId: string;
  domain: DomainId;
  description: string;
  enabled: boolean;
}

export interface PolicySnapshot {
  id: string;
  capturedAt: string;
  policyVersion: string;
  activeRules: PolicySnapshotRule[];
  trustThresholds: Record<string, number>;
  approvalRequirements: Record<string, ApprovalType>;
  autonomyLimits: Record<string, number>;
  capturedFor: string; // execution or workflow ID
}
