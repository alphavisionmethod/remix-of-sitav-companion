import type { RealityContractMeta, RealityVerificationStatus } from "./primitives";

export interface VerificationAssertion {
  id: string;
  executionId: string;
  tenantId: string;
  correlationId: string;
  assertionType: string;
  expected: unknown;
  actual: unknown;
  status: RealityVerificationStatus;
  receiptId: string;
  verifiedAt: string;
  meta: RealityContractMeta;
}
