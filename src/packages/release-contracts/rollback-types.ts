// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollback Types (Fully Advanced)
// Orchestration, eligibility, preconditions, receipts,
// staged rollback, rehearsal, impact analysis, verification.
// ═══════════════════════════════════════════════════════════════

export type RollbackPhase =
  | "evaluating"
  | "approval_pending"
  | "preparing"
  | "draining"
  | "executing"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

export type RollbackScope = "full" | "partial" | "component" | "config_only" | "data_only" | "feature_flag_only";

export type RollbackUrgency = "emergency" | "planned" | "preventive";

export const VALID_ROLLBACK_TRANSITIONS: Record<RollbackPhase, RollbackPhase[]> = {
  evaluating: ["approval_pending", "preparing", "cancelled"],
  approval_pending: ["preparing", "cancelled"],
  preparing: ["draining", "executing", "cancelled"],
  draining: ["executing", "cancelled"],
  executing: ["verifying", "failed"],
  verifying: ["completed", "failed"],
  completed: [],
  failed: ["evaluating"],
  cancelled: [],
};

export interface RollbackOrchestration {
  rollback_id: string;
  rollout_id: string;
  release_version: string;
  target_version: string;
  phase: RollbackPhase;
  scope: RollbackScope;
  urgency: RollbackUrgency;
  components: RollbackComponent[];
  preconditions: RollbackPrecondition[];
  verification_steps: RollbackVerificationStep[];
  phase_history: RollbackPhaseTransition[];
  initiated_by: string;
  approved_by?: string;
  reason: string;
  impact_analysis: RollbackImpactAnalysis;
  drain_config?: DrainConfig;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  correlation_id: string;
}

export interface RollbackPhaseTransition {
  from_phase: RollbackPhase;
  to_phase: RollbackPhase;
  reason: string;
  timestamp: string;
}

export interface RollbackComponent {
  component_id: string;
  name: string;
  from_version: string;
  to_version: string;
  rollback_strategy: "revert" | "compensate" | "rebuild" | "feature_flag_disable";
  status: "pending" | "draining" | "in_progress" | "completed" | "failed" | "skipped" | "verified";
  data_migration_required: boolean;
  estimated_duration_ms: number;
  actual_duration_ms?: number;
  dependencies: string[];
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export interface RollbackPrecondition {
  precondition_id: string;
  name: string;
  description: string;
  check_type: "health" | "data_integrity" | "dependency" | "capacity" | "manual_approval" | "feature_flag" | "traffic_drain";
  passed: boolean;
  required: boolean;
  blocking: boolean;
  detail?: string;
  checked_at: string;
  auto_retry: boolean;
  retry_count: number;
}

export interface RollbackVerificationStep {
  step_id: string;
  name: string;
  verification_type: "health_check" | "data_integrity" | "functional_test" | "performance_baseline" | "user_impact";
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  expected_result: string;
  actual_result?: string;
  critical: boolean;
  executed_at?: string;
  duration_ms?: number;
}

export interface DrainConfig {
  drain_duration_seconds: number;
  graceful_shutdown: boolean;
  connection_timeout_seconds: number;
  max_in_flight_requests: number;
  health_check_interval_seconds: number;
}

export interface RollbackImpactAnalysis {
  affected_users_estimate: number;
  affected_users_by_segment: Record<string, number>;
  data_loss_risk: "none" | "low" | "medium" | "high" | "critical";
  data_loss_details: string[];
  service_disruption_minutes: number;
  financial_impact_cents: number;
  sla_impact: string[];
  dependent_services: string[];
  rollback_complexity_score: number;
}

export interface RollbackEligibility {
  rollout_id: string;
  eligible: boolean;
  blockers: RollbackBlocker[];
  warnings: string[];
  data_loss_risk: "none" | "low" | "medium" | "high" | "critical";
  estimated_duration_minutes: number;
  affected_users_estimate: number;
  rollback_deadline?: string;
  recommended_scope: RollbackScope;
  recommended_urgency: RollbackUrgency;
  alternative_actions: AlternativeAction[];
  evaluated_at: string;
}

export interface RollbackBlocker {
  blocker_id: string;
  reason: string;
  severity: "hard" | "soft";
  resolution: string;
  auto_resolvable: boolean;
}

export interface AlternativeAction {
  action: string;
  description: string;
  risk_score: number;
  estimated_duration_minutes: number;
}

export interface RollbackRehearsal {
  rehearsal_id: string;
  rollout_id: string;
  simulated: boolean;
  environment: "production_shadow" | "staging" | "dry_run";
  steps_executed: number;
  steps_total: number;
  steps_detail: RehearsalStep[];
  issues_found: RehearsalIssue[];
  duration_ms: number;
  confidence_score: number;
  recommendation: "proceed" | "fix_issues" | "abort";
  rehearsed_at: string;
}

export interface RehearsalStep {
  step_id: string;
  name: string;
  status: "passed" | "failed" | "skipped" | "warning";
  duration_ms: number;
  detail?: string;
}

export interface RehearsalIssue {
  issue_id: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affected_component: string;
  remediation: string;
  blocking: boolean;
}

export interface RollbackReceipt {
  receipt_id: string;
  rollback_id: string;
  rollout_id: string;
  correlation_id: string;
  from_version: string;
  to_version: string;
  scope: RollbackScope;
  urgency: RollbackUrgency;
  success: boolean;
  duration_ms: number;
  components_rolled_back: number;
  components_failed: number;
  data_migrations_applied: number;
  data_migrations_failed: number;
  verification_passed: boolean;
  verification_failures: string[];
  users_affected: number;
  service_disruption_ms: number;
  lessons_learned: string[];
  initiated_by: string;
  approved_by?: string;
  started_at: string;
  completed_at: string;
  hash: string;
}
