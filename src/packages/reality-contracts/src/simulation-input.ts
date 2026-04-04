import type { RealityContractMeta } from "./primitives";

export interface SimulationInput {
  id: string;
  scenarioId: string;
  tenantId: string;
  capabilityId: string;
  correlationId: string;
  inputPayload: Record<string, unknown>;
  policySnapshot: Record<string, unknown>;
  submittedAt: string;
  meta: RealityContractMeta;
}
