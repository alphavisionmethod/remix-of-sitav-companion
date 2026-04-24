// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor System Registry (Static Manifest)
//
// The 9 Business System advisors. This is a TYPED, COMPILE-TIME
// mirror of the database `advisor_registry` rows for these advisors,
// used by the shared runtime, UI shell, and DoD verification gate.
//
// Source of truth at runtime is the database; this manifest is used
// for routing, type-safety, and verification.
// ═══════════════════════════════════════════════════════════════

export type BusinessAdvisorId =
  | "sales-advisor"
  | "customer-service-advisor"
  | "cfo-advisor"
  | "marketing-advertising-advisor"
  | "growth-advisor"
  | "tech-advisor"
  | "imports-exports-advisor"
  | "taxes-laws-advisor"
  | "ceo-advisor";

export type AdvisorAuthorityLevel =
  | "L1-suggest"        // Suggest only — never drafts external content
  | "L2-recommend"      // Structured recommendations + risk/explanation
  | "L3-draft"          // May draft outputs the user reviews/sends
  | "L4-simulate"       // May run scenarios + produce action plans
  | "L5-approval-ready"; // May execute after explicit approval

export interface BusinessAdvisorManifest {
  readonly id: BusinessAdvisorId;
  readonly displayName: string;
  readonly tagline: string;
  readonly mission: string;
  readonly authority: AdvisorAuthorityLevel;
  readonly riskTier: "low" | "medium" | "high" | "critical";
  readonly sensitive: boolean;
  readonly professionalDisclaimer: boolean;
  readonly contextSources: readonly string[];
  readonly capabilities: readonly string[];
  readonly blockedActions: readonly string[];
  readonly buildOrder: number;
  readonly icon: string;
  readonly accent: string; // semantic token name (no raw colors)
}

export const BUSINESS_ADVISORS: Readonly<Record<BusinessAdvisorId, BusinessAdvisorManifest>> = {
  "sales-advisor": {
    id: "sales-advisor",
    displayName: "Sales Advisor",
    tagline: "Pipeline strategy, scripts, and follow-through",
    mission: "Help close deals with sound qualification, sharp objection handling, and disciplined follow-up.",
    authority: "L3-draft",
    riskTier: "medium",
    sensitive: false,
    professionalDisclaimer: false,
    contextSources: ["crm_records", "leads", "pipeline", "quotes", "offers"],
    capabilities: ["lead_qualification", "objection_handling", "sales_script_drafting", "pipeline_analysis", "follow_up_planning", "pricing_guidance", "offer_design"],
    blockedActions: ["send_external_email", "modify_pricing_live", "commit_deal"],
    buildOrder: 1,
    icon: "Handshake",
    accent: "primary",
  },
  "customer-service-advisor": {
    id: "customer-service-advisor",
    displayName: "Customer Service Advisor",
    tagline: "Response drafting, escalation, and CSAT lifts",
    mission: "Resolve issues faster, raise CSAT, and protect customer trust through better support workflows.",
    authority: "L3-draft",
    riskTier: "medium",
    sensitive: false,
    professionalDisclaimer: false,
    contextSources: ["support_tickets", "customer_records", "sla_policies"],
    capabilities: ["response_drafting", "escalation_routing", "csat_analysis", "complaint_triage", "support_workflow_design"],
    blockedActions: ["send_external_email", "close_ticket_autonomous", "issue_refund"],
    buildOrder: 2,
    icon: "LifeBuoy",
    accent: "primary",
  },
  "cfo-advisor": {
    id: "cfo-advisor",
    displayName: "CFO Advisor",
    tagline: "Cash, budgets, margins, and scenarios",
    mission: "Provide rigorous financial analysis and decision structure — never executes financial moves autonomously.",
    authority: "L2-recommend",
    riskTier: "high",
    sensitive: true,
    professionalDisclaimer: false,
    contextSources: ["financial_statements", "budgets", "transactions", "forecasts"],
    capabilities: ["cash_flow_analysis", "budget_planning", "scenario_modelling", "margin_analysis", "financial_risk_review", "spend_review"],
    blockedActions: ["execute_payment", "modify_budget_live", "close_books", "file_returns"],
    buildOrder: 3,
    icon: "LineChart",
    accent: "primary",
  },
  "marketing-advertising-advisor": {
    id: "marketing-advertising-advisor",
    displayName: "Marketing & Advertising Advisor",
    tagline: "Positioning, campaigns, creative, and tests",
    mission: "Sharpen positioning, plan campaigns, and design experiments — drafts only, no live launches.",
    authority: "L3-draft",
    riskTier: "medium",
    sensitive: false,
    professionalDisclaimer: false,
    contextSources: ["campaigns", "funnels", "content_assets", "audience_data"],
    capabilities: ["campaign_planning", "creative_briefing", "positioning_analysis", "copy_drafting", "channel_recommendation", "ad_test_planning"],
    blockedActions: ["launch_paid_campaign", "modify_brand_assets_live", "send_external_email"],
    buildOrder: 4,
    icon: "Megaphone",
    accent: "primary",
  },
  "growth-advisor": {
    id: "growth-advisor",
    displayName: "Growth Advisor",
    tagline: "Loops, activation, retention, and experiments",
    mission: "Find the highest-leverage growth moves through funnel, cohort, and loop analysis.",
    authority: "L2-recommend",
    riskTier: "medium",
    sensitive: false,
    professionalDisclaimer: false,
    contextSources: ["analytics", "funnel_metrics", "cohorts", "experiments"],
    capabilities: ["funnel_analysis", "activation_planning", "retention_strategy", "experiment_design", "loop_identification", "scaling_priorities"],
    blockedActions: ["modify_pricing_live", "launch_external_experiment", "commit_strategic_shift"],
    buildOrder: 5,
    icon: "TrendingUp",
    accent: "primary",
  },
  "tech-advisor": {
    id: "tech-advisor",
    displayName: "Tech Advisor",
    tagline: "Architecture, tradeoffs, and delivery",
    mission: "Provide architecture review, tooling recommendations, and tech-risk reasoning.",
    authority: "L3-draft",
    riskTier: "medium",
    sensitive: false,
    professionalDisclaimer: false,
    contextSources: ["product_roadmap", "tech_stack", "architecture_docs", "incidents"],
    capabilities: ["architecture_review", "tradeoff_analysis", "debugging_strategy", "tooling_recommendation", "scaling_planning", "tech_risk_review"],
    blockedActions: ["deploy_production", "modify_infra_live", "commit_breaking_change"],
    buildOrder: 6,
    icon: "Cpu",
    accent: "primary",
  },
  "imports-exports-advisor": {
    id: "imports-exports-advisor",
    displayName: "Imports & Exports Advisor",
    tagline: "Trade workflows, sourcing, logistics, documents",
    mission: "Plan cross-border operations, surface documentation needs, and structure trade decisions.",
    authority: "L2-recommend",
    riskTier: "high",
    sensitive: true,
    professionalDisclaimer: false,
    contextSources: ["trade_records", "logistics", "supplier_data", "customs_docs"],
    capabilities: ["trade_workflow_design", "sourcing_analysis", "logistics_planning", "documentation_guidance", "cross_border_planning"],
    blockedActions: ["execute_customs_filing", "commit_supplier_contract", "modify_shipping_live"],
    buildOrder: 7,
    icon: "Ship",
    accent: "primary",
  },
  "taxes-laws-advisor": {
    id: "taxes-laws-advisor",
    displayName: "Taxes & Laws Advisor",
    tagline: "Issue spotting, preparation, and structure",
    mission: "Provide structured preparation and issue-spotting guidance. NOT a substitute for licensed professionals.",
    authority: "L1-suggest",
    riskTier: "critical",
    sensitive: true,
    professionalDisclaimer: true,
    contextSources: ["tax_documents", "jurisdiction_data", "compliance_records"],
    capabilities: ["compliance_checklist", "issue_spotting", "preparation_guidance", "decision_structure_support", "document_organization"],
    blockedActions: ["file_tax_return", "provide_legal_advice", "submit_legal_filing", "execute_compliance_action"],
    buildOrder: 8,
    icon: "Scale",
    accent: "primary",
  },
  "ceo-advisor": {
    id: "ceo-advisor",
    displayName: "CEO Advisor",
    tagline: "Cross-function synthesis and tradeoffs",
    mission: "Synthesize across all advisors to support strategic prioritization and executive decisions.",
    authority: "L2-recommend",
    riskTier: "high",
    sensitive: true,
    professionalDisclaimer: false,
    contextSources: ["all_advisor_outputs", "business_metrics", "goals", "decisions_log"],
    capabilities: ["strategic_synthesis", "prioritization", "tradeoff_analysis", "cross_function_synthesis", "decision_support", "leadership_thinking"],
    blockedActions: ["commit_strategic_shift", "execute_org_change", "make_external_announcement"],
    buildOrder: 9,
    icon: "Crown",
    accent: "primary",
  },
} as const;

export const BUSINESS_ADVISOR_LIST: readonly BusinessAdvisorManifest[] =
  Object.values(BUSINESS_ADVISORS).sort((a, b) => a.buildOrder - b.buildOrder);

export function getBusinessAdvisor(id: string): BusinessAdvisorManifest | undefined {
  return (BUSINESS_ADVISORS as Record<string, BusinessAdvisorManifest>)[id];
}

export function isBusinessAdvisor(id: string): id is BusinessAdvisorId {
  return id in BUSINESS_ADVISORS;
}