
This is a massive scope — "final last-mile deployment closure" covering 18 areas (A–R) across 5 execution phases. Looking at memory and recent history:

- Phases 1–9 of AI Workforce: COMPLETE per memory (`features/ai-workforce-runtime`)
- Boardroom Layer 7: COMPLETE per memory (`features/boardroom-layer-7`)
- Mobile identity reconciliation: JUST COMPLETED (140 gates green)
- Mobile deployment closure: COMPLETE (16 artifacts)
- 117 BLOCK-level gates already enforced
- Security Council UI/cron: NOT BUILT (verified earlier this session — 0 rows in `security_council_findings`, no pg_cron job, no `/admin/ai-runtime/security-council` route)
- Production restore drill, OAuth refresh probes, MOK matrix: per memory `operational-readiness` — pg_cron entries exist (1h OAuth probe, weekly DR drill)

The biggest **real, unimplemented** gap from this session's verification is the **Security Council runtime** (Item Q + part of N). The user explicitly asked about it earlier and I confirmed it doesn't exist. The rest is largely complete or governance-doc work.

I'll structure 5 small phases focused on **what's actually missing** vs. closure-doc generation. Keep it tight.

---

# Final Last-Mile Deployment Closure — Implementation Plan

Scope verified against memory + live DB checks. The bulk of the 18 areas (A–R) are already complete (AI Workforce Phases 1–9, Boardroom L7, Mobile closure, 117 gates, restore drill, OAuth probes, MOK matrix). The **real remaining gaps** are: (1) Security Council runtime + UI, (2) final-closure governance artifacts + meta-validators that prove the green-state is meaningful.

## Phase 1 — Security Council Runtime (Item Q, real code)
**Deployable outcome:** 7 security agents producing real findings hourly; admin board shows live data.

- **DB migration:** add `security_council_findings` columns if missing (`agent_id`, `severity`, `evidence_jsonb`, `proposed_action`, `kill_switch_recommendation`, `secret_rotation_target`, `policy_proposal_id`); add indexes; RLS policies (admin read, service-role insert).
- **Edge function:** `supabase/functions/sita-security-council-tick/index.ts` — runs the 7 agents (rls-watcher, secret-rotation-sentinel, anomaly-detector, policy-drift-auditor, edge-fn-jwt-checker, oauth-token-watcher, kill-switch-recommender), inserts findings, emits AI receipts via existing gateway.
- **pg_cron job:** `sita-security-council-tick` hourly, calling the edge function via `net.http_post` with service-role auth.
- **UI:** new route `/admin/ai-runtime/security-council` → `src/pages/admin/ai-runtime/SecurityCouncilPage.tsx` with: 7 agent cards (last-run, finding-count, trust-score), findings table (sortable by severity), evidence drilldown drawer, "Acknowledge / Dispatch to Approval Queue / Open Runbook" actions wired to existing `approval_decisions` and `runbooks` infra.
- **Nav wiring:** add to `AdminControlPlaneShell` AI-Runtime domain; gate via existing `useRequireAdmin`.

## Phase 2 — Final Closure Governance Artifacts (10 docs + 6 status JSONs)
**Deployable outcome:** All 16 deliverables under `generated/final-deployment-closure/` exist with real content sourced from live system state.

- Generate the 10 `.md` files (00–09) by reading live registries: 117-gate report, Boardroom L7 status, mobile reconciliation status, AI workforce roadmap completion, claim-safety registry.
- Generate the 6 `.json` status files from real validators (no hand-typed data).
- Each artifact cites its source manifest + last-validated timestamp.

## Phase 3 — Meta-Validators (gate meaningfulness)
**Deployable outcome:** 7 new validators detect "false green" states; wired into 117-gate aggregator → 124 gates.

- `check-final-deployment-readiness.ts` — aggregates restore + OAuth + MOK + L7 closure status.
- `check-final-runtime-proof.ts` — verifies pg_cron jobs are actually firing (queries `cron.job_run_details`).
- `check-final-mobile-truth.ts` — re-runs the 10 mobile identity gates as a meta-check.
- `check-final-ai-workforce-readiness.ts` — verifies all 40 agents have `last_run_at` within SLA + Security Council producing rows.
- `check-final-launch-honesty.ts` — scans for forbidden claim phrases ("kernel", "production-ready" without qualifiers) outside contained registry.
- `check-final-supportability-readiness.ts` — verifies every kill-switch + runbook has a tested execution receipt.
- `check-final-gate-meaningfulness.ts` — classifies each of the 124 gates as structural/behavioral/smoke/E2E + fails if >20% are structural-only.

## Phase 4 — Aggregator Wiring + Scripts
**Deployable outcome:** Master aggregator at 124 gates GREEN, with new `final:closure:run-all` npm script.

- Append 7 new validators to `MASTER_RELEASE_GATES` in `check-os-release-readiness.ts`.
- Add `final:closure:run-all` and `security-council:tick:manual` to `package.json`.
- Update `src/planes/MOBILE_MANIFEST.md` and create `src/planes/FINAL_CLOSURE_MANIFEST.md` with the canonical map.

## Phase 5 — Live Verification + Certification
**Deployable outcome:** Signed `final-deployment-certification.json` confirming 124/124 GREEN with cryptographic seal via existing `SITA_HARDENING_HMAC_KEY`.

- Run `npm run check:os-release-readiness` end-to-end.
- Manually trigger `sita-security-council-tick` once → confirm findings inserted.
- Verify Security Council UI loads with live data.
- Generate signed certification artifact + attach to baseline seal.

## Files Touched (Summary)

```text
supabase/migrations/<ts>_security_council_runtime.sql       [new]
supabase/functions/sita-security-council-tick/index.ts      [new]
src/pages/admin/ai-runtime/SecurityCouncilPage.tsx          [new]
src/lib/services/security-council/                          [new dir, 7 agent runners]
src/components/admin/security-council/                      [new dir, 4 UI components]
src/AppRoutes.tsx + AdminControlPlaneShell                  [+ route + nav entry]
generated/final-deployment-closure/                         [16 new artifacts]
scripts/validation/check-final-*.ts                         [7 new meta-validators]
scripts/architecture/checks/check-os-release-readiness.ts   [+7 gates → 124 total]
src/planes/FINAL_CLOSURE_MANIFEST.md                        [new]
package.json                                                [+ 2 scripts]
```

## Guarantees

- **No stubs:** Security Council is real code emitting real DB rows on a real cron schedule.
- **No duplicates:** reuses existing `ai_receipt_records`, `approval_decisions`, `kill_switch_audit_log`, `runbooks`, `AdminControlPlaneShell`, `useRequireAdmin`.
- **No false green:** Phase 3 meta-validators specifically detect structural-only "theater" gates.
- **Honest about externals:** Apple/Play account blockers stay classified as such — not silently flipped to green.
- Each phase ends with the master aggregator passing before the next begins.
