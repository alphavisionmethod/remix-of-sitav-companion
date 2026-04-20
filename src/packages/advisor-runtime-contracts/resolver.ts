// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Runtime Context Resolver
// Assembles full governance context from all canonical registries.
// ═══════════════════════════════════════════════════════════════

import type { AdvisorRuntimeContext } from "./types";
import { getAdvisorIdentity } from "@/lib/advisors/advisor-identity-registry";
import { getPersonaBoundary } from "@/lib/advisors/advisor-persona-boundary-map";
import { CONFIDENCE_GATES } from "@/lib/advisors/advisor-confidence-policy";
import { DISABLEMENT_POLICIES } from "@/lib/advisors/advisor-disablement-policy";
import { MEMORY_AGING_RULES } from "@/lib/advisors/advisor-memory-aging-policy";
import { OVERRIDE_ACTIONS } from "@/lib/advisors/advisor-override-model";
import { ADVISOR_PERMISSION_MATRIX, type AdvisorRole } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
import { ESCALATION_RULES } from "@/lib/ai-platform/runtime/advisor-escalation-policy";
import { REVERSIBILITY_MAP } from "@/lib/ai-platform/runtime/advisor-reversibility-map";

const ADVISOR_ROLE_MAP: Record<string, AdvisorRole> = {
  "business-advisor": "business",
  "money-advisor": "finance",
  "concierge-advisor": "concierge",
  "security-advisor": "security",
  "ops-advisor": "operations",
  "execution-advisor": "operations",
  "treasury-advisor": "finance",
  "tax-advisor": "finance",
  "collections-advisor": "finance",
};

/**
 * Resolves the full governance context for an advisor in a single call.
 * This is the canonical way to assemble all governance constraints
 * for an advisor before taking any action.
 */
export function resolveAdvisorContext(advisorId: string): AdvisorRuntimeContext {
  const role = ADVISOR_ROLE_MAP[advisorId];
  const permissions = role
    ? ADVISOR_PERMISSION_MATRIX.find((p) => p.role === role) ?? null
    : null;

  return {
    advisorId,
    identity: getAdvisorIdentity(advisorId) ?? null,
    personaBoundary: getPersonaBoundary(advisorId) ?? null,
    permissions,
    confidenceGates: CONFIDENCE_GATES,
    escalationRules: ESCALATION_RULES,
    reversibilityMap: REVERSIBILITY_MAP,
    memoryAgingRules: MEMORY_AGING_RULES,
    overrideActions: OVERRIDE_ACTIONS,
    disablementPolicies: DISABLEMENT_POLICIES,
  };
}