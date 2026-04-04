import type { RealityContractMeta } from "./primitives";

export interface ShadowExecutionRecord {
  id: string;
  tenantId: string;
  correlationId: string;
  capabilityId: string;
  liveExecutionId: string;
  shadowOutput: Record<string, unknown>;
  liveOutput: Record<string, unknown>;
  divergences: Array<{ field: string; expected: unknown; actual: unknown }>;
  durationMs: number;
  receiptId: string;
  executedAt: string;
  meta: RealityContractMeta;
}
