// ═══════════════════════════════════════════════════════════════
// SITA OS — useAIGovernance Hook
// Exposes prompt safety eval, model routing, budget checking,
// tool policy enforcement, action gating, and audit log.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import {
  evaluatePromptSafety,
  routeModel,
  checkBudget,
  enforceToolPolicy,
  evaluateActionGate,
  auditAIAction,
  getAuditLog,
  generateGovernanceReport,
} from "@/lib/engines/ai-governance-engine";
import type { PromptDefinition } from "@/packages/ai-contracts/prompt-types";
import type { AITrustBoundary } from "@/packages/ai-contracts/safety-types";
import type { ModelRoutingPolicy, InferenceTier } from "@/packages/ai-contracts/routing-types";
import type { AIBudgetPolicy } from "@/packages/ai-contracts/economics-types";
import type { AIToolPolicy } from "@/packages/ai-contracts/tool-policy-types";

export function useAIGovernance() {
  const evalPromptSafety = useCallback((prompt: PromptDefinition, boundaries: AITrustBoundary[]) =>
    evaluatePromptSafety(prompt, boundaries), []);

  const route = useCallback((taskClass: string, riskTier: string, policies: ModelRoutingPolicy[]) =>
    routeModel(taskClass, riskTier, policies), []);

  const budget = useCallback((userId: string, costCents: number, policies: AIBudgetPolicy[]) =>
    checkBudget(userId, costCents, policies), []);

  const toolPolicy = useCallback((roleKey: string, toolName: string, policies: AIToolPolicy[]) =>
    enforceToolPolicy(roleKey, toolName, policies), []);

  const actionGate = useCallback((params: {
    action_type: string;
    domain: string;
    risk_tier: string;
    confidence: number;
    actor_type: "ai" | "human";
    requires_human_review: boolean;
  }) => evaluateActionGate(params), []);

  const audit = useCallback((entry: {
    action_type: string;
    actor_id: string;
    domain: string;
    result: string;
    metadata?: Record<string, unknown>;
  }) => auditAIAction(entry), []);

  const getLog = useCallback(() => getAuditLog(), []);

  const getReport = useCallback((agentRoles: Array<{
    role_key: string;
    display_name: string;
    domain: string;
    maturity: string;
    max_autonomy_level: number;
    escalation_targets: string[];
    rights: { can_observe: boolean; can_recommend: boolean; can_execute_low_risk: boolean; can_execute_high_risk: boolean; can_delegate: boolean };
    constraints: { budget_ceiling_cents: number; max_actions_per_hour: number; required_confidence: number; forbidden_domains: string[] };
  }>) => generateGovernanceReport(agentRoles), []);

  return {
    evaluatePromptSafety: evalPromptSafety,
    routeModel: route,
    checkBudget: budget,
    enforceToolPolicy: toolPolicy,
    evaluateActionGate: actionGate,
    auditAIAction: audit,
    getAuditLog: getLog,
    generateGovernanceReport: getReport,
  };
}
