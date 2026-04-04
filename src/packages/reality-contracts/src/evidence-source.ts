import type { RealityContractMeta, EvidenceGradeLevel } from "./primitives";

export interface EvidenceSource {
  id: string;
  tenantId: string;
  sourceType: "system" | "user" | "external" | "derived" | "third-party";
  sourceName: string;
  reliability: EvidenceGradeLevel;
  lastVerifiedAt?: string;
  registeredAt: string;
  meta: RealityContractMeta;
}
