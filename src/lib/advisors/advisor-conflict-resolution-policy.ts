// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Conflict Resolution Policy
// When multiple advisors produce contradictory recommendations.
// ═══════════════════════════════════════════════════════════════

export type ConflictResolutionStrategy =
  | "higher-confidence-wins"
  | "domain-authority-wins"
  | "owner-decides"
  | "strategy-advisor-arbitrates"
  | "merge-with-caveats";

export interface ConflictRule {
  readonly ruleId: string;
  readonly condition: string;
  readonly strategy: ConflictResolutionStrategy;
  readonly description: string;
}

export const CONFLICT_RESOLUTION_RULES: readonly ConflictRule[] = [
  { ruleId: "CR-001", condition: "Same domain, different conclusions", strategy: "higher-confidence-wins", description: "Within a single domain, the recommendation with highest confidence prevails." },
  { ruleId: "CR-002", condition: "Cross-domain, financial impact", strategy: "owner-decides", description: "When recommendations span domains and involve financial impact, owner must arbitrate." },
  { ruleId: "CR-003", condition: "Cross-domain, no financial impact", strategy: "strategy-advisor-arbitrates", description: "Strategy advisor synthesizes non-financial cross-domain conflicts." },
  { ruleId: "CR-004", condition: "Safety vs. growth tension", strategy: "domain-authority-wins", description: "Security/compliance/legal advisors have authority over growth advisors on safety matters." },
  { ruleId: "CR-005", condition: "Both low confidence (<0.6)", strategy: "merge-with-caveats", description: "When both sides have low confidence, present merged view with explicit caveats." },
  { ruleId: "CR-006", condition: "Irreversible action disputed", strategy: "owner-decides", description: "Any dispute involving an irreversible action must be escalated to the owner." },
];

export function resolveConflict(context: {
  sameDomain: boolean;
  financialImpact: boolean;
  safetyRelated: boolean;
  irreversible: boolean;
  maxConfidence: number;
}): ConflictRule {
  if (context.irreversible) return CONFLICT_RESOLUTION_RULES[5];
  if (context.safetyRelated) return CONFLICT_RESOLUTION_RULES[3];
  if (context.sameDomain) return CONFLICT_RESOLUTION_RULES[0];
  if (context.financialImpact) return CONFLICT_RESOLUTION_RULES[1];
  if (context.maxConfidence < 0.6) return CONFLICT_RESOLUTION_RULES[4];
  return CONFLICT_RESOLUTION_RULES[2];
}