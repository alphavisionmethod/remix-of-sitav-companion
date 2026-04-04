import type { RealityContractMeta, DriftSeverity } from "./primitives";

export interface NightlyDriftSummary {
  id: string;
  tenantId: string;
  periodDate: string;
  totalChecks: number;
  driftsDetected: number;
  autoResolved: number;
  escalated: number;
  bySeverity: Record<DriftSeverity, number>;
  topDriftEntities: Array<{ entityId: string; entityType: string; count: number }>;
  generatedAt: string;
  meta: RealityContractMeta;
}
