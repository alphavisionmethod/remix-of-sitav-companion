import type { RealityContractMeta } from "./primitives";

export interface Postcondition {
  id: string;
  capabilityId: string;
  tenantId: string;
  conditionType: "state-check" | "value-range" | "existence" | "side-effect-absent" | "custom";
  expression: string;
  description: string;
  required: boolean;
  meta: RealityContractMeta;
}
