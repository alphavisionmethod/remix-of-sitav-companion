// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Configuration Package
// ═══════════════════════════════════════════════════════════════

export type AdvisorId = "business-advisor" | "money-advisor" | "concierge-advisor" | "strategy-advisor";
export type AdvisorDomain = "business-os" | "finance-os" | "concierge-os" | "cross-domain";
export type AdvisorCouncil = "customer-facing";
export type AutonomyLevel = "L0-observe" | "L1-diagnose" | "L2-recommend" | "L3-draft" | "L4-simulate" | "L5-approval-ready" | "L6-constrained-action";

export interface AdvisorConfig {
  id: AdvisorId;
  name: string;
  domain: AdvisorDomain;
  council: AdvisorCouncil;
  maxAutonomy: AutonomyLevel;
  capabilities: string[];
  memoryScope: string;
  confidenceThreshold: number;
  blockedActions: string[];
  boardroomContributions: string[];
  requiredInputs: string[];
  optionalInputs: string[];
  refusalConditions: string[];
  maturity: "scaffold" | "alpha" | "beta" | "production";
}

export const ADVISOR_CONFIGS: AdvisorConfig[] = [
  {
    id: "business-advisor", name: "Business Advisor", domain: "business-os", council: "customer-facing",
    maxAutonomy: "L4-simulate",
    capabilities: ["crm-analysis", "pipeline-review", "lead-scoring", "revenue-forecasting", "client-health", "follow-up-detection", "opportunity-identification"],
    memoryScope: "business-domain + cross-domain-context",
    confidenceThreshold: 0.7,
    blockedActions: ["execute-payment", "delete-customer", "send-communication-without-approval"],
    boardroomContributions: ["business-boardroom", "executive-review", "opportunity-review"],
    requiredInputs: ["customer-data", "pipeline-data", "revenue-history"],
    optionalInputs: ["communication-history", "invoice-data", "calendar-data"],
    refusalConditions: ["no-customer-data", "stale-pipeline-data"],
    maturity: "alpha",
  },
  {
    id: "money-advisor", name: "Money Advisor", domain: "finance-os", council: "customer-facing",
    maxAutonomy: "L5-approval-ready",
    capabilities: ["cashflow-analysis", "budget-health", "bill-calendar", "reserve-assessment", "subscription-waste", "invoice-aging", "tax-estimation", "investment-review"],
    memoryScope: "finance-domain + confidential-tier",
    confidenceThreshold: 0.8,
    blockedActions: ["execute-payment-over-500", "modify-account", "transfer-funds"],
    boardroomContributions: ["finance-boardroom", "executive-review", "family-office-review"],
    requiredInputs: ["account-data", "transaction-data"],
    optionalInputs: ["investment-data", "tax-data", "budget-data"],
    refusalConditions: ["no-account-data", "stale-transaction-data"],
    maturity: "alpha",
  },
  {
    id: "concierge-advisor", name: "Concierge Advisor", domain: "concierge-os", council: "customer-facing",
    maxAutonomy: "L4-simulate",
    capabilities: ["task-prioritization", "booking-scoring", "conflict-detection", "itinerary-building", "routine-health", "errand-optimization", "household-coordination"],
    memoryScope: "household + calendar + cross-domain-context",
    confidenceThreshold: 0.7,
    blockedActions: ["book-without-approval", "send-communications", "purchase-over-100"],
    boardroomContributions: ["family-boardroom", "executive-review"],
    requiredInputs: ["calendar-data", "task-list"],
    optionalInputs: ["household-members", "provider-list", "budget-data"],
    refusalConditions: ["no-calendar-data"],
    maturity: "alpha",
  },
  {
    id: "strategy-advisor", name: "Strategy Advisor", domain: "cross-domain", council: "customer-facing",
    maxAutonomy: "L3-draft",
    capabilities: ["cross-domain-opportunity-detection", "risk-synthesis", "boardroom-synthesis", "strategic-recommendation"],
    memoryScope: "all-domains-read-only",
    confidenceThreshold: 0.8,
    blockedActions: ["execute-any-action", "modify-data"],
    boardroomContributions: ["executive-review", "opportunity-review"],
    requiredInputs: ["business-health", "finance-health", "concierge-health"],
    optionalInputs: ["opportunity-data", "risk-data"],
    refusalConditions: ["insufficient-cross-domain-data"],
    maturity: "scaffold",
  },
];

export function getAdvisorConfig(id: AdvisorId): AdvisorConfig {
  const config = ADVISOR_CONFIGS.find(a => a.id === id);
  if (!config) throw new Error(`Unknown advisor: ${id}`);
  return config;
}

export function getAdvisorsByDomain(domain: AdvisorDomain): AdvisorConfig[] {
  return ADVISOR_CONFIGS.filter(a => a.domain === domain);
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./behavioral-engine";
export * from "./registry";
