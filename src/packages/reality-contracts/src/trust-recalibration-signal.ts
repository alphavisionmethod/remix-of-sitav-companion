import type { RealityContractMeta, AutonomyLevel } from "./primitives";

export interface TrustRecalibrationSignal {
  id: string;
  tenantId: string;
  actorId: string;
  capabilityId?: string;
  correlationId: string;
  previousLevel: AutonomyLevel;
  recalibratedLevel: AutonomyLevel;
  direction: "promotion" | "downgrade" | "hold";
  confidence: number;
  triggerSource: string;
  receiptId?: string;
  emittedAt: string;
  meta: RealityContractMeta;
}
