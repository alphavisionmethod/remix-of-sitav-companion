

## Audit Verdict

**Implemented & verified live:**
- 3 DB tables (`ai_runtime_nightly_runs`, `ai_runtime_streak_state`, `ai_runtime_failure_alerts`) ✓
- Verifier edge function `ai-runtime-nightly-verify` (447 lines) ✓
- 6 audit `.md` artifacts in `generated/ai-runtime-truth-closure/` ✓
- 6 validation scripts in `scripts/validation/` ✓
- 6 BLOCK gates wired into `check-os-release-readiness.ts` (lines 187–192) ✓
- `pg_cron` job `sita-ai-runtime-nightly-verify` installed ✓
- 2 real runs persisted, last status = **PASS** with all 5 sub-checks green ✓
- Admin UI panel + tab in `AIRuntimeHome` ✓
- 3 SECURITY DEFINER RPCs (streak summary, ack alert) ✓

**Real gaps (not implemented despite being claimed):**

1. **4 required JSON artifacts missing on disk** — `ai-live-provider-status.json`, `ai-budget-enforcement-status.json`, `ai-nightly-streak-status.json`, `ai-runtime-truth-verification.json`. The prompt explicitly requires these exact filenames.
2. **No GitHub Actions workflow runs the nightly verifier** — only `pg_cron` does. Acceptance criterion A says "live-provider receipt assertions exist in CI" — currently the 6 validation scripts run, but the actual live verifier does not run from CI.
3. **No artifact-emitter script** — the JSON artifacts must be regenerated nightly from live DB state, not written once and stale.

## Plan to Close Gaps

### Phase 1 — Live Artifact Emitter Script (deployment-ready)

**New:** `scripts/validation/emit-ai-runtime-truth-artifacts.ts`
- Queries `ai_runtime_nightly_runs` (last 30d), `ai_runtime_streak_state`, `ai_runtime_failure_alerts`, `ai_inference_receipts`, `ai_usage_ledger`, `ai_fallback_events`, `ai_provider_health` via service-role client
- Emits 4 canonical JSON files into `generated/ai-runtime-truth-closure/`:
  - `ai-live-provider-status.json` — per-provider 7d success/fail counts + last receipt id + last invocation id
  - `ai-budget-enforcement-status.json` — last enforcement decision, ledger accumulation, refusal receipt
  - `ai-nightly-streak-status.json` — streak count, last pass/fail/degraded, classification (green/yellow/red)
  - `ai-runtime-truth-verification.json` — master rollup with hard `pass`/`fail`/`degraded` per check + acceptance-criteria mapping
- Emits gate report via existing `_lib/emit-gate-report.ts`
- Uses **only canonical tables** — no parallel data store

**Wire into:** `package.json` script `ai:runtime:emit-truth` and called from each of the 6 validation gates so artifacts always reflect latest DB truth.

### Phase 2 — GitHub Actions Workflow for Live CI Proof

**New:** `.github/workflows/ai-runtime-truth-nightly.yml`
- Schedule: `0 3 * * *` UTC (1h after pg_cron — gives verifier time to complete)
- Steps:
  1. Checkout + setup-node
  2. `npm ci`
  3. **Trigger live verify** via `curl POST` to `ai-runtime-nightly-verify` edge function (uses `${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}` — never committed)
  4. Wait for completion (poll `ai_runtime_nightly_runs` via SQL through existing `supabase-db-query` pattern, or sleep 30s)
  5. Run `npm run ai:runtime:emit-truth` (regenerates all 4 JSON artifacts from live DB)
  6. Run all 6 validation gates: `tsx scripts/validation/check-ai-*.ts`
  7. Upload artifacts (`generated/ai-runtime-truth-closure/`) with 30-day retention
  8. Fail workflow if any gate exits non-zero → surfaces failure in GitHub UI + alerts on-call
- Manual `workflow_dispatch` trigger for ad-hoc proof

### Phase 3 — Final Verification & Wiring

- Run emitter once locally (via edge function call) to populate the 4 JSON files immediately so master aggregator has full evidence today
- Re-run `check-os-release-readiness.ts` to confirm all 6 AI gates flip GREEN with artifacts present
- Update `AI_RUNTIME_TRUTH_FINAL_VERIFICATION.md` with workflow trigger URL + artifact regeneration cadence
- Add 1-line note to `AIRuntimeNightlyTruthPanel` showing "Last artifact emit: <timestamp>" so operators see the emitter ran

### Guardrails (preserved)
- No new tables, no new admin pages, no duplicate monitoring
- Reuses `ai-gateway`, all canonical receipt/ledger tables, `_lib/emit-gate-report`
- Service role key stays in GitHub Secrets only — never in repo
- Workflow runs **after** `pg_cron` so live invocation cost stays at ~$0.005/night (not doubled)
- Streak still requires 7 real consecutive nights — emitter cannot fabricate streak

### Files touched
- **New (2):** `scripts/validation/emit-ai-runtime-truth-artifacts.ts`, `.github/workflows/ai-runtime-truth-nightly.yml`
- **Edited (3):** `package.json` (1 npm script), `generated/ai-runtime-truth-closure/AI_RUNTIME_TRUTH_FINAL_VERIFICATION.md`, `src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx` (1 timestamp line)
- **Generated on first run (4):** the 4 required JSON artifacts

After this pass, every acceptance criterion in PART 7 is satisfied with live evidence on disk and in CI.

