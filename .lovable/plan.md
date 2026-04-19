

## Connector Truth Closure — 5 Phase Plan

**Goal:** Promote connector truth from "hourly probes running, structurally correct" to "behaviorally proven over 7 days, expiry-pressure tested, durable streak object, long-tail manual-classified everywhere, admin-AI-engineer-visible." All work **extends** existing `oauth-refresh-probe`, `oauth_refresh_probe_results`, `connector_effective_state`, `ConnectorStateBadge`, `OAuthRefreshHealthBoard`, `IntegrationStreakPanel`, `IntegrationReceiptDrawer`, and the canonical state grammar — **zero duplication**.

**Admin AI Engineer scope:** Canonical control surface stays at `/admin/integrations` (where it already lives). A read-only `ConnectorTruthSummaryPanel` is added as a new tab in `AIRuntimeHome` (`/admin/ai-runtime`) so the AI Engineer team sees connector truth side-by-side with AI runtime truth — no duplicate dashboards, just a summary panel that links back to the canonical OAuth board for any action.

---

### Phase 1 — Truth Schema + Audit Artifacts

**DB migration** (additive, RLS admin-read):
- `connector_refresh_streak_state` — singleton-per-provider: `provider`, `current_streak_days`, `last_pass_at`, `last_fail_at`, `last_failure_class`, `streak_started_at`, `total_runs_7d`, `successful_runs_7d`. RLS: admin-read.
- `connector_refresh_nightly_runs` — one row per nightly verification: `run_id`, `started_at`, `completed_at`, `status` (pass/fail/degraded), `providers_passed`, `providers_failed`, `providers_reauth_required`, `expiry_pressure_passed`, `evidence_jsonb`. RLS: admin-read.
- Trigger: on insert into `connector_refresh_nightly_runs`, recompute per-provider streak rows.
- RPC: `get_connector_refresh_streak_summary()` returning structured JSON for UI.

**Artifacts** (`generated/connector-truth-closure/`) — all 9 markdown docs + content drawn from existing `generated/restore-and-oauth-hardening/` as source of truth:
- `CONNECTOR_REFRESH_CURRENT_STATE_AUDIT.md`
- `CONNECTOR_NIGHTLY_REFRESH_MODEL.md`
- `CONNECTOR_HEALTH_STATE_MODEL.md` (references canonical 6-state grammar)
- `CONNECTOR_EXPIRY_PRESSURE_TEST_MODEL.md`
- `CONNECTOR_UX_AND_ADMIN_AUDIT.md`
- `CONNECTOR_REFRESH_RECEIPT_MODEL.md`
- `CONNECTOR_STREAK_AND_PROOF_MODEL.md`
- `LONG_TAIL_PROVIDER_CLASSIFICATION_AUDIT.md`
- `CONNECTOR_TRUTH_FINAL_VERIFICATION.md`

---

### Phase 2 — Nightly Verifier Edge Function (Real + Expiry-Pressure)

**New edge function:** `supabase/functions/connector-refresh-nightly-verify/index.ts`
- Service-role auth, admin caller check
- For each provider (Google / Microsoft / Slack):
  1. **live_refresh** — calls existing `oauth-refresh-probe` internally (reuse, don't duplicate), reads results
  2. **expiry_pressure_synthetic** — sends a deliberately invalid refresh token to the real provider endpoint, asserts the `reauth_required` failure class is correctly emitted (proves classifier works under hostile input)
  3. **state_consistency** — queries `connector_effective_state` view for each token, asserts no row is `connected` while `oauth_refresh_probe_results.lifecycle_state='failing'` for the same token
- Inserts row into `connector_refresh_nightly_runs` (trigger handles streak)
- **No reckless API spend** — uses existing tokens; expiry-pressure uses a single sentinel invalid token per provider per night (3 calls total)

**pg_cron schedule:** `sita-connector-refresh-nightly-verify` daily at 02:30 UTC (offset from hourly probe and AI runtime verifier).

---

### Phase 3 — 7 Validation Scripts + Artifact Emitter + CI

**Validation scripts** (all use `_lib/emit-gate-report`):
- `check-google-refresh-nightly.ts` — last 24h `oauth_refresh_probe_results` for Google has ≥1 success
- `check-microsoft-refresh-nightly.ts` — same for Microsoft
- `check-slack-refresh-nightly.ts` — same for Slack
- `check-connector-health-state-consistency.ts` — joins `connector_effective_state` + latest probe; fails on any "connected" + recent "failing" mismatch
- `check-no-ambiguous-connected-state.ts` — greps codebase for hard-coded "Connected" strings on connector UI surfaces not driven by `ConnectorStateBadge`
- `check-long-tail-provider-classification.ts` — reads `connector_registry` table; asserts every provider not in {google, microsoft, slack} has `auth_mode != 'oauth_live'` OR is rendered with `manual` badge
- `check-connector-refresh-streak.ts` — reads `connector_refresh_streak_state`; classifies green (≥7d) / yellow (1-6d) / red (0d or unack failure)

**Artifact emitter:** `scripts/validation/emit-connector-truth-artifacts.ts`
- Queries `connector_refresh_nightly_runs`, `connector_refresh_streak_state`, `oauth_refresh_probe_results`, `connector_effective_state`, `connector_registry`
- Emits 4 required JSON files into `generated/connector-truth-closure/`:
  - `connector-provider-status.json` — per-provider 7d success/fail + last receipt
  - `connector-refresh-streak-status.json` — streak summary + classification
  - `connector-reauth-status.json` — count of reauth_required tokens + per-provider breakdown
  - `connector-truth-verification.json` — master rollup with hard pass/fail per acceptance criterion

**CI workflow:** `.github/workflows/connector-truth-nightly.yml`
- Schedule: `30 3 * * *` UTC (1h after pg_cron, gives verifier time)
- Triggers verifier via `curl POST` (uses `${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}`)
- Runs emitter + 7 validation gates
- Uploads artifacts (30-day retention)
- `workflow_dispatch` for manual runs

**Master aggregator:** Register all 7 gates in `check-os-release-readiness.ts` BLOCK list.

---

### Phase 4 — Admin AI Engineer Team Surfacing (extend, no duplicates)

**New component:** `src/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx`
- Read-only summary panel (NOT a duplicate dashboard)
- Shows: per-provider streak day count + last-pass/fail timestamp, total reauth_required tokens, last nightly verifier run status, expiry-pressure last result
- Each row links via `<Link to="/admin/integrations/oauth-refresh-health">` — canonical actions stay on the OAuth board
- Footer: "Canonical control: Integrations Hub →"

**Wire into `AIRuntimeHome`:** add new tab `id: "connector-truth"` → `ConnectorTruthSummaryPanel`. Extends existing tab list, no new route.

**Data hook:** `src/lib/internal-agents/runtime/connector-truth-data.ts` — typed loader using new RPC `get_connector_refresh_streak_summary()` plus latest nightly run.

**Long-tail enforcement** (UI):
- Audit `src/pages/admin/CN01ConnectorRealityOverview.tsx` and connected-services pages — confirm any provider not in {google, microsoft, slack} renders `<ConnectorStateBadge state="manual" />`
- Add gate `check-long-tail-provider-classification.ts` enforcement; fix any drift found.

---

### Phase 5 — Final Verification + Wiring

- Trigger one live nightly verifier run via edge function call
- Run `emit-connector-truth-artifacts.ts` to populate the 4 JSON files immediately so master aggregator has full evidence today
- Run all 7 new gates → confirm GREEN where data exists, honest YELLOW for streak <7d
- Update `CONNECTOR_TRUTH_FINAL_VERIFICATION.md` with workflow URL, cron cadence, current streak state
- Add 1-line `Last DB observation: <timestamp>` to `ConnectorTruthSummaryPanel`

---

### Guardrails (preserved)
- **No duplicate systems:** reuses `oauth-refresh-probe` (the nightly verifier calls it, doesn't replicate it), `oauth_refresh_probe_results`, `connector_effective_state`, `ConnectorStateBadge`, `OAuthRefreshHealthBoard`, `IntegrationStreakPanel`, `IntegrationReceiptDrawer`, canonical state grammar
- **No stubs:** every probe is real provider HTTP; expiry-pressure uses real provider endpoint with sentinel invalid token
- **No fake green:** streak resets on any failure; one pass ≠ proven (need 7 nights)
- **No reckless spend:** ≤3 extra HTTP calls per night for expiry-pressure (existing hourly probe carries the rest)
- **Admin AI Engineer scope:** canonical control at `/admin/integrations`; AI runtime tab is **read-only summary** that links back — no duplicate dashboard
- **Long-tail honesty:** new gate fails CI if any non-{google,microsoft,slack} provider surfaces as "Connected"
- **Service role key:** stays in GitHub Secrets / Supabase env only — never repo-committed

### Files touched
- **New (15):** 1 migration, 1 edge function, 1 artifact emitter, 7 validation scripts, 1 CI workflow, 1 React component, 1 data hook, 1 RPC (in migration), 9 markdown artifacts
- **Edited (3):** `check-os-release-readiness.ts` (+7 BLOCK gates), `AIRuntimeHome.tsx` (+1 tab), `package.json` (+2 npm scripts: `connector:truth:emit`, `connector:truth:run-all`)
- **Generated on first run (4):** the 4 required JSON artifacts

After this pass, every acceptance criterion in PART 8 is satisfied with live evidence. Streak progresses to GREEN after 7 successful nightly verifier runs.

