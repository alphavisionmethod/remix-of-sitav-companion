import type { RealityContractMeta } from "./primitives";

export interface AuditAnchorReference {
  id: string;
  tenantId: string;
  anchorType: "execution" | "verification" | "reconciliation" | "export" | "finality";
  anchoredArtifactId: string;
  integrityHash: string;
  anchoredAt: string;
  receiptId: string;
  meta: RealityContractMeta;
}
