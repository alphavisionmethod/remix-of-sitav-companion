// ═══════════════════════════════════════════════════════════════
// SITA OS — Scenario Types (Production-Grade)
// Scenario packs, execution, assertions, templating, replay.
// ═══════════════════════════════════════════════════════════════

export type ScenarioCategory =
  | "rollout" | "sync_failure" | "trust_attack" | "budget_reduction"
  | "network_degradation" | "capacity_surge" | "data_corruption"
  | "service_outage" | "security_breach" | "compliance_violation"
  | "cascading_failure" | "ai_misbehavior" | "user_surge"
  | "infrastructure_failure" | "third_party_outage";

export type ScenarioSeverity = "catastrophic" | "severe" | "moderate" | "minor" | "informational";

export type ScenarioExecutionMode = "synchronous" | "asynchronous" | "streamed" | "distributed";

// ── Scenario Pack ──

export interface ScenarioPack {
  pack_id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  scenarios: ScenarioDefinition[];
  dependencies: string[];
  prerequisites: PackPrerequisite[];
  estimated_duration_minutes: number;
  resource_requirements: ResourceRequirement[];
  tags: string[];
  owner: string;
  created_at: string;
  updated_at: string;
  version: number;
  last_run_at?: string;
  last_run_passed?: boolean;
}

export interface PackPrerequisite {
  type: "scenario_pack" | "service_available" | "data_seeded" | "feature_flag" | "environment";
  id: string;
  condition: string;
  required: boolean;
}

export interface ResourceRequirement {
  resource_type: "cpu" | "memory" | "network" | "storage" | "ai_budget";
  amount: number;
  unit: string;
}

// ── Scenario Definition ──

export interface ScenarioDefinition {
  scenario_id: string;
  name: string;
  description: string;
  severity: ScenarioSeverity;
  category: ScenarioCategory;
  execution_mode: ScenarioExecutionMode;
  preconditions: ScenarioPrecondition[];
  setup_actions: SetupAction[];
  events: ScenarioEvent[];
  assertions: ScenarioAssertion[];
  expected_outcomes: ExpectedOutcome[];
  teardown_actions: TeardownAction[];
  duration_minutes: number;
  timeout_minutes: number;
  retry_on_failure: boolean;
  max_retries: number;
  tags: string[];
  parameterized: boolean;
  parameter_sets?: Record<string, unknown>[];
}

export interface ScenarioPrecondition {
  condition_id: string;
  condition: string;
  check_type: "service_health" | "data_state" | "feature_flag" | "time_window" | "resource_available" | "custom";
  required: boolean;
  setup_action?: string;
  timeout_ms: number;
}

export interface SetupAction {
  action_id: string;
  type: "seed_data" | "configure_service" | "set_feature_flag" | "inject_state" | "start_recording" | "custom";
  parameters: Record<string, unknown>;
  timeout_ms: number;
  rollback_action?: string;
}

export interface TeardownAction {
  action_id: string;
  type: "cleanup_data" | "restore_config" | "reset_feature_flag" | "stop_recording" | "custom";
  parameters: Record<string, unknown>;
  always_run: boolean;
}

export interface ScenarioEvent {
  event_id: string;
  timestamp_offset_ms: number;
  event_type: string;
  target: string;
  target_type: "service" | "endpoint" | "database" | "queue" | "cache" | "network" | "user_session";
  parameters: Record<string, unknown>;
  description: string;
  concurrent_with?: string[];
  depends_on?: string[];
  idempotent: boolean;
}

export interface ScenarioAssertion {
  assertion_id: string;
  name: string;
  type: "metric_threshold" | "state_check" | "event_received" | "latency_bound" | "error_absent" | "data_integrity" | "custom";
  target: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "contains" | "matches";
  expected_value: unknown;
  tolerance?: number;
  timeout_ms: number;
  critical: boolean;
  description: string;
}

export interface ExpectedOutcome {
  outcome_id: string;
  description: string;
  metric?: string;
  expected_value?: unknown;
  tolerance?: number;
  critical: boolean;
  verification_method: "automated" | "manual" | "statistical";
}

// ── Execution Results ──

export interface ScenarioRunResult {
  run_id: string;
  scenario_id: string;
  pack_id: string;
  execution_mode: ScenarioExecutionMode;
  parameter_set?: Record<string, unknown>;
  outcomes: OutcomeResult[];
  assertion_results: AssertionResult[];
  events_executed: number;
  events_total: number;
  overall_passed: boolean;
  failure_category?: string;
  failure_root_cause?: string;
  duration_ms: number;
  resource_usage: Record<string, number>;
  started_at: string;
  completed_at: string;
  environment: string;
  triggered_by: string;
}

export interface OutcomeResult {
  outcome_id: string;
  passed: boolean;
  actual_value?: unknown;
  expected_value?: unknown;
  deviation?: number;
  detail?: string;
  evidence?: Record<string, unknown>;
}

export interface AssertionResult {
  assertion_id: string;
  name: string;
  passed: boolean;
  actual_value: unknown;
  expected_value: unknown;
  deviation?: number;
  checked_at: string;
  duration_ms: number;
  error?: string;
}

// ── Scenario Templates ──

export interface ScenarioTemplate {
  template_id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  parameters: ScenarioTemplateParam[];
  base_scenario: Partial<ScenarioDefinition>;
  usage_count: number;
  avg_pass_rate: number;
  created_at: string;
}

export interface ScenarioTemplateParam {
  name: string;
  type: "string" | "number" | "boolean" | "enum";
  required: boolean;
  default_value?: unknown;
  description: string;
  enum_values?: string[];
}

// ── Scenario Registry ──

export interface ScenarioRegistry {
  total_packs: number;
  total_scenarios: number;
  by_category: Record<ScenarioCategory, number>;
  by_severity: Record<ScenarioSeverity, number>;
  last_full_run_at?: string;
  overall_pass_rate: number;
  coverage_score: number;
  gaps: string[];
}
