// ═══════════════════════════════════════════════════════════════
// SITA OS — useAIGovernance Hook
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
  type AIAuditRecord,
} from "@/domains/engines/ai-governance-engine";
import type { PromptDefinition } from "@/packages/ai-contracts/prompt-types";
import type { AITrustBoundary, AIActionGate } from "@/packages/ai-contracts/safety-types";
import type { ModelRoutingPolicy } from "@/packages/ai-contracts/routing-types";
import type { AIBudgetPolicy } from "@/packages/ai-contracts/economics-types";
import type { AIToolPolicy } from "@/packages/ai-contracts/tool-policy-types";
import type { AgentRoleDefinition } from "@/packages/ai-contracts/agent-governance-types";

export function useAIGovernance() {
  const evalPromptSafety = useCallback((prompt: PromptDefinition, boundaries: AITrustBoundary[]) =>
    evaluatePromptSafety(prompt, boundaries), []);

  const route = useCallback((taskClass: string, riskTier: string, policies: ModelRoutingPolicy[]) =>
    routeModel(taskClass, riskTier, policies), []);

  const budget = useCallback((policy: AIBudgetPolicy, currentSpend: number, estimatedCost: number) =>
    checkBudget(policy, currentSpend, estimatedCost), []);

  const toolPolicy = useCallback((roleKey: string, toolName: string, policies: AIToolPolicy[]) =>
    enforceToolPolicy(roleKey, toolName, policies), []);

  const actionGate = useCallback((
    actionType: string, confidence: number, financialImpact: number, gates: AIActionGate[]
  ) => evaluateActionGate(actionType, confidence, financialImpact, gates), []);

  const audit = useCallback((entry: Omit<AIAuditRecord, "audit_id" | "timestamp">) =>
    auditAIAction(entry), []);

  const getLog = useCallback((limit?: number) => getAuditLog(limit), []);

  const getReport = useCallback((
    role: AgentRoleDefinition, invocations: number, failures: number,
    budgetUsed: number, budgetLimit: number,
  ) => generateGovernanceReport(role, invocations, failures, budgetUsed, budgetLimit), []);

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
