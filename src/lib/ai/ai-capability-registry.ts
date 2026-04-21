// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Capability Registry
// Canonical typed registry for every AI capability with providers,
// fallbacks, refusals, evidence grades, and safety requirements.
// ═══════════════════════════════════════════════════════════════

export type EvidenceGrade = "A" | "B" | "C" | "D" | "F";
export type ActionBoundarySensitivity = "none" | "low" | "high" | "critical";
export type DegradedBehavior = "refuse-with-receipt" | "cached-only" | "degrade-gracefully";

export interface AICapabilityEntry {
  capabilityId: string;
  owner: string;
  scope: string;
  allowedModels: readonly string[];
  preferredRoute: string;
  fallbackChain: readonly string[];
  refusalConditions: readonly string[];
  evidenceGradeRequired: EvidenceGrade;
  receiptRequired: boolean;
  costPolicy: string;
  actionBoundarySensitivity: ActionBoundarySensitivity;
  autonomyCeilingRelevance: boolean;
  crossDomainRestriction: boolean;
  noProviderBehavior: DegradedBehavior;
}

export const AI_CAPABILITY_REGISTRY: readonly AICapabilityEntry[] = [
  {
    capabilityId: "advisor.money",
    owner: "finance-os",
    scope: "cashflow-analysis, budget-health, bill-calendar, reserve-assessment, subscription-waste, invoice-aging, tax-estimation",
    allowedModels: ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite", "openai/gpt-5-mini"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "domain-fence-violated", "kill-switch-active"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "standard-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: true,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "advisor.business",
    owner: "business-os",
    scope: "crm-analysis, pipeline-review, lead-scoring, revenue-forecasting, client-health, follow-up-detection",
    allowedModels: ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite", "openai/gpt-5-mini"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "domain-fence-violated", "kill-switch-active"],
    evidenceGradeRequired: "B",
    receiptRequired: true,
    costPolicy: "standard-tier",
    actionBoundarySensitivity: "high",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: true,
    noProviderBehavior: "degrade-gracefully",
  },
  {
    capabilityId: "advisor.concierge",
    owner: "concierge-os",
    scope: "task-prioritization, booking-scoring, conflict-detection, itinerary-building, routine-health",
    allowedModels: ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "domain-fence-violated", "kill-switch-active"],
    evidenceGradeRequired: "B",
    receiptRequired: true,
    costPolicy: "standard-tier",
    actionBoundarySensitivity: "high",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: true,
    noProviderBehavior: "degrade-gracefully",
  },
  {
    capabilityId: "advisor.strategy",
    owner: "cross-domain",
    scope: "cross-domain-opportunity-detection, risk-synthesis, boardroom-synthesis, strategic-recommendation",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "scope-violation", "autonomy-ceiling-reached"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: false,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "advisor.security",
    owner: "security-os",
    scope: "threat-detection, permission-audit, policy-review, vulnerability-scan, compliance-check",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "kill-switch-active"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: false,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "advisor.legal",
    owner: "legal-domain",
    scope: "contract-review, compliance-guidance, jurisdiction-check, risk-assessment",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["openai/gpt-5"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "domain-fence-violated", "scope-violation"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: true,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "advisor.tax",
    owner: "finance-os",
    scope: "tax-estimation, deduction-detection, quarterly-planning, jurisdiction-compliance",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "domain-fence-violated", "scope-violation"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: true,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "boardroom.synthesis",
    owner: "boardroom",
    scope: "cross-domain-synthesis, recommendation-aggregation, strategic-scoring, consensus-detection",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold", "autonomy-ceiling-reached"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "critical",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: false,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "boardroom.debate",
    owner: "boardroom",
    scope: "multi-advisor-debate, conflict-resolution, consensus-building",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold"],
    evidenceGradeRequired: "A",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "high",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: false,
    noProviderBehavior: "refuse-with-receipt",
  },
  {
    capabilityId: "simulation.monte-carlo",
    owner: "simulation-engine",
    scope: "scenario-modeling, risk-simulation, outcome-distribution, sensitivity-analysis",
    allowedModels: ["google/gemini-2.5-pro", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-pro",
    fallbackChain: ["google/gemini-2.5-flash"],
    refusalConditions: ["budget-exceeded", "confidence-below-threshold"],
    evidenceGradeRequired: "B",
    receiptRequired: true,
    costPolicy: "premium-tier",
    actionBoundarySensitivity: "high",
    autonomyCeilingRelevance: false,
    crossDomainRestriction: false,
    noProviderBehavior: "degrade-gracefully",
  },
  {
    capabilityId: "brain.personal",
    owner: "personal-brain",
    scope: "preference-learning, routine-detection, context-restoration, ambient-intelligence",
    allowedModels: ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"],
    preferredRoute: "google/gemini-2.5-flash-lite",
    fallbackChain: ["google/gemini-2.5-flash"],
    refusalConditions: ["budget-exceeded", "kill-switch-active"],
    evidenceGradeRequired: "C",
    receiptRequired: false,
    costPolicy: "economy-tier",
    actionBoundarySensitivity: "low",
    autonomyCeilingRelevance: false,
    crossDomainRestriction: false,
    noProviderBehavior: "cached-only",
  },
  {
    capabilityId: "brain.core",
    owner: "core-intelligence",
    scope: "entity-extraction, classification, summarization, intent-detection",
    allowedModels: ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite", "openai/gpt-5-nano"],
    preferredRoute: "google/gemini-2.5-flash-lite",
    fallbackChain: ["openai/gpt-5-nano"],
    refusalConditions: ["budget-exceeded", "kill-switch-active"],
    evidenceGradeRequired: "C",
    receiptRequired: false,
    costPolicy: "economy-tier",
    actionBoundarySensitivity: "none",
    autonomyCeilingRelevance: false,
    crossDomainRestriction: false,
    noProviderBehavior: "cached-only",
  },
  {
    capabilityId: "admin.intelligence",
    owner: "admin-plane",
    scope: "system-health-analysis, anomaly-detection, usage-analytics, drift-detection",
    allowedModels: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite"],
    refusalConditions: ["budget-exceeded", "kill-switch-active"],
    evidenceGradeRequired: "B",
    receiptRequired: true,
    costPolicy: "standard-tier",
    actionBoundarySensitivity: "high",
    autonomyCeilingRelevance: true,
    crossDomainRestriction: false,
    noProviderBehavior: "degrade-gracefully",
  },
  {
    capabilityId: "gateway.general",
    owner: "ai-gateway",
    scope: "general-purpose-inference, chat-completion, text-generation",
    allowedModels: ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini", "openai/gpt-5-nano"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite", "openai/gpt-5-nano"],
    refusalConditions: ["budget-exceeded", "kill-switch-active"],
    evidenceGradeRequired: "C",
    receiptRequired: true,
    costPolicy: "economy-tier",
    actionBoundarySensitivity: "none",
    autonomyCeilingRelevance: false,
    crossDomainRestriction: false,
    noProviderBehavior: "degrade-gracefully",
  },
  {
    capabilityId: "files.ai-processing",
    owner: "files-domain",
    scope: "document-analysis, image-processing, file-classification, content-extraction",
    allowedModels: ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "openai/gpt-5"],
    preferredRoute: "google/gemini-2.5-flash",
    fallbackChain: ["google/gemini-2.5-flash-lite"],
    refusalConditions: ["budget-exceeded", "kill-switch-active"],
    evidenceGradeRequired: "B",
    receiptRequired: true,
    costPolicy: "standard-tier",
    actionBoundarySensitivity: "low",
    autonomyCeilingRelevance: false,
    crossDomainRestriction: false,
    noProviderBehavior: "degrade-gracefully",
  },
] as const;

export function getCapability(capabilityId: string): AICapabilityEntry | undefined {
  return AI_CAPABILITY_REGISTRY.find((c) => c.capabilityId === capabilityId);
}

export function getCapabilitiesByOwner(owner: string): AICapabilityEntry[] {
  return AI_CAPABILITY_REGISTRY.filter((c) => c.owner === owner);
}

export function getCriticalCapabilities(): AICapabilityEntry[] {
  return AI_CAPABILITY_REGISTRY.filter((c) => c.actionBoundarySensitivity === "critical");
}

export function getCapabilitiesRequiringReceipts(): AICapabilityEntry[] {
  return AI_CAPABILITY_REGISTRY.filter((c) => c.receiptRequired);
}