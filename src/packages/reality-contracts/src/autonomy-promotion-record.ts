import type { RealityContractMeta, AutonomyLevel } from "./primitives";

export interface AutonomyPromotionRecord {
  id: string;
  tenantId: string;
  actorId: string;
  capabilityId: string;
  correlationId: string;
  fromLevel: AutonomyLevel;
  toLevel: AutonomyLevel;
  evidence: string[];
  confidenceAtPromotion: number;
  approvalId?: string;
  receiptId: string;
  promotedAt: string;
  meta: RealityContractMeta;
}
