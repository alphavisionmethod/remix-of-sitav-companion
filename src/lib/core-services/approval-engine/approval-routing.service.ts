// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Routing Service
// Routes approvals to correct approver by domain, risk, amount
// ═══════════════════════════════════════════════════════════════

export interface ApproverRule {
  domain: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  amountAboveCents?: number;
  approverRoles: string[];
  delegationChain: string[];
  maxDelegationDepth: number;
}

export interface RoutingResult {
  approverRoles: string[];
  delegationAvailable: boolean;
  delegationChain: string[];
  matchedRule: ApproverRule | null;
  requiredCount: number;
}

const ROUTING_RULES: ApproverRule[] = [
  { domain: "finance", riskLevel: "critical", amountAboveCents: 500000, approverRoles: ["owner"], delegationChain: [], maxDelegationDepth: 0 },
  { domain: "finance", riskLevel: "high", amountAboveCents: 50000, approverRoles: ["owner", "admin"], delegationChain: ["admin"], maxDelegationDepth: 1 },
  { domain: "finance", riskLevel: "medium", approverRoles: ["admin", "member"], delegationChain: ["admin", "member"], maxDelegationDepth: 2 },
  { domain: "business", riskLevel: "high", approverRoles: ["owner", "admin"], delegationChain: ["admin"], maxDelegationDepth: 1 },
  { domain: "business", riskLevel: "medium", approverRoles: ["admin", "member"], delegationChain: ["member"], maxDelegationDepth: 2 },
  { domain: "concierge", riskLevel: "high", approverRoles: ["owner"], delegationChain: ["admin"], maxDelegationDepth: 1 },
  { domain: "concierge", riskLevel: "medium", approverRoles: ["admin", "member"], delegationChain: ["member"], maxDelegationDepth: 2 },
  { domain: "concierge", riskLevel: "low", approverRoles: ["member"], delegationChain: ["member"], maxDelegationDepth: 3 },
];

export function routeApproval(
  domain: string,
  riskLevel: "low" | "medium" | "high" | "critical",
  amountCents?: number
): RoutingResult {
  const riskOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const candidates = ROUTING_RULES
    .filter((r) => r.domain === domain && riskOrder[r.riskLevel] <= riskOrder[riskLevel])
    .sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel]);

  for (const rule of candidates) {
    if (rule.amountAboveCents !== undefined && amountCents !== undefined && amountCents < rule.amountAboveCents) continue;

    return {
      approverRoles: rule.approverRoles,
      delegationAvailable: rule.delegationChain.length > 0,
      delegationChain: rule.delegationChain,
      matchedRule: rule,
      requiredCount: riskLevel === "critical" ? 2 : 1,
    };
  }

  return {
    approverRoles: ["owner"],
    delegationAvailable: false,
    delegationChain: [],
    matchedRule: null,
    requiredCount: 1,
  };
}

export function canDelegate(rule: ApproverRule, currentDepth: number): boolean {
  return currentDepth < rule.maxDelegationDepth && rule.delegationChain.length > currentDepth;
}

export function getNextDelegate(rule: ApproverRule, currentDepth: number): string | null {
  if (!canDelegate(rule, currentDepth)) return null;
  return rule.delegationChain[currentDepth] || null;
}

