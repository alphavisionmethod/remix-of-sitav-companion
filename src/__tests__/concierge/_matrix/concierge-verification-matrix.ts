// ═══════════════════════════════════════════════════════════════
// Concierge OS — Verification Matrix
// ───────────────────────────────────────────────────────────────
// Single source of truth classifying every Concierge OS surface
// (page, service, route, trust flow, integration seam, adaptive
// behavior, E2E journey) by its verification state. Mirrors the
// Business OS matrix shape so the same CI walker can validate it.
//
// Drives:
//   • src/__tests__/concierge/_matrix/matrix.test.ts
//   • scripts/architecture/check-concierge-coverage.ts (CI gate)
//   • generated/audits/SITA_OS_SERIOUS_VERIFICATION_REPORT.md
//
// `status: "missing"` is allowed and tracked; CI warns until a
// hardening phase fills it. Status downgrades fail CI.
// ═══════════════════════════════════════════════════════════════

export type CoverageStatus =
  | "missing"        // no test exists yet (tracked debt)
  | "partial"        // limited / heuristic only
  | "behavioral"     // unit/integration test asserting behavior
  | "e2e";           // exercised by a Playwright spec

export type Priority = "P0" | "P1" | "P2";

export interface SurfaceEntry {
  id: string;
  kind: "page" | "service" | "route" | "trust" | "integration" | "adaptive" | "e2e";
  /** Path of the implementation file or route (relative to repo root). */
  ref: string;
  /** Path(s) of the test file(s) that cover it (relative to repo root). */
  tests: string[];
  status: CoverageStatus;
  priority: Priority;
  notes?: string;
}

// ── Pages (high-value Concierge OS surfaces) ──────────────────
// Tests added in Phase 5 are listed here as "missing" until then.
export const PAGE_SURFACES: SurfaceEntry[] = [
  { id: "page.household-command-center", kind: "page", ref: "src/modules/concierge/pages/HouseholdCommandCenter.tsx", tests: ["src/__tests__/concierge/pages/household-command-center.test.tsx"], status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P0" },
  { id: "page.life-admin-center",        kind: "page", ref: "src/modules/concierge/pages/LifeAdminCenter.tsx",       tests: ["src/__tests__/concierge/pages/life-admin-center.test.tsx"],       status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P0" },
  { id: "page.appointments-prep",        kind: "page", ref: "src/modules/concierge/pages/AppointmentsPrep.tsx",      tests: ["src/__tests__/concierge/pages/appointments-prep.test.tsx"],       status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P0" },
  { id: "page.recurring-obligations",    kind: "page", ref: "src/modules/concierge/pages/RecurringObligations.tsx",  tests: ["src/__tests__/concierge/pages/recurring-obligations.test.tsx"],   status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P0" },
  { id: "page.service-providers",        kind: "page", ref: "src/modules/concierge/pages/ServiceProviders.tsx",      tests: ["src/__tests__/concierge/pages/service-providers.test.tsx"],       status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P0" },
  { id: "page.family-calendar",          kind: "page", ref: "src/modules/concierge/pages/FamilyCalendar.tsx",        tests: ["src/__tests__/concierge/pages/family-calendar.test.tsx"],         status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P1" },
  { id: "page.travel-planning",          kind: "page", ref: "src/modules/concierge/pages/TravelPlanning.tsx",        tests: ["src/__tests__/concierge/pages/travel-planning.test.tsx"],         status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P1" },
  { id: "page.errands-logistics",        kind: "page", ref: "src/modules/concierge/pages/ErrandsLogistics.tsx",      tests: ["src/__tests__/concierge/pages/errands-logistics.test.tsx"],       status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P1" },
  { id: "page.grocery-planning",         kind: "page", ref: "src/modules/concierge/pages/GroceryPlanning.tsx",       tests: ["src/__tests__/concierge/pages/grocery-planning.test.tsx"],        status: "behavioral", notes: "Phase 5: page renders honest empty/loading state under canonical Supabase mock", priority: "P1" },
  { id: "page.concierge-page-state",     kind: "page", ref: "src/modules/concierge/pages",                           tests: ["src/__tests__/concierge/concierge-page-state-grammar.test.ts"],   status: "behavioral", priority: "P0", notes: "page-state grammar audit covers every page in the dir" },
];

// ── Services / engines (concierge-os) ─────────────────────────
// Services with non-trivial deterministic logic worth dedicated tests.
export const SERVICE_SURFACES: SurfaceEntry[] = [
  { id: "svc.household-overview",   kind: "service", ref: "src/lib/services/concierge-os/household-overview.service.ts",   tests: ["src/__tests__/concierge/services/household-overview.service.test.ts"],   status: "behavioral", priority: "P0", notes: "Phase 3: deterministic active/overdue/topPriorities coverage" },
  { id: "svc.household-ops",        kind: "service", ref: "src/lib/services/concierge-os/household-ops.service.ts",        tests: ["src/__tests__/concierge/services/household-ops.service.test.ts"],        status: "behavioral", priority: "P0", notes: "Phase 3: KPI completion-rate + load distribution" },
  { id: "svc.conflict-detector",    kind: "service", ref: "src/lib/services/concierge-os/conflict-detector.service.ts",    tests: ["src/__tests__/concierge/services/conflict-detector.service.test.ts"],    status: "behavioral", priority: "P0", notes: "Phase 3: overlap detection + auto-resolvability bands" },
  { id: "svc.load-balance",         kind: "service", ref: "src/lib/services/concierge-os/load-balance.service.ts",         tests: ["src/__tests__/concierge/services/load-balance.service.test.ts"],         status: "behavioral", priority: "P0", notes: "Phase 3: per-member hours + rebalance suggestion threshold" },
  { id: "svc.event-continuity",     kind: "service", ref: "src/lib/services/concierge-os/event-continuity.service.ts",     tests: ["src/__tests__/concierge/services/event-continuity.service.test.ts"],     status: "behavioral", priority: "P1", notes: "Phase 4: event plan factory + mock plans" },
  { id: "svc.travel-continuity",    kind: "service", ref: "src/lib/services/concierge-os/travel-continuity.service.ts",    tests: ["src/__tests__/concierge/services/travel-continuity.service.test.ts"],    status: "behavioral", priority: "P1", notes: "Phase 4: prep checklist + reservation ingest + readiness" },
  { id: "svc.grocery-continuity",   kind: "service", ref: "src/lib/services/concierge-os/grocery-continuity.service.ts",   tests: ["src/__tests__/concierge/services/grocery-continuity.service.test.ts"],   status: "behavioral", priority: "P1", notes: "Phase 4: alert severity + shopping-list windowing + budget math" },
  { id: "svc.recurring-supplies",   kind: "service", ref: "src/lib/services/concierge-os/recurring-supplies.service.ts",   tests: ["src/__tests__/concierge/services/recurring-supplies.service.test.ts"],   status: "behavioral", priority: "P1", notes: "Phase 4: resupply detection + monthly cost math" },
  { id: "svc.responsibilities",     kind: "service", ref: "src/lib/services/concierge-os/responsibilities.service.ts",     tests: ["src/__tests__/concierge/services/responsibilities.service.test.ts"],     status: "behavioral", priority: "P1", notes: "Phase 4: per-member grouping + minutes aggregation" },
  { id: "svc.activity-prep",        kind: "service", ref: "src/lib/services/concierge-os/activity-prep.service.ts",        tests: ["src/__tests__/concierge/services/activity-prep.service.test.ts"],        status: "behavioral", priority: "P1", notes: "Phase 4: checklist factory + mock checklists" },
  { id: "svc.prep-derivation",      kind: "service", ref: "src/lib/services/concierge-os/prep-derivation.service.ts",      tests: ["src/__tests__/concierge/services/prep-derivation.service.test.ts"],      status: "behavioral", priority: "P1", notes: "Phase 4: 1h-before-event prep task derivation" },
  { id: "svc.prep-checklist",       kind: "service", ref: "src/lib/services/concierge-os/prep-checklist.service.ts",       tests: ["src/__tests__/concierge/services/prep-checklist.service.test.ts"],       status: "behavioral", priority: "P1", notes: "Phase 4: 6-item trip checklist seeding" },
  { id: "svc.gift-reminders",       kind: "service", ref: "src/lib/services/concierge-os/gift-reminders.service.ts",       tests: ["src/__tests__/concierge/services/gift-reminders.service.test.ts"],       status: "behavioral", priority: "P2", notes: "Phase 4: urgent filtering + budget/ideas presence" },
  { id: "svc.reservation-ingest",   kind: "service", ref: "src/lib/services/concierge-os/reservation-ingest.service.ts",   tests: ["src/__tests__/concierge/services/reservation-ingest.service.test.ts"],   status: "behavioral", priority: "P1", notes: "Phase 4: email→reservation parse + safe defaults" },
  { id: "svc.trip-overview",        kind: "service", ref: "src/lib/services/concierge-os/trip-overview.service.ts",        tests: ["src/__tests__/concierge/services/trip-overview.service.test.ts"],        status: "behavioral", priority: "P1", notes: "Phase 4: upcoming/active/past partitioning + budget sums" },
  { id: "svc.school-items",         kind: "service", ref: "src/lib/services/concierge-os/school-items.service.ts",         tests: ["src/__tests__/concierge/services/school-items.service.test.ts"],         status: "behavioral", priority: "P2", notes: "Phase 4: upcoming filter + groupByChild" },
  { id: "svc.home-admin",           kind: "service", ref: "src/lib/services/concierge-os/home-admin.service.ts",           tests: ["src/__tests__/concierge/services/home-admin.service.test.ts"],           status: "behavioral", priority: "P1", notes: "Phase 4: expiring window sort + admin load counts" },
  { id: "svc.provider-memory",      kind: "service", ref: "src/lib/services/concierge-os/provider-memory.service.ts",      tests: ["src/__tests__/concierge/services/provider-memory.service.test.ts"],      status: "behavioral", priority: "P1", notes: "Phase 4: rating sort + favorite preference + suggestion" },
  { id: "svc.reconciliation",       kind: "service", ref: "src/lib/services/concierge-os/reconciliation.service.ts",       tests: ["src/__tests__/concierge/services/reconciliation.service.test.ts"],       status: "behavioral", priority: "P1", notes: "Phase 4: pair overlap detection + minutes" },
  { id: "svc.household-boardroom-inputs", kind: "service", ref: "src/lib/services/concierge-os/household-boardroom-inputs.service.ts", tests: ["src/__tests__/concierge/services/household-boardroom-inputs.service.test.ts"], status: "behavioral", priority: "P1", notes: "Phase 4: packet shape + non-empty action items" },
];

/** Services intentionally excluded from dedicated behavioral tests, with stable reason. */
export const SERVICE_TEST_EXCLUSIONS: Record<string, string> = {
  "src/lib/services/concierge-os/index.ts": "barrel export",
};

// ── Route integrity ────────────────────────────────────────────
export const ROUTE_SURFACES: SurfaceEntry[] = [
  { id: "route.concierge-routes", kind: "route", ref: "src/routes/families/concierge-routes.tsx", tests: ["src/__tests__/concierge/routes/concierge-routes-integrity.test.ts"], status: "missing", priority: "P0" },
];

// ── Trust / receipt / approval ────────────────────────────────
export const TRUST_SURFACES: SurfaceEntry[] = [
  { id: "trust.concierge-proof-trail", kind: "trust", ref: "src/modules/concierge/hooks/use-concierge-proof-trail.ts", tests: ["src/__tests__/trust/use-concierge-proof-trail.test.ts"], status: "behavioral", priority: "P0", notes: "covered by existing trust-layer test" },
  { id: "trust.concierge-entity-ref",  kind: "trust", ref: "src/lib/ux-trust/derive-concierge-entity-ref.ts",          tests: ["src/__tests__/trust/derive-concierge-entity-ref.test.ts"], status: "behavioral", priority: "P0", notes: "covered by existing trust-layer test" },
];

// ── Cross-module integration ──────────────────────────────────
export const INTEGRATION_SURFACES: SurfaceEntry[] = [
  { id: "int.concierge-business-linkage", kind: "integration", ref: "src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx", tests: ["src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx"], status: "behavioral", priority: "P0", notes: "live cross-domain query already covers concierge↔CRM seam" },
  { id: "int.concierge-finance-linkage",  kind: "integration", ref: "src/lib/services/finance-os/recurring-obligation.service.ts",                tests: ["src/__tests__/finance/integration/concierge-finance-linkage.test.ts"],     status: "missing",    priority: "P1" },
];

// ── Adaptive / persistence ────────────────────────────────────
export const ADAPTIVE_SURFACES: SurfaceEntry[] = [
  { id: "adaptive.concierge-preference-persistence", kind: "adaptive", ref: "src/modules/concierge/contexts", tests: ["src/__tests__/concierge/adaptive/concierge-preference-persistence.test.ts"], status: "missing", priority: "P0" },
];

// ── End-to-end journeys (Playwright) ──────────────────────────
export const E2E_SURFACES: SurfaceEntry[] = [
  { id: "e2e.concierge-auth-smoke",        kind: "e2e", ref: "/concierge/*",                              tests: ["tests/e2e/concierge-journey.spec.ts"],                              status: "e2e",     priority: "P2", notes: "auth-redirect smoke breadth" },
  { id: "e2e.household-reservation-flow",  kind: "e2e", ref: "/concierge/household → /concierge/recurring → linkage", tests: ["tests/e2e/concierge/household-reservation-flow.spec.ts"], status: "missing", priority: "P0" },
];

export const ALL_SURFACES: SurfaceEntry[] = [
  ...PAGE_SURFACES,
  ...SERVICE_SURFACES,
  ...ROUTE_SURFACES,
  ...TRUST_SURFACES,
  ...INTEGRATION_SURFACES,
  ...ADAPTIVE_SURFACES,
  ...E2E_SURFACES,
];

/** Pages explicitly excluded from per-page state-honesty tests, with a stable reason. */
export const PAGE_TEST_EXCLUSIONS: Record<string, string> = {
  "ConciergeCenter.tsx":       "router/dispatcher — covered by concierge-routes-integrity",
  "ConciergeOverview.tsx":     "router shim — covered by concierge-routes-integrity",
  "ConciergeSettings.tsx":     "settings shell — covered by concierge-page-state-grammar",
  "ConciergeBoardroom.tsx":    "boardroom alias — covered by boardroom-journey E2E",
  "ConciergeFiles.tsx":        "files passthrough — covered by files-journey",
  "ConciergeProof.tsx":        "covered by use-concierge-proof-trail trust test",
  "ConciergeWorkflows.tsx":    "automations shell — covered by concierge-page-state-grammar",
  "MonthGridCalendar.tsx":     "leaf calendar grid — covered by family-calendar test",
  "FamilyBoardroom.tsx":       "covered by boardroom-journey E2E",
  "HouseholdTasks.tsx":        "leaf task list — covered by household-command-center test",
  "LifeDashboard.tsx":         "covered by life-admin-center test",
  "EventsGifts.tsx":           "covered by gift-reminders service test",
  "SchoolActivities.tsx":      "covered by school-items service test",
  "UpcomingNeeds.tsx":         "covered by appointments-prep test",
  "PersonalLifeWorkspace.tsx": "covered by life-admin-center test",
  "index.ts":                  "barrel",
};