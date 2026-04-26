// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Business Domain: Business Profile types
//
// Canonical types describing a business archetype/profile, its
// adapted UI, advisors, KPIs, and cross-domain signals.
//
// Originally lifted from src/domains/engines/business-profile-engine.ts
// during the Business OS canonical architecture reorganization.
// The engine now re-exports these from here.
// ═══════════════════════════════════════════════════════════════

export const ALL_ARCHETYPES = [
  "ecommerce",
  "brick-and-mortar",
  "service",
  "employee-based",
  "appointment-based",
  "agency",
  "professional-practice",
  "hybrid",
  "multi-location",
  "product-service",
  "membership",
  "marketplace",
] as const;

export type ProfileArchetype = (typeof ALL_ARCHETYPES)[number];

export interface ArchetypeWeights {
  ecommerce: number;
  "brick-and-mortar": number;
  service: number;
  "employee-based": number;
  "appointment-based": number;
  agency: number;
  "professional-practice": number;
  hybrid: number;
  "multi-location": number;
  "product-service": number;
  membership: number;
  marketplace: number;
}

export interface OperatingFlags {
  hasEmployees: boolean;
  hasAppointments: boolean;
  hasEcommerce: boolean;
  hasLocations: boolean;
  sendsQuotes: boolean;
  sendsInvoices: boolean;
  hasRecurringRevenue: boolean;
  hasCollections: boolean;
  hasLocalPresence: boolean;
  hasDigitalProducts: boolean;
  hasTeam: boolean;
  hasProposals: boolean;
}

export interface SidebarPriority {
  groupOrder: string[];
  hiddenGroups: string[];
  badgeOverrides: Record<string, { label: string; severity?: "warning" | "critical" }>;
}

export interface HomeWidgetConfig {
  /** Top-priority widget IDs */
  primary: string[];
  /** Lower-priority widget IDs */
  secondary: string[];
  /** Explicitly hidden widget IDs */
  hidden: string[];
}

export interface CRMAdaptation {
  language: {
    contactLabel: string;
    dealLabel: string;
    pipelineLabel: string;
    proposalLabel: string;
  };
  priorityFields: string[];
  hiddenFields: string[];
  defaultSegments: string[];
  pipelineStages: string[];
}

export interface AdvisorSpec {
  id: string;
  name: string;
  specialty: string;
  accent: string;
  portraitSeed: number;
  affinityScore: number;
}

export interface BoardroomFocus {
  focusAreas: string[];
  kpiEmphasis: string[];
  reviewMode: string;
  agendaPriorities: string[];
}

export interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  affinityScore: number;
  archetype: ProfileArchetype;
}

export interface CrossDomainSignals {
  finance: { emphasis: string; kpis: string[] };
  concierge: { emphasis: string; triggers: string[] };
}

export interface BusinessProfileResult {
  weights: ArchetypeWeights;
  primaryMode: ProfileArchetype;
  secondaryModes: ProfileArchetype[];
  operatingFlags: OperatingFlags;
  sidebar: SidebarPriority;
  homeWidgets: HomeWidgetConfig;
  crm: CRMAdaptation;
  advisors: AdvisorSpec[];
  boardroom: BoardroomFocus;
  workflows: WorkflowSuggestion[];
  kpis: string[];
  manualOverrides: Partial<ArchetypeWeights>;
  /** 0–1 confidence in the computed profile */
  profileConfidence: number;
  crossDomainSignals: CrossDomainSignals;
}