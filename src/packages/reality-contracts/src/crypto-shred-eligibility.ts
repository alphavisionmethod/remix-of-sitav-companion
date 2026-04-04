import type { RealityContractMeta } from "./primitives";

export interface CryptoShredEligibility {
  id: string;
  artifactId: string;
  artifactType: string;
  tenantId: string;
  eligible: boolean;
  reason: string;
  retentionExpiresAt?: string;
  approvalRequired: boolean;
  approvalId?: string;
  evaluatedAt: string;
  meta: RealityContractMeta;
}
