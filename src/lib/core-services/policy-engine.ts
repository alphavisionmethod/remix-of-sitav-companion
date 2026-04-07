// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Engine (Durable)
// Constitutional rules evaluation with durable persistence of
// meaningful policy decisions to os_policy_evaluations
// ═══════════════════════════════════════════════════════════════

import type { RiskTier as CanonicalRiskTier } from "@/packages/contracts";
import { persistPolicyEvaluation } from "@/lib/persistence/policy-engine-persistence";

export type { CanonicalRiskTier };

export type PolicyEffect =
  | "allow"
  | "deny"
  | "require-approval"
  | "require-dual-approval"
  | "require-simulation";

export type ServiceRiskTier = "low" | "medium" | "high" | "critical";

export interface PolicyRule {
  id: string;
  name: string;
  priority: number;
  effect: PolicyEffect;
  conditions: PolicyCondition[];
  reason: string;
}

export interface PolicyCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
}

export interface PolicyContext {
  domain?: string;
  capabilityId?: string;
  riskTier?: ServiceRiskTier;
  amount?: number;
  autonomyLevel?: string;
  userId?: string;
  isSimulation?: boolean;
  hasStaleSources?: boolean;
  contradictionCount?: number;
  [key: string]: unknown;
}

export interface PolicyEvaluationResult {
  effect: PolicyEffect;
  matchedRule: PolicyRule | null;
  reason: string;
  evaluatedRules: number;
  evaluationTimeMs: number;
  /** Set after durable persistence — the ID of the persisted evaluation record */
  persistedEvaluationId?: string;
}

// ── Constitutional Policy Rules ─────────────────────────────────

const CONSTITUTIONAL_RULES: PolicyRule[] = [
  {
    id: "security-deny-critical",
    name: "Deny Critical Operations",
    priority: 1000,
    effect: "deny",
    conditions: [{ field: "riskTier", operator: "eq", value: "critical" }],
    reason: "Critical operations require special authorization and cannot be auto-executed",
  },
  {
    id: "finance-dual-approval-5k",
    name: "Finance Dual Approval >$5K",
    priority: 950,
    effect: "require-dual-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "finance" },
      { field: "amount", operator: "gt", value: 5000 },
    ],
    reason: "Financial transactions > $5K require dual approval",
  },
  {
    id: "finance-approval-500",
    name: "Finance Approval >$500",
    priority: 940,
    effect: "require-approval",
    conditions: [
      { field: "domain", operator: "eq", value: "finance" },
      { field: "amount", operator: "gt", value: 500 },
    ],
    reason: "Financial transactions > $500 require approval",
  },
  {
    id: "contradiction-block",
    name: "Block on Material Contradictions",
    priority: 930,
    effect: "deny",
    conditions: [{ field: "contradictionCount", operator: "gte", value: 2 }],
    reason: "Cannot proceed with 2+ material contradictions in source data",
  },
  {
    id: "stale-data-require-sim",
    name: "Require Simulation on Stale Data",
    priority: 920,
    effect: "require-simulation",
    conditions: [{ field: "hasStaleSources", operator: "eq", value: true }],
    reason: "Stale source data detected — simulation required before execution",
  },
  {
    id: "high-risk-approval",
    name: "High Risk Requires Approval",
    priority: 900,
    effect: "require-approval",
    conditions: [{ field: "riskTier", operator: "eq", value: "high" }],
    reason: "High-risk operations require human approval",
  },
  {
    id: "connector-write-guard",
    name: "Connector Write Guard",
    priority: 880,
    effect: "require-approval",
    conditions: [
      { field: "capabilityId", operator: "contains", value: "write" },
      { field: "domain", operator: "eq", value: "connector" },
    ],
    reason: "Connector write operations require approval",
  },
  {
    id: "simulation-bypass",
    name: "Simulation Mode Bypass",
    priority: 850,
    effect: "allow",
    conditions: [{ field: "isSimulation", operator: "eq", value: true }],
    reason: "Simulation mode — no real side effects",
  },
  {
    id: "medium-risk-allow",
    name: "Medium Risk Allow with Monitoring",
    priority: 800,
    effect: "allow",
    conditions: [{ field: "riskTier", operator: "eq", value: "medium" }],
    reason: "Medium-risk operations allowed with monitoring",
  },
  {
    id: "default-allow",
    name: "Default Allow",
    priority: 700,
    effect: "allow",
    conditions: [],
    reason: "No restricting policy matched — operation allowed",
  },
];

// ── Condition Evaluation ────────────────────────────────────────

function evaluateCondition(condition: PolicyCondition, context: PolicyContext): boolean {
  const contextValue = context[condition.field];
  if (contextValue === undefined || contextValue === null) return false;

  switch (condition.operator) {
    case "eq": return contextValue === condition.value;
    case "neq": return contextValue !== condition.value;
    case "gt": return typeof contextValue === "number" && contextValue > (condition.value as number);
    case "gte": return typeof contextValue === "number" && contextValue >= (condition.value as number);
    case "lt": return typeof contextValue === "number" && contextValue < (condition.value as number);
    case "lte": return typeof contextValue === "number" && contextValue <= (condition.value as number);
    case "in": return Array.isArray(condition.value) && (condition.value as never[]).includes(contextValue);
    case "contains":
      return typeof contextValue === "string" && contextValue.includes(condition.value as string);
    default: return false;
  }
}

function evaluateRule(rule: PolicyRule, context: PolicyContext): boolean {
  if (rule.conditions.length === 0) return true;
  return rule.conditions.every((c) => evaluateCondition(c, context));
}

// ── Public API ──────────────────────────────────────────────────

import { getInvestmentPolicyRules } from "./investment-policy-rules";

export function evaluatePolicy(
  context: PolicyContext,
  customRules?: PolicyRule[],
  opts?: {
    /** Link this evaluation to an action for lineage */
    linkedActionId?: string;
    /** Force persist even for allow decisions */
    forcePersist?: boolean;
    /** Skip persistence entirely */
    skipPersist?: boolean;
  }
): PolicyEvaluationResult {
  const start = performance.now();
  const investmentRules = context.domain === "investment" ? getInvestmentPolicyRules() : [];
  const rules = [...(customRules || []), ...investmentRules, ...CONSTITUTIONAL_RULES]
    .sort((a, b) => b.priority - a.priority);

  for (const rule of rules) {
    if (evaluateRule(rule, context)) {
      const result: PolicyEvaluationResult = {
        effect: rule.effect,
        matchedRule: rule,
        reason: rule.reason,
        evaluatedRules: rules.indexOf(rule) + 1,
        evaluationTimeMs: performance.now() - start,
      };

      // Durably persist meaningful decisions (non-blocking)
      if (!opts?.skipPersist) {
        persistPolicyEvaluation(result, context, {
          linkedActionId: opts?.linkedActionId,
          forcePersist: opts?.forcePersist,
        })
          .then(id => { if (id) result.persistedEvaluationId = id; })
          .catch(() => {});
      }

      return result;
    }
  }

  const fallback: PolicyEvaluationResult = {
    effect: "allow",
    matchedRule: null,
    reason: "No rules matched",
    evaluatedRules: rules.length,
    evaluationTimeMs: performance.now() - start,
  };

  return fallback;
}

export function classifyRiskTier(domain: string, capabilityId: string, amount?: number): ServiceRiskTier {
  if (domain === "finance" && amount && amount > 5000) return "critical";
  if (domain === "finance" && amount && amount > 500) return "high";
  if (domain === "finance") return "medium";
  if (capabilityId.includes("delete") || capabilityId.includes("destroy")) return "high";
  if (capabilityId.includes("write") || capabilityId.includes("update")) return "medium";
  return "low";
}

export function getConstitutionalRules(): PolicyRule[] {
  return [...CONSTITUTIONAL_RULES];
}

export function getRuleById(ruleId: string): PolicyRule | undefined {
  return CONSTITUTIONAL_RULES.find((r) => r.id === ruleId);
}
