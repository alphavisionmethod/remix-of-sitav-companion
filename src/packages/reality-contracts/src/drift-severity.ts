import type { RealityContractMeta, DriftSeverity as DriftSeverityEnum } from "./primitives";

export interface DriftSeverityDefinition {
  level: DriftSeverityEnum;
  description: string;
  requiresEscalation: boolean;
  autoResolveEligible: boolean;
  meta: RealityContractMeta;
}

export type { DriftSeverityEnum as DriftSeverity };
