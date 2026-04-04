import type { RealityContractMeta } from "./primitives";

export interface CounterfactualSet {
  id: string;
  tenantId: string;
  baselineId: string;
  alternatives: Array<{
    label: string;
    parameters: Record<string, unknown>;
    projectedOutcome: Record<string, unknown>;
    confidence: number;
  }>;
  generatedAt: string;
  meta: RealityContractMeta;
}
