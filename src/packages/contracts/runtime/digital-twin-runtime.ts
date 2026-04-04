// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Digital Twin Runtime
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type RuntimeTwinType = "business" | "financial" | "household" | "entity";

export interface TwinDataPoint {
  key: string;
  value: unknown;
  source: string;
  confidence: number;
  lastUpdated: string;
  isStale: boolean;
}

export interface DigitalTwinRuntime {
  twinId: string;
  twinType: RuntimeTwinType;
  domain: DomainId;
  entityId: string;
  dataPoints: TwinDataPoint[];
  lastSyncAt: string;
  healthScore: number;
  staleSources: string[];
  activeScenarios: string[];
  snapshotVersion: string;
}
