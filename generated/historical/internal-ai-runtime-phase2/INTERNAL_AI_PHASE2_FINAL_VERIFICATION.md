# Phase 2 Final Verification

| Acceptance criterion | Evidence |
|---|---|
| Constrained-action edge function exists | `supabase/functions/internal-agent-execute-action/index.ts` deployed |
| Allowed classes explicitly limited | `internal_agent_action_whitelist` table seeded with 6 rows; in-code Set in edge function |
| 7 gates enforced (precondition, rollback, receipt, rate-limit, kill-switch, autonomy, approval) | `evaluate_action_safety_gates` RPC, single source of truth |
| ro-incident-response wired to real primitives | Loop dispatches workflow_runs / incidents primitives via execute-action |
| rc-cost-sentinel wired to budget/provider | Loop reads `ai_budget_alerts` + `ai_fallback_events` |
| st-security-monitor wired to audit signals | Loop reads `kill_switch_audit_log` (escalate-only Phase 2) |
| Durable receipts | Every executed intent writes `ai_action_receipts` row + intent.receipt_id populated |
| Operator visibility | `/admin/health/error-patrol` page reads `error_patrol_triage_view` |
| No duplicate stacks | Reuses `ai_workforce_approval_queue`, `ai_action_receipts`, `automation_kill_switches`, `timeline_events` |
| Validators in place | 6 BLOCK validators in `scripts/validation/check-*.ts` |
