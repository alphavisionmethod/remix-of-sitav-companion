// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Governance Engine (Production-Grade)
// Unified facade: prompt safety, model routing, budget checking,
// tool policy enforcement, action gating, audit, governance reports.
// ═══════════════════════════════════════════════════════════════

import type { ModelRoutingPolicy, InferenceRoute, InferenceTier, RoutingStrategy } from "@/packages/ai-contracts/routing-types";
import type { AIActionGate, AIActionGateResult, AITrustBoundary } from "@/packages/ai-contracts/safety-types";
import type { AIBudgetPolicy, SpendCeiling } from "@/packages/ai-contracts/economics-types";
import type { AIToolPolicy, ToolPermission } from "@/packages/ai-contracts/tool-policy-types";
import type { PromptDefinition, PromptQualityMetadata } from "@/packages/ai-contracts/prompt-types";
import type { AgentRoleDefinition, AgentGovernanceReport, GovernanceIssue } from "@/packages/ai-contracts/agent-governance-types";

// ── Prompt Safety Evaluator ──

export function evaluatePromptSafety(prompt: PromptDefinition, trustBoundaries: AITrustBoundary[]): {
  safe: boolean;
  violations: string[];
  warnings: string[];
  risk_score: number;
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  let riskScore = 0;

  for (const boundary of trustBoundaries) {
    if (boundary.never_from_llm) {
      const fieldPattern = boundary.field.toLowerCase();
      if (prompt.user_prompt_template.toLowerCase().includes(fieldPattern)) {
        violations.push(`Prompt references trust-boundary field "${boundary.field}" (domain: ${boundary.domain}) which must never come from LLM`);
        riskScore += boundary.severity === "critical" ? 1.0 : boundary.severity === "high" ? 0.7 : 0.3;
      }
    }
  }

  if (prompt.risk_tier === "r4_critical" || prompt.risk_tier === "r5_existential") {
    if (prompt.status !== "active") {
      warnings.push("High-risk prompt is not in active status");
      riskScore += 0.2;
    }
    if (!prompt.guardrails || prompt.guardrails.length === 0) {
      warnings.push("High-risk prompt has no guardrails configured");
      riskScore += 0.5;
    }
  }

  if (prompt.variables.some(v => v.sensitive && !v.redact_in_logs)) {
    warnings.push("Sensitive variables not marked for log redaction");
    riskScore += 0.3;
  }

  return { safe: violations.length === 0, violations, warnings, risk_score: Math.min(riskScore, 1) };
}

// ── Model Router ──

export function routeModel(taskClass: string, riskTier: string, policies: ModelRoutingPolicy[]): InferenceRoute | null {
  const policy = policies.find(p => p.task_class === taskClass && p.risk_tier === riskTier && p.active)
    ?? policies.find(p => p.task_class === taskClass && p.active);

  if (!policy || policy.model_preferences.length === 0) return null;

  const enabledModels = policy.model_preferences.filter(m => m.enabled);
  if (enabledModels.length === 0) return null;

  const selected = enabledModels.sort((a, b) => a.priority - b.priority)[0];
  const now = new Date().toISOString();

  return {
    route_id: crypto.randomUUID(),
    task_class: taskClass,
    selected_model: selected.model_id,
    selected_provider: selected.provider,
    selected_tier: selected.tier,
    selected_location: selected.location,
    routing_reason: `Policy "${policy.policy_name}": priority ${selected.priority} model for ${taskClass}/${riskTier}`,
    routing_strategy_used: policy.routing_strategy,
    policy_id: policy.policy_id,
    estimated_cost_cents: selected.cost_per_1k_input_cents,
    estimated_latency_ms: selected.avg_latency_ms,
    fallback_position: 0,
    circuit_breaker_state: "closed",
    cache_hit: false,
    data_residency_compliant: true,
    alternatives_considered: enabledModels.length,
    routed_at: now,
  };
}

// ── Budget Checker ──

export function checkBudget(policy: AIBudgetPolicy, currentSpend: number, estimatedCost: number): {
  allowed: boolean;
  remaining_cents: number;
  utilization_percent: number;
  action: "allow" | "throttle" | "downgrade_tier" | "block";
} {
  const dailyCeiling = policy.daily_ceiling_cents;
  const projectedSpend = currentSpend + estimatedCost;
  const utilization = (projectedSpend / Math.max(dailyCeiling, 1)) * 100;

  const sortedThresholds = [...policy.alert_thresholds].sort((a, b) => b.percent - a.percent);
  let action: "allow" | "throttle" | "downgrade_tier" | "block" = "allow";

  for (const threshold of sortedThresholds) {
    if (utilization >= threshold.percent) {
      if (threshold.action === "block" || threshold.action === "emergency_stop") { action = "block"; }
      else if (threshold.action === "downgrade_tier" && action === "allow") { action = "downgrade_tier"; }
      else if (threshold.action === "throttle" && action === "allow") { action = "throttle"; }
      break;
    }
  }

  if (policy.enforcement === "hard_block" && projectedSpend > dailyCeiling) {
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
  execution_mode?: string;
} {
  const policy = policies.find(p => p.role_key === roleKey && p.active);
  if (!policy) return { allowed: false, permission: null, reason: `No active tool policy found for role ${roleKey}` };

  const toolPerm = policy.tool_policies.find(t => t.tool_name === toolName);
  if (!toolPerm) return { allowed: false, permission: null, reason: `Tool "${toolName}" not configured for role ${roleKey}` };

  if (toolPerm.access_level === "forbidden") {
    return { allowed: false, permission: toolPerm, reason: `Tool "${toolName}" is forbidden for role ${roleKey}` };
  }

  return {
    allowed: true,
    permission: toolPerm,
    reason: `Access granted (${toolPerm.access_level})`,
    execution_mode: toolPerm.execution_mode,
  };
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
  if (financialImpact > gate.max_financial_impact_cents) return gate.requires_dual_approval ? "require_dual_approval" : "require_approval";
  if (gate.requires_dual_approval) return "require_dual_approval";
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
  domain?: string;
  capability_id?: string;
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
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
  if (auditLog.length > 10000) auditLog.splice(0, auditLog.length - 10000);
  return entry;
}

export function getAuditLog(limit = 100): AIAuditRecord[] {
  return auditLog.slice(-limit);
}

export function getAuditStats(): { total: number; by_result: Record<string, number>; avg_cost: number } {
  const byResult: Record<string, number> = {};
  let totalCost = 0;
  for (const r of auditLog) {
    byResult[r.gate_result] = (byResult[r.gate_result] || 0) + 1;
    totalCost += r.cost_cents;
  }
  return { total: auditLog.length, by_result: byResult, avg_cost: auditLog.length > 0 ? totalCost / auditLog.length : 0 };
}

// ── Governance Report Generator ──

export function generateGovernanceReport(
  role: AgentRoleDefinition,
  invocations: number,
  failures: number,
  budgetUsed: number,
  budgetLimit: number,
  escalations = 0,
  avgConfidence = 0.8,
  avgQuality = 0.75,
  avgLatency = 200,
): AgentGovernanceReport {
  const issues: GovernanceIssue[] = [];
  const failureRate = failures / Math.max(invocations, 1);
  const budgetUtil = budgetUsed / Math.max(budgetLimit, 1);

  if (failureRate > 0.1) {
    issues.push({
      issue_id: crypto.randomUUID(),
      severity: failureRate > 0.25 ? "critical" : "high",
      category: "reliability",
      description: `Failure rate ${(failureRate * 100).toFixed(1)}% exceeds 10% threshold`,
      remediation: "Review error logs, check model availability, consider fallback chain adjustments",
      auto_remediation_available: false,
    });
  }

  if (budgetUtil > 0.9) {
    issues.push({
      issue_id: crypto.randomUUID(),
      severity: budgetUtil > 0.95 ? "critical" : "high",
      category: "budget",
      description: `Budget utilization ${(budgetUtil * 100).toFixed(1)}% exceeds 90% threshold`,
      remediation: "Consider tier downgrade, caching optimization, or budget increase",
      auto_remediation_available: true,
    });
  }

  if (avgConfidence < 0.6) {
    issues.push({
      issue_id: crypto.randomUUID(),
      severity: "medium",
      category: "performance",
      description: `Average confidence ${avgConfidence.toFixed(2)} below 0.6 threshold`,
      remediation: "Improve prompts, add grounding sources, or restrict task scope",
      auto_remediation_available: false,
    });
  }

  let maturityRec = role.maturity;
  if (invocations > 5000 && failureRate < 0.02 && avgQuality > 0.85) maturityRec = "stable";
  if (invocations > 20000 && failureRate < 0.01 && avgQuality > 0.9) maturityRec = "hardened";
  if (failureRate > 0.2) maturityRec = "experimental";

  return {
    report_id: crypto.randomUUID(),
    role_key: role.role_key,
    period: new Date().toISOString().slice(0, 10),
    lifecycle_state: role.lifecycle_state,
    total_invocations: invocations,
    successful_invocations: invocations - failures,
    failed_invocations: failures,
    escalations,
    escalation_rate: escalations / Math.max(invocations, 1),
    approvals_requested: 0,
    approvals_granted: 0,
    approvals_denied: 0,
    avg_confidence: avgConfidence,
    avg_quality_score: avgQuality,
    avg_latency_ms: avgLatency,
    budget_used_cents: budgetUsed,
    budget_limit_cents: budgetLimit,
    budget_utilization_percent: budgetUtil * 100,
    kpi_scores: Object.fromEntries(
      role.kpis.map(k => [k.kpi_id, { target: k.target, actual: k.current ?? 0, met: (k.current ?? 0) >= k.target }])
    ),
    maturity_recommendation: maturityRec,
    promotion_eligible: maturityRec === "stable" && role.maturity !== "stable" && role.maturity !== "hardened",
    demotion_risk: failureRate > 0.15 || budgetUtil > 0.95,
    issues,
    recommendations: issues.map(i => i.remediation),
    generated_at: new Date().toISOString(),
  };
}
