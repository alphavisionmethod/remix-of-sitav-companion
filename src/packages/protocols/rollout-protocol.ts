// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollout Protocol
// plan → gate → canary → promote → verify → rollback
// ═══════════════════════════════════════════════════════════════

export type RolloutPhase =
  | "planning"
  | "gating"
  | "canary"
  | "staged"
  | "promoting"
  | "full"
  | "verifying"
  | "complete"
  | "rolling_back"
  | "rolled_back"
  | "failed";

export interface RolloutPlan {
  rollout_id: string;
  artifact_type: "edge_function" | "frontend_spa" | "os_update" | "mobile_app" | "config_change";
  artifact_version: string;
  target_environment: "staging" | "canary" | "production";
  strategy: "immediate" | "canary_percent" | "blue_green" | "rolling";
  canary_percent?: number;
  gates: RolloutGate[];
  phase: RolloutPhase;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RolloutGate {
  gate_id: string;
  gate_type: "test_suite" | "compatibility" | "performance" | "security" | "manual_approval";
  name: string;
  status: "pending" | "passed" | "failed" | "skipped";
  required: boolean;
  result?: { passed: boolean; details: string; checked_at: string };
}

export interface RolloutCanaryMetrics {
  rollout_id: string;
  error_rate_percent: number;
  latency_p50_ms: number;
  latency_p99_ms: number;
  success_rate_percent: number;
  sample_size: number;
  threshold_breached: boolean;
  collected_at: string;
}

export interface RolloutDecision {
  rollout_id: string;
  decision: "promote" | "hold" | "rollback";
  reason: string;
  decided_by: "automated" | string;
  decided_at: string;
}

export interface RollbackRecord {
  rollout_id: string;
  rollback_to_version: string;
  reason: string;
  initiated_by: string;
  status: "initiated" | "in_progress" | "complete" | "failed";
  started_at: string;
  completed_at?: string;
}
