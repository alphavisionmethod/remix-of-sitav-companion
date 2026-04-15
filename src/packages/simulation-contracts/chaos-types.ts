// ═══════════════════════════════════════════════════════════════
// SITA OS — Chaos Types (Production-Grade)
// Chaos scripts, outage scenarios, resilience drills,
// game days, blast radius control, safety interlocks.
// ═══════════════════════════════════════════════════════════════

export type ChaosTargetType = "service" | "network" | "database" | "cache" | "queue" | "storage" | "dns" | "load_balancer" | "ai_model" | "auth_service";

export type ChaosAction =
  | "kill" | "slow" | "corrupt" | "partition" | "overload" | "delay"
  | "drop" | "throttle" | "inject_error" | "exhaust_resources"
  | "clock_skew" | "certificate_expire" | "rate_limit_exhaust"
  | "dependency_timeout" | "data_inconsistency";

export type ChaosScope = "single_instance" | "availability_zone" | "region" | "service_mesh" | "global";

// ── Chaos Script ──

export interface ChaosScript {
  script_id: string;
  name: string;
  description: string;
  hypothesis: string;
  category: string;
  scope: ChaosScope;
  steps: ChaosStep[];
  safety_checks: ChaosSafetyCheck[];
  blast_radius_limits: BlastRadiusLimits;
  rollback_procedure: ChaosRollback;
  monitoring_config: ChaosMonitoringConfig;
  max_duration_minutes: number;
  auto_terminate: boolean;
  require_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  last_run_at?: string;
  last_run_result?: "passed" | "failed" | "aborted";
  scheduling: ChaosScheduling;
  tags: string[];
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface ChaosStep {
  step_id: string;
  order: number;
  name: string;
  target_type: ChaosTargetType;
  target_id: string;
  target_selector?: Record<string, string>;
  action: ChaosAction;
  parameters: Record<string, unknown>;
  duration_seconds: number;
  ramp_up_seconds: number;
  description: string;
  precondition?: string;
  concurrent_with?: string[];
  depends_on?: string[];
  skip_on_previous_failure: boolean;
}

export interface ChaosSafetyCheck {
  check_id: string;
  check_name: string;
  metric: string;
  threshold: number;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  check_interval_seconds: number;
  action_on_breach: "abort" | "pause" | "alert" | "rollback";
  grace_period_seconds: number;
  consecutive_failures_before_action: number;
  description: string;
}

export interface BlastRadiusLimits {
  max_affected_users_percent: number;
  max_affected_services: number;
  max_error_rate_increase_percent: number;
  max_latency_increase_percent: number;
  max_data_affected_rows: number;
  max_financial_impact_cents: number;
  excluded_services: string[];
  excluded_environments: string[];
}

export interface ChaosRollback {
  strategy: "automatic" | "manual" | "compensating";
  max_rollback_time_seconds: number;
  verification_checks: string[];
  fallback_if_rollback_fails: string;
  notification_on_rollback: boolean;
}

export interface ChaosMonitoringConfig {
  metrics_to_watch: ChaosMetricWatch[];
  log_queries: string[];
  dashboard_id?: string;
  alert_channels: string[];
  recording_enabled: boolean;
  screenshot_on_impact: boolean;
}

export interface ChaosMetricWatch {
  metric: string;
  baseline_value: number;
  warning_threshold: number;
  critical_threshold: number;
  aggregation: "avg" | "max" | "min" | "p95" | "p99" | "sum";
  window_seconds: number;
}

export interface ChaosScheduling {
  type: "manual" | "recurring" | "triggered";
  cron?: string;
  trigger_conditions?: string[];
  blackout_windows?: { start: string; end: string }[];
  timezone: string;
}

// ── Execution Results ──

export interface ChaosRunResult {
  run_id: string;
  script_id: string;
  status: "running" | "completed" | "aborted" | "failed" | "rolled_back";
  hypothesis_validated: boolean;
  steps_executed: number;
  steps_total: number;
  safety_breaches: SafetyBreach[];
  observations: ChaosObservation[];
  resilience_score: number;
  resilience_breakdown: ResilienceBreakdown;
  blast_radius_actual: ActualBlastRadius;
  recovery_metrics: RecoveryMetrics;
  started_at: string;
  completed_at?: string;
  duration_ms: number;
  triggered_rollback: boolean;
  rollback_successful?: boolean;
  environment: string;
  run_by: string;
}

export interface SafetyBreach {
  check_id: string;
  check_name: string;
  metric: string;
  threshold: number;
  actual_value: number;
  action_taken: string;
  timestamp: string;
}

export interface ChaosObservation {
  observation_id: string;
  step_id: string;
  timestamp: string;
  metric: string;
  baseline_value: number;
  observed_value: number;
  impact: "none" | "minor" | "moderate" | "severe" | "catastrophic";
  recovery_time_ms?: number;
  recovery_complete: boolean;
  notes?: string;
}

export interface ResilienceBreakdown {
  detection_time_ms: number;
  response_time_ms: number;
  recovery_time_ms: number;
  data_integrity_maintained: boolean;
  service_degradation_graceful: boolean;
  user_impact_minimized: boolean;
  alerting_worked: boolean;
  auto_healing_triggered: boolean;
  failover_successful?: boolean;
}

export interface ActualBlastRadius {
  affected_users: number;
  affected_services: string[];
  error_rate_increase_percent: number;
  latency_increase_percent: number;
  within_limits: boolean;
}

export interface RecoveryMetrics {
  time_to_detect_ms: number;
  time_to_respond_ms: number;
  time_to_recover_ms: number;
  time_to_normal_ms: number;
  recovery_method: "automatic" | "manual" | "partial";
  data_loss: boolean;
  sla_violated: boolean;
}

// ── Resilience Drills ──

export interface ResilienceDrill {
  drill_id: string;
  name: string;
  description: string;
  objective: string;
  chaos_scripts: string[];
  participants: string[];
  communication_plan: string;
  success_criteria: DrillSuccessCriterion[];
  schedule: "weekly" | "monthly" | "quarterly" | "manual";
  last_run_at?: string;
  last_score?: number;
  target_score: number;
  trend: "improving" | "stable" | "degrading";
  findings: DrillFinding[];
  action_items: DrillActionItem[];
}

export interface DrillSuccessCriterion {
  criterion: string;
  metric: string;
  threshold: number;
  weight: number;
}

export interface DrillFinding {
  finding_id: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affected_area: string;
  remediation: string;
  assigned_to?: string;
  status: "open" | "in_progress" | "resolved";
}

export interface DrillActionItem {
  item_id: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low";
  assigned_to: string;
  due_date: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
}

// ── Game Day ──

export interface GameDay {
  game_day_id: string;
  name: string;
  theme: string;
  drills: string[];
  date: string;
  duration_hours: number;
  participants: string[];
  observers: string[];
  facilitator: string;
  overall_score?: number;
  report_id?: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
}
