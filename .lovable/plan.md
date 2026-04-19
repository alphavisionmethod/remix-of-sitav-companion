

## Audit verdict — Security & Portability is 100% complete; Economic-Trust-Future is 0% started

**Security & Portability closure (prior work) — VERIFIED COMPLETE:**
- 19 deliverables present in `generated/security-and-portability-closure/` (12 markdowns + 4 JSON status mates + 2 evidence dirs + register)
- 10 real validators (no stubs) wired into `check-os-release-readiness.ts` at lines 232–242 (181 BLOCK gates total)
- `secret_rotation_log` DB table + cadence registry (`src/lib/security/secret-rotation-cadence.ts`) live
- Canonical `runtime-host-adapter.ts` + 4 hooks refactored
- `SecurityAndPortabilityTruthPanel.tsx` mounted on AI Engineer hub
- Honest WARN-tier classification for items requiring real-world execution (no fake greens)

**Economic Governance + UX Trust + Future-Surface Containment — 0% started:**

| Area | Current state | Gap |
|---|---|---|
| Per-user AI ceilings | Class-based (`max_calls_per_hour`, `max_cost_cents_per_call`) per user — but no **explicit hard daily/monthly user-spend ceiling** distinct from class envelope | No per-user hard-stop ledger, no budget-decision receipts table, no load-proof artifact |
| Calm mode | Default = `"standard"` in `AppearanceContext.tsx` line 84 | Should be `"calm"` if calm is canonical safe default |
| AI workforce wording | 13+ surfaces use "workforce", "autonomously", etc. | No agency-claim audit + no validator preventing regression |
| Future surfaces | `demo-only-surface-registry.ts` has 9 surfaces (DWE01-07, UAO03/08) BUT **mobile-native, ambient shells, continuity, wearable archive paths NOT all in the launch-scope exclusion list** | No `launch-scope-surface-classification` validator + no `economic-trust-and-future-closure/` directory |
| Validators | 0 of 7 required validators exist | `check-per-user-ai-ceilings`, `check-ai-budget-hard-stop`, `check-ai-budget-receipts`, `check-calm-mode-default`, `check-no-ambiguous-ai-agency-claims`, `check-future-surface-containment`, `check-launch-scope-surface-classification` |

**Scope rule (per user):** All NEW UI lives ONLY on Admin AI Engineer hub (`AIRuntimeHome.tsx`). Validators in canonical `scripts/validation/`. Generated evidence in canonical `generated/economic-trust-and-future-closure/`. **Zero edits to other admin domains.**

---

## Phase 1 — Per-user AI hard ceilings (DB + runtime + receipts)

### 1A. DB migration — explicit per-user ceiling + decision receipts
- **NEW table** `ai_user_hard_ceilings`: `user_id PK`, `daily_cost_cents_cap`, `monthly_cost_cents_cap`, `daily_calls_cap`, `degrade_to_model_id`, `effective_from`, `updated_at`. Admin-write, owner-read RLS.
- **NEW table** `ai_budget_decision_receipts`: `id`, `user_id`, `capability_key`, `decision: allow|degrade|block`, `reason`, `pre_check_state jsonb` (rolling spend, calls), `policy_rule`, `cost_estimate_cents`, `actual_cost_cents`, `created_at`. Append-only, admin-read, service-insert RLS. Realtime-published.
- **NEW SECURITY DEFINER fn** `check_user_hard_ceiling(p_user_id, p_estimated_cost_cents)` returns `{allowed, reason, daily_pct, monthly_pct, fallback_model_id}` — runs BEFORE existing `check_ai_budget_policies` (defense in depth).
- **Seed default ceiling** for every existing user via trigger on `auth.users`.

### 1B. Runtime enforcement (real path, no dashboards-only)
- Edit `supabase/functions/_shared/ai-budget-check.ts` → after the existing class-based RPC, ALSO call `check_user_hard_ceiling`. If user-cap exceeded → `shouldBlock=true, reason="user_hard_ceiling_exceeded"`. If 80%+ → `shouldDowngrade=true, fallbackModelId=ceiling.degrade_to_model_id`.
- Every call writes a row to `ai_budget_decision_receipts` BEFORE executing the LLM call (the receipt records the *decision*, not the result).
- Edit `supabase/functions/ai-gateway/index.ts` → on `shouldBlock`, return graceful 429 with structured body `{ kind: "budget_ceiling", message_user_safe: "...", retry_after_seconds, current_pct, daily_resets_at }` so UI can render premium decline copy.

### 1C. Graceful degraded behavior in UI
- **NEW** `src/components/ai-runtime/BudgetCeilingNotice.tsx` — premium calm copy when blocked: "You've used today's AI workspace allowance. New requests resume at 00:00 UTC." (No bug-feel.) Wired into `chat-advisor` client error handler.
- Admin-visible ceiling badge in the new truth panel.

### 1D. Load proof
- **NEW** `os/scripts/run-per-user-budget-load-test.sh` — drives 200 concurrent calls against a test user past their cap, verifies (a) no extra calls slipped through, (b) ledger tally is exact, (c) all decisions receipted, (d) degraded behavior stable. Writes evidence file `generated/economic-trust-and-future-closure/budget-load-runs/<ts>.json`.

---

## Phase 2 — Calm-mode default + UX trust copy alignment

### 2A. Flip calm-mode default
- Edit `src/contexts/AppearanceContext.tsx` line 84: `useState<DisplayMode>("standard")` → `useState<DisplayMode>("calm")`.
- Edit `src/pages/FirstBootSetup.tsx` line 98: `calmMode: false` → `calmMode: true`.
- Edit `src/lib/services/personalization-engine/index.ts` line 124: `calmMode: false` → `calmMode: true`.
- Update onboarding copy disclosing calm-mode default.

### 2B. Notification disclosure surface
- **NEW** `src/components/notifications/NotificationDisclosureCard.tsx` — calm description of: notification categories, default intensity (calm), how to tune. Embed into Settings notification page (existing) AND first-boot.

### 2C. AI agency wording audit + corrections
- Scan-then-edit pass: replace "workforce is acting" / "AI is autonomously" patterns with proven-language equivalents from `src/lib/ux-trust/microcopy.ts`. Targets identified: `AutonomyLadder.tsx`, `MissionControlPage.tsx`, `InternalAgentsBoard.tsx`, `SuggestionsBoard.tsx`, `HQApprovalQueue.tsx`, `AIT01TeamOverview.tsx`, `AIT02RoleRegistry.tsx`, `AIT03TaskInvocation.tsx`, `AIT04to08Boards.tsx`.
- Extend `src/lib/ux-trust/microcopy.ts` with `aiAgency.{readyToAct, canRecommend, governedScope, runtimeProvenOnly}` canonical phrases.

---

## Phase 3 — Future-surface containment expansion

### 3A. Extend `demo-only-surface-registry.ts`
- Add archived-mobile-native surface entries (linking to `archive/mobile/`).
- Add `containment: "archived"` as a new ContainmentLevel and seed it.
- **NEW field** `excludedFromLaunchScoring: boolean` on every entry that is `future_vision` or `archived` — this is what the new validator reads.

### 3B. Banners + route-level truth
- Verify every entry's `componentPath` imports `<DemoOnlyBanner surfaceId="..." />` (existing `check-demo-only-surface-badging.ts` already enforces this — no new work).

### 3C. Remove from launch-scored critical path
- **NEW** `generated/economic-trust-and-future-closure/launch-scope-exclusions.json` — emitted from registry, lists every `excludedFromLaunchScoring=true` surface.
- New validator (Phase 4) reads this and ensures these surfaces never appear as required gates in `check-os-release-readiness.ts`.

---

## Phase 4 — Seven new BLOCK validators + 1 emitter

All real (no stubs); honest WARN-tier where evidence requires real execution.

1. `check-per-user-ai-ceilings.ts` (~90 LOC) — asserts `ai_user_hard_ceilings` table exists + every active user has a row + RLS correct. Reads DB via `psql`.
2. `check-ai-budget-hard-stop.ts` (~70 LOC) — reads `budget-load-runs/*.json`; requires ≥1 run in last 30 days proving zero ceiling-exceeding calls; honest `pending-execution` WARN if no runs.
3. `check-ai-budget-receipts.ts` (~60 LOC) — verifies `ai_budget_decision_receipts` table exists; cross-references DB count vs `ai_usage_ledger` count (every call must have a decision receipt).
4. `check-calm-mode-default.ts` (~50 LOC) — greps `AppearanceContext.tsx`, `FirstBootSetup.tsx`, `personalization-engine/index.ts` for `useState<DisplayMode>("calm")` and `calmMode: true`. BLOCK on regression.
5. `check-no-ambiguous-ai-agency-claims.ts` (~80 LOC) — scans `src/components/`, `src/pages/` for forbidden phrases: "workforce is acting", "AI autonomously", "is acting on your behalf" (case-insensitive). Allowlists wording sourced from `src/lib/ux-trust/microcopy.ts::aiAgency`.
6. `check-future-surface-containment.ts` (~70 LOC) — reads `demo-only-surface-registry.ts`; asserts every device/wearable/ambient/continuity/native-mobile route has a registry entry with `excludedFromLaunchScoring=true` for `future_vision` and `archived` levels.
7. `check-launch-scope-surface-classification.ts` (~60 LOC, meta) — cross-references `launch-scope-exclusions.json` against `REQUIRED_GATES` array in `check-os-release-readiness.ts`; BLOCK if any excluded surface appears in launch scoring.
8. `emit-economic-trust-future-status.ts` — emitter that queries DB + reads registry + writes the 4 JSON status mates.

---

## Phase 5 — 12 deliverables in `generated/economic-trust-and-future-closure/`

8 markdowns + 4 JSON mates per Part 5 spec:
- `AI_BUDGET_CURRENT_STATE_AUDIT.md`, `PER_USER_AI_CEILING_MODEL.md`, `AI_BUDGET_RECEIPT_MODEL.md`, `PER_USER_BUDGET_ENFORCEMENT_PROOF.md`
- `TRUST_SENSITIVE_UX_AUDIT.md`, `TRUST_COPY_ALIGNMENT_MODEL.md`
- `FUTURE_SURFACE_AUDIT.md`
- `ECONOMIC_TRUST_AND_FUTURE_FINAL_VERIFICATION.md`
- `per-user-budget-status.json`, `trust-ux-status.json`, `future-surface-status.json`, `economic-trust-and-future-verification.json`

All audits backed by LIVE evidence (DB queries, registry parse, file scans).

---

## Phase 6 — UI panel on AI Engineer hub (1 new panel ONLY)

- **NEW** `src/components/admin/ai-runtime/EconomicTrustFutureTruthPanel.tsx` — three sections:
  - **Per-user budget ceilings** — live query `ai_user_hard_ceilings` + recent `ai_budget_decision_receipts` (block/degrade/allow counts, top users by spend %)
  - **UX trust posture** — calm-mode default status, agency-claim scan result
  - **Future-surface containment** — table from registry, excluded-from-launch-scoring badge per row
- Insert as new tab in `AIRuntimeHome.tsx` after `security-portability-truth`.
- **Zero other admin pages touched.**

---

## Phase 7 — Wire 7 new BLOCK gates + npm scripts

### 7A. `check-os-release-readiness.ts`
Append after line 242 (181 → **188 BLOCK gates**):
```
// Economic Governance + UX Trust + Future-Surface Closure — 7 BLOCK gates
"per-user-ai-ceilings", "ai-budget-hard-stop", "ai-budget-receipts",
"calm-mode-default", "no-ambiguous-ai-agency-claims",
"future-surface-containment", "launch-scope-surface-classification",
```

### 7B. `package.json` scripts
- `closure:economic-trust-future:emit` (runs emitter)
- `closure:economic-trust-future:run-all` (runs 7 validators)
- `ai:budget:load-test` (runs `run-per-user-budget-load-test.sh`)
- Update `final:closure:run-all` to include the new closure.

---

## Honest limits surfaced (no fake green)

- `check-ai-budget-hard-stop` returns `pending-execution` WARN until first load-test run — script is wired and ready.
- `check-per-user-ai-ceilings` BLOCKs only if table missing or RLS wrong; honest WARN if seed coverage <100%.
- `check-future-surface-containment` BLOCKs on uncategorized device/mobile-native routes.

Every WARN classification is reached by inspecting REAL data — never hard-coded.

---

## Files touched (final summary)

- **NEW (24):** 8 markdown audits + 4 JSON status files + 7 validators + 1 emitter + 1 truth panel UI + 1 SQL migration + 1 load-test shell script + 1 budget-ceiling notice component
- **EDITED (10):** `AppearanceContext.tsx`, `FirstBootSetup.tsx`, `personalization-engine/index.ts`, `microcopy.ts`, `demo-only-surface-registry.ts`, `ai-budget-check.ts`, `ai-gateway/index.ts`, `AIRuntimeHome.tsx`, `check-os-release-readiness.ts`, `package.json`
- **AGENCY WORDING EDITS:** 9 admin/AI surfaces (one-line copy fixes only)
- **ZERO edits to:** other admin domains, security/portability/mobile/AI runtime/connector/hardware closures (preserved GREEN)

After this pass: **188 BLOCK gates total**, 1 new live truth panel on AI Engineer hub, real per-user hard-stop enforcement at runtime with receipts, calm-mode as default, agency wording locked behind validator, future surfaces excluded from launch scoring with explicit registry+validator backing. Honest WARN-tier preserved where evidence requires real execution.

