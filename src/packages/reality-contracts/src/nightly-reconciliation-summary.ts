import type { RealityContractMeta, ReconciliationStatus } from "./primitives";

export interface NightlyReconciliationSummary {
  id: string;
  tenantId: string;
  periodDate: string;
  totalReconciliations: number;
  byStatus: Record<ReconciliationStatus, number>;
  totalGaps: number;
  resolvedGaps: number;
  unresolvedGaps: number;
  generatedAt: string;
  meta: RealityContractMeta;
}
