// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt Protocol
// Canonical receipt schemas for execution, approval, verification,
// rollback, and trust across all planes.
// ═══════════════════════════════════════════════════════════════

export type ReceiptCategory =
  | "execution"
  | "approval"
  | "verification"
  | "rollback"
  | "trust"
  | "release"
  | "sync"
  | "ai_inference";

export type ReceiptIntegrity = "full" | "partial" | "degraded" | "unverified";

export interface ReceiptEnvelope<TData = unknown> {
  receipt_id: string;
  correlation_id: string;
  parent_receipt_id?: string;
  category: ReceiptCategory;
  source_service: string;
  source_plane: string;
  actor_id: string;
  tenant_id?: string;
  data: TData;
  integrity: ReceiptIntegrity;
  hash: string;
  previous_hash?: string;
  chain_position?: number;
  created_at: string;
  expires_at?: string;
}

export interface ExecutionReceiptData {
  command_id: string;
  command_type: string;
  outcome: "success" | "failure" | "partial" | "timeout";
  duration_ms: number;
  side_effects: SideEffectRecord[];
  rollback_available: boolean;
  rollback_deadline?: string;
  output_summary?: string;
  error_code?: string;
  error_message?: string;
}

export interface SideEffectRecord {
  effect_id: string;
  effect_type: "data_mutation" | "notification" | "external_call" | "state_change" | "financial";
  target: string;
  reversible: boolean;
  description: string;
}

export interface ApprovalReceiptData {
  approval_id: string;
  decision: "approved" | "rejected" | "expired" | "escalated";
  decided_by: string;
  risk_level: string;
  justification: string;
  conditions?: string[];
  escalation_target?: string;
  decision_time_ms: number;
}

export interface VerificationReceiptData {
  verification_id: string;
  subject_receipt_id: string;
  verification_type: "automated" | "manual" | "peer" | "ai_assisted";
  passed: boolean;
  checks: VerificationCheck[];
  confidence: number;
  verifier_id: string;
}

export interface VerificationCheck {
  check_id: string;
  name: string;
  passed: boolean;
  severity: "critical" | "high" | "medium" | "low";
  detail?: string;
}

export interface RollbackReceiptData {
  rollback_id: string;
  original_receipt_id: string;
  original_command_id: string;
  rollback_type: "full" | "partial" | "compensating";
  success: boolean;
  restored_state_hash?: string;
  unrestorable_effects: string[];
  duration_ms: number;
}

export interface TrustReceiptData {
  trust_event_id: string;
  subject_type: "user" | "device" | "agent" | "service" | "release";
  subject_id: string;
  trust_action: "grant" | "revoke" | "escalate" | "degrade" | "attest";
  previous_grade: string;
  new_grade: string;
  evidence_count: number;
  rationale: string;
}

export interface ReceiptChainAnchor {
  chain_id: string;
  chain_type: "command" | "approval" | "release" | "trust";
  genesis_receipt_id: string;
  latest_receipt_id: string;
  length: number;
  integrity: ReceiptIntegrity;
  last_verified_at: string;
}

export interface ReceiptQuery {
  correlation_id?: string;
  category?: ReceiptCategory;
  actor_id?: string;
  since?: string;
  until?: string;
  limit?: number;
  chain_id?: string;
}
