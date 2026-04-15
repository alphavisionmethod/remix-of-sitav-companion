// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twin Types (Production-Grade)
// User/device/system/release/trust/sync/business twin models
// with drift detection, prediction, and calibration.
// ═══════════════════════════════════════════════════════════════

export type TwinType = "user" | "device" | "system" | "release" | "trust" | "sync" | "business" | "network" | "budget";

export type TwinFidelity = "realtime" | "high" | "medium" | "low" | "sketch" | "degraded";

export type TwinSyncStrategy = "push" | "pull" | "hybrid" | "event_driven" | "scheduled";

// ── Core Model ──

export interface DigitalTwinModel<TState = Record<string, unknown>> {
  twin_id: string;
  twin_type: TwinType;
  real_entity_id: string;
  entity_name: string;
  fidelity: TwinFidelity;
  state: TState;
  state_version: number;
  state_hash: string;
  sync_strategy: TwinSyncStrategy;
  sync_interval_ms: number;
  last_synced_at: string;
  last_state_change_at: string;
  drift_score: number;
  drift_fields: string[];
  prediction_accuracy: number;
  calibration_score: number;
  health_score: number;
  anomaly_detected: boolean;
  anomaly_details?: string;
  dependencies: string[];
  observers: string[];
  created_at: string;
  updated_at: string;
  ttl_hours?: number;
}

// ── Specialized States ──

export interface UserTwinState {
  behavior_patterns: BehaviorPattern[];
  engagement_score: number;
  engagement_trend: "rising" | "stable" | "declining";
  risk_profile: "low" | "medium" | "high" | "critical";
  predicted_actions: PredictedAction[];
  satisfaction_estimate: number;
  feature_usage: Record<string, number>;
  session_frequency_daily: number;
  avg_session_duration_ms: number;
  churn_probability: number;
  lifetime_value_estimate_cents: number;
  last_active_at: string;
}

export interface BehaviorPattern {
  pattern_id: string;
  name: string;
  frequency: number;
  confidence: number;
  first_observed_at: string;
  last_observed_at: string;
  predictive_value: number;
}

export interface DeviceTwinState {
  health_score: number;
  health_trend: "improving" | "stable" | "degrading";
  resource_utilization: ResourceUtilization;
  connectivity_status: "online" | "offline" | "intermittent" | "degraded";
  connectivity_quality: number;
  update_state: "current" | "pending" | "installing" | "failed" | "rollback";
  trust_level: "trusted" | "verified" | "unverified" | "revoked";
  battery_level?: number;
  storage_available_mb?: number;
  last_heartbeat_at: string;
  uptime_hours: number;
  crash_count_24h: number;
  performance_score: number;
}

export interface ResourceUtilization {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_bandwidth_percent: number;
  ai_inference_load: number;
}

export interface SystemTwinState {
  service_health: Record<string, ServiceHealthEntry>;
  load_metrics: LoadMetrics;
  error_rates: Record<string, number>;
  capacity_utilization: number;
  degradation_level: "none" | "minor" | "moderate" | "severe" | "critical";
  active_incidents: number;
  pending_deployments: number;
  circuit_breakers_open: number;
  avg_response_time_ms: number;
  p99_response_time_ms: number;
  throughput_rps: number;
}

export interface ServiceHealthEntry {
  status: "healthy" | "degraded" | "unhealthy" | "offline";
  latency_ms: number;
  error_rate: number;
  last_checked_at: string;
}

export interface LoadMetrics {
  requests_per_second: number;
  concurrent_connections: number;
  queue_depth: number;
  processing_backlog: number;
}

export interface ReleaseTwinState {
  version: string;
  rollout_phase: string;
  rollout_percent: number;
  health_score: number;
  health_trend: "improving" | "stable" | "degrading";
  affected_users: number;
  regression_count: number;
  rollback_probability: number;
  error_rate_delta: number;
  latency_delta_ms: number;
  crash_rate_delta: number;
  user_satisfaction_delta: number;
  canary_verdict?: "pass" | "fail" | "inconclusive";
}

export interface TrustTwinState {
  trust_grade: "A" | "B" | "C" | "D" | "F";
  trust_score: number;
  risk_factors: TrustRiskFactor[];
  anomaly_score: number;
  anomaly_trend: "rising" | "stable" | "declining";
  last_verification_at: string;
  verification_method: string;
  revocation_probability: number;
  escalation_pending: boolean;
  compliance_status: "compliant" | "warning" | "violation";
}

export interface TrustRiskFactor {
  factor_id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  score: number;
  trend: "worsening" | "stable" | "improving";
  mitigation_available: boolean;
}

export interface SyncTwinState {
  sync_lag_ms: number;
  sync_lag_trend: "increasing" | "stable" | "decreasing";
  conflict_rate: number;
  conflict_rate_trend: "increasing" | "stable" | "decreasing";
  pending_changes: number;
  device_count: number;
  devices_in_sync: number;
  reconciliation_needed: boolean;
  last_full_sync_at: string;
  next_scheduled_sync_at?: string;
  bandwidth_usage_mbps: number;
  data_integrity_score: number;
}

// ── Predictions ──

export interface PredictedAction {
  action: string;
  probability: number;
  confidence: number;
  timeframe_hours: number;
  impact: "positive" | "negative" | "neutral";
  impact_magnitude: number;
  basis: string;
  model_used: string;
}

// ── Sync & Drift ──

export interface TwinSyncReport {
  twin_id: string;
  twin_type: TwinType;
  sync_status: "synced" | "drifted" | "stale" | "disconnected" | "reconciling";
  drift_fields: DriftField[];
  drift_score: number;
  drift_trend: "increasing" | "stable" | "decreasing";
  last_synced_at: string;
  next_sync_at?: string;
  sync_latency_ms: number;
  data_freshness_ms: number;
  reconciliation_actions: string[];
  auto_reconcile_possible: boolean;
}

export interface DriftField {
  field: string;
  twin_value: unknown;
  real_value: unknown;
  drift_magnitude: number;
  significance: "critical" | "notable" | "minor";
  auto_correctable: boolean;
}

// ── Twin Orchestration ──

export interface TwinOrchestrationConfig {
  twin_type: TwinType;
  max_twins: number;
  default_fidelity: TwinFidelity;
  sync_strategy: TwinSyncStrategy;
  sync_interval_ms: number;
  drift_threshold: number;
  auto_reconcile: boolean;
  prediction_enabled: boolean;
  prediction_horizon_hours: number;
  anomaly_detection_enabled: boolean;
  anomaly_sensitivity: number;
  retention_hours: number;
  archival_enabled: boolean;
}

export interface TwinFleetReport {
  report_id: string;
  total_twins: number;
  by_type: Record<TwinType, number>;
  by_fidelity: Record<TwinFidelity, number>;
  avg_drift_score: number;
  twins_drifted: number;
  twins_stale: number;
  twins_disconnected: number;
  prediction_accuracy_avg: number;
  anomalies_detected: number;
  sync_failures_24h: number;
  generated_at: string;
}
