import type { RealityContractMeta, DriftSeverity } from "./primitives";

export interface DriftIncident {
  id: string;
  tenantId: string;
  correlationId: string;
  detectionIds: string[];
  severity: DriftSeverity;
  affectedEntities: Array<{ entityId: string; entityType: string }>;
  rootCause?: string;
  resolution?: string;
  receiptId: string;
  openedAt: string;
  resolvedAt?: string;
  meta: RealityContractMeta;
}
