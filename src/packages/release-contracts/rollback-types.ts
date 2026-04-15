// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollback Types
// Orchestration, eligibility, preconditions, receipts.
// ═══════════════════════════════════════════════════════════════

export type RollbackPhase = "evaluating" | "preparing" | "executing" | "verifying" | "completed" | "failed";

export type RollbackScope = "full" | "partial" | "component" | "config_only";

export interface RollbackOrchestration {
  rollback_id: string;
  rollout_id: string;
  release_version: string;
  target_version: string;
  phase: RollbackPhase;
  scope: RollbackScope;
  components: RollbackComponent[];
  preconditions: RollbackPrecondition[];
  initiated_by: string;
  reason: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface RollbackComponent {
  component_id: string;
  name: string;
  from_version: string;
  to_version: string;
  rollback_strategy: "revert" | "compensate" | "rebuild";
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  data_migration_required: boolean;
}

export interface RollbackPrecondition {
  precondition_id: string;
  name: string;
  check_type: "health" | "data_integrity" | "dependency" | "capacity" | "manual_approval";
  passed: boolean;
  required: boolean;
  detail?: string;
  checked_at: string;
}

export interface RollbackEligibility {
  rollout_id: string;
  eligible: boolean;
  blockers: string[];
  warnings: string[];
  data_loss_risk: "none" | "low" | "medium" | "high";
  estimated_duration_minutes: number;
  affected_users_estimate: number;
  rollback_deadline?: string;
}

export interface RollbackRehearsal {
  rehearsal_id: string;
  rollout_id: string;
  simulated: boolean;
  steps_executed: number;
  steps_total: number;
  issues_found: string[];
  duration_ms: number;
  confidence_score: number;
  rehearsed_at: string;
}

export interface RollbackReceipt {
  receipt_id: string;
  rollback_id: string;
  rollout_id: string;
  from_version: string;
  to_version: string;
  scope: RollbackScope;
  success: boolean;
  duration_ms: number;
  components_rolled_back: number;
  data_migrations_applied: number;
  verification_passed: boolean;
  completed_at: string;
}
