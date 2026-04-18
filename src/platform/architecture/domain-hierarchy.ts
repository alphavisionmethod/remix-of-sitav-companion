// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Hierarchy
// Exactly 3 top-level domains. No 4th module ever.
// Anything in finance/business/concierge is a submodule.
// ═══════════════════════════════════════════════════════════════

export interface DomainSubmodule {
  id: string;
  name: string;
  purpose: string;
  formerStandalone?: boolean; // was previously a top-level module
}

export interface DomainModule {
  id: "finance-os" | "business-os" | "concierge-os";
  name: string;
  purpose: string;
  submodules: DomainSubmodule[];
  rules: string[];
}

export const DOMAIN_HIERARCHY: DomainModule[] = [
  {
    id: "finance-os",
    name: "Finance OS",
    purpose: "All financial reasoning, evaluation, and proposals",
    submodules: [
      { id: "money-center", name: "Money Center", purpose: "Cash flow, accounts, safe-to-spend, bills, subscriptions" },
      { id: "investment-office", name: "Investment Office", purpose: "Portfolio intelligence, asset management, advisor system, trade proposals", formerStandalone: true },
      { id: "tax-planning", name: "Tax Planning", purpose: "Tax estimation, deduction tracking, filing preparation" },
      { id: "insurance", name: "Insurance", purpose: "Coverage evaluation, gap analysis, renewal tracking" },
      { id: "capital-allocation", name: "Capital Allocation", purpose: "Purpose buckets, allocation strategy, rebalancing proposals" },
      { id: "wealth-projection", name: "Wealth Projection", purpose: "Long-term wealth modeling, scenario planning" },
    ],
    rules: [
      "Pure reasoning only — no execution, no API calls",
      "Does not call business-os or concierge-os directly",
      "Does not share databases with other domains",
      "Proposes actions through brain-core → executor chain",
    ],
  },
  {
    id: "business-os",
    name: "Business OS",
    purpose: "All business reasoning, evaluation, and proposals",
    submodules: [
      { id: "revenue-office", name: "Revenue Office", purpose: "Revenue intelligence, pipeline, pricing, growth strategy", formerStandalone: true },
      { id: "digital-presence", name: "Digital Presence", purpose: "Website, brand, SEO, content, CRO, social", formerStandalone: true },
      { id: "crm", name: "CRM", purpose: "Contacts, accounts, communication history, health scoring" },
      { id: "pipeline", name: "Pipeline", purpose: "Deals, stages, forecasting, stakeholder mapping" },
      { id: "invoicing", name: "Invoicing", purpose: "Invoice generation, tracking, collections, follow-up" },
      { id: "booking", name: "Booking & Scheduling", purpose: "Appointment booking, calendar sync, no-show management" },
      { id: "outreach", name: "Outreach", purpose: "Communication campaigns, referral, follow-up automation" },
    ],
    rules: [
      "Pure reasoning only — no execution, no API calls",
      "Does not call finance-os or concierge-os directly",
      "Does not share databases with other domains",
      "Proposes actions through brain-core → executor chain",
    ],
  },
  {
    id: "concierge-os",
    name: "Concierge OS",
    purpose: "All household/life reasoning, evaluation, and proposals",
    submodules: [
      { id: "calendar", name: "Calendar", purpose: "Schedule management, conflict detection, optimization" },
      { id: "tasks", name: "Tasks", purpose: "Task delegation, household member assignment, tracking" },
      { id: "providers", name: "Providers", purpose: "Service provider management, ratings, scheduling" },
      { id: "household", name: "Household", purpose: "Member management, preferences, routines" },
      { id: "logistics", name: "Logistics", purpose: "Travel, errands, delivery coordination" },
      { id: "life-quality", name: "Life Quality", purpose: "Wellness, routines, habit tracking, life scoring" },
    ],
    rules: [
      "Pure reasoning only — no execution, no API calls",
      "Does not call finance-os or business-os directly",
      "Does not share databases with other domains",
      "Proposes actions through brain-core → executor chain",
    ],
  },
];

// ── Validation ──────────────────────────────────────────────

export function isDomainModule(id: string): boolean {
  return DOMAIN_HIERARCHY.some(d => d.id === id);
}

export function isSubmoduleOf(submoduleId: string, domainId: string): boolean {
  const domain = DOMAIN_HIERARCHY.find(d => d.id === domainId);
  return domain?.submodules.some(s => s.id === submoduleId) ?? false;
}

export function getSubmoduleDomain(submoduleId: string): DomainModule | undefined {
  return DOMAIN_HIERARCHY.find(d => d.submodules.some(s => s.id === submoduleId));
}

export function getFormerStandalones(): DomainSubmodule[] {
  return DOMAIN_HIERARCHY.flatMap(d => d.submodules.filter(s => s.formerStandalone));
}

export function validateNoDomain4(): { valid: boolean; count: number } {
  return { valid: DOMAIN_HIERARCHY.length === 3, count: DOMAIN_HIERARCHY.length };
}
