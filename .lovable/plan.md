

## Re-Audit — Checklist 16: 9.5/10, 1 Real Gap

DB + edge fns + crons + admin UI + CI gates all live. **One concrete bypass found.**

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Workflow engine explicit | ✅ | `workflow-execute` is canonical runner, deployed |
| 2 | Runtime state persisted | ✅ | All 8 tables present + RLS (verified live) |
| 3 | Steps inspectable | ✅ | `workflow_steps` with `receipt_id`, admin queries it |
| 4 | Retry/replay | ✅ | `workflow-replay` deployed, `next_retry_at` + `replayed_from` columns exist |
| 5 | Failures visible | ✅ | `WorkflowReplayAudit` queries live `workflow_runs`, no DEMO_RUNS |
| 6 | Automation policies explicit | ✅ | `scheduled_jobs.policy_family` + `kill_switch_class` columns live |
| 7 | Kill switches | ✅ | `automation_kill_switches` enforced in `workflow-execute` + `scheduler-dispatch` |
| 8 | Actions write proofs | ✅ | `workflow_receipts` written by execute + repair |
| 9 | **No hidden bypasses** | ❌ | **`event-processor/index.ts:117` inserts directly into `workflow_runs` + `workflow_steps`** — bypasses canonical runner, kill-switches, receipts, state transitions, stuck-detector |
| 10 | Stuck repair in admin | ✅ | `workflow-repair` has all 4 actions; admin Repair drawer wired |

### The Gap
`event-processor` is the event→workflow trigger fan-out. It calls `supabase.from("workflow_runs").insert(...)` and `workflow_steps.insert(...)` directly, then executes step 0 inline. This means:
- No `workflow_state_transitions` audit row
- No `workflow_receipts` written
- KS-WORKFLOW kill-switch never consulted on event-triggered runs
- `last_progress_at` never set → stuck-detector can't catch them
- Gate 34's bypass guard (`check-no-workflow-bypass.ts`) would flag this if run

---

## Phase 23.1 — Bypass Closure (1 file change + verification)

### 23.1.A — Route event-processor through canonical runner
Edit `supabase/functions/event-processor/index.ts` (lines ~100–160):
- Remove the direct `workflow_runs` + `workflow_steps` inserts and inline step-0 execution.
- Replace with a single call: `supabase.functions.invoke('workflow-execute', { body: { workflow_id, user_id, trigger: { type:'event', event_type, payload } } })`.
- `workflow-execute` already handles: kill-switch check → run insert → state transition → step records → receipts → first-step dispatch.
- Preserve the conditions filter (lines 102–114) — that stays in event-processor.

### 23.1.B — Verify Gate 34 bypass guard catches future regressions
Confirm `scripts/architecture/checks/check-no-workflow-bypass.ts` allowlist contains exactly the 4 canonical runners (it does) and that running it now returns 0 violations after the fix.

### 23.1.C — Refresh report
Re-emit `generated/workflow-reality-report.json` with a new `bypassScan: { violations: 0, scannedFiles: N }` evidence field.

### Files

| Layer | Change |
|---|---|
| `supabase/functions/event-processor/index.ts` | REWIRE — invoke `workflow-execute` instead of direct inserts |
| `scripts/architecture/checks/check-workflow-reality.ts` | EXTEND — embed bypass scan result in report |
| `generated/workflow-reality-report.json` | Refresh with `bypassScan` field |

### Acceptance
- `grep -r "workflow_runs.*insert\|workflow_steps.*insert" supabase/functions/` returns hits ONLY in the 4 canonical runners
- Triggering an event whose workflow has `KS-WORKFLOW` active → run is **rejected** at execute time (not silently created)
- Event-triggered run shows up in `workflow_state_transitions` and writes a `workflow_receipts` row for step 0
- `workflow-stuck-detector` can see `last_progress_at` on event-triggered runs
- Gate 34 + bypass guard both green; report `ok:true, bypassScan.violations=0`
- Checklist 16 truthfully **10/10 — fully deployable**

