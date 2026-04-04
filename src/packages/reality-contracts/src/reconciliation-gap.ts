import type { RealityContractMeta, DriftSeverity } from "./primitives";

export interface ReconciliationGap {
  id: string;
  reconciliationId: string;
  tenantId: string;
  field: string;
  sourceAValue: unknown;
  sourceBValue: unknown;
  severity: DriftSeverity;
  resolution?: "auto-corrected" | "manual" | "deferred" | "escalated";
  receiptId: string;
  detectedAt: string;
  meta: RealityContractMeta;
}
