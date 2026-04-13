// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Routing Registry
// Maps modules → advisors, scores Boardroom worthiness
// ═══════════════════════════════════════════════════════════════

import type { DomainSignal, Domain } from "./types";

export interface AdvisorRegistryEntry {
  advisor_id: string;
  display_name: string;
  domain: Domain;
  modules: string[]; // which modules this advisor covers
  specialties: string[];
}

// ── Static Registry ─────────────────────────────────────────────

const ADVISOR_REGISTRY: AdvisorRegistryEntry[] = [
  // Business domain
  { advisor_id: "revenue-advisor", display_name: "Revenue Advisor", domain: "business", modules: ["crm", "leads", "quotes"], specialties: ["revenue", "pipeline", "collections"] },
  { advisor_id: "crm-advisor", display_name: "CRM Advisor", domain: "business", modules: ["crm"], specialties: ["customer-health", "relationship", "retention"] },
  { advisor_id: "lead-recovery-advisor", display_name: "Lead Recovery Advisor", domain: "business", modules: ["leads"], specialties: ["lead-recovery", "outreach", "conversion"] },
  { advisor_id: "operations-advisor", display_name: "Operations Advisor", domain: "business", modules: ["operations", "quotes"], specialties: ["fulfillment", "efficiency", "process"] },
  // Finance domain
  { advisor_id: "spending-advisor", display_name: "Spending Advisor", domain: "finance", modules: ["spending", "bills"], specialties: ["spending", "budget", "subscriptions"] },
  { advisor_id: "reserve-advisor", display_name: "Reserve Advisor", domain: "finance", modules: ["overview", "approvals"], specialties: ["reserves", "cash-flow", "liquidity"] },
  { advisor_id: "obligations-advisor", display_name: "Obligations Advisor", domain: "finance", modules: ["bills", "approvals"], specialties: ["bills", "payments", "obligations"] },
  // Concierge domain
  { advisor_id: "travel-advisor", display_name: "Travel Advisor", domain: "concierge", modules: ["calendar", "errands"], specialties: ["travel", "prep", "logistics"] },
  { advisor_id: "calendar-advisor", display_name: "Calendar Advisor", domain: "concierge", modules: ["calendar", "tasks"], specialties: ["scheduling", "appointments", "reminders"] },
  { advisor_id: "lifestyle-advisor", display_name: "Lifestyle Advisor", domain: "concierge", modules: ["tasks", "errands"], specialties: ["errands", "groceries", "recurring"] },
];

/**
 * Get all advisors that should receive a given signal.
 */
export function getAdvisorsForSignal(signal: DomainSignal): AdvisorRegistryEntry[] {
  return ADVISOR_REGISTRY.filter(
    (a) => a.domain === signal.domain && a.modules.includes(signal.module)
  );
}

/**
 * Get all advisors for a domain.
 */
export function getAdvisorsForDomain(domain: Domain): AdvisorRegistryEntry[] {
  return ADVISOR_REGISTRY.filter((a) => a.domain === domain);
}

/**
 * Get the full registry.
 */
export function getFullRegistry(): AdvisorRegistryEntry[] {
  return [...ADVISOR_REGISTRY];
}

// ── Boardroom Worthiness Score ───────────────────────────────────

const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 0.95,
  high: 0.75,
  medium: 0.45,
  low: 0.2,
};

/**
 * Score 0-1 indicating whether a signal warrants Boardroom escalation.
 * Considers severity, confidence, cross-domain potential, and value-at-risk.
 */
export function getBoardroomWorthinessScore(signal: DomainSignal): number {
  const severityScore = SEVERITY_WEIGHTS[signal.severity] ?? 0.3;

  // Higher confidence = more trustworthy signal = more actionable
  const confidenceFactor = signal.confidence / 100;

  // Cross-domain signals (touching multiple modules) are more Boardroom-worthy
  const crossDomainBonus = signal.linked_objects.length > 2 ? 0.1 : 0;

  // Urgent triggers boost worthiness
  const urgencyBonus = signal.trigger_type === "immediate" ? 0.1 : 0;

  const raw = severityScore * 0.5 + confidenceFactor * 0.25 + crossDomainBonus + urgencyBonus + 0.15;
  return Math.min(1, Math.max(0, raw));
}
