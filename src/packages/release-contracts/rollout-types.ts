// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollout Types (Fully Advanced)
// State machine, cohort targeting, canary promotion, blast-radius,
// multi-metric evaluation, staged expansion, feature flags, audit.
// ═══════════════════════════════════════════════════════════════

export type RolloutPhase =
  | "planning"
  | "approval_pending"
  | "canary"
  | "expanding"
  | "paused"
  | "full"
  | "completed"
  | "aborted"
  | "rolling_back"
  | "post_release_monitoring";

export type RolloutTrigger = "manual" | "scheduled" | "ci_pipeline" | "auto_promote" | "emergency";

export type RolloutStrategy = "canary" | "blue_green" | "rolling" | "feature_flag" | "shadow";

// ── Valid Phase Transitions ──

export const VALID_ROLLOUT_TRANSITIONS: Record<RolloutPhase, RolloutPhase[]> = {
  planning: ["approval_pending", "canary", "aborted"],
  approval_pending: ["canary", "aborted"],
  canary: ["expanding", "paused", "aborted", "rolling_back"],
  expanding: ["paused", "full", "aborted", "rolling_back"],
  paused: ["expanding", "canary", "aborted", "rolling_back"],
  full: ["completed", "rolling_back", "post_release_monitoring"],
  completed: ["post_release_monitoring"],
  aborted: [],
  rolling_back: ["aborted", "completed"],
  post_release_monitoring: ["completed", "rolling_back"],
};

export interface RolloutStateMachine {
  rollout_id: string;
  release_version: string;
  previous_version: string;
  phase: RolloutPhase;
  strategy: RolloutStrategy;
  trigger: RolloutTrigger;
  started_at: string;
  updated_at: string;
  completed_at?: string;
  target_cohort: CohortTarget;
  canary_config: CanaryConfig;
  expansion_rules: ExpansionRule[];
  abort_conditions: AbortCondition[];
  feature_flags: RolloutFeatureFlag[];
  current_reach_percent: number;
  health_score: number;
  phase_history: PhaseTransition[];
  owner_id: string;
  approval_id?: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface PhaseTransition {
  from_phase: RolloutPhase;
  to_phase: RolloutPhase;
  reason: string;
  triggered_by: string;
  timestamp: string;
  metrics_snapshot?: Record<string, number>;
}

export interface CohortTarget {
  cohort_id: string;
  name: string;
  description?: string;
  targeting_rules: TargetingRule[];
  exclusion_rules: TargetingRule[];
  estimated_size: number;
  actual_size?: number;
  priority: number;
  sticky_assignment: boolean;
}

export interface TargetingRule {
  field: string;
  operator: "eq" | "neq" | "in" | "not_in" | "gt" | "lt" | "gte" | "lte" | "regex" | "contains" | "starts_with";
  value: unknown;
  weight?: number;
}

export interface CanaryConfig {
  initial_percent: number;
  observation_period_minutes: number;
  success_threshold: number;
  error_rate_threshold: number;
  latency_p50_threshold_ms: number;
  latency_p95_threshold_ms: number;
  latency_p99_threshold_ms: number;
  crash_rate_threshold: number;
  auto_promote: boolean;
  min_sample_size: number;
  require_manual_approval_after_canary: boolean;
  multi_metric_evaluation: MultiMetricEvaluation;
}

export interface MultiMetricEvaluation {
  metrics: MetricEvaluationRule[];
  evaluation_strategy: "all_must_pass" | "weighted_score" | "majority";
  minimum_score?: number;
}

export interface MetricEvaluationRule {
  metric_name: string;
  weight: number;
  threshold: number;
  direction: "lower_is_better" | "higher_is_better";
  comparison: "absolute" | "relative_to_baseline";
  required: boolean;
}

export interface ExpansionRule {
  step_id: string;
  from_percent: number;
  to_percent: number;
  wait_minutes: number;
  health_gate: number;
  auto_expand: boolean;
  require_approval: boolean;
  max_error_rate_during_expansion: number;
  rollback_on_breach: boolean;
}

export interface AbortCondition {
  condition_id: string;
  metric: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  threshold: number;
  window_minutes: number;
  consecutive_breaches: number;
  auto_abort: boolean;
  severity: "critical" | "high" | "medium";
  notification_channels: string[];
}

export interface RolloutFeatureFlag {
  flag_key: string;
  enabled_for_canary: boolean;
  enabled_for_expansion: boolean;
  kill_switch: boolean;
  override_value?: unknown;
}

export interface BlastRadiusEstimate {
  rollout_id: string;
  affected_users_estimate: number;
  affected_users_by_tier: Record<string, number>;
  affected_services: string[];
  affected_endpoints: string[];
  data_scope: string[];
  financial_exposure_cents: number;
  revenue_at_risk_cents: number;
  rollback_time_estimate_minutes: number;
  risk_score: number;
  risk_factors: RiskFactor[];
  confidence: number;
  estimated_at: string;
}

export interface RiskFactor {
  factor: string;
  severity: "critical" | "high" | "medium" | "low";
  impact_description: string;
  mitigation?: string;
}

export interface CanaryPromotionDecision {
  rollout_id: string;
  decision: "promote" | "hold" | "abort" | "extend_observation";
  current_percent: number;
  target_percent: number;
  health_metrics: Record<string, number>;
  baseline_metrics: Record<string, number>;
  metric_evaluations: MetricEvaluationResult[];
  rationale: string;
  confidence: number;
  decided_at: string;
  decided_by: "auto" | string;
  next_evaluation_at?: string;
}

export interface MetricEvaluationResult {
  metric_name: string;
  passed: boolean;
  current_value: number;
  threshold: number;
  baseline_value?: number;
  delta_percent?: number;
  weight: number;
  contribution_to_score: number;
}

// ── Rollout Event Log ──

export type RolloutEventType =
  | "created"
  | "phase_changed"
  | "cohort_updated"
  | "metrics_collected"
  | "promotion_evaluated"
  | "abort_condition_breached"
  | "manual_override"
  | "feature_flag_toggled"
  | "rollback_initiated"
  | "completed";

export interface RolloutEvent {
  event_id: string;
  rollout_id: string;
  event_type: RolloutEventType;
  phase: RolloutPhase;
  reach_percent: number;
  health_score: number;
  detail: string;
  actor_id?: string;
  metrics_snapshot?: Record<string, number>;
  timestamp: string;
}

// ── Rollout Summary ──

export interface RolloutSummary {
  rollout_id: string;
  release_version: string;
  strategy: RolloutStrategy;
  phase: RolloutPhase;
  duration_minutes: number;
  peak_reach_percent: number;
  total_phase_transitions: number;
  total_abort_condition_breaches: number;
  final_health_score: number;
  rollback_occurred: boolean;
  started_at: string;
  completed_at?: string;
}
