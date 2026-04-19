

## AI Runtime Truth Closure — 5 Phase Plan

**Goal:** Move AI runtime from "path-proven" to "behaviorally proven, live-provider verified, cost-ceiling enforced under load, 7-day streak tracked, operator-visible." Integrated **only on the Admin AI Engineer** team surfaces (`/admin/ai-runtime/*`). No duplicates — extends existing `ai-gateway`, `ai_invocations`, `ai_usage_ledger`, `ai_inference_receipts`, `ai_fallback_events`, `AIRuntimeHome`, `NightlyProofBadge`, and existing nightly workflows.

---

### Phase 1 — Truth Schema + Audit Artifacts (deployment-ready standalone)

**DB migration** (additive, no destructive changes):
- `ai_runtime_nightly_runs` — one row per nightly run: `run_id`, `started_at`, `completed_at`, `status` (pass/fail/degraded), `provider_calls_ok`, `receipts_verified`, `ledger_verified`, `fallback_verified`, `budget_enforced`, `failure_class`, `evidence_jsonb`. RLS: admin-read only.
- `ai_runtime_streak_state` — singleton: `current_streak_days`, `last_pass_at`, `last_fail_at`, `last_failure_class`, `streak_started_at`. RLS: admin-read only.
- `ai_runtime_failure_alerts` — `alert_id`, `run_id`, `failure_class`, `severity`, `acknowledged_at`, `acknowledged_by`. RLS: admin-read/write via `has_admin_permission`.
- Trigger: on insert into `ai_runtime_nightly_runs`, recompute streak; if status=fail, insert alert row.

**Artifacts** (`generated/ai-runtime-truth-closure/`):
- `AI_RUNTIME_CURRENT_STATE_AUDIT.md` — what's already real vs. synthetic
- `AI_RUNTIME_NIGHTLY_VERIFICATION_MODEL.md` — canonical flow design
- `AI_BUDGET_AND_CEILING_AUDIT.md`
- `AI_COST_CEILING_LOAD_PROOF_MODEL.md`
- `AI_RUNTIME_FAILURE_CLASSES.md` — 9 classes (provider_unavailable, invocation_invalid, receipt_missing, ledger_missing, fallback_failed, budget_enforcement_failed, budget_overrun_unblocked, model_routing_mismatch, verification_query_mismatch)

---

### Phase 2 — Live-Provider Nightly Verifier Edge Function

**New edge function:** `supabase/functions/ai-runtime-nightly-verify/index.ts`
- Service-role auth + admin caller check
- Executes 5 canonical sub-checks against the **real `ai-gateway`** (cheapest model: `google/gemini-2.5-flash-lite`, capped at ~6 invocations / run):
  1. **live_provider_call** — invokes gateway with sentinel prompt, asserts 200 + content
  2. **receipt_persistence** — re-queries `ai_inference_receipts` by invocation_id
  3. **ledger_write** — re-queries `ai_usage_ledger` matches invocation
  4. **fallback_path** — invokes with deliberately-failing primary model, asserts `ai_fallback_events` row written
  5. **budget_enforcement_under_load** — uses `ai_workforce_budget_classes` test class (already exists) at 95% utilization, fires N+1 calls, asserts the (N+1)th is refused and a refusal receipt persists
- Inserts result row into `ai_runtime_nightly_runs` (trigger handles streak + alert)
- Writes `generated/ai-runtime-truth-closure/ai-runtime-truth-verification.json` via response payload

**Cost guardrail:** hard-cap ~$0.005/run via `gemini-2.5-flash-lite`, dry-run mode flag for CI without live credits.

---

### Phase 3 — CI Wiring + 6 Validation Scripts

**Validation scripts** (`scripts/validation/`):
- `check-ai-live-provider-nightly.ts` — reads latest `ai_runtime_nightly_runs` row, fails if >36h stale or status=fail
- `check-ai-receipt-persistence.ts` — asserts last 24h `ai_inference_receipts` count > 0 and matches `ai_invocations`
- `check-ai-ledger-write-verification.ts` — asserts `ai_usage_ledger` rows match invocation count
- `check-ai-fallback-verification.ts` — asserts last 7d has ≥1 fallback event proving path works
- `check-ai-budget-enforcement-under-load.ts` — asserts last nightly run includes `budget_enforced=true`
- `check-ai-runtime-streak-health.ts` — reads `ai_runtime_streak_state`, classifies streak, writes `ai-nightly-streak-status.json`

All emit gate reports via existing `_lib/emit-gate-report.ts`.

**Cron schedule** (via `pg_cron` + `pg_net`, inserted directly to DB so anon key isn't repo-committed):
- `ai-runtime-nightly-verify-tick` — daily 02:00 UTC, hits the edge function

**CI wiring:** add 6 new gate steps to `playwright-proof-nightly.yml` and `ci.yml` after existing AI gates. Add to master release aggregator (`check-os-release-readiness.ts`) at BLOCK level.

---

### Phase 4 — Admin Visibility (extend existing surfaces only — no new pages)

**Extend `AIRuntimeDrilldownPanel.tsx`** (already mounted in `InternalAgentsBoard`):
- Replace minimal `NightlyProofBadge` with rich panel showing:
  - Current 7-day streak (with day-by-day dots)
  - Last pass/fail timestamps + failure class
  - Per-sub-check status (5 checks from Phase 2)
  - Last live provider receipt link → drill into `ai_inference_receipts` row
  - Last fallback event link
  - Last budget enforcement decision
  - Acknowledge-failure button (writes to `ai_runtime_failure_alerts`)

**Extend `AIRuntimeHome.tsx`** with one new tab (no separate route):
- `id: "nightly-truth"` → `AIRuntimeNightlyTruthPanel` (new component, lives in `src/components/admin/ai-runtime/`)
- Shows full 30-day history table, per-run drilldown, evidence JSON viewer

**Data hook:** `src/lib/internal-agents/runtime/nightly-truth-data.ts` — single typed loader querying the 3 new tables. Reuses existing pattern from `agent-drilldown-data.ts`.

---

### Phase 5 — Final Verification + Reports + Master Aggregator Wiring

**Generated artifacts** (final outputs):
- `ai-live-provider-status.json` — per-provider success/failure last 7d
- `ai-budget-enforcement-status.json` — last enforcement decision + ledger proof
- `ai-nightly-streak-status.json` — current streak + classification
- `ai-runtime-truth-verification.json` — master rollup
- `AI_RUNTIME_TRUTH_FINAL_VERIFICATION.md` — operator-facing summary

**Master aggregator integration:**
- Register 6 new gates in `check-os-release-readiness.ts` BLOCK list
- Update `generated/os-release-readiness-report.json` to include AI runtime truth section
- Streak <3 days → YELLOW; ≥7 days → GREEN; any unack'd failure → RED

**Failure alerting:**
- Reuse existing `notification_delivery_receipts` + admin notification path
- Trigger on `ai_runtime_failure_alerts` insert → notification to admin AI engineer team only

**Final run:** trigger one live verify, confirm row persists, badge updates, gate passes.

---

### Technical guardrails

- **No duplicates:** extends `ai-gateway`, `AIRuntimeDrilldownPanel`, `AIRuntimeHome`, `NightlyProofBadge`, existing nightly workflows
- **No stubs:** every script queries real tables; edge function calls real provider
- **No fake green:** streak resets on any failure; one pass ≠ proven (need 7)
- **No reckless spend:** flash-lite model, ≤6 calls/run, ~$0.005/night
- **Admin-only scope:** all UI under `/admin/ai-runtime/*`; RLS restricts to `has_admin_permission`
- **Reuses canonical:** `ai_invocations`, `ai_usage_ledger`, `ai_inference_receipts`, `ai_fallback_events`, `ai_workforce_budget_classes`, `notification_delivery_receipts`, `_lib/emit-gate-report`

Each phase ships independently deployment-ready. Phase 5 requires 7 nights to reach GREEN streak — until then the aggregator honestly reports YELLOW (launch-honest).

