// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twin Types
// User/device/system/release/trust/sync twin models.
// ═══════════════════════════════════════════════════════════════

export type TwinType = "user" | "device" | "system" | "release" | "trust" | "sync" | "business";

export type TwinFidelity = "high" | "medium" | "low" | "sketch";

export interface DigitalTwinModel<TState = Record<string, unknown>> {
  twin_id: string;
  twin_type: TwinType;
  real_entity_id: string;
  fidelity: TwinFidelity;
  state: TState;
  state_version: number;
  last_synced_at: string;
  drift_score: number;
  created_at: string;
  updated_at: string;
}

export interface UserTwinState {
  behavior_patterns: string[];
  engagement_score: number;
  risk_profile: string;
  predicted_actions: PredictedAction[];
  satisfaction_estimate: number;
}

export interface DeviceTwinState {
  health_score: number;
  resource_utilization: Record<string, number>;
  connectivity_status: string;
  update_state: string;
  trust_level: string;
}

export interface SystemTwinState {
  service_health: Record<string, string>;
  load_metrics: Record<string, number>;
  error_rates: Record<string, number>;
  capacity_utilization: number;
  degradation_level: string;
}

export interface ReleaseTwinState {
  version: string;
  rollout_phase: string;
  health_score: number;
  affected_users: number;
  regression_count: number;
  rollback_probability: number;
}

export interface TrustTwinState {
  trust_grade: string;
  risk_factors: string[];
  anomaly_score: number;
  last_verification_at: string;
  revocation_probability: number;
}

export interface SyncTwinState {
  sync_lag_ms: number;
  conflict_rate: number;
  pending_changes: number;
  device_count: number;
  reconciliation_needed: boolean;
}

export interface PredictedAction {
  action: string;
  probability: number;
  timeframe_hours: number;
  impact: "positive" | "negative" | "neutral";
}

export interface TwinSyncReport {
  twin_id: string;
  sync_status: "synced" | "drifted" | "stale" | "disconnected";
  drift_fields: string[];
  drift_score: number;
  last_synced_at: string;
  next_sync_at?: string;
}
