import type { RealityContractMeta } from "./primitives";

export interface ConfidenceTrend {
  id: string;
  entityId: string;
  entityType: string;
  tenantId: string;
  dataPoints: Array<{ timestamp: string; score: number; evidenceCount: number }>;
  trend: "improving" | "stable" | "declining" | "volatile";
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  meta: RealityContractMeta;
}
