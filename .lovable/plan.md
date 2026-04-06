

# 7 Indices → 100% — Implementation Plan

## Current State Analysis

| Index | Persisted | DB | Hooks | Gap Summary |
|---|---|---|---|---|
| **AI Budget/Policies** | 95% | 90% | 80% | DB functions exist (`check_ai_budget_policies`, `aggregate_ai_daily_spend`), budget service fully wired. Missing: CRUD mutations for `ai_budget_policies` from the UI, usage ledger aggregation hook, and the AITokenDashboard uses legacy `ai_token_usage` instead of `ai_usage_ledger` |
| **AI Usage Ledger** | 95% | 85% | 75% | `getUsageLedger()` exists but AITokenDashboard still queries `ai_token_usage` (legacy). Missing: hook wrapping `budget.service.ts`, daily aggregation via `aggregate_ai_daily_spend` RPC, and cost-by-capability breakdown |
| **Calendar** | 85% | 80% | 65% | Has `use-calendar-data.ts` hook + `CalendarWorkspace.tsx` inline query. Missing: CRUD mutations (create/edit/delete events), the page's "New Event" button is non-functional, Edit/Reschedule buttons are dead |
| **Owner Center** | 90% | 85% | 70% | Uses `useCouncilDecisions` + `useAdminPolicies` correctly. Still imports from `@/lib/mock-data/admin-ops` for demo fallback. Missing: direct DB queries for policies/incidents/audit instead of edge function proxy, and `ENGINE_COSTS` is from a demo-data file |
| **Apple Ecosystem** | 95% | 90% | 70% | All 7 hooks wired, seed button works. Missing: CRUD mutations (add/remove device, update trust, toggle health consent), the pages are read-only with no write actions |
| **Android Ecosystem** | 95% | 90% | 70% | Same as Apple — all 7 hooks wired. Missing: same CRUD mutations as Apple |
| **Health/Signal Intel** | 90% | 85% | 65% | 5 hooks wired. HRS01-03 use hooks. HRS05 uses `useReadinessStates` but hardcodes `BRIEFING_WINDOWS` and `HOLD_VS_ACT`. HRS01 consent toggles are local state only, not persisted |

## Plan

### 1. AI Budget/Policies + AI Usage Ledger → 100%

**`src/hooks/use-ai-budget-data.ts`** (new) — React Query hooks wrapping `budget.service.ts`:
- `useBudgetPolicies()`, `useActiveBudgetPolicies()`, `useBudgetAlerts()`, `useBudgetSummary()`
- `useUsageLedger(limit)`, `useDailyAggregation()` (calls `aggregate_ai_daily_spend` RPC)
- `useCreateBudgetPolicy()`, `useUpdateBudgetPolicy()`, `useDeleteBudgetPolicy()` mutations

**`src/pages/admin/AITokenDashboard.tsx`** — Rewrite to use new hooks:
- Replace `ai_token_usage` query with `useUsageLedger()`
- Replace `user_ai_budgets` query with `useBudgetSummary()`
- Add daily aggregation chart via `useDailyAggregation()`
- Add budget policy CRUD panel (list, create, toggle active)

### 2. Calendar → 100%

**`src/hooks/use-calendar-mutations.ts`** (new):
- `useCreateCalendarEvent()` — insert into `calendar_events`
- `useUpdateCalendarEvent()` — update event
- `useDeleteCalendarEvent()` — delete event

**`src/pages/CalendarWorkspace.tsx`** — Wire CRUD:
- "New Event" button opens a dialog with form fields (title, date, time, domain, type, location)
- Event detail panel: "Edit" opens pre-filled dialog, "Reschedule" opens date picker, add "Delete" button
- Replace inline supabase query with `useCalendarEvents` hook from `use-calendar-data.ts`

### 3. Owner Center → 100%

**`src/hooks/use-admin-data.ts`** — Add direct DB query fallback paths:
- `useAdminPolicies`: in non-demo mode, query `approval_policies` or `ai_budget_policies` table directly instead of edge function only
- `useAdminIncidents`: in non-demo mode, query `incidents` table directly as fallback
- `useAdminAuditLogs`: query `audit_logs` table directly as fallback
- `useFleetHealth`: query `connected_devices` / `ecosystem_devices` directly as fallback
- `useCouncilDecisions`: query `council_decisions` table directly as fallback
- Remove mock-data imports for non-demo paths — keep them only for `isDemoMode` branches

**`src/pages/OwnerCenter.tsx`** — Replace `ENGINE_COSTS` import with DB query or inline canonical data

### 4. Apple + Android Ecosystem → 100%

**`src/hooks/useEcosystemDevices.ts`** — Add CRUD mutations:
- `useAddEcosystemDevice()` — insert into `ecosystem_devices`
- `useRemoveEcosystemDevice()` — delete device
- `useUpdateDeviceTrust()` — update `ecosystem_trust_records`
- `useToggleHealthConsent()` — update `ecosystem_health_consents.read_permission`/`revoked_at`
- `useUpdatePushRoute()` — update `ecosystem_push_routes`

**`src/pages/admin/APL01AppleEcosystemCenter.tsx`** + **`AND01AndroidEcosystemCenter.tsx`**:
- Add "Add Device" button + dialog
- Trust tab: add "Revoke Trust" / "Re-verify" actions on each device
- Health tab: consent toggles actually call `useToggleHealthConsent()` instead of local state
- Push tab: enable/disable route toggles that persist

### 5. Health/Signal Intel → 100%

**`src/hooks/use-health-signal-mutations.ts`** (new):
- `useToggleSignalConsent()` — update `health_signal_consents` table
- `useUpdateReadinessState()` — for manual override of readiness

**`src/pages/admin/HRS01HealthConsentCenter.tsx`**:
- Replace `enabledCats` local state with DB-backed consent toggles using `useToggleSignalConsent()`
- When toggled, insert/update `health_signal_consents` row

**`src/pages/admin/HRS05AssistantTimingBoard.tsx`**:
- Extract `BRIEFING_WINDOWS` and `HOLD_VS_ACT` to `src/lib/demo-data/health-signals.ts`
- Wire `useReadinessStates` data into timing logic display

## Files Changed

| File | Change |
|---|---|
| `src/hooks/use-ai-budget-data.ts` | **New** — 9 React Query hooks for budget + usage |
| `src/hooks/use-calendar-mutations.ts` | **New** — create/update/delete calendar event mutations |
| `src/hooks/use-health-signal-mutations.ts` | **New** — consent toggle + readiness update mutations |
| `src/pages/admin/AITokenDashboard.tsx` | Rewrite: `ai_usage_ledger` + budget policies + daily aggregation |
| `src/pages/CalendarWorkspace.tsx` | Wire CRUD dialogs for New/Edit/Delete events |
| `src/hooks/use-admin-data.ts` | Add direct DB fallback queries for 5 hooks, remove mock imports from non-demo paths |
| `src/pages/OwnerCenter.tsx` | Replace `ENGINE_COSTS` with canonical/DB data |
| `src/hooks/useEcosystemDevices.ts` | Add 5 CRUD mutations |
| `src/pages/admin/APL01AppleEcosystemCenter.tsx` | Add device + trust + consent CRUD actions |
| `src/pages/admin/AND01AndroidEcosystemCenter.tsx` | Add device + trust + consent CRUD actions |
| `src/pages/admin/HRS01HealthConsentCenter.tsx` | Wire consent toggles to DB |
| `src/pages/admin/HRS05AssistantTimingBoard.tsx` | Extract hardcoded data to demo module |
| `src/lib/demo-data/health-signals.ts` | Add `DEMO_BRIEFING_WINDOWS`, `DEMO_HOLD_VS_ACT` |

## No database migration needed
All tables already exist. This is hooks + mutations + UI wiring.

