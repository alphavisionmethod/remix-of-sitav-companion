// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Escalation Policy
// Rules for when advisors escalate to human approval.
// ═══════════════════════════════════════════════════════════════

export interface EscalationRule {
  ruleId: string;
  description: string;
  condition: string;
  escalateTo: "owner" | "admin" | "dual-admin";
  priority: "immediate" | "next-review" | "batch";
}

export const ESCALATION_RULES: readonly EscalationRule[] = [
  { ruleId: "ESC-001", description: "Financial action exceeding $500", condition: "action.financialImpactCents > 50000", escalateTo: "owner", priority: "immediate" },
  { ruleId: "ESC-002", description: "External communication to client", condition: "action.category === 'communicate-external'", escalateTo: "owner", priority: "immediate" },
  { ruleId: "ESC-003", description: "Confidence below 0.7", condition: "action.confidence < 0.7", escalateTo: "owner", priority: "next-review" },
  { ruleId: "ESC-004", description: "Destructive or irreversible action", condition: "action.reversible === false", escalateTo: "owner", priority: "immediate" },
  { ruleId: "ESC-005", description: "System configuration change", condition: "action.category === 'system-config'", escalateTo: "dual-admin", priority: "immediate" },
  { ruleId: "ESC-006", description: "Cross-domain action (affects multiple advisors)", condition: "action.affectedDomains.length > 1", escalateTo: "owner", priority: "next-review" },
  { ruleId: "ESC-007", description: "Kill-switch activation/deactivation", condition: "action.type === 'kill-switch-toggle'", escalateTo: "dual-admin", priority: "immediate" },
  { ruleId: "ESC-008", description: "First-time action type for this advisor", condition: "advisor.actionHistory[action.type] === 0", escalateTo: "owner", priority: "next-review" },
] as const;

export function shouldEscalate(context: { financialImpactCents?: number; confidence: number; reversible: boolean; category: string; affectedDomains?: string[]; isFirstTime?: boolean }): EscalationRule | null {
  if (context.financialImpactCents && context.financialImpactCents > 50000) return ESCALATION_RULES[0];
  if (context.category === "communicate-external") return ESCALATION_RULES[1];
  if (context.confidence < 0.7) return ESCALATION_RULES[2];
  if (!context.reversible) return ESCALATION_RULES[3];
  if (context.category === "system-config") return ESCALATION_RULES[4];
  if (context.affectedDomains && context.affectedDomains.length > 1) return ESCALATION_RULES[5];
  if (context.isFirstTime) return ESCALATION_RULES[7];
  return null;
}