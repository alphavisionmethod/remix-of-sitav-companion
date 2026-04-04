import type { RealityContractMeta, AutonomyLevel } from "./primitives";

export interface AutonomyDowngradeRecord {
  id: string;
  tenantId: string;
  actorId: string;
  capabilityId: string;
  correlationId: string;
  fromLevel: AutonomyLevel;
  toLevel: AutonomyLevel;
  reason: string;
  triggerType: "drift" | "policy-violation" | "manual" | "anomaly" | "trust-decay";
  receiptId: string;
  downgradedAt: string;
  meta: RealityContractMeta;
}
