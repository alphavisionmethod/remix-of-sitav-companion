# Business OS — Production Truth Closure Report

**Last updated:** 2026-04-26
**Scope:** All 54 pages in `src/modules/business/pages/`
**Truth-checker:** `scripts/architecture/check-business-truth.ts`

---

## Snapshot

| Metric                          | Value |
| ------------------------------- | ----- |
| Manifest entries                | 54    |
| Page files                      | 54    |
| Pages currently passing checker | 42    |
| Pages still violating           | 12    |
| Total violations                | 14    |

---

## Phase History

### Phase 1 — Manifest + Truth Checker (✅ shipped)
- Created `src/modules/business/PRODUCTION_TRUTH_MANIFEST.ts` as single source of truth for page state.
- Built `scripts/architecture/check-business-truth.ts` with 4 enforcement rules.
- CI gate added to `.github/workflows/check-boundaries.yml` (gated by `BUSINESS_TRUTH_ENFORCE`).
- Added canonical `usePageData` hook (`src/hooks/usePageData.ts`) for standardized loading/error/empty states.

### Phase 2 — CRM Receipt Coverage (✅ shipped)
- Seeded **30 new action keys** in `trust_action_catalog`.
- Mirrored presets in `src/platform/trust/registry/trust-action-registry.ts`.
- Wrapped **all 26 CRM mutation hooks** in `src/hooks/use-crm-data.ts` with `withTrust()` — every CRM write now emits a receipt and respects authority gating.
- Added `src/hooks/__tests__/use-crm-data-trust.test.ts` (23/23 passing).

### Phase 3 — AppointmentsScheduling + BackgroundTaskCenter (✅ shipped)
- New canonical hook `src/hooks/use-scheduled-appointments.ts` (real `bookings` table + realtime + governed mutations).
- `AppointmentsScheduling.tsx`: removed hardcoded `APPOINTMENTS` array, wired to real bookings.
- `BackgroundTaskCenter.tsx`: aggregates 6 real job tables via `useBackgroundJobs()` with retry/cancel mutations.

### Phase 4 — Operational Rituals (✅ shipped)
- New unified hook `src/hooks/use-operational-rituals.ts` deriving briefings from canonical CRM/Booking/Receipts hooks.
- `MorningBriefing.tsx`: real overdue-task / unconfirmed-booking / overnight-activity derivations.
- `EndOfDayClosure.tsx`: real completion summaries, stale-opp detection (≥5 days), tomorrow's calendar prep.
- `RelationshipDossier.tsx`: contact selector + 5-factor relationship-health derivation.

### Phase 5 — CRM-cluster config hygiene (✅ shipped)
The 4 CRM pages (`CRMAutomations`, `CRMHealth`, `CRMImportCenter`, `CRMSegments`) were already wired to real CRM hooks but were flagged by the truth checker because of top-level configuration arrays (trigger-types, action-types, trust-gates, filter-fields, health-buckets, import-platforms). These are **not data fixtures** — they are option lists driving builder UIs.

**Resolution:** extracted all configuration constants to dedicated, co-located files under `src/modules/business/pages/_config/`:
- `_config/CRMAutomations.config.ts` — trigger types, action types, trust gates, entity types, categories + helpers.
- `_config/CRMHealth.config.ts` — health bucket definitions + bucket lookup.
- `_config/CRMImportCenter.config.ts` — import platforms + smart-field-by-mode map.
- `_config/CRMSegments.config.ts` — filter field definitions + operator map.

No data layer or behavior changed. Truth checker now distinguishes config (lives in `_config/`) from page-level fake-live arrays.

**Result:** 25 → 21 violations, 20 → 16 failing pages.

---

### Phase 6 — Ops cluster wiring (✅ shipped)
The four Ops-cluster pages (`BusinessDocuments`, `BusinessOperations`, `BusinessSettingsPage`, `PlaybookBuilder`) were carrying hardcoded fixture arrays and the audit-stripped `([] as any[])` filter shortcut.

**Resolution split into two waves:**

1. **Config extraction (Wave A — already shipped earlier in the phase):**
   - `src/modules/business/pages/_config/BusinessSettingsPage.config.ts` — 10 onboarding option lists (business types, lead sources, growth goals, etc.).
   - `src/modules/business/pages/_config/PlaybookBuilder.config.ts` — 6 builder configuration arrays (action types, trigger events, quick-start templates, etc.) restoring trigger/condition dropdowns and template selection.

2. **Real-data hooks (Wave B — this commit):**
   - New canonical hook `src/hooks/use-business-documents.ts` aggregates `cloud_files` + `invoices` + `quotes` + `proposals` into a normalized `BusinessDocumentVM[]` with category/type/status derivation, relative-time formatting, and per-tab counts.
   - New canonical hook `src/hooks/use-business-operations.ts` aggregates `incidents` + `council_escalations` + `approval_queue` + `webhook_retry_queue` into a normalized `OperationalItemVM[]` with urgency/severity/age derivation and live KPI metrics. Auto-refreshes every 60 s.
   - `BusinessDocuments.tsx`: removed the 6-item `DOCUMENTS` fixture and 6 `([] as any[])` shortcuts; wired tabs, list, detail pane, and advisor insight to the hook.
   - `BusinessOperations.tsx`: removed the 8-item `ITEMS` fixture, the 5-row `TEAM_MEMBERS` fixture, and 9 `([] as any[])` shortcuts; wired hero metric, KPI strip, tabs, queue list, and advisor insight to the hook. The legacy "team activity" tab (which was a hardcoded roster) was retired.

**Result:** 21 → 14 violations, 16 → 12 failing pages. All 4 Ops-cluster pages now pass the audit.

---

## Remaining Backlog (16 pages)

## Remaining Backlog (12 pages)

| # | Page | Primary violation kind | Phase target |
| - | ---- | ---------------------- | ------------ |
| 1 | CustomersPage             | fake-live-array | Phase 7 (Customer cluster) |
| 2 | CustomerDetail            | audit-stripped-filter | Phase 7 |
| 3 | CustomerHealthPage        | no-data-imports | Phase 7 |
| 4 | CustomerSupportCenter     | fake-live-array + audit-stripped-filter | Phase 7 |
| 5 | CollectionsCommandCenter  | fake-live-array | Phase 8 (Revenue cluster) |
| 6 | DealRoom                  | fake-live-array + audit-stripped-filter | Phase 8 |
| 7 | FollowThroughCenter       | fake-live-array | Phase 8 |
| 8 | LeadsInbox                | fake-live-array | Phase 8 |
| 9 | RevenueAutopilot          | audit-stripped-filter | Phase 8 |
| 10| RevenueCallingPage        | audit-stripped-filter | Phase 8 |
| 11| RevenueForecast           | fake-live-array | Phase 8 |
| 12| StrategicAccountRoom      | fake-live-array | Phase 8 |

---

## Verification
- `bunx tsc --noEmit` — clean.
- `npx tsx scripts/architecture/check-business-truth.ts` — 14 violations across 12 pages, all in remaining-backlog set.
- `bunx vitest run src/hooks/__tests__/use-crm-data-trust.test.ts` — 23/23 passing (Phase 2 trust wiring intact).