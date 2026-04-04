// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Scenario Intelligence Runtime
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type RuntimeScenarioType = "what-if" | "stress-test" | "monte-carlo" | "regression" | "optimization";

export interface ScenarioVariable {
  name: string;
  currentValue: unknown;
  testValues: unknown[];
  sensitivity: number;
}

export interface ScenarioResult {
  scenarioId: string;
  variables: ScenarioVariable[];
  outcomes: Record<string, unknown>;
  confidence: number;
  riskScore: number;
  recommendation: string;
}

export interface ScenarioIntelligenceRuntime {
  activeScenarios: Array<{
    id: string;
    name: string;
    type: RuntimeScenarioType;
    domain: DomainId;
    status: "running" | "completed" | "failed";
    progress: number;
  }>;
  completedResults: ScenarioResult[];
  lastRunAt: string;
}
