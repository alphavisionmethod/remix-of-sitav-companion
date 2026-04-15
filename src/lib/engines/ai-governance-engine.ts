// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Governance Engine
// Unified facade coordinating model routing, safety, budget,
// tool policies, and audit.
// ═══════════════════════════════════════════════════════════════

import type { ModelRoutingPolicy, InferenceRoute, InferenceTier } from "@/packages/ai-contracts/routing-types";
import type { AIActionGate, AIActionGateResult, AITrustBoundary } from "@/packages/ai-contracts/safety-types";
import type { AIBudgetPolicy, SpendCeiling } from "@/packages/ai-contracts/economics-types";
import type { AIToolPolicy, ToolPermission } from "@/packages/ai-contracts/tool-policy-types";
import type { PromptDefinition, PromptQualityMetadata } from "@/packages/ai-contracts/prompt-types";
import type { AgentRoleDefinition, AgentGovernanceReport } from "@/packages/ai-contracts/agent-governance-types";

// ── Prompt Safety Evaluator ──

export function evaluatePromptSafety(prompt: PromptDefinition, trustBoundaries: AITrustBoundary[]): {
  safe: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];

  for (const boundary of trustBoundaries) {
    if (boundary.never_from_llm) {
      const fieldPattern = boundary.field.toLowerCase();
      if (prompt.user_prompt_template.toLowerCase().includes(fieldPattern)) {
        violations.push(`Prompt references trust-boundary field "${boundary.field}" (domain: ${boundary.domain}) which must never come from LLM`);
      }
    }
  }

  if (prompt.risk_tier === "critical" && prompt.status !== "active") {
    warnings.push("Critical-risk prompt is not in active status");
  }

  return { safe: violations.length === 0, violations, warnings };
}

// ── Model Router ──

export function routeModel(taskClass: string, riskTier: string, policies: ModelRoutingPolicy[]): InferenceRoute | null {
  const policy = policies.find(p => p.task_class === taskClass && p.risk_tier === riskTier)
    ?? policies.find(p => p.task_class === taskClass);

  if (!policy || policy.model_preferences.length === 0) return null;

  const selected = policy.model_preferences.sort((a, b) => a.priority - b.priority)[0];
  return {
    route_id: crypto.randomUUID(),
    task_class: taskClass,
    selected_model: selected.model_id,
    selected_tier: selected.tier,
    routing_reason: `Policy ${policy.policy_id}: highest priority model for ${taskClass}/${riskTier}`,
    policy_id: policy.policy_id,
    estimated_cost_cents: selected.cost_per_1k_input_cents,
    estimated_latency_ms: selected.avg_latency_ms,
    fallback_position: 0,
  };
}

// ── Budget Checker ──

export function checkBudget(policy: AIBudgetPolicy, currentSpend: number, estimatedCost: number): {
  allowed: boolean;
  remaining_cents: number;
  utilization_percent: number;
  action: "allow" | "throttle" | "block";
} {
  const dailyCeiling = policy.daily_ceiling_cents;
  const projectedSpend = currentSpend + estimatedCost;
  const utilization = (projectedSpend / dailyCeiling) * 100;

  // Check thresholds
  const sortedThresholds = [...policy.alert_thresholds].sort((a, b) => b.percent - a.percent);
  let action: "allow" | "throttle" | "block" = "allow";

  for (const threshold of sortedThresholds) {
    if (utilization >= threshold.percent) {
      if (threshold.action === "block") action = "block";
      else if (threshold.action === "throttle" && action !== "block") action = "throttle";
      break;
    }
  }

  if (policy.enforcement === "hard" && projectedSpend > dailyCeiling) {
    action = "block";
  }

  return {
    allowed: action !== "block",
    remaining_cents: Math.max(0, dailyCeiling - currentSpend),
    utilization_percent: Math.round(utilization * 100) / 100,
    action,
  };
}

// ── Tool Policy Enforcer ──

export function enforceToolPolicy(roleKey: string, toolName: string, policies: AIToolPolicy[]): {
  allowed: boolean;
  permission: ToolPermission | null;
  reason: string;
} {
  const policy = policies.find(p => p.role_key === roleKey);
  if (!policy) return { allowed: false, permission: null, reason: `No tool policy found for role ${roleKey}` };

  const toolPerm = policy.tool_policies.find(t => t.tool_name === toolName);
  if (!toolPerm) return { allowed: false, permission: null, reason: `Tool "${toolName}" not configured for role ${roleKey}` };

  if (toolPerm.access_level === "forbidden") {
    return { allowed: false, permission: toolPerm, reason: `Tool "${toolName}" is forbidden for role ${roleKey}` };
  }

  return { allowed: true, permission: toolPerm, reason: "Access granted" };
}

// ── Action Gating ──

export function evaluateActionGate(
  actionType: string,
  confidence: number,
  financialImpact: number,
  gates: AIActionGate[],
): AIActionGateResult {
  const gate = gates.find(g => g.action_type === actionType);
  if (!gate) return "allow";

  if (confidence < gate.confidence_threshold) return "require_approval";
  if (financialImpact > gate.max_financial_impact_cents) return "require_approval";
  if (gate.requires_human_approval) return "require_approval";
  if (gate.requires_grounding) return "allow_with_caveat";

  return gate.result;
}

// ── AI Action Audit ──

export interface AIAuditRecord {
  audit_id: string;
  action_type: string;
  role_key: string;
  model_used: string;
  gate_result: AIActionGateResult;
  confidence: number;
  cost_cents: number;
  timestamp: string;
}

const auditLog: AIAuditRecord[] = [];

export function auditAIAction(record: Omit<AIAuditRecord, "audit_id" | "timestamp">): AIAuditRecord {
  const entry: AIAuditRecord = {
    ...record,
    audit_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  auditLog.push(entry);
  return entry;
}

export function getAuditLog(limit = 100): AIAuditRecord[] {
  return auditLog.slice(-limit);
}

// ── Governance Report Generator ──

export function generateGovernanceReport(role: AgentRoleDefinition, invocations: number, failures: number, budgetUsed: number, budgetLimit: number): AgentGovernanceReport {
  const issues: string[] = [];
  if (failures / Math.max(invocations, 1) > 0.1) issues.push("Failure rate exceeds 10%");
  if (budgetUsed > budgetLimit * 0.9) issues.push("Budget utilization above 90%");

  return {
    report_id: crypto.randomUUID(),
    role_key: role.role_key,
    period: new Date().toISOString().slice(0, 10),
    total_invocations: invocations,
    successful_invocations: invocations - failures,
    failed_invocations: failures,
    escalations: 0,
    avg_confidence: 0.8,
    budget_used_cents: budgetUsed,
    budget_limit_cents: budgetLimit,
    maturity_recommendation: invocations > 1000 && failures / invocations < 0.05 ? "stable" : role.maturity,
    issues,
    generated_at: new Date().toISOString(),
  };
}
