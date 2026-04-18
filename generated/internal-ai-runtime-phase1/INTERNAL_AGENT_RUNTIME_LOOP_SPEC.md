# Internal Agent Runtime Loop — Specification

**Function:** `supabase/functions/internal-agent-loop/index.ts`  
**Cron:** `internal-agent-loop-tick` — `*/5 * * * *` (every 5 minutes)  
**Trigger source:** `pg_cron` job invoking `net.http_post` to the function URL with anon-key bearer.

## Why one frequent loop with internal due-evaluation

The Phase 1 prompt's cadence model:

| Council class | Cadence |
|---|---|
| Reliability / Cost critical | every 5 min |
| Security / Architecture | hourly |
| Knowledge / Coordination | every 6 hours |
| Product / Recommendation | daily |

The cleanest project-native implementation is **a single cron tick every 5 min** that internally evaluates `schedule_type` per agent. This avoids registering 40+ individual cron jobs, keeps cadence in the agent definition (where it belongs), and lets operators retune cadence by updating the definition row alone.

## Algorithm

For each tick:

1. **Health gate** — verify `internal-agent-loop` kill switch is not active.
2. **Load due agents** — `SELECT * FROM internal_agent_definitions d JOIN internal_agent_runtime_state s ON s.agent_id = d.agent_id WHERE d.is_active = true`.
3. **Per agent due check:**
   - `continuous`: due if `last_run_at IS NULL OR last_run_at < now() - interval '5 minutes'`
   - `hourly`: due if `last_run_at < now() - interval '1 hour'`
   - `daily`: due if `last_run_at < now() - interval '24 hours'`
   - `on-event`: skip in cron tick (event-driven only)
4. **Per agent guards** (skip with reason if any fails):
   - `current_status` not in (`suspended`, `paused`)
   - `cooldown_until` is null or `< now()`
   - `consecutive_failures < 5` (otherwise auto-suspend + create escalation)
   - daily invocation count `< max_invocations_per_day`
5. **Budget gate** — call `check_ai_budget_policies(user_id, capability_key, est_cost)`; if `should_block` → record `escalated` action and create `council_escalations` row with `severity=medium, reason=budget_block`.
6. **Inference** — POST to Sovereign AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with the agent's mission + scoped evidence as system/user prompts. Capture cost, latency, tokens.
7. **Persist invocation** — insert into `ai_workforce_invocations` (canonical, not a parallel table).
8. **Persist action** — insert `internal_agent_actions` row with `invocation_id`, `confidence` parsed from response, `action_type` derived from autonomy level + confidence vs thresholds.
9. **Decide outcome:**
   - `confidence >= confidence_threshold_act` AND autonomy allows constrained action → execute, write `execution_result`, mark `succeeded`.
   - `confidence >= confidence_threshold_recommend` → write `recommend` action, no execution.
   - `confidence < confidence_threshold_recommend` → create `council_escalations` row (target = `primary_escalation_target`), mark action `escalated`.
   - Failure path → increment `consecutive_failures`, set `last_failure_at`, optionally enter cooldown.
10. **Update runtime state** — `last_run_at`, totals, `trust_score` (EMA over success ratio).
11. **Emit timeline event** for operator visibility.

## Safety guards (verified in `check-internal-agent-runtime-loop` validator)

The function source must contain these tokens:
- `checkAIBudget` — proves budget gating wired.
- `internal_agent_runtime_state` — proves state updates.
- `internal_agent_actions` — proves action persistence.
- `ai.gateway.lovable.dev` — proves canonical gateway use (no shadow inference).
- One of: `cooldown_until`, `is_active`, `suspension_reason` — proves kill-switch / cooldown handling.

## Manual trigger

Operators can also POST to the function with `{"trigger":"manual","agent_id":"..."}` from the `InternalAgentsBoard` "Run now" action — the same code path runs, scoped to a single agent.

## Failure containment

- Per-agent `try/catch` ensures one failing agent never aborts the tick.
- Auto-suspend at 5 consecutive failures; creates `severity=high` escalation to council supervisor.
- Budget exhaustion auto-downgrades model via `check_ai_budget_policies.fallback_model_id`.
- Kill-switch (`automation_kill_switches` with `switch_id='internal-agent-loop'`) immediately drains the loop.
