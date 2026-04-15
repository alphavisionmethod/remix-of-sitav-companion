// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Protocol
// initiate → evaluate → decide → notify → audit
// ═══════════════════════════════════════════════════════════════

export type ApprovalPhase =
  | "initiated"
  | "evaluating"
  | "pending_human"
  | "pending_dual"
  | "approved"
  | "rejected"
  | "expired"
  | "escalated";

export interface ApprovalRequest {
  approval_id: string;
  correlation_id: string;
  command_id?: string;
  requester_id: string;
  approval_type: "single" | "dual" | "committee" | "auto";
  risk_level: "low" | "medium" | "high" | "critical";
  domain: string;
  action_key: string;
  justification: string;
  evidence_refs: string[];
  impact_summary: string;
  dry_run_result?: unknown;
  phase: ApprovalPhase;
  expires_at: string;
  created_at: string;
}

export interface ApprovalDecision {
  approval_id: string;
  decided_by: string;
  decision: "approve" | "reject" | "escalate" | "defer";
  conditions?: string[];
  comments?: string;
  decided_at: string;
}

export interface ApprovalNotification {
  approval_id: string;
  recipient_id: string;
  channel: "push" | "email" | "in_app" | "websocket";
  template: string;
  sent_at: string;
  acknowledged_at?: string;
}

export interface ApprovalPolicy {
  action_key: string;
  min_risk_for_human: "low" | "medium" | "high" | "critical";
  require_dual_above: "high" | "critical";
  auto_approve_below: "low" | "medium";
  max_approval_time_minutes: number;
  escalation_after_minutes: number;
  cooldown_seconds: number;
}
