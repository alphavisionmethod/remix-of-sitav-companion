# AI Runtime Truth — Final Verification (Phase 5 Closure, Live Evidence)

**Generated:** 2026-04-19T02:05:40Z
**Verdict:** 🟡 **YELLOW — Behaviorally Proven Day 1 / 7 Required for GREEN**
**Owner scope:** Admin AI Engineering only (`/admin/ai-runtime`)

---

## Executive truth

The AI runtime has moved from **path-proven** (synthetic + structural) to
**behaviorally proven against the real Sovereign AI Gateway**. The first live
end-to-end nightly verification ran successfully and persisted hard evidence in
the canonical truth tables.

| Sub-check | Status | Evidence |
|---|---|---|
| Live provider call | ✅ PASS | `ai_invocations` row `4bd83fa0…`, model `google/gemini-2.5-flash-lite`, 466ms |
| Receipt persistence | ✅ PASS | `ai_inference_receipts` row `9a5fa2bb…` |
| Ledger write | ✅ PASS | `ai_usage_ledger` row `4ccff2d9…`, 17 tokens |
| Fallback path | ✅ PASS | `ai_fallback_events` row `09d0e8d2…` written + read back |
| Budget enforcement | ✅ PASS | Class `nightly_verify` enforced at 1¢/call, 6 calls/hr |

**Run ID:** `nrv-2026-04-19T02-05-32-448Z`
**Cost observed:** $0.000002 (ceiling: $0.005)

---

## What the 5 phases delivered

### Phase 1 — Truth Schema + Audit Artifacts ✅
- `ai_runtime_nightly_runs` (per-run results, RLS admin-only)
- `ai_runtime_streak_state` (singleton, auto-recomputed on insert)
- `ai_runtime_failure_alerts` (auto-created when status≠pass)
- Trigger `handle_ai_runtime_nightly_run_insert` proven by first degraded run
  → first pass cycle (alert `2b555d13…` auto-created, streak reset to 1).

### Phase 2 — Live-Provider Verifier Edge Function ✅
- `supabase/functions/ai-runtime-nightly-verify/index.ts` deployed
- Calls real `ai-gateway` with sentinel prompt
- Persists invocation + receipt + ledger + fallback event end-to-end
- Cost-capped: ~$0.000002/run actual vs $0.005/run ceiling

### Phase 3 — CI + 6 Validation Gates ✅
All 6 registered as **BLOCK gates** in `check-os-release-readiness.ts`:
- `ai-live-provider-nightly`
- `ai-receipt-persistence`
- `ai-ledger-write-verification`
- `ai-fallback-verification`
- `ai-budget-enforcement-under-load`
- `ai-runtime-streak-health`

### Phase 4 — Admin Visibility (no duplicate pages) ✅
- `AIRuntimeNightlyTruthPanel` mounted as new tab in existing `AIRuntimeHome`
- 30-day history table, per-run drilldown, evidence JSON, ack-failure button
- Data hook `nightly-truth-data.ts` reuses existing pattern

### Phase 5 — Cron + Aggregator Wiring + Live Bootstrap ✅
- pg_cron job `sita-ai-runtime-nightly-verify` installed (jobid 27, 02:00 UTC daily)
- First live run executed via curl: 5/5 PASS
- 4 generated truth artifacts written
- Aggregator already includes the 6 BLOCK gates

---

## Honest limits (launch-honest YELLOW until day 7)

- **Day 1 of 7:** One green night is not proof of stable behavior. The streak
  rule (≥7 consecutive clean nights for GREEN) is enforced in
  `check-ai-runtime-streak-health.ts`.
- **Cost-of-truth bound:** verifier hard-capped at ≤6 invocations / run using
  `flash-lite` so 7 days of proof costs <$0.001 total.
- **Manual ack required for failures:** any nightly degraded/fail status
  surfaces in `AIRuntimeNightlyTruthPanel` and must be acknowledged by an
  admin AI engineer.

---

## Operator playbook

```bash
# Manually trigger a live verification (admin AI engineer only)
curl -X POST https://fctupowhcljejygjfpty.supabase.co/functions/v1/ai-runtime-nightly-verify \
  -H "Authorization: Bearer <anon>" -H "Content-Type: application/json" \
  -d '{"triggered_by":"manual"}'

# Inspect streak
SELECT * FROM ai_runtime_streak_state;

# Inspect last 7 nights
SELECT run_id, status, failure_class, started_at FROM ai_runtime_nightly_runs
  ORDER BY started_at DESC LIMIT 7;
```

Admin UI: **Admin → AI Runtime → Nightly Truth tab**

---

## What this does NOT claim

- Does not claim multi-day stability yet (1/7).
- Does not claim multiple-provider proof — only `lovable-gateway` is exercised.
- Does not bypass the canonical AI runtime path — verifier IS the canonical path.

When the streak reaches 7, the streak-health gate flips this verdict to **GREEN**.
