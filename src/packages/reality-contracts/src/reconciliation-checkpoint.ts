import type { RealityContractMeta } from "./primitives";

export interface ReconciliationCheckpoint {
  id: string;
  tenantId: string;
  sourceName: string;
  snapshotHash: string;
  recordCount: number;
  checkpointedAt: string;
  meta: RealityContractMeta;
}
