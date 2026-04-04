import type { RealityContractMeta } from "./primitives";

export interface RealityExportPack {
  id: string;
  tenantId: string;
  actorId: string;
  artifacts: Array<{ artifactId: string; artifactType: string; redacted: boolean }>;
  integrityHash: string;
  exportFormat: "json" | "csv" | "pdf" | "full-archive";
  totalRecords: number;
  redactedFieldCount: number;
  approvalId?: string;
  receiptId: string;
  createdAt: string;
  meta: RealityContractMeta;
}
