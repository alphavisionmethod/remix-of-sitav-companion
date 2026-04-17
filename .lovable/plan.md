

## Re-Audit — Checklists 15 & 16

### Checklist 15: Integrations / Connectors → 12/12 ✅ (verified, no changes)
All 8 tables, 5 edge fns, 2 crons, Gate 33 confirmed live.

### Checklist 16: Workflows / Automation → 1/10 ❌ CRITICAL FAÇADE

**Live DB has NONE of the workflow/automation tables** despite migrations existing in source (likely lost in rebase). 40+ files, 4 admin pages, and `scheduler-dispatch` edge fn all reference missing tables.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Workflow engine explicit | ⚠️ | `workflow-engine` service exists (in-memory only) |
| 2 | Runtime state persisted | ❌ | `workflows`, `workflow_runs`, `workflow_steps` **MISSING from DB** |
| 3 | Steps inspectable | ❌ | No `workflow_steps` table; `WorkflowReplayAudit.tsx` uses `DEMO_RUNS` mock |
| 4 | Retry/replay exists | ⚠️ | `WorkflowReplayEngine` in-memory; no DB replay log |
| 5 | Failures visible | ❌ | Admin pages query missing tables → render empty |
| 6 | Automation policies explicit | ❌ | `scheduled_jobs.policy_family` column missing (table missing) |
| 7 | Kill switches exist | ❌ | `automation_kill_switches` **MISSING**; KS-WORKFLOW/KS-AUTOMATIONS declared but no DB enforcement |
| 8 | Actions write proofs | ❌ | No `workflow_receipts` table; no proof binding |
| 9 | No hidden bypasses | ⚠️ | `check-no-hidden-executor.ts` exists; no workflow-specific check |
| 10 | Stuck workflow repair in admin | ❌ | No `force_complete` / repair action; only mock data |

**Truth: 1/10 partial, 9/10 hard fails.**

---

## Phase 23 — Workflow & Automation Reality Closure

### 23.A — Restore + extend the missing 8 tables (fixes 2,3,5,6,7,8)
DB migration:
- **`workflows`** — id, user_id, name, domain, version, trigger_type, trigger_config jsonb, steps jsonb, enabled, policy_family, kill_switch_class, retry_policy jsonb, approval_required, metadata
- **`workflow_runs`** — id, user_id, workflow_id FK, status (pending|running|paused|awaiting-approval|completed|failed|cancelled|stuck), current_step, context jsonb, correlation_id, started_at, completed_at, last_progress_at, error, force_terminated_by
- **`workflow_steps`** — id, run_id FK, step_index, step_id, step_type, status, input jsonb, output jsonb, retries, started_at, completed_at, error, receipt_id
- **`workflow_state_transitions`** — id, run_id, from_state, to_state, reason, actor, timestamp (insert-only audit)
- **`workflow_receipts`** — id, run_id, step_id, action, hash, evidence jsonb, created_at (insert-only)
- **`scheduled_jobs`** — full schema from migration `20260405233420` (with `policy_family`, `kill_switch_class`)
- **`job_executions`** — full schema (started_at, status, retries, output, error)
- **`automation_kill_switches`** — id, user_id, scope (global|domain|job_class|workflow_id), scope_id, enabled, reason, activated_by, activated_at, deactivated_at
All RLS user-scoped + admin-RW; indexes on status/next_run_at/run_id.

### 23.B — Stuck workflow detector + repair (fixes 10)
- **NEW edge fn `workflow-stuck-detector`** — every 5 min, finds runs where `status='running'` AND `last_progress_at < now() - 30min`; flips to `status='stuck'`; emits Phase 20 alert; writes `workflow_state_transitions` row.
- **NEW edge fn `workflow-repair`** — admin-gated actions: `retry` (re-enqueue current step), `force_complete` (mark completed + audit), `force_fail` (mark failed + audit), `rollback` (run compensation steps). Every action writes `workflow_receipts` + `timeline_events`.
- **CRON `sita-workflow-stuck-detector-5m`** every 5 min.

### 23.C — Wire scheduler-dispatch + dispatcher cron (fixes 6, 7)
- **CRON `sita-scheduler-dispatch-1m`** every minute → `scheduler-dispatch` (already deployed but never invoked).
- Update `scheduler-dispatch` to also check `KS-WORKFLOW` + `KS-AUTOMATIONS` runtime kill-switches via `checkKillSwitchOrReject`.

### 23.D — Workflow runner edge fn + receipts (fixes 1, 4, 8)
- **NEW edge fn `workflow-execute`** — canonical runner. Reads `workflows`, creates `workflow_runs` + `workflow_steps`, advances state, writes `workflow_state_transitions` + `workflow_receipts` per step, honors retry policy with exponential backoff via `next_retry_at`.
- **NEW edge fn `workflow-replay`** — admin: replay a failed run by run_id, creates new run with `replayed_from` link.

### 23.E — Hidden bypass check (fixes 9)
- **NEW `scripts/architecture/checks/check-no-workflow-bypass.ts`** — scans for direct `workflow_runs.insert` outside `workflow-execute`/`workflow-repair` fns. Fail if found.

### 23.F — Wire admin pages to real tables (fixes 3, 5, 10)
- `WorkflowReplayAudit.tsx` — replace `DEMO_RUNS` with live query of `workflow_runs` + `workflow_steps`. Add Repair drawer with Retry/Force-Complete/Force-Fail/Rollback buttons calling `workflow-repair`.
- `AR01AutomationOverview.tsx` — already wired, will start showing real rows once tables exist.

### 23.G — Gate 34 + report
- **NEW `scripts/architecture/checks/check-workflow-reality.ts`** (Gate 34):
  - All 8 tables exist + RLS on
  - Edge fns `workflow-execute`, `workflow-repair`, `workflow-stuck-detector`, `workflow-replay` deployed
  - Crons `sita-scheduler-dispatch-1m` + `sita-workflow-stuck-detector-5m` active
  - `WorkflowReplayAudit` references real query (not `DEMO_RUNS`)
  - `KS-WORKFLOW` enforcement points include `workflow-execute` + `scheduler-dispatch`
  - Emit `generated/workflow-reality-report.json`
- Bump `gateCount: 34` in `ci-gate-registry.ts` + `ci-umbrella-manifest.json`.
- Register 8 new tables in `non-edge-table-io-sources.ts`.

### Files

| Layer | Change |
|---|---|
| DB migration | 8 tables (workflows + 4 workflow children + 3 automation), RLS, indexes, FKs |
| Edge fn `workflow-execute` | NEW — canonical runner |
| Edge fn `workflow-repair` | NEW — retry/force-complete/force-fail/rollback |
| Edge fn `workflow-stuck-detector` | NEW — 5-min sweep |
| Edge fn `workflow-replay` | NEW — admin replay |
| Edge fn `scheduler-dispatch` | EXTEND — KS-WORKFLOW/KS-AUTOMATIONS gates |
| `WorkflowReplayAudit.tsx` | REWIRE — live data + Repair drawer |
| `scripts/architecture/checks/check-workflow-reality.ts` | NEW Gate 34 |
| `scripts/architecture/checks/check-no-workflow-bypass.ts` | NEW bypass check |
| `src/lib/ci/ci-gate-registry.ts` + manifest | gateCount 34 |
| `src/lib/db/non-edge-table-io-sources.ts` | register 8 tables |
| Cron inserts | `sita-scheduler-dispatch-1m` + `sita-workflow-stuck-detector-5m` |
| `generated/workflow-reality-report.json` | NEW |

### Acceptance

- All 8 tables exist with RLS; `SELECT * FROM workflows LIMIT 1` succeeds (empty OK)
- `cron.job` contains `sita-scheduler-dispatch-1m` + `sita-workflow-stuck-detector-5m` active
- `workflow-execute` end-to-end: insert workflow → invoke → run row created → steps advance → receipts written → terminal status
- Stuck detector flips a synthetic stale run to `status='stuck'` within 5 min + emits alert
- `workflow-repair { action:'force_complete', run_id }` writes audit + transitions to `completed`
- `WorkflowReplayAudit` admin page renders real rows + Repair buttons functional
- Activating `KS-AUTOMATIONS` causes `scheduler-dispatch` to skip dispatch (proof receipt)
- Gate 34 green; CI Umbrella `gateCount: 34`; report `ok:true`
- Checklist 16 truthfully **10/10 — fully deployable**

