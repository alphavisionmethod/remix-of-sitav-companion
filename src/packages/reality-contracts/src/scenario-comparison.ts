import type { RealityContractMeta } from "./primitives";

export interface ScenarioComparison {
  id: string;
  tenantId: string;
  scenarioIds: string[];
  dimensions: Array<{
    dimension: string;
    values: Record<string, unknown>;
    winner?: string;
  }>;
  overallRecommendation?: string;
  generatedAt: string;
  meta: RealityContractMeta;
}
