import type { RealityContractMeta } from "./primitives";

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  actorId: string;
  correlationId: string;
  parameters: Record<string, unknown>;
  constraints: Record<string, unknown>;
  baselineSnapshotId?: string;
  createdAt: string;
  receiptId: string;
  meta: RealityContractMeta;
}
