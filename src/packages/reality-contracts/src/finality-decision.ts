import type { RealityContractMeta, FinalityLevel } from "./primitives";

export interface FinalityDecision {
  id: string;
  executionId: string;
  tenantId: string;
  correlationId: string;
  decidedLevel: FinalityLevel;
  decidedBy: string;
  evidence: string[];
  receiptId: string;
  approvalId?: string;
  decidedAt: string;
  meta: RealityContractMeta;
}
