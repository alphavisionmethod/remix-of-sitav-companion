# AI Runtime Truth — Final Verification Summary

> Operator-facing summary of the AI Runtime Truth Closure pass.

## What changed

The Sovereign AI Gateway, ledger, receipts, and fallback infrastructure
were already real and in production. This closure adds **behavioral
proof over time** — verifying nightly that the live runtime path
actually works, with hard pass/fail evidence and operator visibility.

## Components shipped

### Database (Phase 1)
- `ai_runtime_nightly_runs` — one row per nightly run with per-sub-check booleans
- `ai_runtime_streak_state` — singleton tracking 7-day clean-night streak
- `ai_runtime_failure_alerts` — operator-acknowledgeable failures
- Trigger `handle_ai_runtime_nightly_run_insert` — auto-recomputes streak + alerts
- RPC `acknowledge_ai_runtime_failure_alert` — admin-gated
- RPC `get_ai_runtime_streak_summary` — admin-gated rich read

### Edge function (Phase 2)
- `ai-runtime-nightly-verify` — calls real Lovable AI Gateway, writes 5
  sub-check results, persists invocation/ledger/receipt rows

### Validation gates (Phase 3 — wired to master aggregator)
- `ai-live-provider-nightly`
- `ai-receipt-persistence`
- `ai-ledger-write-verification`
- `ai-fallback-verification`
- `ai-budget-enforcement-under-load`
- `ai-runtime-streak-health`

### Admin UI (Phase 4 — Admin AI Engineer team only)
- `AIRuntimeNightlyTruthPanel.tsx` — mounted as "Nightly Truth" tab in `/admin/ai-runtime`
- Streak summary, 30-day history, per-run drilldown, evidence JSON viewer
- Manual trigger button
- Failure acknowledgment with notes
- Extended `NightlyProofBadge` — already shown on InternalAgentsBoard

### Cron schedule (Phase 5)
- `ai-runtime-nightly-verify-tick` — daily 02:00 UTC

## Cost profile

- Per run: ~$0.000002 (one `gemini-2.5-flash-lite` sentinel call)
- Per year: ~$0.001 total

## How to read the verdict

| Streak | Classification | Action |
|---|---|---|
| ≥ 7 nights, 0 unack | **GREEN** | Behaviorally proven — release-cuttable |
| 3–6 nights, 0 unack | **YELLOW** | Building — release-cuttable with note |
| < 3 nights | **BUILDING** | Insufficient proof — wait |
| Any unack failure | **RED** | Operator must acknowledge |

## How to trigger

- **Automatic**: pg_cron at 02:00 UTC daily
- **Manual**: Admin AI Engineer → AI Runtime → Nightly Truth tab → "Trigger now"
- **Direct**: `supabase.functions.invoke("ai-runtime-nightly-verify", { body: { triggered_by: "manual" } })`

## Launch honesty

Until 7 consecutive clean nights have run in production, the master
release aggregator will report YELLOW for the AI runtime truth section.
This is intentional and honest — one passing run is not proof.

## CI / artifact cadence (added in closure pass)

- **CI workflow**: `.github/workflows/ai-runtime-truth-nightly.yml`
  - Schedule: `0 3 * * *` UTC (1h after pg_cron)
  - Manual trigger: GitHub → Actions → "AI Runtime Truth — Nightly" → Run workflow
  - Steps: trigger live verifier → wait 30s → emit JSON artifacts → run 6 gates → upload evidence (30d retention)
- **Artifact emitter**: `scripts/validation/emit-ai-runtime-truth-artifacts.ts`
  - npm script: `npm run ai:runtime:emit-truth`
  - Combined: `npm run ai:runtime:truth:run-all`
  - Reads canonical tables (`ai_runtime_nightly_runs`, `ai_runtime_streak_state`,
    `ai_runtime_failure_alerts`, `ai_inference_receipts`, `ai_usage_ledger`,
    `ai_fallback_events`, `ai_budget_alerts`) via service role
  - Writes 4 canonical JSON files (live-provider, budget, streak, master rollup)
- **Required GitHub Secrets**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
