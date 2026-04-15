// ═══════════════════════════════════════════════════════════════
// SITA OS — Scenario Types
// Scenario pack definitions for rollout, sync, trust, budget, network.
// ═══════════════════════════════════════════════════════════════

export type ScenarioCategory =
  | "rollout"
  | "sync_failure"
  | "trust_attack"
  | "budget_reduction"
  | "network_degradation"
  | "capacity_surge"
  | "data_corruption"
  | "service_outage";

export type ScenarioSeverity = "catastrophic" | "severe" | "moderate" | "minor";

export interface ScenarioPack {
  pack_id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  scenarios: ScenarioDefinition[];
  created_at: string;
  version: number;
}

export interface ScenarioDefinition {
  scenario_id: string;
  name: string;
  description: string;
  severity: ScenarioSeverity;
  preconditions: ScenarioPrecondition[];
  events: ScenarioEvent[];
  expected_outcomes: ExpectedOutcome[];
  duration_minutes: number;
  tags: string[];
}

export interface ScenarioPrecondition {
  condition: string;
  required: boolean;
  setup_action?: string;
}

export interface ScenarioEvent {
  event_id: string;
  timestamp_offset_ms: number;
  event_type: string;
  target: string;
  parameters: Record<string, unknown>;
  description: string;
}

export interface ExpectedOutcome {
  outcome_id: string;
  description: string;
  metric?: string;
  expected_value?: unknown;
  tolerance?: number;
  critical: boolean;
}

export interface ScenarioRunResult {
  run_id: string;
  scenario_id: string;
  pack_id: string;
  outcomes: OutcomeResult[];
  overall_passed: boolean;
  duration_ms: number;
  started_at: string;
  completed_at: string;
}

export interface OutcomeResult {
  outcome_id: string;
  passed: boolean;
  actual_value?: unknown;
  expected_value?: unknown;
  deviation?: number;
  detail?: string;
}
