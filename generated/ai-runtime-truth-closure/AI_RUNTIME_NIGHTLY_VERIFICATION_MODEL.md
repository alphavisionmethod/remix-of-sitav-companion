# Nightly AI Runtime Verification — Canonical Model

## Flow

```
pg_cron (02:00 UTC daily)
  │
  ▼
net.http_post → /functions/v1/ai-runtime-nightly-verify
  │
  ▼
ai-runtime-nightly-verify edge function (service-role)
  │
  ├─ Sub-check 1: live_provider_call
  │     POST https://ai.gateway.lovable.dev/v1/chat/completions
  │     model: google/gemini-2.5-flash-lite
  │     prompt: sentinel "Reply with the single word: ACK"
  │     → INSERT ai_invocations, ai_usage_ledger, ai_inference_receipts
  │
  ├─ Sub-check 2: receipt_persistence
  │     SELECT ai_inference_receipts WHERE capability_id = 'ai-runtime-nightly-verify'
  │
  ├─ Sub-check 3: ledger_write
  │     SELECT ai_usage_ledger WHERE capability_key = 'ai-runtime-nightly-verify'
  │
  ├─ Sub-check 4: fallback_path
  │     INSERT ai_fallback_events (synthetic probe)
  │     SELECT back to prove read path
  │
  └─ Sub-check 5: budget_enforcement
        SELECT ai_workforce_budget_classes (must have ≥1 row)
        SELECT ai_budget_alerts (must be queryable)
        SELECT ai_usage_ledger 24h (must have organic traffic)
  │
  ▼
INSERT ai_runtime_nightly_runs (status, per-check booleans, evidence)
  │
  ▼
TRIGGER handle_ai_runtime_nightly_run_insert
  ├─ if status = pass → streak += 1
  └─ if status = fail/degraded → streak = 0, INSERT ai_runtime_failure_alerts
  │
  ▼
Admin drilldown via AIRuntimeNightlyTruthPanel
  ├─ Streak summary (current / longest / classification)
  ├─ 30-day history table
  ├─ Per-run drilldown
  ├─ Evidence JSON viewer
  └─ Failure acknowledgment (writes acknowledged_at)
```

## Streak classification

| Streak | Classification | Verdict |
|---|---|---|
| ≥ 7 clean nights, 0 unack failures | GREEN | Behaviorally proven |
| 3–6 clean nights, 0 unack failures | YELLOW | Building proof |
| < 3 clean nights | BUILDING | Insufficient proof |
| ANY unacknowledged failure | RED | Operator action required |

## Why service-role for cron

The pg_cron job runs without a user session, so the verifier uses the
service role key to write `ai_invocations`, `ai_usage_ledger`,
`ai_inference_receipts`, `ai_fallback_events`, and `ai_runtime_nightly_runs`.
All written rows use a system tenant ID (`00000000-0000-0000-0000-000000000000`)
that is excluded from user-facing budget calculations.
