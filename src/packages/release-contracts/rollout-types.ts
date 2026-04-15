// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollout Types
// State machine, cohort targeting, canary promotion, blast-radius.
// ═══════════════════════════════════════════════════════════════

export type RolloutPhase =
  | "planning"
  | "canary"
  | "expanding"
  | "paused"
  | "full"
  | "completed"
  | "aborted"
  | "rolling_back";

export interface RolloutStateMachine {
  rollout_id: string;
  release_version: string;
  phase: RolloutPhase;
  started_at: string;
  updated_at: string;
  target_cohort: CohortTarget;
  canary_config: CanaryConfig;
  expansion_rules: ExpansionRule[];
  abort_conditions: AbortCondition[];
  current_reach_percent: number;
  health_score: number;
}

export interface CohortTarget {
  cohort_id: string;
  name: string;
  targeting_rules: TargetingRule[];
  estimated_size: number;
  actual_size?: number;
}

export interface TargetingRule {
  field: string;
  operator: "eq" | "neq" | "in" | "not_in" | "gt" | "lt" | "regex";
  value: unknown;
}

export interface CanaryConfig {
  initial_percent: number;
  observation_period_minutes: number;
  success_threshold: number;
  error_rate_threshold: number;
  latency_p99_threshold_ms: number;
  auto_promote: boolean;
}

export interface ExpansionRule {
  from_percent: number;
  to_percent: number;
  wait_minutes: number;
  health_gate: number;
  auto_expand: boolean;
}

export interface AbortCondition {
  metric: string;
  operator: "gt" | "lt" | "eq";
  threshold: number;
  window_minutes: number;
  auto_abort: boolean;
}

export interface BlastRadiusEstimate {
  rollout_id: string;
  affected_users_estimate: number;
  affected_services: string[];
  data_scope: string[];
  financial_exposure_cents: number;
  rollback_time_estimate_minutes: number;
  risk_score: number;
  confidence: number;
}

export interface CanaryPromotionDecision {
  rollout_id: string;
  decision: "promote" | "hold" | "abort";
  current_percent: number;
  target_percent: number;
  health_metrics: Record<string, number>;
  rationale: string;
  decided_at: string;
  decided_by: "auto" | string;
}
