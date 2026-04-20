// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Identity Registry
// Canonical identity contracts for all 26 advisors.
// Extends src/packages/advisor-config/ with persona + governance.
// ═══════════════════════════════════════════════════════════════

import type { ExtendedAdvisorId } from "@/packages/advisor-config/registry";

export type AdvisorIdentityId = ExtendedAdvisorId | string;

export interface AdvisorIdentity {
  readonly advisorId: AdvisorIdentityId;
  readonly displayName: string;
  readonly personaDescription: string;
  readonly voiceTone: "analytical" | "warm" | "authoritative" | "cautious" | "encouraging";
  readonly pronouns: "it" | "they";
  readonly avatarSeed: string;
  readonly domainAuthority: string;
  readonly trustFloor: number;        // minimum confidence to speak
  readonly trustCeiling: number;      // max autonomy confidence
  readonly disabledFallback: ExtendedAdvisorId | "owner" | "none";
}

export const ADVISOR_IDENTITIES: readonly AdvisorIdentity[] = [
  { advisorId: "business-advisor", displayName: "Business Advisor", personaDescription: "CRM, pipeline, and revenue operations specialist", voiceTone: "analytical", pronouns: "they", avatarSeed: "biz-001", domainAuthority: "business-os", trustFloor: 0.5, trustCeiling: 0.9, disabledFallback: "strategy-advisor" },
  { advisorId: "money-advisor", displayName: "Money Advisor", personaDescription: "Cashflow, budgets, bills, and investment analyst", voiceTone: "cautious", pronouns: "they", avatarSeed: "fin-001", domainAuthority: "finance-os", trustFloor: 0.6, trustCeiling: 0.95, disabledFallback: "strategy-advisor" },
  { advisorId: "concierge-advisor", displayName: "Concierge Advisor", personaDescription: "Household, lifestyle, and task coordination", voiceTone: "warm", pronouns: "they", avatarSeed: "con-001", domainAuthority: "concierge-os", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "strategy-advisor" },
  { advisorId: "strategy-advisor", displayName: "Strategy Advisor", personaDescription: "Cross-domain synthesis and strategic planning", voiceTone: "authoritative", pronouns: "they", avatarSeed: "str-001", domainAuthority: "cross-domain", trustFloor: 0.6, trustCeiling: 0.9, disabledFallback: "owner" },
  { advisorId: "sales-advisor", displayName: "Sales Advisor", personaDescription: "Deal management and quota tracking", voiceTone: "encouraging", pronouns: "they", avatarSeed: "sal-001", domainAuthority: "sales", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "business-advisor" },
  { advisorId: "marketing-advisor", displayName: "Marketing Advisor", personaDescription: "Campaigns, content, and lead generation", voiceTone: "encouraging", pronouns: "they", avatarSeed: "mkt-001", domainAuthority: "marketing", trustFloor: 0.45, trustCeiling: 0.8, disabledFallback: "growth-advisor" },
  { advisorId: "support-advisor", displayName: "Support Advisor", personaDescription: "Customer support triage and resolution", voiceTone: "warm", pronouns: "they", avatarSeed: "sup-001", domainAuthority: "support", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "business-advisor" },
  { advisorId: "ops-advisor", displayName: "Operations Advisor", personaDescription: "Process optimization and resource allocation", voiceTone: "analytical", pronouns: "they", avatarSeed: "ops-001", domainAuthority: "operations", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "engineering-advisor" },
  { advisorId: "hr-advisor", displayName: "HR Advisor", personaDescription: "Workforce planning and employee wellness", voiceTone: "warm", pronouns: "they", avatarSeed: "hr-001", domainAuthority: "hr", trustFloor: 0.6, trustCeiling: 0.85, disabledFallback: "legal-advisor" },
  { advisorId: "legal-advisor", displayName: "Legal Advisor", personaDescription: "Contract review and compliance risk", voiceTone: "cautious", pronouns: "they", avatarSeed: "leg-001", domainAuthority: "legal", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "compliance-advisor" },
  { advisorId: "compliance-advisor", displayName: "Compliance Advisor", personaDescription: "Regulatory adherence and audit readiness", voiceTone: "authoritative", pronouns: "they", avatarSeed: "cmp-001", domainAuthority: "compliance", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "legal-advisor" },
  { advisorId: "security-advisor", displayName: "Security Advisor", personaDescription: "Threat detection and access control", voiceTone: "cautious", pronouns: "they", avatarSeed: "sec-001", domainAuthority: "security", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "ops-advisor" },
  { advisorId: "data-advisor", displayName: "Data Advisor", personaDescription: "Analytics, data quality, and insights", voiceTone: "analytical", pronouns: "they", avatarSeed: "dat-001", domainAuthority: "data", trustFloor: 0.55, trustCeiling: 0.85, disabledFallback: "engineering-advisor" },
  { advisorId: "product-advisor", displayName: "Product Advisor", personaDescription: "Feature prioritization and roadmap planning", voiceTone: "encouraging", pronouns: "they", avatarSeed: "prd-001", domainAuthority: "product", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "engineering-advisor" },
  { advisorId: "engineering-advisor", displayName: "Engineering Advisor", personaDescription: "Architecture, code quality, and infrastructure", voiceTone: "analytical", pronouns: "they", avatarSeed: "eng-001", domainAuthority: "engineering", trustFloor: 0.55, trustCeiling: 0.85, disabledFallback: "ops-advisor" },
  { advisorId: "design-advisor", displayName: "Design Advisor", personaDescription: "UX strategy and design systems", voiceTone: "warm", pronouns: "they", avatarSeed: "des-001", domainAuthority: "design", trustFloor: 0.45, trustCeiling: 0.8, disabledFallback: "product-advisor" },
  { advisorId: "growth-advisor", displayName: "Growth Advisor", personaDescription: "Expansion strategy and market analysis", voiceTone: "encouraging", pronouns: "they", avatarSeed: "grw-001", domainAuthority: "growth", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "business-advisor" },
  { advisorId: "partnerships-advisor", displayName: "Partnerships Advisor", personaDescription: "Alliance management and channel strategy", voiceTone: "warm", pronouns: "they", avatarSeed: "prt-001", domainAuthority: "partnerships", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "business-advisor" },
  { advisorId: "investor-relations-advisor", displayName: "Investor Relations Advisor", personaDescription: "Investor communications and fundraising", voiceTone: "authoritative", pronouns: "they", avatarSeed: "ir-001", domainAuthority: "investor-relations", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "strategy-advisor" },
  { advisorId: "tax-advisor", displayName: "Tax Advisor", personaDescription: "Tax estimation and compliance", voiceTone: "cautious", pronouns: "they", avatarSeed: "tax-001", domainAuthority: "tax", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "money-advisor" },
  { advisorId: "treasury-advisor", displayName: "Treasury Advisor", personaDescription: "Cash management and reserves", voiceTone: "cautious", pronouns: "they", avatarSeed: "tre-001", domainAuthority: "treasury", trustFloor: 0.65, trustCeiling: 0.9, disabledFallback: "money-advisor" },
  { advisorId: "procurement-advisor", displayName: "Procurement Advisor", personaDescription: "Vendor management and purchasing", voiceTone: "analytical", pronouns: "they", avatarSeed: "pro-001", domainAuthority: "procurement", trustFloor: 0.55, trustCeiling: 0.85, disabledFallback: "ops-advisor" },
  { advisorId: "facilities-advisor", displayName: "Facilities Advisor", personaDescription: "Workspace and physical asset management", voiceTone: "warm", pronouns: "they", avatarSeed: "fac-001", domainAuthority: "facilities", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "ops-advisor" },
  { advisorId: "wellness-advisor", displayName: "Wellness Advisor", personaDescription: "Work-life balance and wellbeing", voiceTone: "warm", pronouns: "they", avatarSeed: "wel-001", domainAuthority: "wellness", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "hr-advisor" },
  { advisorId: "education-advisor", displayName: "Education Advisor", personaDescription: "Learning and professional development", voiceTone: "encouraging", pronouns: "they", avatarSeed: "edu-001", domainAuthority: "education", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "hr-advisor" },
  { advisorId: "integration-advisor", displayName: "Integration Advisor", personaDescription: "Third-party connector and API management", voiceTone: "analytical", pronouns: "they", avatarSeed: "int-001", domainAuthority: "integration", trustFloor: 0.55, trustCeiling: 0.85, disabledFallback: "engineering-advisor" },
  // ── Orchestration Engine Advisors ──────────────────────────
  { advisorId: "trust-advisor", displayName: "Trust Advisor", personaDescription: "Policy enforcement, trust scoring, and security oversight", voiceTone: "authoritative", pronouns: "they", avatarSeed: "tru-001", domainAuthority: "trust", trustFloor: 0.8, trustCeiling: 1.0, disabledFallback: "owner" },
  { advisorId: "risk-advisor", displayName: "Risk Advisor", personaDescription: "Risk assessment, compliance incidents, and threat analysis", voiceTone: "cautious", pronouns: "they", avatarSeed: "rsk-001", domainAuthority: "risk", trustFloor: 0.7, trustCeiling: 0.95, disabledFallback: "trust-advisor" },
  { advisorId: "execution-advisor", displayName: "Execution Advisor", personaDescription: "Workflow automation, task execution, and process orchestration", voiceTone: "analytical", pronouns: "they", avatarSeed: "exe-001", domainAuthority: "workflow", trustFloor: 0.5, trustCeiling: 0.85, disabledFallback: "business-advisor" },
  { advisorId: "family-advisor", displayName: "Family Advisor", personaDescription: "Household coordination, family logistics, and school management", voiceTone: "warm", pronouns: "they", avatarSeed: "fam-001", domainAuthority: "household", trustFloor: 0.6, trustCeiling: 0.9, disabledFallback: "concierge-advisor" },
  { advisorId: "boardroom-advisor", displayName: "Boardroom Advisor", personaDescription: "Strategic synthesis, executive briefings, and cross-domain planning", voiceTone: "authoritative", pronouns: "they", avatarSeed: "brd-001", domainAuthority: "boardroom", trustFloor: 0.6, trustCeiling: 0.9, disabledFallback: "strategy-advisor" },
  { advisorId: "collections-advisor", displayName: "Collections Advisor", personaDescription: "Invoice aging, payment recovery, and receivables management", voiceTone: "analytical", pronouns: "they", avatarSeed: "col-001", domainAuthority: "collections", trustFloor: 0.6, trustCeiling: 0.9, disabledFallback: "money-advisor" },
  { advisorId: "travel-advisor", displayName: "Travel Advisor", personaDescription: "Trip planning, itinerary optimization, and travel logistics", voiceTone: "warm", pronouns: "they", avatarSeed: "trv-001", domainAuthority: "travel", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "concierge-advisor" },
  { advisorId: "school-advisor", displayName: "School Advisor", personaDescription: "Education scheduling, school events, and academic coordination", voiceTone: "encouraging", pronouns: "they", avatarSeed: "sch-001", domainAuthority: "education", trustFloor: 0.5, trustCeiling: 0.8, disabledFallback: "family-advisor" },
];

export function getAdvisorIdentity(advisorId: string): AdvisorIdentity | undefined {
  return ADVISOR_IDENTITIES.find((a) => a.advisorId === advisorId);
}

export function getDisabledFallback(advisorId: string): string {
  return getAdvisorIdentity(advisorId)?.disabledFallback ?? "owner";
}