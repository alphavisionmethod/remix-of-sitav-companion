// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Config: Full 26-Advisor Registry
// Configuration layer — capabilities, blocked actions, maturity.
// Consistent with advisor-protocol ADVISOR_REGISTRY IDs.
// ═══════════════════════════════════════════════════════════════

import type { AdvisorConfig, AdvisorDomain, AdvisorCouncil, AutonomyLevel } from "./index";

// Extended advisor IDs beyond the core 4
export type ExtendedAdvisorId =
  | "business-advisor" | "money-advisor" | "concierge-advisor" | "strategy-advisor"
  | "sales-advisor" | "marketing-advisor" | "support-advisor" | "ops-advisor"
  | "hr-advisor" | "legal-advisor" | "compliance-advisor" | "security-advisor"
  | "data-advisor" | "product-advisor" | "engineering-advisor" | "design-advisor"
  | "growth-advisor" | "partnerships-advisor" | "investor-relations-advisor" | "tax-advisor"
  | "treasury-advisor" | "procurement-advisor" | "facilities-advisor" | "wellness-advisor"
  | "education-advisor" | "integration-advisor";

export type ExtendedAdvisorDomain =
  | AdvisorDomain
  | "sales" | "marketing" | "support" | "operations"
  | "hr" | "legal" | "compliance" | "security"
  | "data" | "product" | "engineering" | "design"
  | "growth" | "partnerships" | "investor-relations"
  | "tax" | "treasury" | "procurement" | "facilities"
  | "wellness" | "education" | "integration";

export interface ExtendedAdvisorConfig {
  id: ExtendedAdvisorId;
  name: string;
  domain: ExtendedAdvisorDomain;
  council: AdvisorCouncil | "internal-ops" | "technical" | "governance";
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
  handoffTargets: ExtendedAdvisorId[];
  performanceKpis: string[];
  description: string;
}

export const FULL_ADVISOR_REGISTRY: ExtendedAdvisorConfig[] = [
  // ── Core 4 (match existing ADVISOR_CONFIGS) ───────────────
  {
    id: "business-advisor", name: "Business Advisor", domain: "business-os", council: "customer-facing",
    maxAutonomy: "L4-simulate", description: "Primary business domain advisor for CRM, pipeline, and revenue operations.",
    capabilities: ["crm-analysis", "pipeline-review", "lead-scoring", "revenue-forecasting", "client-health", "follow-up-detection", "opportunity-identification"],
    memoryScope: "business-domain + cross-domain-context", confidenceThreshold: 0.7,
    blockedActions: ["execute-payment", "delete-customer", "send-communication-without-approval"],
    boardroomContributions: ["business-boardroom", "executive-review", "opportunity-review"],
    requiredInputs: ["customer-data", "pipeline-data", "revenue-history"],
    optionalInputs: ["communication-history", "invoice-data", "calendar-data"],
    refusalConditions: ["no-customer-data", "stale-pipeline-data"],
    maturity: "alpha", handoffTargets: ["sales-advisor", "support-advisor", "strategy-advisor"],
    performanceKpis: ["pipeline-accuracy", "forecast-precision", "response-latency"],
  },
  {
    id: "money-advisor", name: "Money Advisor", domain: "finance-os", council: "customer-facing",
    maxAutonomy: "L5-approval-ready", description: "Financial advisor for cashflow, budgets, bills, and investment review.",
    capabilities: ["cashflow-analysis", "budget-health", "bill-calendar", "reserve-assessment", "subscription-waste", "invoice-aging", "tax-estimation", "investment-review"],
    memoryScope: "finance-domain + confidential-tier", confidenceThreshold: 0.8,
    blockedActions: ["execute-payment-over-500", "modify-account", "transfer-funds"],
    boardroomContributions: ["finance-boardroom", "executive-review", "family-office-review"],
    requiredInputs: ["account-data", "transaction-data"],
    optionalInputs: ["investment-data", "tax-data", "budget-data"],
    refusalConditions: ["no-account-data", "stale-transaction-data"],
    maturity: "alpha", handoffTargets: ["tax-advisor", "treasury-advisor", "strategy-advisor"],
    performanceKpis: ["forecast-accuracy", "anomaly-detection-rate", "budget-adherence"],
  },
  {
    id: "concierge-advisor", name: "Concierge Advisor", domain: "concierge-os", council: "customer-facing",
    maxAutonomy: "L4-simulate", description: "Household and lifestyle advisor for tasks, bookings, and routines.",
    capabilities: ["task-prioritization", "booking-scoring", "conflict-detection", "itinerary-building", "routine-health", "errand-optimization", "household-coordination"],
    memoryScope: "household + calendar + cross-domain-context", confidenceThreshold: 0.7,
    blockedActions: ["book-without-approval", "send-communications", "purchase-over-100"],
    boardroomContributions: ["family-boardroom", "executive-review"],
    requiredInputs: ["calendar-data", "task-list"],
    optionalInputs: ["household-members", "provider-list", "budget-data"],
    refusalConditions: ["no-calendar-data"],
    maturity: "alpha", handoffTargets: ["wellness-advisor", "facilities-advisor", "strategy-advisor"],
    performanceKpis: ["task-completion-rate", "scheduling-accuracy", "user-satisfaction"],
  },
  {
    id: "strategy-advisor", name: "Strategy Advisor", domain: "cross-domain", council: "customer-facing",
    maxAutonomy: "L3-draft", description: "Cross-domain synthesis advisor for strategic recommendations and risk analysis.",
    capabilities: ["cross-domain-opportunity-detection", "risk-synthesis", "boardroom-synthesis", "strategic-recommendation"],
    memoryScope: "all-domains-read-only", confidenceThreshold: 0.8,
    blockedActions: ["execute-any-action", "modify-data"],
    boardroomContributions: ["executive-review", "opportunity-review"],
    requiredInputs: ["business-health", "finance-health", "concierge-health"],
    optionalInputs: ["opportunity-data", "risk-data"],
    refusalConditions: ["insufficient-cross-domain-data"],
    maturity: "scaffold", handoffTargets: ["business-advisor", "money-advisor", "concierge-advisor"],
    performanceKpis: ["insight-quality", "cross-domain-accuracy", "recommendation-adoption"],
  },

  // ── Business Domain Specialists ───────────────────────────
  {
    id: "sales-advisor", name: "Sales Advisor", domain: "sales", council: "customer-facing",
    maxAutonomy: "L4-simulate", description: "Specialized sales advisor for deal management, negotiations, and quota tracking.",
    capabilities: ["deal-coaching", "quota-tracking", "win-loss-analysis", "competitive-intel", "proposal-generation", "discount-analysis", "territory-planning"],
    memoryScope: "sales-domain + crm-data", confidenceThreshold: 0.7,
    blockedActions: ["approve-discount-over-20pct", "commit-to-pricing", "sign-contract"],
    boardroomContributions: ["sales-review", "pipeline-review"],
    requiredInputs: ["opportunity-data", "quota-data", "activity-data"],
    optionalInputs: ["competitive-data", "historical-deals", "territory-data"],
    refusalConditions: ["no-opportunity-data", "stale-crm-data"],
    maturity: "scaffold", handoffTargets: ["business-advisor", "legal-advisor", "partnerships-advisor"],
    performanceKpis: ["win-rate-improvement", "deal-velocity", "forecast-accuracy"],
  },
  {
    id: "marketing-advisor", name: "Marketing Advisor", domain: "marketing", council: "customer-facing",
    maxAutonomy: "L3-draft", description: "Marketing advisor for campaigns, content strategy, and lead generation.",
    capabilities: ["campaign-analysis", "content-strategy", "lead-gen-optimization", "brand-monitoring", "channel-attribution", "audience-segmentation", "a-b-testing"],
    memoryScope: "marketing-domain + analytics", confidenceThreshold: 0.65,
    blockedActions: ["publish-content", "launch-campaign", "modify-budget-over-1000"],
    boardroomContributions: ["marketing-review", "growth-review"],
    requiredInputs: ["campaign-data", "analytics-data"],
    optionalInputs: ["content-calendar", "competitor-data", "social-data"],
    refusalConditions: ["no-analytics-data"],
    maturity: "scaffold", handoffTargets: ["growth-advisor", "business-advisor", "design-advisor"],
    performanceKpis: ["cpl-reduction", "conversion-rate", "brand-awareness"],
  },
  {
    id: "support-advisor", name: "Support Advisor", domain: "support", council: "customer-facing",
    maxAutonomy: "L4-simulate", description: "Customer support advisor for ticket triage, resolution, and satisfaction.",
    capabilities: ["ticket-triage", "resolution-suggestion", "sentiment-analysis", "escalation-routing", "knowledge-base-search", "sla-monitoring", "csat-analysis"],
    memoryScope: "support-domain + customer-history", confidenceThreshold: 0.7,
    blockedActions: ["issue-refund-over-200", "close-account", "share-internal-data"],
    boardroomContributions: ["support-review", "customer-health-review"],
    requiredInputs: ["ticket-data", "customer-data"],
    optionalInputs: ["knowledge-base", "product-docs", "communication-history"],
    refusalConditions: ["no-ticket-data"],
    maturity: "scaffold", handoffTargets: ["business-advisor", "engineering-advisor", "product-advisor"],
    performanceKpis: ["first-response-time", "resolution-rate", "csat-score"],
  },
  {
    id: "ops-advisor", name: "Operations Advisor", domain: "operations", council: "internal-ops",
    maxAutonomy: "L4-simulate", description: "Operations advisor for process optimization, resource allocation, and efficiency.",
    capabilities: ["process-mapping", "bottleneck-detection", "resource-optimization", "vendor-management", "quality-monitoring", "capacity-planning", "workflow-automation"],
    memoryScope: "operations-domain + cross-domain", confidenceThreshold: 0.7,
    blockedActions: ["terminate-vendor", "restructure-team", "commit-budget"],
    boardroomContributions: ["ops-review", "efficiency-review"],
    requiredInputs: ["process-data", "resource-data"],
    optionalInputs: ["vendor-data", "quality-metrics", "capacity-data"],
    refusalConditions: ["no-process-data"],
    maturity: "scaffold", handoffTargets: ["procurement-advisor", "engineering-advisor", "facilities-advisor"],
    performanceKpis: ["process-efficiency", "cost-per-unit", "throughput"],
  },

  // ── Governance & Compliance ───────────────────────────────
  {
    id: "hr-advisor", name: "HR Advisor", domain: "hr", council: "internal-ops",
    maxAutonomy: "L2-recommend", description: "Human resources advisor for workforce planning, policies, and employee wellness.",
    capabilities: ["workforce-planning", "policy-review", "benefits-analysis", "performance-tracking", "hiring-pipeline", "retention-analysis", "training-recommendations"],
    memoryScope: "hr-domain + confidential-tier", confidenceThreshold: 0.8,
    blockedActions: ["terminate-employee", "modify-compensation", "access-medical-records"],
    boardroomContributions: ["people-review", "culture-review"],
    requiredInputs: ["headcount-data", "performance-data"],
    optionalInputs: ["survey-data", "training-data", "benefits-data"],
    refusalConditions: ["no-headcount-data", "insufficient-permissions"],
    maturity: "scaffold", handoffTargets: ["legal-advisor", "compliance-advisor", "wellness-advisor"],
    performanceKpis: ["retention-rate", "hiring-velocity", "employee-satisfaction"],
  },
  {
    id: "legal-advisor", name: "Legal Advisor", domain: "legal", council: "governance",
    maxAutonomy: "L2-recommend", description: "Legal advisor for contract review, compliance, and risk assessment.",
    capabilities: ["contract-review", "risk-assessment", "regulatory-monitoring", "ip-protection", "dispute-analysis", "compliance-checking", "policy-drafting"],
    memoryScope: "legal-domain + restricted-tier", confidenceThreshold: 0.85,
    blockedActions: ["sign-contract", "file-legal-action", "waive-liability", "provide-legal-opinion"],
    boardroomContributions: ["legal-review", "risk-review"],
    requiredInputs: ["contract-data", "regulatory-data"],
    optionalInputs: ["dispute-history", "ip-portfolio", "insurance-data"],
    refusalConditions: ["no-contract-data", "jurisdiction-unknown"],
    maturity: "scaffold", handoffTargets: ["compliance-advisor", "business-advisor", "hr-advisor"],
    performanceKpis: ["contract-turnaround", "risk-mitigation", "compliance-rate"],
  },
  {
    id: "compliance-advisor", name: "Compliance Advisor", domain: "compliance", council: "governance",
    maxAutonomy: "L3-draft", description: "Compliance advisor for regulatory adherence, audit preparation, and policy enforcement.",
    capabilities: ["regulation-tracking", "audit-preparation", "policy-enforcement", "gap-analysis", "reporting", "training-compliance", "data-privacy"],
    memoryScope: "compliance-domain + all-domains-read-only", confidenceThreshold: 0.85,
    blockedActions: ["modify-policy-without-approval", "grant-exemptions", "suppress-alerts"],
    boardroomContributions: ["compliance-review", "audit-review"],
    requiredInputs: ["policy-data", "regulation-data"],
    optionalInputs: ["audit-history", "incident-data", "training-records"],
    refusalConditions: ["no-policy-data", "outdated-regulations"],
    maturity: "scaffold", handoffTargets: ["legal-advisor", "security-advisor", "data-advisor"],
    performanceKpis: ["compliance-score", "audit-readiness", "violation-count"],
  },
  {
    id: "security-advisor", name: "Security Advisor", domain: "security", council: "governance",
    maxAutonomy: "L4-simulate", description: "Security advisor for threat detection, vulnerability management, and access control.",
    capabilities: ["threat-detection", "vulnerability-scanning", "access-review", "incident-response", "penetration-testing", "security-posture", "zero-trust-evaluation"],
    memoryScope: "security-domain + restricted-tier", confidenceThreshold: 0.85,
    blockedActions: ["modify-access-controls", "disable-security-features", "expose-credentials"],
    boardroomContributions: ["security-review", "risk-review"],
    requiredInputs: ["security-logs", "access-data"],
    optionalInputs: ["vulnerability-data", "threat-intel", "compliance-data"],
    refusalConditions: ["no-security-logs", "compromised-credentials"],
    maturity: "scaffold", handoffTargets: ["compliance-advisor", "engineering-advisor", "ops-advisor"],
    performanceKpis: ["threat-detection-rate", "mean-time-to-respond", "vulnerability-count"],
  },

  // ── Technical ─────────────────────────────────────────────
  {
    id: "data-advisor", name: "Data Advisor", domain: "data", council: "technical",
    maxAutonomy: "L4-simulate", description: "Data advisor for analytics, data quality, and insights generation.",
    capabilities: ["data-quality-monitoring", "analytics-generation", "reporting", "data-pipeline-health", "anomaly-detection", "trend-analysis", "data-governance"],
    memoryScope: "data-domain + cross-domain-read", confidenceThreshold: 0.75,
    blockedActions: ["delete-data", "modify-schema", "export-pii"],
    boardroomContributions: ["data-review", "analytics-review"],
    requiredInputs: ["data-catalog", "quality-metrics"],
    optionalInputs: ["pipeline-status", "usage-analytics", "schema-registry"],
    refusalConditions: ["no-data-catalog", "stale-metrics"],
    maturity: "scaffold", handoffTargets: ["engineering-advisor", "product-advisor", "compliance-advisor"],
    performanceKpis: ["data-quality-score", "insight-adoption", "pipeline-uptime"],
  },
  {
    id: "product-advisor", name: "Product Advisor", domain: "product", council: "technical",
    maxAutonomy: "L3-draft", description: "Product advisor for feature prioritization, roadmap planning, and user research.",
    capabilities: ["feature-prioritization", "roadmap-planning", "user-research-synthesis", "competitor-analysis", "metric-tracking", "experiment-design", "feedback-aggregation"],
    memoryScope: "product-domain + customer-feedback", confidenceThreshold: 0.7,
    blockedActions: ["commit-roadmap", "launch-feature", "deprecate-feature"],
    boardroomContributions: ["product-review", "strategy-review"],
    requiredInputs: ["feature-backlog", "usage-data"],
    optionalInputs: ["user-research", "competitor-data", "nps-data"],
    refusalConditions: ["no-usage-data"],
    maturity: "scaffold", handoffTargets: ["engineering-advisor", "design-advisor", "data-advisor"],
    performanceKpis: ["feature-adoption", "time-to-value", "customer-impact"],
  },
  {
    id: "engineering-advisor", name: "Engineering Advisor", domain: "engineering", council: "technical",
    maxAutonomy: "L4-simulate", description: "Engineering advisor for architecture, code quality, and infrastructure decisions.",
    capabilities: ["architecture-review", "code-quality-analysis", "incident-diagnosis", "performance-optimization", "tech-debt-tracking", "dependency-analysis", "deployment-planning"],
    memoryScope: "engineering-domain + infrastructure", confidenceThreshold: 0.75,
    blockedActions: ["deploy-to-production", "modify-infrastructure", "revoke-access"],
    boardroomContributions: ["engineering-review", "reliability-review"],
    requiredInputs: ["codebase-metrics", "infrastructure-data"],
    optionalInputs: ["incident-history", "dependency-graph", "ci-cd-data"],
    refusalConditions: ["no-codebase-metrics"],
    maturity: "scaffold", handoffTargets: ["security-advisor", "ops-advisor", "data-advisor"],
    performanceKpis: ["deployment-frequency", "change-failure-rate", "lead-time"],
  },
  {
    id: "design-advisor", name: "Design Advisor", domain: "design", council: "technical",
    maxAutonomy: "L3-draft", description: "Design advisor for UX strategy, design systems, and accessibility.",
    capabilities: ["ux-audit", "design-system-management", "accessibility-review", "user-flow-optimization", "visual-consistency", "prototype-review", "usability-testing"],
    memoryScope: "design-domain + product-data", confidenceThreshold: 0.65,
    blockedActions: ["publish-design-changes", "modify-brand-guidelines"],
    boardroomContributions: ["design-review", "product-review"],
    requiredInputs: ["design-tokens", "component-library"],
    optionalInputs: ["user-testing-data", "analytics-data", "accessibility-reports"],
    refusalConditions: ["no-design-tokens"],
    maturity: "scaffold", handoffTargets: ["product-advisor", "engineering-advisor", "marketing-advisor"],
    performanceKpis: ["usability-score", "accessibility-compliance", "design-consistency"],
  },

  // ── Growth & Partnerships ─────────────────────────────────
  {
    id: "growth-advisor", name: "Growth Advisor", domain: "growth", council: "customer-facing",
    maxAutonomy: "L3-draft", description: "Growth advisor for acquisition, activation, retention, and expansion strategies.",
    capabilities: ["funnel-analysis", "cohort-analysis", "experiment-tracking", "viral-loop-design", "pricing-optimization", "churn-prevention", "expansion-revenue"],
    memoryScope: "growth-domain + cross-domain", confidenceThreshold: 0.7,
    blockedActions: ["modify-pricing", "launch-experiment", "send-mass-communication"],
    boardroomContributions: ["growth-review", "strategy-review"],
    requiredInputs: ["funnel-data", "cohort-data"],
    optionalInputs: ["experiment-data", "pricing-data", "competitor-data"],
    refusalConditions: ["no-funnel-data"],
    maturity: "scaffold", handoffTargets: ["marketing-advisor", "product-advisor", "sales-advisor"],
    performanceKpis: ["acquisition-cost", "activation-rate", "net-revenue-retention"],
  },
  {
    id: "partnerships-advisor", name: "Partnerships Advisor", domain: "partnerships", council: "customer-facing",
    maxAutonomy: "L2-recommend", description: "Partnerships advisor for alliance management, channel strategy, and co-marketing.",
    capabilities: ["partner-scoring", "alliance-health", "channel-performance", "co-marketing-planning", "integration-readiness", "revenue-sharing-analysis", "partner-onboarding"],
    memoryScope: "partnerships-domain + business-data", confidenceThreshold: 0.7,
    blockedActions: ["sign-partnership-agreement", "commit-revenue-share", "terminate-partnership"],
    boardroomContributions: ["partnerships-review", "strategy-review"],
    requiredInputs: ["partner-data", "channel-data"],
    optionalInputs: ["revenue-sharing-data", "integration-data", "market-data"],
    refusalConditions: ["no-partner-data"],
    maturity: "scaffold", handoffTargets: ["business-advisor", "legal-advisor", "sales-advisor"],
    performanceKpis: ["partner-revenue", "partner-satisfaction", "integration-velocity"],
  },
  {
    id: "investor-relations-advisor", name: "Investor Relations Advisor", domain: "investor-relations", council: "governance",
    maxAutonomy: "L2-recommend", description: "IR advisor for stakeholder communications, reporting, and market positioning.",
    capabilities: ["earnings-prep", "stakeholder-communication", "market-analysis", "valuation-modeling", "regulatory-filings", "investor-deck-generation", "sentiment-tracking"],
    memoryScope: "ir-domain + finance-domain + restricted-tier", confidenceThreshold: 0.85,
    blockedActions: ["publish-earnings", "make-forward-statements", "disclose-material-info"],
    boardroomContributions: ["ir-review", "executive-review"],
    requiredInputs: ["financial-statements", "market-data"],
    optionalInputs: ["analyst-reports", "peer-data", "shareholder-data"],
    refusalConditions: ["no-financial-statements", "quiet-period-active"],
    maturity: "scaffold", handoffTargets: ["money-advisor", "legal-advisor", "strategy-advisor"],
    performanceKpis: ["investor-satisfaction", "report-accuracy", "market-perception"],
  },

  // ── Finance Specialists ───────────────────────────────────
  {
    id: "tax-advisor", name: "Tax Advisor", domain: "tax", council: "governance",
    maxAutonomy: "L2-recommend", description: "Tax advisor for tax planning, compliance, and optimization strategies.",
    capabilities: ["tax-estimation", "deduction-identification", "compliance-calendar", "jurisdiction-analysis", "audit-preparation", "entity-structuring", "international-tax"],
    memoryScope: "tax-domain + finance-domain + confidential-tier", confidenceThreshold: 0.85,
    blockedActions: ["file-tax-return", "commit-to-tax-position", "provide-tax-advice-as-professional"],
    boardroomContributions: ["tax-review", "finance-boardroom"],
    requiredInputs: ["income-data", "expense-data", "jurisdiction-data"],
    optionalInputs: ["prior-returns", "entity-structure", "investment-data"],
    refusalConditions: ["no-income-data", "jurisdiction-unknown"],
    maturity: "scaffold", handoffTargets: ["money-advisor", "legal-advisor", "compliance-advisor"],
    performanceKpis: ["tax-savings-identified", "compliance-rate", "filing-accuracy"],
  },
  {
    id: "treasury-advisor", name: "Treasury Advisor", domain: "treasury", council: "governance",
    maxAutonomy: "L3-draft", description: "Treasury advisor for cash management, liquidity, and financial risk.",
    capabilities: ["cash-positioning", "liquidity-forecasting", "fx-risk-management", "bank-relationship", "investment-policy", "debt-management", "working-capital"],
    memoryScope: "treasury-domain + finance-domain + confidential-tier", confidenceThreshold: 0.8,
    blockedActions: ["execute-wire-transfer", "modify-investment-policy", "commit-to-hedge"],
    boardroomContributions: ["treasury-review", "finance-boardroom"],
    requiredInputs: ["cash-position", "bank-data"],
    optionalInputs: ["fx-exposure", "debt-schedule", "investment-portfolio"],
    refusalConditions: ["no-cash-position-data"],
    maturity: "scaffold", handoffTargets: ["money-advisor", "compliance-advisor", "investor-relations-advisor"],
    performanceKpis: ["liquidity-ratio", "cash-forecast-accuracy", "interest-optimization"],
  },
  {
    id: "procurement-advisor", name: "Procurement Advisor", domain: "procurement", council: "internal-ops",
    maxAutonomy: "L3-draft", description: "Procurement advisor for vendor management, sourcing, and cost optimization.",
    capabilities: ["vendor-evaluation", "cost-analysis", "contract-negotiation-prep", "supplier-risk", "spend-analytics", "category-management", "sustainability-scoring"],
    memoryScope: "procurement-domain + operations-data", confidenceThreshold: 0.7,
    blockedActions: ["approve-purchase-over-5000", "sign-vendor-contract", "terminate-supplier"],
    boardroomContributions: ["procurement-review", "ops-review"],
    requiredInputs: ["vendor-data", "spend-data"],
    optionalInputs: ["contract-data", "market-pricing", "sustainability-data"],
    refusalConditions: ["no-vendor-data"],
    maturity: "scaffold", handoffTargets: ["ops-advisor", "legal-advisor", "money-advisor"],
    performanceKpis: ["cost-savings", "vendor-performance", "procurement-cycle-time"],
  },

  // ── Lifestyle & Household ─────────────────────────────────
  {
    id: "facilities-advisor", name: "Facilities Advisor", domain: "facilities", council: "internal-ops",
    maxAutonomy: "L3-draft", description: "Facilities advisor for space management, maintenance, and workplace optimization.",
    capabilities: ["space-planning", "maintenance-scheduling", "energy-optimization", "safety-compliance", "asset-tracking", "move-planning", "sustainability"],
    memoryScope: "facilities-domain + operations-data", confidenceThreshold: 0.7,
    blockedActions: ["approve-renovation", "sign-lease", "modify-safety-system"],
    boardroomContributions: ["facilities-review", "ops-review"],
    requiredInputs: ["space-data", "maintenance-schedule"],
    optionalInputs: ["energy-data", "asset-registry", "occupancy-data"],
    refusalConditions: ["no-space-data"],
    maturity: "scaffold", handoffTargets: ["ops-advisor", "procurement-advisor", "concierge-advisor"],
    performanceKpis: ["space-utilization", "maintenance-response", "energy-efficiency"],
  },
  {
    id: "wellness-advisor", name: "Wellness Advisor", domain: "wellness", council: "customer-facing",
    maxAutonomy: "L2-recommend", description: "Wellness advisor for health routines, stress management, and work-life balance.",
    capabilities: ["routine-optimization", "stress-detection", "activity-tracking", "sleep-analysis", "nutrition-suggestions", "mindfulness-reminders", "work-life-balance"],
    memoryScope: "wellness-domain + confidential-tier", confidenceThreshold: 0.6,
    blockedActions: ["provide-medical-advice", "diagnose-conditions", "prescribe-supplements"],
    boardroomContributions: ["wellness-review"],
    requiredInputs: ["activity-data"],
    optionalInputs: ["sleep-data", "nutrition-data", "calendar-data"],
    refusalConditions: ["no-activity-data", "user-opted-out"],
    maturity: "scaffold", handoffTargets: ["concierge-advisor", "hr-advisor"],
    performanceKpis: ["routine-adherence", "stress-reduction", "user-satisfaction"],
  },
  {
    id: "education-advisor", name: "Education Advisor", domain: "education", council: "customer-facing",
    maxAutonomy: "L3-draft", description: "Education advisor for learning paths, skill development, and knowledge management.",
    capabilities: ["learning-path-design", "skill-gap-analysis", "content-recommendation", "progress-tracking", "certification-planning", "knowledge-mapping", "mentorship-matching"],
    memoryScope: "education-domain + hr-data", confidenceThreshold: 0.65,
    blockedActions: ["enroll-in-paid-course", "commit-training-budget"],
    boardroomContributions: ["learning-review", "people-review"],
    requiredInputs: ["skill-data", "learning-history"],
    optionalInputs: ["role-requirements", "industry-trends", "certification-data"],
    refusalConditions: ["no-skill-data"],
    maturity: "scaffold", handoffTargets: ["hr-advisor", "product-advisor"],
    performanceKpis: ["skill-development-rate", "course-completion", "knowledge-retention"],
  },
  {
    id: "integration-advisor", name: "Integration Advisor", domain: "integration", council: "technical",
    maxAutonomy: "L4-simulate", description: "Integration advisor for API management, connector health, and data flow optimization.",
    capabilities: ["connector-health-monitoring", "api-usage-analysis", "data-flow-optimization", "webhook-management", "rate-limit-planning", "schema-evolution", "migration-planning"],
    memoryScope: "integration-domain + all-connector-metadata", confidenceThreshold: 0.75,
    blockedActions: ["disconnect-integration", "modify-api-keys", "change-webhook-endpoints"],
    boardroomContributions: ["integration-review", "engineering-review"],
    requiredInputs: ["connector-status", "api-usage-data"],
    optionalInputs: ["error-logs", "rate-limit-data", "schema-registry"],
    refusalConditions: ["no-connector-data"],
    maturity: "scaffold", handoffTargets: ["engineering-advisor", "data-advisor", "security-advisor"],
    performanceKpis: ["connector-uptime", "data-sync-latency", "error-rate"],
  },
];

// ── Lookup Functions ────────────────────────────────────────

export function getExtendedAdvisorConfig(id: ExtendedAdvisorId): ExtendedAdvisorConfig {
  const config = FULL_ADVISOR_REGISTRY.find(a => a.id === id);
  if (!config) throw new Error(`Unknown advisor: ${id}`);
  return config;
}

export function getAdvisorsByExtendedDomain(domain: ExtendedAdvisorDomain): ExtendedAdvisorConfig[] {
  return FULL_ADVISOR_REGISTRY.filter(a => a.domain === domain);
}

export function getAdvisorsByCouncil(council: string): ExtendedAdvisorConfig[] {
  return FULL_ADVISOR_REGISTRY.filter(a => a.council === council);
}

export function getAdvisorsByMaturity(maturity: ExtendedAdvisorConfig["maturity"]): ExtendedAdvisorConfig[] {
  return FULL_ADVISOR_REGISTRY.filter(a => a.maturity === maturity);
}

export function getAdvisorHandoffTargets(id: ExtendedAdvisorId): ExtendedAdvisorConfig[] {
  const config = getExtendedAdvisorConfig(id);
  return config.handoffTargets.map(targetId => getExtendedAdvisorConfig(targetId));
}

export function searchAdvisorsByCapability(capability: string): ExtendedAdvisorConfig[] {
  return FULL_ADVISOR_REGISTRY.filter(a => a.capabilities.some(c => c.includes(capability)));
}
