
## Cron / Scheduler / Automation Reality

### Database (Migration)
1. **`scheduled_jobs`** — canonical job registry (id, name, domain, cron_expression, target_function, job_class, risk_tier, autonomy_tier, state, policy_family, kill_switch_class, last_run_at, next_run_at, retry_policy, max_retries, environment, metadata)
2. **`job_executions`** — durable execution history (id, job_id, started_at, completed_at, status, attempt_number, output, error, duration_ms, policy_decision, verification_result, triggered_by)
3. **`automation_kill_switches`** — global/domain/job kill switches (id, scope, scope_id, enabled, reason, activated_by, activated_at)
4. RLS policies for all tables

### Edge Function
5. **`scheduler-dispatch`** — the dispatcher that:
   - Reads due jobs from `scheduled_jobs`
   - Checks kill switches
   - Checks policy gates
   - Invokes target functions
   - Records execution in `job_executions`
   - Handles retries with backoff
   - Respects demo/real mode

### pg_cron Setup
6. Schedule `scheduler-dispatch` to run every minute via pg_cron + pg_net

### Seed Data
7. Register canonical jobs: self-healing check, agent heartbeat, system maintenance, budget enforcement, digest generation

### Admin Pages (9 pages, routed under /admin/automation/*)
8. **AR01** — Automation Reality Overview
9. **AR02** — Scheduled Job Registry
10. **AR03** — Self-Healing Execution Board
11. **AR04** — Agent Scheduler Control Plane
12. **AR05** — System Maintenance Board
13. **AR06** — Execution Trace Explorer
14. **AR07** — Retry / Failure Center
15. **AR08** — Kill Switch & Safety Center
16. **AR09** — Automation Launch Gate
