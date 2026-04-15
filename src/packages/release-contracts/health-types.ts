// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Health Types
// Post-release health, hold/expand/rollback thresholds.
// ═══════════════════════════════════════════════════════════════

export type ReleaseHealthStatus = "healthy" | "degraded" | "critical" | "unknown";

export type ReleaseDecision = "expand" | "hold" | "rollback" | "abort";

export interface ReleaseHealthSnapshot {
  release_version: string;
  rollout_id: string;
  status: ReleaseHealthStatus;
  error_rate: number;
  latency_p50_ms: number;
  latency_p99_ms: number;
  crash_rate: number;
  user_satisfaction_score?: number;
  active_incidents: number;
  regressions_detected: number;
  sample_size: number;
  observed_at: string;
}

export interface ReleaseHealthThresholds {
  error_rate_warning: number;
  error_rate_critical: number;
  latency_p99_warning_ms: number;
  latency_p99_critical_ms: number;
  crash_rate_warning: number;
  crash_rate_critical: number;
  min_sample_size: number;
  observation_window_minutes: number;
}

export interface HoldExpandRollbackRule {
  rule_id: string;
  name: string;
  condition_metric: string;
  condition_operator: "gt" | "lt" | "eq" | "gte" | "lte";
  condition_value: number;
  action: ReleaseDecision;
  priority: number;
  auto_execute: boolean;
  cooldown_minutes: number;
}

export interface ReleaseHealthComparison {
  current_version: string;
  baseline_version: string;
  current_snapshot: ReleaseHealthSnapshot;
  baseline_snapshot: ReleaseHealthSnapshot;
  delta: Record<string, number>;
  recommendation: ReleaseDecision;
  confidence: number;
  rationale: string;
}

export interface ReleaseNarrative {
  release_version: string;
  narrative_id: string;
  summary: string;
  key_metrics: Record<string, number>;
  notable_events: string[];
  recommendation: ReleaseDecision;
  generated_at: string;
}
