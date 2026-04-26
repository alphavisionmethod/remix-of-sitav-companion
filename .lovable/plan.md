
# Background Task Center — Production Integration Plan

## Audit findings (current `src/modules/business/pages/BackgroundTaskCenter.tsx`)

1. **Static `TASKS` array** (6 fake rows) presented as live activity.
2. **`([] as any[]).filter(...)`** for both filtered list and `runningCount` — counts always 0, list always empty.
3. **No data fetching**, no auth scope, no demo/live split, no realtime/polling.
4. **No state coverage** — no loading / error / empty / unauth / degraded.
5. **Dead UI** — no row drilldown, no retry/cancel/open-result, filters work on nothing.
6. **No observability/proof wiring** despite `ai_action_receipts`, `workflow_receipts`, `RecoveryOpsCenter`, `AR07RetryFailureCenter` already existing.
7. Sits in the Business shell as **"Tasks & Syncs"** but is not connected to any of the 60+ canonical job/run tables.

## Canonical systems found and reused (no duplication)

| Capability | Reused from |
|---|---|
| Job sources | `crm_import_jobs`, `connector_sync_runs`, `data_export_requests`, `cloud_sync_jobs`, `ingestion_jobs`, `crm_automations` (last_run), `workflow_runs` |
| Page state model | `usePageData` + `PageSkeleton` + `EmptyStateCard` + `PageTruthBanner` |
| Demo/live split | `useDataMode()` + `_demo-source-marker.ts` fixture pattern (matches `business-scheduling-service`) |
| Receipts/proof | `ai_action_receipts` via shared `recordAutopilotEvent` pattern |
| Recovery routes | Link to `/admin/recovery-ops` and `/admin/ar07-retry-failure-center` (no duplicate recovery UI) |
| Auth | `supabase.auth.getUser()` (matches scheduling/autopilot services) |
| Realtime | Supabase channels on the same job tables (no new realtime infra) |

**Explicitly NOT building:** new job tables, a parallel workflow engine, a new receipt model, a new retry handler, a new recovery surface, or a duplicate `TasksWorkflowsCenter` (that is the user-task kanban — different surface).

---

## Phase 1 — Domain model + service + demo fixture (gate before Phase 2)

**New files**
- `src/modules/business/domain/background-tasks/types.ts`
  - `BackgroundJobKind` = `"import" | "sync" | "export" | "automation" | "ingestion" | "workflow"`
  - `BackgroundJobStatus` = `"queued" | "running" | "completed" | "failed" | "cancelled"`
  - `BackgroundJobVM { id; kind; title; status; progress; startedAt; completedAt?; durationMs?; details?; error?; sourceTable; sourceId; canRetry; canCancel; receiptId?; recoveryHref? }`
  - Pure mappers: `crmImportJobToVM`, `connectorSyncRunToVM`, `dataExportRequestToVM`, `cloudSyncJobToVM`, `ingestionJobToVM`, `crmAutomationToVM`, `workflowRunToVM` — each strongly typed against `BookingRow`-style `*Row` aliases derived from `Database["public"]["Tables"]`.
  - `summarizeJobs(jobs)` → `{ running, queued, completed24h, failed24h, total }`.
  - `groupJobsBySection(jobs)` → `{ attention, running, queued, recent, history }`.

- `src/data/fixtures/mock-data/business-background-tasks.ts`
  - `buildDemoBackgroundJobs(): BackgroundJobVM[]` — relative-to-now timestamps so demo always looks fresh. Replaces the inline `TASKS` array. Marked with `_demo-source-marker`.

- `src/data/repositories/business-background-tasks-service.ts`
  - `fetchBackgroundJobs({ mode, sinceHours = 72 }): Promise<BackgroundJobVM[]>`
    - `mode === "demo"` → fixture
    - `mode === "live"` → 7 parallel `fromTable(...).select(...).eq("user_id", uid).gte("created_at", ...)` queries against the tables above (only those with user-scoped RLS for the operator surface; `cloud_sync_jobs` is admin-only and is excluded for the business operator view), normalized via the mappers, sorted by `startedAt` desc.
    - Per-source try/catch → degraded results carry a `partial` flag instead of throwing.
  - `retryBackgroundJob(job)` — kind-aware: imports re-enqueue via existing `crm-import` edge function if present, else marks `pending`; for `connector_sync_runs` calls existing `connector-sync` invoker; for `workflow_runs` uses existing replay path; for unsupported kinds returns `{ ok: false, reason: "manual" }` so the UI shows an honest disabled state.
  - `cancelBackgroundJob(job)` — only for `queued`/`running` and only on tables/kinds where the existing engine supports it; otherwise honest no-op with reason.
  - `recordBackgroundJobAction(event)` — writes to `ai_action_receipts` (governance trail), reuses the same pattern as `recordAutopilotEvent`.

**Validation gate (must pass before Phase 2):**
- `bunx tsc --noEmit` clean
- `bunx vitest run src/data/repositories/business-background-tasks-service` (added in Phase 4 — for now just type-check + manual `psql` smoke)
- Zero new tables, zero new edge functions

---

## Phase 2 — React Query hook + realtime (gate before Phase 3)

**New file**
- `src/hooks/use-background-tasks.ts`
  - `useBackgroundTasks()` → wraps `usePageData<BackgroundJobVM[]>` with the service.
  - Subscribes via `supabase.channel("bg-tasks").on("postgres_changes", ...)` to `crm_import_jobs`, `connector_sync_runs`, `data_export_requests`, `ingestion_jobs`, `workflow_runs` (filtered by `user_id=eq.${uid}`), invalidating the query on change. Falls back to a 15s polling interval if realtime denied.
  - `useRetryBackgroundJob()` / `useCancelBackgroundJob()` — mutation hooks with optimistic toast + receipt emission + invalidation.

**Validation gate:** `tsc --noEmit` clean, hook used nowhere else (no duplication), realtime subscription cleanup verified.

---

## Phase 3 — Page rewrite + actions + observability (gate before Phase 4)

**Edited file**
- `src/modules/business/pages/BackgroundTaskCenter.tsx` — full rewrite:
  - Remove `TASKS`, remove all `([] as any[])` casts, remove `any`.
  - Add `PageTruthBanner` (matches Autopilot/Scheduling).
  - State machine via `usePageData`:
    - `loading` → `<PageSkeleton variant="list" />`
    - `error` → inline error card with retry
    - `unauth` (live + no user) → sign-in CTA
    - `empty` → `<EmptyStateCard>` with "Run an import or connect a sync source" CTA linking to `/business/contacts` (CSV import) and `/business/integrations`
    - `ready` → real layout
  - **KPIs** computed from `summarizeJobs(jobs)`: Running · Queued · Completed (24h) · Failed (24h) · Total.
  - **Filter tabs** drive a real predicate over typed `jobs` (`all | running | completed | failed | queued`).
  - **Grouped sections** via `groupJobsBySection`: "Attention required" (failed + recoverable) → "Running now" → "Queued" → "Recent" → expandable "History".
  - **Row click** opens a slide-over `BackgroundJobDetailDrawer` (new co-located component in same dir):
    - Shows kind, source table, started/completed/duration, progress, error message, raw `details`.
    - Action buttons: **Retry** (enabled iff `canRetry`), **Cancel** (iff `canCancel`), **Open recovery center** (links to `/admin/ar07-retry-failure-center?jobId=...` for failed), **View receipt** (opens `/admin/aig05-receipts-explorer?ref=...` if `receiptId`).
    - Buttons that aren't supported for that kind render disabled with a tooltip explaining why — **no dead buttons**.
  - Replace static "advisor" copy: a small `BackgroundOpsAdvisorStrip` derived from `summarizeJobs` (e.g., "3 imports failed in last 24h — open recovery", or "All clear · 12 syncs completed today"). Not a parallel advisor system, just a derived insight string + CTA, matching the Autopilot pattern.

**Validation gate:** Manual smoke in preview against demo + live mode, `tsc --noEmit` clean, all action buttons resolve to a real handler or honest disabled state.

---

## Phase 4 — Tests (gate before Phase 5)

**New files**
- `src/modules/business/domain/background-tasks/__tests__/types.test.ts`
  - Mappers produce expected `BackgroundJobVM` from sample rows of every source table.
  - `summarizeJobs` and `groupJobsBySection` cover empty, all-running, all-failed, mixed.
- `src/data/repositories/__tests__/business-background-tasks-service.test.ts`
  - Demo mode returns fixture. Live mode unauth returns `[]`. Per-source failure → `partial` flag, no throw.
- `src/modules/business/pages/__tests__/BackgroundTaskCenter.test.tsx`
  - Renders skeleton on loading, error card on error, empty state on `[]`, real rows + KPIs on ready.
  - Filter tabs filter the typed list.
  - Detail drawer opens on row click; retry button disabled when `canRetry === false`.

**Validation gate:** `bunx vitest run src/modules/business src/data/repositories/__tests__/business-background-tasks-service` all green.

---

## Phase 5 — Integration report (final gate)

**New file**
- `docs/integration/BACKGROUND_TASK_CENTER_INTEGRATION_REPORT.md`
  - Sections 1–10 per the spec: original issues, canonical systems reused, files added/changed, data wiring, observability/recovery integrations, UX states, wow upgrades, deferred items (with honest representation), tests added.

---

## OS / App impact

- **OS layer:** no changes needed — `BusinessAppShell` already mounts the page at `background-tasks`. The page lives inside the Business app surface only; it does not pollute the desktop shell or `TasksWorkflowsCenter` (which remains the user-task kanban).
- **Mobile/Admin:** out of scope; the relevant deep links (`/admin/ar07-retry-failure-center`, `/admin/aig05-receipts-explorer`) already exist and are reused, not duplicated.

## Hard rules I will hold to

- One in-progress phase at a time. No phase advances until the previous phase is `tsc`-clean and (from Phase 4) test-green.
- No new tables, no new edge functions, no new admin pages, no new advisor system, no `as any` in the page.
- Every action button is wired to a real handler or disabled with an explicit reason — zero dead UI.
