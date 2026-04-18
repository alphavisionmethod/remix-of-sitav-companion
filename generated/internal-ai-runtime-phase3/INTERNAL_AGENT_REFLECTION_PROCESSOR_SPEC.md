# `internal-agent-reflect` — Processor Specification

## Function
`supabase/functions/internal-agent-reflect/index.ts`

## Schedule
pg_cron `sita-internal-agent-reflect` — every 30 minutes (`*/30 * * * *`).

## Inputs
```json
{ "lookback_hours": 2, "max_batch": 50 }
```

## Behavior
1. Selects `internal_agent_action_intents` executed within `lookback_hours` not yet reflected.
2. For each, gathers evidence: receipts, error logs, downstream effects.
3. Scores outcome (0–1) based on:
   - explicit success/failure flag
   - error rate delta in surrounding window
   - rollback-triggered (penalty)
   - budget overrun (penalty)
4. Calls `record_internal_agent_reflection` RPC which:
   - Inserts reflection row
   - Updates `internal_agent_runtime_state.trust_score` via EWMA: `α=0.2`, bounded [0,1]
5. Idempotent: re-running on same intent is a no-op (UNIQUE on `(agent_id, action_intent_id)`).

## Trust score update
- Only path: `record_internal_agent_reflection` RPC
- No edge function or page may write `trust_score` directly (enforced by gate `trust-score-update-logic`)
- Audit trail: every change leaves a reflection row referencing the cause
