// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Governance Contracts (Edge Function Layer)
// Canonical governance rules for advisor edge functions.
// Mirrors src/lib/advisors/ contracts for Deno runtime.
// ═══════════════════════════════════════════════════════════════

// ── Persona Boundaries ──────────────────────────────────────────
export const ADVISOR_DOMAIN_FENCES: Record<string, string[]> = {
  "money-advisor": ["legal", "hr", "security"],
  "business-advisor": ["legal", "finance-os", "hr"],
  "concierge-advisor": ["finance-os", "legal", "security"],
  "strategy-advisor": [],
  "legal-advisor": ["finance-os", "engineering"],
  "security-advisor": ["finance-os", "hr"],
  "tax-advisor": ["legal", "hr", "security"],
};

export function isDomainFenced(advisorId: string, targetDomain: string): boolean {
  const fences = ADVISOR_DOMAIN_FENCES[advisorId];
  return fences?.includes(targetDomain) ?? false;
}

// ── Confidence Gates ────────────────────────────────────────────
export const CONFIDENCE_THRESHOLDS: Record<string, number> = {
  observe: 0.0,
  recommend: 0.5,
  draft: 0.6,
  simulate: 0.7,
  execute: 0.8,
  "execute-financial": 0.9,
  "communicate-external": 0.85,
  "system-config": 0.9,
};

export function isConfidenceSufficient(actionClass: string, confidence: number): boolean {
  const threshold = CONFIDENCE_THRESHOLDS[actionClass] ?? 0.8;
  return confidence >= threshold;
}

// ── Permission Matrix ───────────────────────────────────────────
export type AdvisorRole = "business" | "finance" | "concierge" | "security" | "operations";

const BLOCKED_ACTIONS: Record<AdvisorRole, string[]> = {
  business: ["system-config"],
  finance: ["system-config", "communicate-external"],
  concierge: ["system-config", "execute-financial"],
  security: ["execute-financial", "communicate-external"],
  operations: ["execute-financial", "communicate-external"],
};

export function isActionBlocked(role: AdvisorRole, actionCategory: string): boolean {
  return BLOCKED_ACTIONS[role]?.includes(actionCategory) ?? false;
}

// ── Escalation Check ────────────────────────────────────────────
export function shouldEscalateAction(context: {
  financialImpactCents?: number;
  confidence: number;
  reversible: boolean;
  category: string;
}): { escalate: boolean; reason?: string } {
  if (context.financialImpactCents && context.financialImpactCents > 50000) {
    return { escalate: true, reason: "Financial action exceeding $500" };
  }
  if (context.category === "communicate-external") {
    return { escalate: true, reason: "External communication requires approval" };
  }
  if (context.confidence < 0.7) {
    return { escalate: true, reason: `Confidence ${context.confidence} below threshold` };
  }
  if (!context.reversible) {
    return { escalate: true, reason: "Irreversible action requires approval" };
  }
  return { escalate: false };
}

// ── Reversibility Classification ────────────────────────────────
const IRREVERSIBLE_ACTIONS = new Set([
  "send-notification", "send-email", "execute-payment",
  "delete-record", "publish-content",
]);

export function isActionReversible(actionType: string): boolean {
  return !IRREVERSIBLE_ACTIONS.has(actionType);
}