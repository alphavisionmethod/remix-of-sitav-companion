// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Trust Transition
// Formalizes trust state changes with provenance
// ═══════════════════════════════════════════════════════════════

export type TrustTransitionTrigger =
  | "action-outcome"
  | "policy-change"
  | "incident"
  | "verification"
  | "delegation-change"
  | "manual";

export interface TrustTransition {
  id: string;
  entityId: string;
  entityType: string;
  previousScore: number;
  newScore: number;
  trigger: TrustTransitionTrigger;
  proofId?: string;
  policySnapshotId?: string;
  timestamp: string;
  changedBy: string;
  reason: string;
}
