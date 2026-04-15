// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Agent Governance Types
// Role definitions, rights, planner/reviewer separation, escalation.
// ═══════════════════════════════════════════════════════════════

export type AgentMaturity = "experimental" | "beta" | "stable" | "hardened";

export type AgentRight = "observe" | "recommend" | "draft" | "execute" | "approve" | "escalate";

export interface AgentRoleDefinition {
  role_key: string;
  display_name: string;
  mission: string;
  council: string;
  maturity: AgentMaturity;
  rights: AgentRight[];
  forbidden_rights: AgentRight[];
  max_autonomy_level: number;
  domains: string[];
  kpis: AgentKPI[];
  escalation_targets: string[];
  memory_scope: "own" | "council" | "global";
}

export interface AgentKPI {
  kpi_id: string;
  name: string;
  metric: string;
  target: number;
  current?: number;
  unit: string;
  direction: "higher_better" | "lower_better";
}

export interface PlannerReviewerSeparation {
  task_id: string;
  planner_role: string;
  reviewer_role: string;
  planner_output: unknown;
  reviewer_verdict: "approve" | "revise" | "reject";
  reviewer_feedback?: string;
  iteration: number;
  max_iterations: number;
}

export interface AgentEscalationRule {
  rule_id: string;
  from_role: string;
  to_target: string;
  trigger_condition: string;
  urgency: "low" | "normal" | "high" | "critical";
  auto_escalate: boolean;
  timeout_minutes: number;
  escalation_message_template: string;
}

export interface AgentGovernanceReport {
  report_id: string;
  role_key: string;
  period: string;
  total_invocations: number;
  successful_invocations: number;
  failed_invocations: number;
  escalations: number;
  avg_confidence: number;
  budget_used_cents: number;
  budget_limit_cents: number;
  maturity_recommendation: AgentMaturity;
  issues: string[];
  generated_at: string;
}

export interface AgentCapabilityDeclaration {
  role_key: string;
  capabilities: string[];
  tools: string[];
  supported_task_types: string[];
  max_context_tokens: number;
  supports_streaming: boolean;
  supports_function_calling: boolean;
  version: string;
}
