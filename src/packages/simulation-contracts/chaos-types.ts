// ═══════════════════════════════════════════════════════════════
// SITA OS — Chaos Types
// Chaos scripts, outage scenarios, resilience drills.
// ═══════════════════════════════════════════════════════════════

export type ChaosTargetType = "service" | "network" | "database" | "cache" | "queue" | "storage";

export type ChaosAction = "kill" | "slow" | "corrupt" | "partition" | "overload" | "delay" | "drop";

export interface ChaosScript {
  script_id: string;
  name: string;
  description: string;
  steps: ChaosStep[];
  safety_checks: ChaosSafetyCheck[];
  rollback_procedure: string;
  max_duration_minutes: number;
  auto_terminate: boolean;
  approved_by?: string;
}

export interface ChaosStep {
  step_id: string;
  order: number;
  target_type: ChaosTargetType;
  target_id: string;
  action: ChaosAction;
  parameters: Record<string, unknown>;
  duration_seconds: number;
  description: string;
}

export interface ChaosSafetyCheck {
  check_name: string;
  metric: string;
  threshold: number;
  operator: "gt" | "lt" | "eq";
  action_on_breach: "abort" | "pause" | "alert";
}

export interface ChaosRunResult {
  run_id: string;
  script_id: string;
  status: "running" | "completed" | "aborted" | "failed";
  steps_executed: number;
  steps_total: number;
  safety_breaches: string[];
  observations: ChaosObservation[];
  resilience_score: number;
  started_at: string;
  completed_at?: string;
}

export interface ChaosObservation {
  observation_id: string;
  step_id: string;
  metric: string;
  baseline_value: number;
  observed_value: number;
  impact: "none" | "minor" | "moderate" | "severe";
  recovery_time_ms?: number;
}

export interface ResilienceDrill {
  drill_id: string;
  name: string;
  chaos_scripts: string[];
  schedule: "weekly" | "monthly" | "quarterly" | "manual";
  last_run_at?: string;
  last_score?: number;
  target_score: number;
}
