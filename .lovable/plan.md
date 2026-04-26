# Business OS — Production-Truth Closure Plan

**Goal**: Every Business OS surface ends in exactly one of three honest states — **fully wired**, **honestly empty/setup/degraded**, or **intentionally hidden/archived**. No fake-live UI, no demo data leaking into production paths, no premium UI implying execution that isn't real.

**Discipline**: Each phase must be 100% complete and verified (`bunx tsc --noEmit` clean + relevant runtime check) before the next begins. No new parallel systems — extend canonical infra (`PageTruthBanner`, `EmptyStateCard`, `PageSkeleton`, `business-scheduling-service`, trust receipts registry, `useBusinessProfile`).

---

## Production-Truth Classification Matrix

Result of the audit pass (17 pages currently lack canonical truth primitives, plus several "fake-live" patterns in already-wired pages). The matrix is the contract for all 7 phases:

### A. Fully wire (real data + page-state honesty)
| Surface | Backing | Why now |
|---|---|---|
| `AppointmentsScheduling` | `business-scheduling-service` (already exists, `bookings` table, RLS) + `buildDemoScheduledAppointments` fixture | Service + fixture already canonical; page is the only fake-live consumer |
| `BackgroundTaskCenter` | NEW `useBackgroundJobs` hook reading `crm_import_jobs` (live imports) + `recovery_jobs` + `ai_invocations` (running AI tasks) — these are the **real** background activity in the system | All three tables already exist; no new persistence needed |
| `BusinessAdvisorBoardPage` | Already wired; remove residual fake-live KPIs and confirm receipt path through `advisor_action_queue` | Fix not rebuild |
| `MorningBriefing` | Aggregate from `crm_tasks` (today), `bookings` (today), `lead_inbox_items` (overnight new), `ai_action_receipts` (overnight changes) | All tables live |
| `EndOfDayClosure` | Same source set, scoped to "today closing" | All tables live |
| `RelationshipDossier` | Existing `useCRMContacts` + `crm_communications` + `crm_notes` + `crm_opportunities` joined per contact | All hooks live |
| `CustomerHealthPage` | Already uses `CustomerHealthDashboard` (partial mock+live); push the live path through `customer-health.service`, gate demo behind `useRealityModeSafe` | Service exists |
| `CRMIntegrationHub` | `crm_import_jobs` for sync history; honest "Not connected" state per platform until OAuth connectors land | Mostly setup-state |
| All CRM mutation hooks (`use-crm-data.ts`) | Wrap each `useMutation` with `emitRegisteredTrustAction` using existing registry keys (`crm.contact.create`, `crm.deal.stage_change`, `business.crm.contact_delete`, etc.) | Registry already complete |

### B. Honestly degraded / setup / empty
| Surface | Honest state | Reason |
|---|---|---|
| `WebsiteBuilder` | "Connect your website" setup state via existing `EmptyStateCard` + truth banner = `partial`; advisor card stays | No website connector exists yet |
| `SocialCommand` | "Connect a social account" setup state; truth banner = `partial` | No social connectors wired |
| `EcommerceManager` | "Connect your store" setup state (Shopify connector exists in `shopify--*` tools but not consumed here yet); truth banner = `partial` | Backend exists, page wiring deferred — must say so |
| `DealRoom` | Reuse `useCRMOpportunities`; if no opportunities, show `EmptyStateCard` with "Create your first deal" CTA. Remove all hardcoded `DEALS`, `RISK_FACTORS`, `STAKEHOLDERS`, `STAGE_PLAYBOOK`, `CLOSE_SCENARIOS` arrays. Where structured insights would require AI, render via `ModuleAdvisorInsight` empty state | No "deal-room" specific table; opportunity-derived view is honest |
| `StrategicAccountRoom` | Same: pivot off `crm_companies` + `crm_opportunities` aggregated by company; honest empty state if no strategic accounts tagged | No new schema; honest |
| `RevenueImpactDashboard` | Already wired; add `partial` truth banner if no `recovered_value_ledger` rows exist | Honesty pass only |
| `RevenueAutopilot` | Remove `let LEAKAGE = ...` module-level fake state at top of file (currently runs at import time with empty inputs); compute inside component from real `useRevenueLeaksData` only | Surgical |
| `AdaptiveBusinessHome` / `LiveHomePreview` / `ProfileTemplateGallery` / `BusinessModeOnboardingPreview` | Audit which 26 adaptive components actually consume `useBusinessProfile` (persisted) vs local-only preview state. Mark preview-only components clearly as "Preview" or move under `/business/settings/profile-studio` (settings sub-area, not main IA) | Adaptive layer is the audit's biggest "over-engineered" risk |

### C. Intentionally hidden / archived (route-guarded behind labs flag or removed from nav)
| Surface | Action |
|---|---|
| Duplicate `OpportunityEngine` (root-level page vs `pages/business/`) | Hide root-level; keep one canonical |
| `BackgroundTaskCenter` if `crm_import_jobs` + `recovery_jobs` + `ai_invocations` are all empty for a session | Render `EmptyStateCard` "No background activity" — never shows fake `TASKS` |

---

## Phase 1 — Audit & Truth Manifest (foundation, no UI changes)

**Goal**: Codify the matrix above as a runtime-checkable manifest so future regressions are caught.

1. Create `src/modules/business/PRODUCTION_TRUTH_MANIFEST.ts` listing every Business OS page with its declared state (`fully-wired` | `degraded` | `hidden`), its canonical data source(s), and any required setup steps. Single source of truth used by tests + the truth banner.
2. Create `scripts/architecture/check-business-truth.ts` — scans `src/modules/business/pages/**` for:
   - top-level `const X = [` arrays with hardcoded fixture data
   - `([] as any[])` filter shortcuts
   - pages declared `fully-wired` that import zero hooks/services
3. Wire the script into `.github/workflows/check-boundaries.yml`.
4. Generate `/mnt/documents/BUSINESS_OS_PRODUCTION_TRUTH_REPORT.md` (initial baseline).

**Exit gate**: TypeScript clean. Script exits non-zero on at least the 17 currently-broken pages (proving it works).

---

## Phase 2 — CRM Receipt Coverage (single largest trust gap)

**Goal**: Every CRM CRUD mutation emits a Trust receipt via the existing canonical registry. Zero new infrastructure.

1. Refactor `src/hooks/use-crm-data.ts` so each `useMutation` wraps `mutationFn` with a thin helper that calls `emitRegisteredTrustAction(<key>, { payload, correlationId })` post-success and on error.
   - `crm.contact.create`, `business.crm.contact_delete`, `crm.deal.stage_change` (existing keys)
   - Add minimal new registry entries only where missing: `crm.contact.update`, `crm.company.create/update/delete`, `crm.task.create/update/delete`, `crm.note.create`, `crm.communication.create/delete` — all `riskTier: "low"`, `reversible: true`, `pillar: "business"`. Extend `trust-action-registry.ts`, do not parallel-source.
2. Stage-change special case: `useUpdateCRMOpportunity` detects `updates.stage` change and uses `crm.deal.stage_change` (higher receipt class).
3. Bulk operations: extend `BulkTriageBar` and any other bulk surfaces to emit `business.crm.contact_bulk_import`-style receipts and gate via `emitRegisteredTrustAction` (which already opens approval at `>50` threshold per registry).
4. Add `src/__tests__/business/crm-mutation-receipts.test.ts` proving every mutation hook emits.

**Exit gate**: TypeScript clean. New test passes. Manual smoke: create a contact in dev, verify a row appears in `ai_action_receipts`.

---

## Phase 3 — Wire `AppointmentsScheduling` + `BackgroundTaskCenter` (fake-live → real)

**Goal**: Two flagship priority pages identified by the user become fully real.

### 3a. AppointmentsScheduling
- Delete the 8-row hardcoded `APPOINTMENTS` const and all `([] as any[])` filter calls.
- Create `src/hooks/business/use-scheduled-appointments.ts` (canonical home) wrapping `fetchScheduledAppointments` with React Query, demo-aware via `useRealityModeSafe`.
- Replace KPI strip + tabs to read from the real list. Loading → `PageSkeleton`. Empty → `EmptyStateCard`. Error → retry. No appointments yet → "Connect your calendar or create your first booking".
- Wire the existing service mutations (`sendConfirmationReminder`, `markBookingConfirmed`, `recoverNoShow`) to the per-card buttons. Each emits a Trust receipt via `business.calendar.external_invite` or a new `business.appointment.reminder_send` registry entry.
- Add `<PageTruthBanner />` reflecting demo/live state.
- Scheduling Advisor sidebar card: keep the structure, but when no high-risk bookings exist, render via `ModuleAdvisorInsight` empty state.

### 3b. BackgroundTaskCenter
- Delete the 6-row hardcoded `TASKS` const and all `([] as any[])` filters.
- Create `src/hooks/business/use-background-jobs.ts` aggregating live rows from:
  - `crm_import_jobs` → "import" type
  - `recovery_jobs` → "automation" type
  - `ai_invocations` recent (last 1h) → represents AI work in flight
- Each row maps to the existing `BGTask` shape (rename to `BackgroundJobVM`, place type in `src/modules/business/domain/background/types.ts`).
- Real progress: `crm_import_jobs.processed_rows / total_rows`; `recovery_jobs.status` → running/completed/failed; `ai_invocations` → `status` field if present, else completed.
- Page now: `PageSkeleton` while loading, `EmptyStateCard` when zero jobs ("No background activity"), live list with real timestamps.
- `<PageTruthBanner />` truthful.

**Exit gate**: TypeScript clean. Both pages render correctly empty when no data, render real rows when seeded.

---

## Phase 4 — Wire CRM-derived "operational ritual" pages

**Goal**: `MorningBriefing`, `EndOfDayClosure`, `RelationshipDossier`, `CustomerHealthPage`, `CRMIntegrationHub`, `BusinessAdvisorBoardPage` (cleanup) — none of these need new tables.

1. **MorningBriefing**: Replace `PRIORITY_ITEMS`, `OVERNIGHT_CHANGES`, `TODAY_SCHEDULE`, `METRICS_SNAPSHOT` with derivations from existing hooks (`useCRMTasks`, `useScheduledAppointments`, `useLeadInbox`, `ai_action_receipts` last 12h). Add `PageTruthBanner` + `EmptyStateCard`.
2. **EndOfDayClosure**: Same pattern, scoped to "completed today" / "stale" / "tomorrow". Sources: `crm_tasks` (status, due_date), `bookings` (today), advisor receipts.
3. **RelationshipDossier**: Hardcoded `HEALTH_BREAKDOWN`, `TIMELINE`, `LINKED_DEALS`, `LINKED_FILES` → drawn from selected contact via `useCRMContact(id)` + joined `crm_communications`/`crm_notes`/`crm_opportunities`. If used as a route page (not modal), add a contact picker; if drawer-only, keep as-is but data must come from real selection.
4. **CustomerHealthPage**: Push `CustomerHealthDashboard` through `customer-health.service` live path; demo gate via `useRealityModeSafe`. Truth banner.
5. **CRMIntegrationHub**: Real `crm_import_jobs` history. Per-platform "Connect" buttons render honestly: "Not connected" + Connect CTA (no fake "85% health" numbers). Truth banner = `partial` until real connectors land.
6. **BusinessAdvisorBoardPage**: It already uses canonical primitives; sweep for any fake-live KPI numerics, ensure all displayed advisor stats come from `useBusinessAdvisorBoard`. Confirm receipt emission path through `advisor_action_queue` is intact end-to-end.

**Exit gate**: TypeScript clean. All 6 pages declared `fully-wired` in the manifest; truth-check script passes for them.

---

## Phase 5 — Honestly degrade / hide unrealizable surfaces

**Goal**: Any page implying execution that is not actually wired must say so honestly or be hidden.

1. **WebsiteBuilder**: Delete hardcoded `sites`, `abTests`, `seoKeywords` arrays. Replace body with a setup-state composition: `PageTruthBanner truthState="partial"` + `EmptyStateCard` ("Connect a website to see analytics, A/B tests, and SEO insights") + the existing `DomainAdvisorCard` (which is honestly informational). Add a clear "Coming soon: native website builder" banner if/where the original UI's promise (drag-drop builder) is not real.
2. **SocialCommand**: Same treatment — strip `platforms`, `scheduled`, `topPerforming` arrays. Replace with "Connect Twitter / LinkedIn / Instagram to begin scheduling" empty state. Truth banner `partial`. Advisor insight kept for guidance only.
3. **EcommerceManager**: Strip `kpis` and other arrays. Show "Connect Shopify to surface live ecommerce metrics" with a real CTA hooked to the existing `shopify--claim_store` connector flow (button dispatches the link). Truth banner `partial`.
4. **DealRoom**: Pivot to `useCRMOpportunities` data; if no opportunity selected, render selection UI; if no opportunities exist, `EmptyStateCard`. Remove all 5 hardcoded arrays. Where the original UI promised structured "Risk Factors / Stakeholders / Stage Playbook / Close Scenarios" sections that require AI synthesis, render them via `ModuleAdvisorInsight` so the user understands the source.
5. **StrategicAccountRoom**: Same pivot to `crm_companies` + `crm_opportunities`; remove `STRATEGIC_ACCOUNTS`, `ACCOUNT_HEALTH_FACTORS`, `BUYING_COMMITTEE`, `ACCOUNT_STRATEGY` hardcoded arrays. Empty state when no companies tagged "strategic".
6. **RevenueAutopilot**: Move the four module-level `let LEAKAGE = ...; let RECOVERY_ACTIONS = ...; let RECOVERED = []; let OPPORTUNITIES = ...; let SUMMARY = ...` statements (which compute at import time with empty input — silent fake) **inside** the component, computed from real `useRevenueLeaksData` / `useRecoveredValuesData` / `useRawOpportunities`. Truth banner reflects whether any underlying data exists.
7. **Adaptive layer audit**: For each of the 26 components in `components/business/adaptive/`, classify via the manifest:
   - **Wired**: consumes `useBusinessProfile` AND triggers persistence on change → keep, mark fully-wired
   - **Preview-only**: local state for previewing a profile change before saving → keep but add explicit "Preview" labeling
   - **Orphan**: not consumed by any page → archive (move to `src/modules/business/components/business/adaptive/_archived/` and remove from any registry)
   - Heavy candidates for archive (per audit Sec H/L.5): `LiveHomePreview`, `ProfileTemplateGallery`, `ProfileEvolutionTimeline` if not actually emitting profile updates.

**Exit gate**: TypeScript clean. All 7 surfaces honestly classified in the manifest. Truth-check script clean.

---

## Phase 6 — Routes / Navigation / IA cleanup

**Goal**: No orphaned pages, no naming overlap, no dead-end navigation.

1. **Resolve revenue automation IA**: Per the audit, `RevenueAutopilot` (workspace) + `AutopilotHub` (configuration center) + `RevenueImpactDashboard` (analytics) overlap. Decision:
   - `AutopilotHub` = **canonical control plane** (already wired well, has wizard, has command center, has truth banner).
   - `RevenueAutopilot` = **operational workspace** (leaks, recovery, opportunities); rename heading to "Revenue Operations" and remove "Autopilot" wording from the page title to disambiguate from Hub.
   - `RevenueImpactDashboard` = **analytics-only** (already correct).
   - Update `BusinessNavigationContext` labels accordingly. No route deletions (preserves links).
2. **Hide duplicate `OpportunityEngine`**: There's a root-level page and a business-pages version. Keep the business-pages version; root-level redirects to `/business/opportunities` or removed from registry.
3. **Surface DealRoom / StrategicAccountRoom in nav**: They were unreachable per audit. Now that they're honestly empty, add them under CRM > Deals submenu via `BusinessNavigationContext`.
4. **Archived adaptive components**: ensure none are still imported.
5. Update `src/modules/business/MANIFEST.md` to reflect the final IA.

**Exit gate**: TypeScript clean. Manual click-through: every nav entry leads to a page that renders without error in both demo and live.

---

## Phase 7 — Tests, report, sign-off

**Goal**: Lock in the production-truth state with verifiers and ship the final report.

1. **Tests**:
   - `src/__tests__/business/production-truth-matrix.test.ts` — asserts manifest entries match the runtime classifications (fully-wired pages have hooks, degraded pages render `EmptyStateCard`, hidden pages are not in the route registry main menu).
   - `src/__tests__/business/crm-mutation-receipts.test.ts` (added in Phase 2) — re-verified.
   - `src/__tests__/business/appointments-scheduling.test.tsx` — empty / loading / data states render.
   - `src/__tests__/business/background-jobs.test.tsx` — same.
   - Service tests: `lead-scoring.service`, `recovery-engine.service`, `customer-health.service` (one canonical happy-path each).
2. **Truth-check script** (`scripts/architecture/check-business-truth.ts`, added in Phase 1) — must exit 0 on the final repo state.
3. **Report**: regenerate `/mnt/documents/BUSINESS_OS_PRODUCTION_TRUTH_REPORT.md` with the final classification, list of changed files, removed fake-live patterns, added receipt wiring, archived adaptive components, IA changes, tests added, and the explicit list of remaining future-facing items (real website / social / ecommerce connectors, calendar provider integration, invoice creation UI calling the existing `invoice-generate` edge function — these stay future-facing but are now **honestly** future-facing).
4. **Memory updates**: append entries documenting the production-truth manifest convention and the receipt-coverage policy under `mem://features/`.

**Exit gate**: All tests pass. `bunx tsc --noEmit` clean. Truth-check script clean. CI workflow green.

---

## Hard rules respected throughout

- **No parallel systems**: every new piece extends an existing canonical home (`PageTruthBanner`, `EmptyStateCard`, `PageSkeleton`, `business-scheduling-service`, `trust-action-registry`, `useBusinessProfile`, `use-crm-data`, the `@/domains/business` barrel from prior phases).
- **No new schema**: every wiring uses tables that already exist (`bookings`, `crm_*`, `recovery_jobs`, `crm_import_jobs`, `ai_invocations`, `ai_action_receipts`, `customer_*`, `recovered_value_ledger`).
- **No fake-live**: every hardcoded fixture in a production-looking page is either deleted, moved into a demo fixture file gated by `useRealityModeSafe`, or replaced with a real query.
- **No premium UI implying execution without real wiring**: setup states / honest degradation are mandatory wherever the underlying integration is missing.
- **Phase gate**: each phase ends with TypeScript clean + the relevant test/script green before the next begins.

---

**Approve this plan and I'll execute Phase 1 immediately, then gate before each subsequent phase.**