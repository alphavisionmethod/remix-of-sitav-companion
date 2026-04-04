import type { RealityContractMeta, RealityVerificationStatus } from "./primitives";

export interface VerificationOutcome {
  id: string;
  executionId: string;
  tenantId: string;
  correlationId: string;
  assertions: Array<{ assertionId: string; status: RealityVerificationStatus }>;
  overallStatus: RealityVerificationStatus;
  receiptId: string;
  durationMs: number;
  verifiedAt: string;
  meta: RealityContractMeta;
}
