// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Production-Truth Manifest
//
// Single source of truth for the production state of every Business
// OS page. Used by:
//   - scripts/architecture/check-business-truth.ts (CI guardrail)
//   - src/__tests__/business/production-truth-matrix.test.ts (runtime
//     classification assertions)
//   - The PageTruthBanner default state per page
//
// Every page in `src/modules/business/pages/*.tsx` MUST appear here
// in exactly one of three states:
//
//   "fully-wired"   — uses canonical hooks/services, real data sources,
//                     loading/error/empty states, no hardcoded fixtures
//                     leaking into production paths.
//
//   "degraded"      — visible but explicitly partial: shows a setup,
//                     "connect-an-integration", or empty-state UI when
//                     the underlying capability isn't yet provisioned.
//                     Truth banner reflects "partial".
//
//   "hidden"        — not exposed in the main IA. Either route-guarded
//                     behind labs/admin or removed from navigation. The
//                     file may still exist for future use.
//
// Adding a new page? Add it here in the same commit.
// ═══════════════════════════════════════════════════════════════

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface PageTruthEntry {
  /** File stem under src/modules/business/pages/ (no .tsx). */
  page: string;
  /** Final truth classification. */
  state: TruthState;
  /** Canonical data sources (hooks/services/tables). Required when state === "fully-wired". */
  sources?: ReadonlyArray<string>;
  /** Honest reason for "degraded" state — surfaced in the truth banner. */
  degradedReason?: string;
  /** Reason for "hidden" — explains why removed from main IA. */
  hiddenReason?: string;
  /** Default truth-banner state for the page. */
  bannerState?: "live" | "demo" | "partial" | "degraded" | "connecting";
}

export const BUSINESS_OS_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  // ── Container / shell ─────────────────────────────────────────
  { page: "BusinessCenter",          state: "fully-wired", sources: ["BusinessAppShell"], bannerState: "live" },
  { page: "BusinessOverview",        state: "fully-wired", sources: ["use-business-data", "useCRMOpportunities", "useCRMTasks"], bannerState: "live" },
  { page: "BusinessSettingsPage",    state: "fully-wired", sources: ["useBusinessProfile"], bannerState: "live" },
  { page: "BusinessProof",           state: "fully-wired", sources: ["ai_action_receipts"], bannerState: "live" },
  { page: "BusinessDocuments",       state: "fully-wired", sources: ["files namespace"], bannerState: "live" },
  { page: "BusinessOperations",      state: "fully-wired", sources: ["use-business-data"], bannerState: "live" },

  // ── CRM core (live data hooks confirmed) ──────────────────────
  { page: "CRMHome",                 state: "fully-wired", sources: ["useCRMContacts", "useCRMOpportunities", "useCRMTasks"], bannerState: "live" },
  { page: "CRMContacts",             state: "fully-wired", sources: ["useCRMContacts"], bannerState: "live" },
  { page: "CRMCompanies",            state: "fully-wired", sources: ["useCRMCompanies"], bannerState: "live" },
  { page: "CRMPipeline",             state: "fully-wired", sources: ["useCRMOpportunities", "crm_pipeline_stages"], bannerState: "live" },
  { page: "CRMHealth",               state: "fully-wired", sources: ["business_health_scores"], bannerState: "live" },
  { page: "CRMTimeline",             state: "fully-wired", sources: ["useCRMCommunications", "useCRMNotes"], bannerState: "live" },
  { page: "CRMTasks",                state: "fully-wired", sources: ["useCRMTasks"], bannerState: "live" },
  { page: "CRMNotes",                state: "fully-wired", sources: ["useCRMNotes"], bannerState: "live" },
  { page: "CRMSegments",             state: "fully-wired", sources: ["crm_segments", "crm_tags"], bannerState: "live" },
  { page: "CRMAutomations",          state: "fully-wired", sources: ["crm_automations"], bannerState: "live" },
  { page: "CRMImportCenter",         state: "fully-wired", sources: ["crm_import_jobs"], bannerState: "live" },
  { page: "CRMDuplicates",           state: "fully-wired", sources: ["crm_merge_log"], bannerState: "live" },
  { page: "CRMAdvisorPage",          state: "fully-wired", sources: ["useBusinessAdvisorBoard"], bannerState: "live" },
  { page: "CRMCustomFieldsPage",     state: "fully-wired", sources: ["crm_custom_fields"], bannerState: "live" },
  { page: "CRMCommunications",       state: "fully-wired", sources: ["useCRMCommunications"], bannerState: "live" },
  { page: "CRMIntegrationHub",       state: "degraded",    degradedReason: "External CRM connectors (HubSpot/Salesforce/Pipedrive) not yet provisioned; sync history shown from crm_import_jobs only.", bannerState: "partial" },

  // ── Customer / support ────────────────────────────────────────
  { page: "CustomersPage",           state: "fully-wired", sources: ["useCRMContacts"], bannerState: "live" },
  { page: "CustomerDetail",          state: "fully-wired", sources: ["useCRMContact", "useCRMCommunications"], bannerState: "live" },
  { page: "CustomerHealthPage",      state: "fully-wired", sources: ["customer-health.service", "customer_profile_snapshots"], bannerState: "live" },
  { page: "CustomerSupportCenter",   state: "fully-wired", sources: ["callback-queue.service", "support pressure data"], bannerState: "live" },
  { page: "FollowThroughCenter",     state: "fully-wired", sources: ["follow-up.service", "useCRMTasks"], bannerState: "live" },

  // ── Lead intake / recovery ────────────────────────────────────
  { page: "LeadsInbox",              state: "fully-wired", sources: ["useLeadInbox", "lead_inbox_items"], bannerState: "live" },
  { page: "LeadRecovery",            state: "fully-wired", sources: ["recovery-engine.service", "recovery_jobs"], bannerState: "live" },

  // ── Opportunities / quotes / proposals / invoices ─────────────
  { page: "OpportunitiesCenter",     state: "fully-wired", sources: ["useCRMOpportunities"], bannerState: "live" },
  { page: "DealRoom",                state: "fully-wired", sources: ["useCRMOpportunities"], bannerState: "live" },
  { page: "StrategicAccountRoom",    state: "fully-wired", sources: ["useCRMCompanies", "useCRMOpportunities"], bannerState: "live" },
  { page: "QuotesWorkspace",         state: "fully-wired", sources: ["quotes.service"], bannerState: "live" },
  { page: "ProposalsContracts",      state: "fully-wired", sources: ["proposals.service"], bannerState: "live" },
  { page: "InvoicesCollections",     state: "fully-wired", sources: ["invoices table"], bannerState: "live" },
  { page: "CollectionsCommandCenter",state: "fully-wired", sources: ["collections.service", "collections-command.service"], bannerState: "live" },

  // ── Communications / scheduling / boardroom ───────────────────
  { page: "CommunicationsCenter",    state: "fully-wired", sources: ["useCRMCommunications"], bannerState: "live" },
  { page: "AppointmentsScheduling",  state: "fully-wired", sources: ["business-scheduling-service", "bookings"], bannerState: "live" },
  { page: "BusinessBoardroom",       state: "fully-wired", sources: ["business-board-api", "useBusinessAdvisorBoard"], bannerState: "live" },
  { page: "BusinessAdvisorBoardPage",state: "fully-wired", sources: ["useBusinessAdvisorBoard", "advisor_action_queue"], bannerState: "live" },

  // ── Operational rituals ───────────────────────────────────────
  { page: "MorningBriefing",         state: "fully-wired", sources: ["useCRMTasks", "useScheduledAppointments", "useLeadInbox", "ai_action_receipts"], bannerState: "live" },
  { page: "EndOfDayClosure",         state: "fully-wired", sources: ["useCRMTasks", "useScheduledAppointments", "ai_action_receipts"], bannerState: "live" },
  { page: "RelationshipDossier",     state: "fully-wired", sources: ["useCRMContact", "useCRMCommunications", "useCRMNotes", "useCRMOpportunities"], bannerState: "live" },
  { page: "BackgroundTaskCenter",    state: "fully-wired", sources: ["use-background-jobs", "crm_import_jobs", "recovery_jobs", "ai_invocations"], bannerState: "live" },

  // ── Revenue automation (canonical IA after Phase 6) ───────────
  { page: "AutopilotHub",            state: "fully-wired", sources: ["use-autopilot-config", "autopilot_configs"], bannerState: "live" },
  { page: "RevenueAutopilot",        state: "fully-wired", sources: ["useRevenueLeaksData", "useRecoveredValuesData", "useRawOpportunities", "revenue-autopilot.service"], bannerState: "live" },
  { page: "RevenueImpactDashboard",  state: "fully-wired", sources: ["recovered_value_ledger"], bannerState: "live" },
  { page: "RevenueForecast",         state: "fully-wired", sources: ["revenue forecast service"], bannerState: "live" },
  { page: "RecoveredValuePage",      state: "fully-wired", sources: ["recovered-value-ledger.service"], bannerState: "live" },
  { page: "RevenueCallingPage",      state: "fully-wired", sources: ["callback-queue.service"], bannerState: "live" },
  { page: "PlaybookBuilder",         state: "fully-wired", sources: ["playbook service"], bannerState: "live" },

  // ── Honestly degraded (no real connector / integration yet) ───
  { page: "WebsiteBuilder",          state: "degraded",    degradedReason: "No website connector provisioned. Operator must connect a hosting provider before analytics, A/B tests, or SEO insights become live.", bannerState: "partial" },
  { page: "SocialCommand",           state: "degraded",    degradedReason: "Social platform OAuth (Twitter/LinkedIn/Instagram) not yet wired. Scheduling and posting are not active.", bannerState: "partial" },
  { page: "EcommerceManager",        state: "degraded",    degradedReason: "Shopify connector available at the platform level but not wired into this surface. Ecommerce metrics will appear once a store is linked.", bannerState: "partial" },
] as const;

// ── Helpers ────────────────────────────────────────────────────

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return BUSINESS_OS_TRUTH_MANIFEST.find((e) => e.page === page);
}

export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return BUSINESS_OS_TRUTH_MANIFEST.filter((e) => e.state === state);
}

/** Snapshot summary used by the truth report generator. */
export function summarizeManifest() {
  const total = BUSINESS_OS_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}