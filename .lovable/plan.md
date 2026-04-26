# Background Task Center — Remaining Phases (2 → 5)

**Status going in:** Phase 1 is already merged and TypeScript-clean.
- `src/modules/business/domain/background-tasks/types.ts` — `BackgroundJobVM`, 6 typed mappers, `summarizeJobs`, `groupJobsBySection`, `filterJobsByStatus`, `formatDuration`, `formatRelativeShort`.
- `src/data/repositories/business-background-tasks-service.ts` — parallel RLS-scoped fetch across `crm_import_jobs`, `connector_sync_runs`, `data_export_requests`, `ingestion_jobs`, `crm_automations`, `workflow_runs` + `retryBackgroundJob`, `cancelBackgroundJob`, `recordBackgroundJobAction` (writes to `ai_action_receipts`).
- `src/data/fixtures/mock-data/business-background-tasks.ts` — `buildDemoBackgroundJobs()`.

**Routing note:** the page is mounted by `BusinessAppShell` under the `"ns"` key — no `App.tsx`/router changes required. The `src/pages/business/BackgroundTaskCenter.tsx` shim already re-exports the canonical module.

**Hard rules carried forward:** no duplicate task/workflow/runtime systems; reuse `usePageData`, `PageSkeleton`, `PremiumEmptyState`, `PageErrorState`, `StatusBadge`, `AR07RetryFailureCenter`, `WorkflowReplayAudit`; zero `as any` in the page.

---

## Phase 2 — React Query hook + realtime subscriptions

**File added:** `src/hooks/use-background-tasks.ts`

- `useBackgroundJobs({ sinceHours? })` — wraps `usePageData` with `queryKey: ["bg-tasks", mode, userId, sinceHours]`, calls `fetchBackgroundJobs`, returns `{ jobs, partial, failedSources, summary, sections, state, refetch }` where `summary` and `sections` come from the Phase 1 pure aggregators.
- `useBackgroundJobsRealtime()` — in `live` mode only, subscribes to `postgres_changes` on the 6 source tables filtered by `user_id=eq.<uid>` and invalidates the query on any change. Demo mode is a no-op. Uses a single Supabase channel (`bg-tasks:<uid>`) to avoid channel sprawl. Cleans up on unmount.
- `useRetryBackgroundJob()` / `useCancelBackgroundJob()` — `useMutation` wrappers that call the Phase 1 service mutations, then call `recordBackgroundJobAction(...)`, then `queryClient.invalidateQueries({ queryKey: ["bg-tasks"] })`. On not-supported / not-authenticated reasons, surface a toast via `sonner` with the honest reason; do not silently swallow.

**Gate:** `bunx tsc --noEmit -p tsconfig.app.json` clean for the new hook file. Manual smoke: hook compiles, types flow.

---

## Phase 3 — Page rewrite + detail drawer

**File rewritten:** `src/modules/business/pages/BackgroundTaskCenter.tsx`
- Remove the static `TASKS` array, `BGTask` interface, and every `([] as any[])`.
- Mount `useBackgroundJobs()` and `useBackgroundJobsRealtime()` at the top.
- Render four real states using canonical primitives:
  - `loading` → `<PageSkeleton variant="list" />`
  - `error` → `<PageErrorState onRetry={refetch} />`
  - `unauthenticated` (live + no user) → `<PremiumEmptyState variant="auth-required" cta="Sign in" onCta={…} />`
  - `empty` → `<PremiumEmptyState variant="no-data" title="No background jobs" body="Imports, syncs, exports, automations, and workflows will appear here as they run." />`
- Header KPI strip: `summary.running`, `summary.queued`, `summary.completed24h`, `summary.failed24h`. All derived from real state.
- Filters: `all | running | queued | completed | failed` — drives `filterJobsByStatus`.
- Sectioned list (when filter = `all`): **Attention required** (failed) → **Running** → **Queued** → **Recent (24h)** → **History**. Each section uses `groupJobsBySection`. Empty sections collapse silently.
- Per-row: kind icon, title, `StatusBadge` mapped from canonical tones (`running→info`, `queued→muted`, `completed→success`, `failed→danger`, `cancelled→muted`), real progress bar derived from `job.progress`, `formatRelativeShort(startedAt)` and `formatDuration(durationMs)`.
- **Partial-degraded banner:** when `partial` is true, render an honest `StatusBadge tone="warning"` strip listing `failedSources` ("Some sources unavailable: …. Showing what we have."). No fake fallback rows.
- Click row → opens `BackgroundJobDetailDrawer`.

**File added:** `src/modules/business/components/background-tasks/BackgroundJobDetailDrawer.tsx`
- `<Sheet>` (right side). Body shows: kind, title, status badge, source table + id, started/completed/duration, details, error (if any), and an explanation of where the row came from ("Source: `crm_import_jobs` · row `…`").
- Action footer:
  - **Retry** → enabled iff `job.canRetry`. Uses `useRetryBackgroundJob()`.
  - **Cancel** → enabled iff `job.canCancel`. Uses `useCancelBackgroundJob()`. Confirmation via `<AlertDialog>`.
  - **Open recovery** → `Link` to `job.recoveryHref` when set (already routes to `AR07RetryFailureCenter` or `WorkflowReplayAudit` per Phase 1).
  - **View logs** → for `workflow` kind, deep-links to `WorkflowReplayAudit?run=<sourceId>`; for other kinds where no canonical viewer exists, render a disabled button with tooltip `"Logs not yet exposed for this source"` (honest deferred — no dead button).
- Receipt visibility: a "Last governance receipt" line appears when the latest mutation result is in cache; otherwise hidden.

**Gate:** `bunx tsc --noEmit -p tsconfig.app.json` clean. Page renders all four states in dev. No `any`.

---

## Phase 4 — Tests

**Files added:**
- `src/modules/business/domain/background-tasks/__tests__/types.test.ts` — Vitest unit tests for every mapper (one row per source table → asserts shape, status normalization, progress, error, recovery href). Covers `summarizeJobs`, `groupJobsBySection`, `filterJobsByStatus`, `formatDuration`, `formatRelativeShort` (deterministic clock).
- `src/data/repositories/__tests__/business-background-tasks-service.test.ts` — mocks `@/integrations/supabase/client` and `fromTable`; asserts demo mode returns fixture, live mode aggregates 6 sources, partial-degraded behavior when one source throws, and that `recordBackgroundJobAction` writes to `ai_action_receipts` with the right columns.
- `src/modules/business/pages/__tests__/BackgroundTaskCenter.test.tsx` — RTL renders the page in `loading`, `error`, `empty`, and `ready` states by mocking `use-background-tasks`. Asserts: KPI strip uses real summary numbers, filter buttons switch lists, clicking a row opens the drawer, retry button is disabled when `canRetry=false`, partial-degraded banner appears when `partial=true`.

**Gate:** `bunx vitest run` for these three files passes locally. No flakes from realtime (subscription hook is mocked in page tests).

---

## Phase 5 — Integration report

**File added:** `docs/integration/BACKGROUND_TASK_CENTER_INTEGRATION_REPORT.md`

Sections:
1. What was wrong (static `TASKS`, `([] as any[])` filters/counts, no fetch, no auth, no drawer, no retry/cancel, no observability).
2. Canonical systems reused (`bookings`/job tables × 6, `usePageData`, `PageSkeleton`, `PremiumEmptyState`, `PageErrorState`, `StatusBadge`, `Sheet`, `AlertDialog`, `AR07RetryFailureCenter`, `WorkflowReplayAudit`, `ai_action_receipts`, `useDataMode`).
3. Files changed / files added (exact paths from this plan).
4. Wiring map (what powers each visual: KPI → `summarizeJobs`, sections → `groupJobsBySection`, retry → service mutation → receipt → invalidate).
5. Observability/proof/recovery (receipts to `ai_action_receipts`, deep-links to recovery surfaces, partial-degraded source list).
6. UX states added (loading/error/empty/unauth/partial/no-match-filter).
7. Wow upgrades (sectioned attention queue, realtime invalidation, honest deferred actions, governance receipts on every mutation).
8. Deferred items + why (per-source log viewers for non-workflow kinds; cross-tenant operator view; cancellation for `connector_sync_runs` and `data_export_requests` — workers don't expose a cancel API).
9. Tests added (3 files above) and how to run them.

**Gate:** report file exists, links resolve, paths match the actual changes.

---

## Anti-duplication assertions (verified during Phase 1 audit, re-checked at each gate)

- No new task/job DB tables — uses the 6 existing ones.
- No new edge functions.
- No new status/badge primitive — uses `StatusBadge`.
- No new empty/error/loading primitive — uses `usePageData` + `PremiumEmptyState` + `PageErrorState` + `PageSkeleton`.
- No new receipt/proof system — writes to `ai_action_receipts` (same pattern as `autopilot-config-service`).
- No new recovery surface — links to existing `AR07RetryFailureCenter` and `WorkflowReplayAudit`.
- The `TasksWorkflowsCenter` (user-task kanban) is intentionally not touched: distinct domain (human tasks vs. system jobs).

## Gating discipline

After each phase: TypeScript clean → tests added at that phase pass → I report and **stop**, waiting for "continue" before starting the next phase. No phase begins until the previous one is 100% deployment-ready.