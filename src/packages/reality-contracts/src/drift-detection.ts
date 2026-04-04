import type { RealityContractMeta, DriftSeverity } from "./primitives";

export interface DriftDetection {
  id: string;
  entityId: string;
  entityType: string;
  tenantId: string;
  correlationId: string;
  expected: unknown;
  actual: unknown;
  severity: DriftSeverity;
  detectedAt: string;
  autoResolved: boolean;
  resolvedAt?: string;
  meta: RealityContractMeta;
}
