import type { RealityContractMeta } from "./primitives";

export interface UncertaintyBand {
  id: string;
  entityId: string;
  entityType: string;
  tenantId: string;
  metric: string;
  centralEstimate: number;
  lowerBound: number;
  upperBound: number;
  confidenceInterval: number;
  distribution: "normal" | "skewed" | "bimodal" | "unknown";
  evaluatedAt: string;
  meta: RealityContractMeta;
}
