// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Autonomy Ceiling Policy
// Consolidates autonomy governance from agent-governance.ts and
// advisor-escalation-policy.ts into a canonical proof-ready map.
// ═══════════════════════════════════════════════════════════════

export type AutonomyTier = "L0-observe" | "L1-suggest" | "L2-draft" | "L3-simulate" | "L4-auto-reversible" | "L5-auto-irreversible" | "L6-constrained-action";

const TIER_ORDER: AutonomyTier[] = [
  "L0-observe", "L1-suggest", "L2-draft", "L3-simulate",
  "L4-auto-reversible", "L5-auto-irreversible", "L6-constrained-action",
];

export interface AutonomyCeilingEntry {
  agentId: string;
  agentType: "advisor" | "internal-agent" | "workforce-agent";
  maxAutonomyTier: AutonomyTier;
  approvalRequiredAbove: AutonomyTier;
  blockedActions: readonly string[];
  escalationPath: string;
  auditRequirement: "all-actions" | "above-ceiling" | "action-capable-only";
  operatorRestrictions: readonly string[];
}

export const AUTONOMY_CEILING_MAP: readonly AutonomyCeilingEntry[] = [
  { agentId: "money-advisor", agentType: "advisor", maxAutonomyTier: "L3-simulate", approvalRequiredAbove: "L2-draft", blockedActions: ["execute-payment-over-500", "modify-account", "transfer-funds"], escalationPath: "owner → admin", auditRequirement: "all-actions", operatorRestrictions: ["no-financial-execution"] },
  { agentId: "business-advisor", agentType: "advisor", maxAutonomyTier: "L3-simulate", approvalRequiredAbove: "L2-draft", blockedActions: ["execute-payment", "delete-customer", "send-communication-without-approval"], escalationPath: "owner", auditRequirement: "above-ceiling", operatorRestrictions: [] },
  { agentId: "concierge-advisor", agentType: "advisor", maxAutonomyTier: "L3-simulate", approvalRequiredAbove: "L2-draft", blockedActions: ["book-without-approval", "send-communications", "purchase-over-100"], escalationPath: "owner", auditRequirement: "above-ceiling", operatorRestrictions: [] },
  { agentId: "strategy-advisor", agentType: "advisor", maxAutonomyTier: "L2-draft", approvalRequiredAbove: "L1-suggest", blockedActions: ["execute-any-action", "modify-data"], escalationPath: "owner → admin", auditRequirement: "all-actions", operatorRestrictions: ["read-only-cross-domain"] },
  { agentId: "security-advisor", agentType: "advisor", maxAutonomyTier: "L2-draft", approvalRequiredAbove: "L1-suggest", blockedActions: ["disable-security-features", "expose-credentials", "bypass-access-controls"], escalationPath: "dual-admin", auditRequirement: "all-actions", operatorRestrictions: ["no-security-bypass"] },
  { agentId: "legal-advisor", agentType: "advisor", maxAutonomyTier: "L1-suggest", approvalRequiredAbove: "L0-observe", blockedActions: ["sign-contracts", "waive-liability", "provide-binding-opinions"], escalationPath: "owner → admin", auditRequirement: "all-actions", operatorRestrictions: ["advisory-only"] },
  { agentId: "tax-advisor", agentType: "advisor", maxAutonomyTier: "L1-suggest", approvalRequiredAbove: "L0-observe", blockedActions: ["file-tax-returns", "guarantee-tax-outcomes"], escalationPath: "owner → admin", auditRequirement: "all-actions", operatorRestrictions: ["advisory-only"] },
  { agentId: "st-security-monitor", agentType: "internal-agent", maxAutonomyTier: "L3-simulate", approvalRequiredAbove: "L2-draft", blockedActions: ["auto-apply-policy", "modify-permissions"], escalationPath: "dual-admin", auditRequirement: "all-actions", operatorRestrictions: ["no-auto-apply"] },
  { agentId: "st-cost-optimizer", agentType: "internal-agent", maxAutonomyTier: "L3-simulate", approvalRequiredAbove: "L2-draft", blockedActions: ["auto-downgrade-tier", "delete-resources"], escalationPath: "admin", auditRequirement: "above-ceiling", operatorRestrictions: [] },
  { agentId: "st-quality-auditor", agentType: "internal-agent", maxAutonomyTier: "L2-draft", approvalRequiredAbove: "L1-suggest", blockedActions: ["auto-reject-outputs"], escalationPath: "admin", auditRequirement: "above-ceiling", operatorRestrictions: [] },
  { agentId: "workforce-executor", agentType: "workforce-agent", maxAutonomyTier: "L4-auto-reversible", approvalRequiredAbove: "L3-simulate", blockedActions: ["irreversible-without-approval"], escalationPath: "owner → dual-admin", auditRequirement: "all-actions", operatorRestrictions: ["reversible-only-auto"] },
];

export function enforceAutonomyCeiling(agentId: string, requestedLevel: AutonomyTier): { allowed: boolean; reason: string; escalationPath: string | null } {
  const entry = AUTONOMY_CEILING_MAP.find((e) => e.agentId === agentId);
  if (!entry) return { allowed: false, reason: `Unknown agent: ${agentId}`, escalationPath: null };

  const requestedIdx = TIER_ORDER.indexOf(requestedLevel);
  const maxIdx = TIER_ORDER.indexOf(entry.maxAutonomyTier);
  const approvalIdx = TIER_ORDER.indexOf(entry.approvalRequiredAbove);

  if (requestedIdx > maxIdx) {
    return { allowed: false, reason: `Requested ${requestedLevel} exceeds ceiling ${entry.maxAutonomyTier}`, escalationPath: entry.escalationPath };
  }
  if (requestedIdx > approvalIdx) {
    return { allowed: false, reason: `Requested ${requestedLevel} requires approval (above ${entry.approvalRequiredAbove})`, escalationPath: entry.escalationPath };
  }
  return { allowed: true, reason: `${requestedLevel} within ceiling`, escalationPath: null };
}

export function getAutonomyCeiling(agentId: string): AutonomyCeilingEntry | undefined {
  return AUTONOMY_CEILING_MAP.find((e) => e.agentId === agentId);
}