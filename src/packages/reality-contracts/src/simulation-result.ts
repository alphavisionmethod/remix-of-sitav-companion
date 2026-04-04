import type { RealityContractMeta } from "./primitives";

export interface SimulationResult {
  id: string;
  scenarioId: string;
  inputId: string;
  tenantId: string;
  correlationId: string;
  output: Record<string, unknown>;
  confidence: number;
  uncertaintyRange: { low: number; high: number };
  durationMs: number;
  sideEffects: string[];
  receiptId: string;
  completedAt: string;
  meta: RealityContractMeta;
}
