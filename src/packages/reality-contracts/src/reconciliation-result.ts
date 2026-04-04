import type { RealityContractMeta, ReconciliationStatus } from "./primitives";

export interface ReconciliationResult {
  id: string;
  tenantId: string;
  correlationId: string;
  sourceA: { name: string; snapshotId: string };
  sourceB: { name: string; snapshotId: string };
  totalRecords: number;
  matchedRecords: number;
  gaps: string[];
  resolvedGaps: string[];
  status: ReconciliationStatus;
  receiptId: string;
  reconciledAt: string;
  meta: RealityContractMeta;
}
