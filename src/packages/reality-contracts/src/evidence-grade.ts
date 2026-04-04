import type { RealityContractMeta, EvidenceGradeLevel } from "./primitives";

export interface EvidenceGrade {
  id: string;
  artifactId: string;
  artifactType: string;
  tenantId: string;
  gradeLevel: EvidenceGradeLevel;
  source: string;
  verifiedAt?: string;
  verifiedBy?: string;
  lineageId?: string;
  justification: string;
  meta: RealityContractMeta;
}
