// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Refusal Policy
// Explicit refusal model for AI capabilities with trigger categories,
// remediation guidance, and escalation paths.
// Extends AIActionResult from ai-trust-enforcer.ts.
// ═══════════════════════════════════════════════════════════════

export type RefusalTrigger =
  | "budget-exceeded"
  | "confidence-below-threshold"
  | "domain-fence-violated"
  | "scope-violation"
  | "kill-switch-active"
  | "autonomy-ceiling-reached";

export interface RefusalDecision {
  refused: true;
  capabilityId: string;
  trigger: RefusalTrigger;
  reason: string;
  remediationGuidance: string;
  humanEscalationPath: string;
  uiDisclosureRequired: boolean;
  auditReceiptRequired: boolean;
}

export interface RefusalPolicyEntry {
  trigger: RefusalTrigger;
  description: string;
  remediationGuidance: string;
  humanEscalationPath: string;
  uiDisclosureRequired: boolean;
  auditReceiptRequired: boolean;
}

export const REFUSAL_POLICIES: readonly RefusalPolicyEntry[] = [
  {
    trigger: "budget-exceeded",
    description: "AI budget for this capability or period has been exhausted",
    remediationGuidance: "Wait for budget reset or request budget increase from admin",
    humanEscalationPath: "owner → admin",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
  {
    trigger: "confidence-below-threshold",
    description: "Model confidence is below the required threshold for this action",
    remediationGuidance: "Provide more context, refine the request, or escalate to human review",
    humanEscalationPath: "owner",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
  {
    trigger: "domain-fence-violated",
    description: "Advisor attempted to act outside its designated domain boundary",
    remediationGuidance: "Route request to the appropriate domain advisor",
    humanEscalationPath: "owner → strategy-advisor",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
  {
    trigger: "scope-violation",
    description: "Requested action exceeds the capability scope declaration",
    remediationGuidance: "Use a capability with appropriate scope or request scope expansion",
    humanEscalationPath: "admin",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
  {
    trigger: "kill-switch-active",
    description: "A kill switch is active that blocks this capability",
    remediationGuidance: "Contact admin to review and deactivate the kill switch if appropriate",
    humanEscalationPath: "dual-admin",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
  {
    trigger: "autonomy-ceiling-reached",
    description: "Requested autonomy level exceeds the configured ceiling for this agent",
    remediationGuidance: "Reduce autonomy level or request approval for elevated autonomy",
    humanEscalationPath: "owner → admin",
    uiDisclosureRequired: true,
    auditReceiptRequired: true,
  },
] as const;

export interface RefusalContext {
  budgetExceeded?: boolean;
  confidence?: number;
  confidenceThreshold?: number;
  domainFenceViolated?: boolean;
  scopeViolated?: boolean;
  killSwitchActive?: boolean;
  autonomyCeilingReached?: boolean;
}

export function evaluateRefusal(capabilityId: string, context: RefusalContext): RefusalDecision | null {
  if (context.killSwitchActive) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "kill-switch-active")!;
    return { refused: true, capabilityId, trigger: "kill-switch-active", reason: policy.description, ...policy };
  }
  if (context.budgetExceeded) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "budget-exceeded")!;
    return { refused: true, capabilityId, trigger: "budget-exceeded", reason: policy.description, ...policy };
  }
  if (context.domainFenceViolated) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "domain-fence-violated")!;
    return { refused: true, capabilityId, trigger: "domain-fence-violated", reason: policy.description, ...policy };
  }
  if (context.autonomyCeilingReached) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "autonomy-ceiling-reached")!;
    return { refused: true, capabilityId, trigger: "autonomy-ceiling-reached", reason: policy.description, ...policy };
  }
  if (context.scopeViolated) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "scope-violation")!;
    return { refused: true, capabilityId, trigger: "scope-violation", reason: policy.description, ...policy };
  }
  if (context.confidence !== undefined && context.confidenceThreshold !== undefined && context.confidence < context.confidenceThreshold) {
    const policy = REFUSAL_POLICIES.find((p) => p.trigger === "confidence-below-threshold")!;
    return { refused: true, capabilityId, trigger: "confidence-below-threshold", reason: `${policy.description} (${context.confidence} < ${context.confidenceThreshold})`, ...policy };
  }
  return null;
}

export function getRefusalPolicy(trigger: RefusalTrigger): RefusalPolicyEntry | undefined {
  return REFUSAL_POLICIES.find((p) => p.trigger === trigger);
}