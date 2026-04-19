# AI Runtime — Current State Audit (Truth Closure Phase 1)

> Generated: 2026-04-19
> Scope: Admin AI Engineer team (`/admin/ai-runtime/*`)

## What is already real

| Surface | Status | Evidence |
|---|---|---|
| `ai-gateway` edge function | REAL | Deployed, used by `invokeAICapability` everywhere |
| `ai_invocations` table | REAL | 35-table AI fabric, RLS-protected, persistent |
| `ai_usage_ledger` table | REAL | Append-only ledger with cost tracking |
| `ai_inference_receipts` table | REAL | Per-invocation receipt persistence |
| `ai_fallback_events` table | REAL | Records fallback attempts & outcomes |
| `ai_provider_health` snapshot | REAL | Periodic health probes |
| `ai_workforce_budget_classes` | REAL | Per-user budget envelopes |
| `check_ai_budget_policies` RPC | REAL | Server-side budget enforcement (fail-closed) |
| Synthetic gate tests | REAL | Path-proof at structural level |

## What was missing (now closed by this work)

| Gap | Closure |
|---|---|
| No nightly live-provider verification | ✅ `ai-runtime-nightly-verify` edge function — calls real Lovable AI Gateway |
| No persistent record of nightly runs | ✅ `ai_runtime_nightly_runs` table |
| No 7-day clean-night streak tracking | ✅ `ai_runtime_streak_state` singleton + DB trigger |
| No operator-acknowledgeable failure surface | ✅ `ai_runtime_failure_alerts` table + `acknowledge_ai_runtime_failure_alert` RPC |
| No admin drilldown for nightly truth | ✅ `AIRuntimeNightlyTruthPanel.tsx` mounted in `AIRuntimeHome` |
| No CI gates verifying behavioral truth | ✅ 6 new validation scripts wired to master aggregator |

## What remains synthetic (acceptable)

- The "fallback path" sub-check writes a synthetic `ai_fallback_events` row to prove the writer/reader path works. Real fallbacks also happen organically in production traffic and surface in the same table.
- The "budget enforcement" sub-check verifies infrastructure (classes table, alerts table, ledger accumulation) rather than firing a runaway-load probe — that would burn meaningful spend without proportional truth gain. The real enforcement is exercised constantly by production traffic via the `check_ai_budget_policies` RPC.

## Cost profile per nightly run

- Model: `google/gemini-2.5-flash-lite`
- Sentinel prompt: ~10 tokens in, ≤8 tokens out
- Estimated cost: **~$0.0000018 per probe** (effectively free at one probe/night)
- Hard cap: 1 live invocation per scheduled run; manual triggers also limited to 1
