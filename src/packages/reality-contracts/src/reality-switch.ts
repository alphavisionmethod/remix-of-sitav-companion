// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Switch: Simulation/Shadow/Live Lane Control
// ═══════════════════════════════════════════════════════════════

import type { RealityLane, RealityContractMeta } from "./primitives";

export interface RealitySwitch {
  id: string;
  lane: RealityLane;
  simulationId?: string;
  shadowId?: string;
  liveExecutionId?: string;
  tenantId: string;
  actorId: string;
  correlationId: string;
  policyOverrides: Record<string, unknown>;
  activatedAt: string;
  expiresAt?: string;
  meta: RealityContractMeta;
}
