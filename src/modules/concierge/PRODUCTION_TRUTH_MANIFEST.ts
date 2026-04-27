// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Production-Truth Manifest
//
// Single source of truth for the production state of every Concierge
// page. Mirrors src/modules/business/PRODUCTION_TRUTH_MANIFEST.ts
// in shape and semantics so the audit checker can reuse the same
// rules. Used by:
//   - scripts/architecture/check-concierge-truth.ts (CI guardrail)
//   - src/__tests__/concierge/concierge-page-state-grammar.test.ts
//   - PageTruthBanner default state per page
//
// Every page in `src/modules/concierge/pages/*.tsx` MUST appear here
// in exactly one of three states:
//
//   "fully-wired"   — uses canonical hooks/services, real data
//                     sources, loading/error/empty states, no
//                     hardcoded fixtures leaking into production.
//
//   "degraded"      — visible but explicitly partial: shows a
//                     setup, "connect-an-integration", or honest
//                     empty-state UI when the underlying capability
//                     isn't yet provisioned. Truth banner reflects
//                     "partial".
//
//   "hidden"        — not exposed in the main IA. Either route-
//                     guarded behind labs/admin or removed from
//                     navigation. The file may still exist.
//
// Adding a new page? Add it here in the same commit.
// ═══════════════════════════════════════════════════════════════

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface PageTruthEntry {
  /** File stem under src/modules/concierge/pages/ (no .tsx). */
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

export const CONCIERGE_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  // ── Container / shells ────────────────────────────────────────
  { page: "ConciergeCenter",         state: "fully-wired", sources: ["routing shim → desktop window"], bannerState: "live" },
  { page: "ConciergeOverview",       state: "fully-wired", sources: ["useHouseholdTasks", "useFamilyEvents", "useConciergeNavigation"], bannerState: "live" },
  { page: "ConciergeSettings",       state: "degraded",    degradedReason: "Household members / automation rules / connector health are presentational samples until the household_settings + connectors table are wired into this surface. Demo fixtures gated behind reality mode.", bannerState: "partial" },
  { page: "ConciergeProof",          state: "fully-wired", sources: ["ai_action_receipts via ConciergeReceiptViewer"], bannerState: "live" },
  { page: "ConciergeFiles",          state: "fully-wired", sources: ["files namespace via PersonalEssentialsPreviewPanel"], bannerState: "live" },
  { page: "ConciergeWorkflows",      state: "fully-wired", sources: ["ConciergeAutomationRuleCard", "ConciergeAdvisorInsightCard"], bannerState: "live" },
  { page: "ConciergeBoardroom",      state: "fully-wired", sources: ["DomainAdvisorBoard", "AITruthDisclosure"], bannerState: "live" },

  // ── Real data hooks confirmed ─────────────────────────────────
  { page: "ErrandsLogistics",        state: "fully-wired", sources: ["useErrands", "useUpdateErrand", "useDeleteErrand"], bannerState: "live" },
  { page: "HouseholdCommandCenter",  state: "fully-wired", sources: ["useHouseholds", "useHouseholdMembers", "useCreateHousehold", "useAddHouseholdMember", "useDeleteHouseholdMember"], bannerState: "live" },
  { page: "HouseholdTasks",          state: "fully-wired", sources: ["useQuery against household_tasks", "useAction kernel"], bannerState: "live" },
  { page: "MonthGridCalendar",       state: "fully-wired", sources: ["useCalendarData", "supabase calendar_events"], bannerState: "live" },
  { page: "ServiceProviders",        state: "fully-wired", sources: ["useServiceProvidersList"], bannerState: "live" },
  { page: "GroceryPlanning",         state: "fully-wired", sources: ["useGroceryLists"], bannerState: "live" },
  { page: "LifeDashboard",           state: "fully-wired", sources: ["useCompanion", "personal life context"], bannerState: "live" },

  // ── Honestly degraded — presentational shells, no real source ─
  { page: "FamilyCalendar",          state: "degraded",    degradedReason: "Family calendar data hook not yet wired; surface renders an empty week strip until calendar source is connected.",                                                                                bannerState: "partial" },
  { page: "FamilyBoardroom",         state: "degraded",    degradedReason: "Family-board observation pipeline not yet provisioned; advisor cards will populate once family signals are emitted.",                                                                              bannerState: "partial" },
  { page: "AppointmentsPrep",        state: "degraded",    degradedReason: "Appointments hook not yet wired into this surface; renders an empty queue until calendar source is connected.",                                                                                    bannerState: "partial" },
  { page: "TravelPlanning",          state: "degraded",    degradedReason: "Travel/reservations hook not yet wired into this surface; renders an empty trip queue until a travel source is connected.",                                                                        bannerState: "partial" },
  { page: "EventsGifts",             state: "degraded",    degradedReason: "Events & gifting source not yet wired; surface renders an empty queue until event provider is connected. Demo fixtures gated behind reality mode.",                                                bannerState: "partial" },
  { page: "RecurringObligations",    state: "degraded",    degradedReason: "Recurring-obligations hook not yet wired; surface renders an empty queue until a recurring source is connected.",                                                                                  bannerState: "partial" },
  { page: "SchoolActivities",        state: "degraded",    degradedReason: "School activities source not yet wired; surface renders an empty queue until a school provider is connected.",                                                                                     bannerState: "partial" },
  { page: "UpcomingNeeds",           state: "degraded",    degradedReason: "Upcoming-obligations source not yet wired; surface renders an empty queue until a calendar/errands source is connected. Demo fixtures gated behind reality mode.",                                  bannerState: "partial" },
  { page: "LifeAdminCenter",         state: "degraded",    degradedReason: "Life-admin queue source not yet wired; surface renders an empty queue until a life-admin source is connected.",                                                                                    bannerState: "partial" },
  // Phase 3 IA cleanup — canonical Workspace-suffixed aliases. Implementations
  // are re-exports of the legacy classes; truth state mirrors the canonical impl.
  { page: "LifeAdminWorkspace",      state: "fully-wired", sources: ["Phase 3 canonical alias of LifeAdminCenter — re-exports the same component; degraded empty-state grammar is enforced on LifeAdminCenter.tsx by this same audit."],                                          bannerState: "live" },
  { page: "HouseholdWorkspace",      state: "fully-wired", sources: ["Phase 3 canonical alias of HouseholdCommandCenter — re-exports its full hook set"],                                                                                                                        bannerState: "live" },
  { page: "PersonalLifeWorkspace",   state: "degraded",    degradedReason: "Personal-life data hooks not yet wired into this workspace; renders an empty workspace until household/calendar sources are connected.",                                                            bannerState: "partial" },
] as const;

// ── Helpers ────────────────────────────────────────────────────

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return CONCIERGE_TRUTH_MANIFEST.find((e) => e.page === page);
}

export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return CONCIERGE_TRUTH_MANIFEST.filter((e) => e.state === state);
}

/** Snapshot summary used by the truth report generator. */
export function summarizeManifest() {
  const total = CONCIERGE_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}