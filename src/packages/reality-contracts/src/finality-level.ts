import type { RealityContractMeta, FinalityLevel as FinalityLevelEnum } from "./primitives";

export interface FinalityLevelDefinition {
  level: FinalityLevelEnum;
  description: string;
  requiresApproval: boolean;
  requiresReceipt: boolean;
  escalationOnViolation: boolean;
  meta: RealityContractMeta;
}

export type { FinalityLevelEnum as FinalityLevel };
