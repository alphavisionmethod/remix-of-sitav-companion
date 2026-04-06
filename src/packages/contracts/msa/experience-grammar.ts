// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Experience Grammar Layer
// 10 canonical grammar categories for cross-surface coherence
// ═══════════════════════════════════════════════════════════════

export type GrammarType =
  | "trust_state"
  | "workflow_state"
  | "action_state"
  | "receipt_proof"
  | "command"
  | "boardroom"
  | "notification_urgency"
  | "opportunity_scoring"
  | "degraded_state"
  | "refusal";

export interface ExperienceGrammarRecord {
  id: string;
  grammarType: GrammarType;
  grammarKey: string;
  displayName: string;
  description?: string;
  canonicalValues: GrammarValue[];
  surfaceRenderingRules: Record<string, SurfaceRenderingRule>;
}

export interface GrammarValue {
  key: string;
  label: string;
  severity?: "info" | "warning" | "error" | "success";
  icon?: string;
  color?: string;
}

export interface SurfaceRenderingRule {
  surface: string;
  component?: string;
  variant?: string;
  animation?: string;
  fallback?: string;
}

// ── Canonical grammar definitions ──

export const TRUST_STATE_GRAMMAR: GrammarValue[] = [
  { key: "proven", label: "Proven", severity: "success", color: "green" },
  { key: "verified", label: "Verified", severity: "success", color: "emerald" },
  { key: "trusted", label: "Trusted", severity: "info", color: "blue" },
  { key: "unverified", label: "Unverified", severity: "warning", color: "yellow" },
  { key: "untrusted", label: "Untrusted", severity: "error", color: "red" },
  { key: "revoked", label: "Revoked", severity: "error", color: "destructive" },
];

export const WORKFLOW_STATE_GRAMMAR: GrammarValue[] = [
  { key: "pending", label: "Pending", severity: "info" },
  { key: "running", label: "Running", severity: "info" },
  { key: "waiting_approval", label: "Waiting Approval", severity: "warning" },
  { key: "completed", label: "Completed", severity: "success" },
  { key: "failed", label: "Failed", severity: "error" },
  { key: "stuck", label: "Stuck", severity: "error" },
  { key: "rolled_back", label: "Rolled Back", severity: "warning" },
];

export const ACTION_STATE_GRAMMAR: GrammarValue[] = [
  { key: "idle", label: "Idle", severity: "info" },
  { key: "executing", label: "Executing", severity: "info" },
  { key: "succeeded", label: "Succeeded", severity: "success" },
  { key: "failed", label: "Failed", severity: "error" },
  { key: "cancelled", label: "Cancelled", severity: "warning" },
  { key: "requires_approval", label: "Requires Approval", severity: "warning" },
];

export const RECEIPT_PROOF_GRAMMAR: GrammarValue[] = [
  { key: "action_receipt", label: "Action Receipt" },
  { key: "approval_receipt", label: "Approval Receipt" },
  { key: "verification_receipt", label: "Verification Receipt" },
  { key: "rollback_receipt", label: "Rollback Receipt" },
  { key: "payment_receipt", label: "Payment Receipt" },
  { key: "decision_receipt", label: "Decision Receipt" },
];

export const COMMAND_GRAMMAR: GrammarValue[] = [
  { key: "navigate", label: "Navigate" },
  { key: "execute", label: "Execute" },
  { key: "query", label: "Query" },
  { key: "approve", label: "Approve" },
  { key: "reject", label: "Reject" },
  { key: "configure", label: "Configure" },
  { key: "create", label: "Create" },
  { key: "delete", label: "Delete" },
];

export const BOARDROOM_GRAMMAR: GrammarValue[] = [
  { key: "packet", label: "Packet" },
  { key: "slide", label: "Slide" },
  { key: "insight", label: "Insight" },
  { key: "recommendation", label: "Recommendation" },
  { key: "alert", label: "Alert" },
  { key: "trend", label: "Trend" },
];

export const NOTIFICATION_URGENCY_GRAMMAR: GrammarValue[] = [
  { key: "critical", label: "Critical", severity: "error", color: "red" },
  { key: "high", label: "High", severity: "warning", color: "orange" },
  { key: "normal", label: "Normal", severity: "info", color: "blue" },
  { key: "low", label: "Low", severity: "info", color: "muted" },
  { key: "silent", label: "Silent", severity: "info", color: "muted" },
];

export const OPPORTUNITY_SCORING_GRAMMAR: GrammarValue[] = [
  { key: "urgent", label: "Urgent", severity: "error" },
  { key: "high_value", label: "High Value", severity: "warning" },
  { key: "moderate", label: "Moderate", severity: "info" },
  { key: "informational", label: "Informational", severity: "info" },
];

export const DEGRADED_STATE_GRAMMAR: GrammarValue[] = [
  { key: "healthy", label: "Healthy", severity: "success" },
  { key: "degraded", label: "Degraded", severity: "warning" },
  { key: "partial_outage", label: "Partial Outage", severity: "error" },
  { key: "full_outage", label: "Full Outage", severity: "error" },
  { key: "maintenance", label: "Maintenance", severity: "info" },
];

export const REFUSAL_GRAMMAR: GrammarValue[] = [
  { key: "unauthorized", label: "Unauthorized", severity: "error" },
  { key: "insufficient_privilege", label: "Insufficient Privilege", severity: "warning" },
  { key: "policy_blocked", label: "Policy Blocked", severity: "warning" },
  { key: "budget_exceeded", label: "Budget Exceeded", severity: "error" },
  { key: "rate_limited", label: "Rate Limited", severity: "warning" },
  { key: "feature_disabled", label: "Feature Disabled", severity: "info" },
];

/** All 10 canonical grammars */
export const ALL_GRAMMARS: Record<GrammarType, GrammarValue[]> = {
  trust_state: TRUST_STATE_GRAMMAR,
  workflow_state: WORKFLOW_STATE_GRAMMAR,
  action_state: ACTION_STATE_GRAMMAR,
  receipt_proof: RECEIPT_PROOF_GRAMMAR,
  command: COMMAND_GRAMMAR,
  boardroom: BOARDROOM_GRAMMAR,
  notification_urgency: NOTIFICATION_URGENCY_GRAMMAR,
  opportunity_scoring: OPPORTUNITY_SCORING_GRAMMAR,
  degraded_state: DEGRADED_STATE_GRAMMAR,
  refusal: REFUSAL_GRAMMAR,
};
