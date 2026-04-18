

## Audit Result: Phase 2 is ~98% advanced — 2 real defects found

**117/117 release gates GREEN**, all 8 Phase 2 BLOCK validators pass, executor + safety RPC + 3 bridges + error-patrol UI + rollback path are real and wired. But two concrete defects exist that the validators don't catch:

### Defect 1 — Dead stub call (`internal-agent-execute-action/index.ts:397`)
```ts
await admin.rpc("noop").catch(() => {});
```
A non-existent RPC is invoked on every successful action and the error is silently swallowed. Pure dead code from an earlier scaffold. Validators don't catch it because it's wrapped in `.catch()`.

### Defect 2 — Status string mismatch breaks bridge telemetry
- Executor returns `status: "approval_pending"` (lines 271, 279)
- Loop bridges check `if (r.status === "queued_for_approval")` (lines 614, 678)
- **Result:** `aw-ai-spend-control` enqueues approvals correctly, but the bridge result always reports `approvalsQueued: 0`. Operator dashboards lie about how many approvals were generated.

### Plan (2 surgical fixes, 0 new files)

**Fix 1 — Remove dead stub**
Delete the `admin.rpc("noop")` line entirely.

**Fix 2 — Align status check with executor contract**
Change both bridge handlers to match the canonical executor response:
```ts
if (r.status === "approval_pending") result.approvalsQueued++;
```

**Fix 3 — Add a regression validator**
New `scripts/validation/check-bridge-status-contract.ts` that asserts the loop's status checks match the literal status strings the executor returns. Wire into `phase2:run-all` and the master aggregator (becomes gate #118).

### Why no other changes
- Safety RPC: real, 7 named gates, GRANT'd to service_role only ✓
- Whitelist enforcement: hardcoded set in executor + DB FK in intents table ✓
- Rollback handlers: `enable_connector` + `cancel_workflow_run` real ✓
- Receipts: every executed intent gets `ai_action_receipts` row + `receipt_id` backref ✓
- Kill-switch backfill: real migration, all admins seeded ✓
- Bridges: real RPCs (`list_stale_locked_workflow_runs`, `list_unhealthy_connector_accounts`, `list_unescalated_security_events`) — no mock data ✓
- Error patrol UI: reads `error_patrol_triage_view`, rollback button calls canonical executor ✓
- Auth: dual-mode (service-role from loop, admin user via `has_role`) ✓

### Files touched
- `supabase/functions/internal-agent-execute-action/index.ts` (delete 1 line)
- `supabase/functions/internal-agent-loop/index.ts` (fix 2 string literals)
- `scripts/validation/check-bridge-status-contract.ts` (new, ~30 lines)
- `scripts/architecture/checks/check-os-release-readiness.ts` (register gate)
- `package.json` (add to `phase2:run-all` script)

After these fixes, Phase 2 will be genuinely 100% advanced with no stubs, no silent telemetry gaps, and a regression gate to keep it that way.

