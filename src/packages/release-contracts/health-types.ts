// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Health Types (Fully Advanced)
// Post-release health, hold/expand/rollback thresholds,
// intelligent decision engine, SLO tracking, incident correlation.
// ═══════════════════════════════════════════════════════════════

export type ReleaseHealthStatus = "healthy" | "degraded" | "critical" | "unknown" | "recovering";

export type ReleaseDecision = "expand" | "hold" | "rollback" | "abort" | "extend_monitoring" | "accelerate";

export interface ReleaseHealthSnapshot {
  snapshot_id: string;
  release_version: string;
  rollout_id: string;
  status: ReleaseHealthStatus;
  overall_score: number;
  error_rate: number;
  error_rate_delta: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  latency_delta_percent: number;
  crash_rate: number;
  crash_rate_delta: number;
  throughput_rps: number;
  throughput_delta_percent: number;
  user_satisfaction_score?: number;
  apdex_score?: number;
  active_incidents: number;
  regressions_detected: number;
  regressions_confirmed: number;
  sample_size: number;
  sample_adequate: boolean;
  slo_compliance: SLOCompliance[];
  service_health: ServiceHealthDetail[];
  observed_at: string;
  observation_window_minutes: number;
}

export interface SLOCompliance {
  slo_name: string;
  target: number;
  current: number;
  budget_remaining_percent: number;
  breached: boolean;
  burn_rate: number;
}

export interface ServiceHealthDetail {
  service_name: string;
  status: ReleaseHealthStatus;
  error_rate: number;
  latency_p99_ms: number;
  affected_endpoints: string[];
  issues: string[];
}

export interface ReleaseHealthThresholds {
  error_rate_healthy: number;
  error_rate_warning: number;
  error_rate_critical: number;
  latency_p95_healthy_ms: number;
  latency_p95_warning_ms: number;
  latency_p95_critical_ms: number;
  latency_p99_warning_ms: number;
  latency_p99_critical_ms: number;
  crash_rate_healthy: number;
  crash_rate_warning: number;
  crash_rate_critical: number;
  throughput_drop_warning_percent: number;
  throughput_drop_critical_percent: number;
  apdex_warning: number;
  apdex_critical: number;
  min_sample_size: number;
  observation_window_minutes: number;
  slo_burn_rate_warning: number;
  slo_burn_rate_critical: number;
}

export interface HoldExpandRollbackRule {
  rule_id: string;
  name: string;
  description: string;
  condition_metric: string;
  condition_operator: "gt" | "lt" | "eq" | "gte" | "lte";
  condition_value: number;
  condition_window_minutes: number;
  consecutive_violations: number;
  action: ReleaseDecision;
  priority: number;
  auto_execute: boolean;
  requires_confirmation: boolean;
  cooldown_minutes: number;
  notification_channels: string[];
  enabled: boolean;
}

export interface ReleaseHealthComparison {
  comparison_id: string;
  current_version: string;
  baseline_version: string;
  current_snapshot: ReleaseHealthSnapshot;
  baseline_snapshot: ReleaseHealthSnapshot;
  delta: Record<string, number>;
  significant_changes: SignificantChange[];
  recommendation: ReleaseDecision;
  confidence: number;
  risk_score: number;
  rationale: string;
  alternative_recommendations: AlternativeRecommendation[];
  compared_at: string;
}

export interface SignificantChange {
  metric: string;
  baseline_value: number;
  current_value: number;
  delta_percent: number;
  direction: "improved" | "regressed" | "stable";
  significance: number;
  impact: "critical" | "high" | "medium" | "low";
}

export interface AlternativeRecommendation {
  decision: ReleaseDecision;
  rationale: string;
  confidence: number;
  risk_if_chosen: string;
}

export interface ReleaseNarrative {
  release_version: string;
  narrative_id: string;
  summary: string;
  executive_summary: string;
  key_metrics: Record<string, number>;
  key_metrics_context: Record<string, string>;
  notable_events: NarrativeEvent[];
  risk_assessment: string;
  recommendation: ReleaseDecision;
  recommendation_confidence: number;
  action_items: string[];
  generated_at: string;
  audience: "engineering" | "executive" | "operations";
}

export interface NarrativeEvent {
  event_type: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
  related_metrics: string[];
}

// ── Incident Correlation ──

export interface ReleaseIncidentCorrelation {
  correlation_id: string;
  release_version: string;
  incident_id: string;
  correlation_type: "temporal" | "causal" | "coincidental";
  confidence: number;
  evidence: string[];
  auto_detected: boolean;
  verified: boolean;
}

// ── Health Intelligence ──

export interface HealthIntelligenceReport {
  report_id: string;
  release_version: string;
  period_hours: number;
  snapshots_analyzed: number;
  trend: "improving" | "stable" | "degrading" | "volatile";
  trend_confidence: number;
  predicted_status_24h: ReleaseHealthStatus;
  predicted_decision: ReleaseDecision;
  anomalies: HealthAnomaly[];
  generated_at: string;
}

export interface HealthAnomaly {
  anomaly_id: string;
  metric: string;
  anomaly_type: "spike" | "drop" | "trend_break" | "oscillation";
  severity: "critical" | "warning" | "info";
  value: number;
  expected_range: [number, number];
  detected_at: string;
  resolved_at?: string;
}
