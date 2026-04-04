import type { RealityContractMeta, EvidenceGradeLevel } from "./primitives";

export interface ConfidenceScore {
  id: string;
  entityId: string;
  entityType: string;
  tenantId: string;
  score: number;
  evidenceGrade: EvidenceGradeLevel;
  reasons: string[];
  missingInputs: string[];
  staleInputs: string[];
  evaluatedAt: string;
  meta: RealityContractMeta;
}
