// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Tool Policy Types
// Tool access rules, data exposure, high-risk restrictions.
// ═══════════════════════════════════════════════════════════════

export type ToolAccessLevel = "full" | "read_only" | "restricted" | "forbidden";

export interface AIToolPolicy {
  policy_id: string;
  role_key: string;
  tool_policies: ToolPermission[];
  data_exposure_rules: DataExposureRule[];
  high_risk_restrictions: HighRiskRestriction[];
  updated_at: string;
}

export interface ToolPermission {
  tool_name: string;
  tool_category: string;
  access_level: ToolAccessLevel;
  max_calls_per_hour: number;
  requires_approval: boolean;
  approval_threshold_confidence: number;
  allowed_operations: string[];
  forbidden_operations: string[];
}

export interface DataExposureRule {
  data_category: string;
  allowed_in_prompt: boolean;
  allowed_in_response: boolean;
  redaction_required: boolean;
  redaction_strategy: "full" | "partial" | "hash" | "placeholder";
  pii_fields: string[];
}

export interface HighRiskRestriction {
  restriction_id: string;
  action_category: string;
  description: string;
  max_autonomy_level: number;
  requires_dual_approval: boolean;
  cooldown_minutes: number;
  max_financial_impact_cents: number;
  audit_required: boolean;
}

export interface ToolExecutionPolicy {
  tool_name: string;
  max_retries: number;
  timeout_ms: number;
  rollback_capable: boolean;
  dry_run_required: boolean;
  confirmation_required: boolean;
  output_validation: "none" | "schema" | "semantic" | "full";
}
