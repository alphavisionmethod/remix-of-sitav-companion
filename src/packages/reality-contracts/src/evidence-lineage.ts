import type { RealityContractMeta } from "./primitives";

export interface EvidenceLineage {
  id: string;
  tenantId: string;
  rootArtifactId: string;
  chain: Array<{
    artifactId: string;
    artifactType: string;
    derivedFrom?: string;
    transformApplied?: string;
    timestamp: string;
    integrityHash: string;
  }>;
  chainIntact: boolean;
  receiptId: string;
  createdAt: string;
  meta: RealityContractMeta;
}
