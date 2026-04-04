// ═══════════════════════════════════════════════════════════════
// SITA OS — Constitution Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, TenantScoped, DomainId, RiskTier } from "../_contract-scaffold";

export type ConstitutionRuleCategory =
  | "financial-guard"
  | "privacy-boundary"
  | "execution-limit"
  | "data-residency"
  | "approval-requirement"
  | "autonomy-ceiling"
  | "communication-policy"
  | "retention-policy";

export type ConstitutionEnforcementMode = "block" | "warn" | "log" | "simulate";

export type ConstitutionRulePriority = "critical" | "high" | "medium" | "low";

export interface ConstitutionRule extends BaseContract, TenantScoped {
  name: string;
  category: ConstitutionRuleCategory;
  description: string;
  domain: DomainId;
  enforcement: ConstitutionEnforcementMode;
  priority: ConstitutionRulePriority;
  condition: ConstitutionCondition;
  action: ConstitutionAction;
  riskTier: RiskTier;
  enabled: boolean;
  version: number;
  lastEvaluated?: string;
  evaluationCount: number;
  violationCount: number;
}

export interface ConstitutionCondition {
  type: "threshold" | "pattern" | "time-window" | "composite";
  field?: string;
  operator?: "gt" | "lt" | "eq" | "ne" | "in" | "not-in" | "contains" | "matches";
  value?: unknown;
  children?: ConstitutionCondition[];
  logic?: "and" | "or";
}

export interface ConstitutionAction {
  type: "block" | "require-approval" | "downgrade-trust" | "notify" | "quarantine" | "rate-limit";
  params: Record<string, unknown>;
  fallback?: ConstitutionAction;
}

export interface ConstitutionEvaluation extends BaseContract {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  enforcement: ConstitutionEnforcementMode;
  input: Record<string, unknown>;
  reason: string;
  actionTaken?: string;
  duration: number;
}

export interface CompiledConstitution {
  id: string;
  version: number;
  compiledAt: string;
  ruleCount: number;
  rules: ConstitutionRule[];
  hash: string;
}
