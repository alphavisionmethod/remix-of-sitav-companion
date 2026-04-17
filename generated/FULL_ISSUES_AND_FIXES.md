# SITA OS — Full Issues & Fixes Registry (Outstanding-Only)

**Document Class**: Truth · Issue tracker
**Version**: 6.0 — outstanding-only edition
**Generated**: 2026-04-17T20:30:00.000Z
**Codebase Snapshot**: 1,040 pages · 922 components · 168 hooks · 27 contexts · 126 edge functions · 301 tables · 14 views · 643 RLS policies · 188 SECURITY DEFINER functions · 398 migrations · 295 scripts · 107 generated JSON · 10 generated MD

---

## Reporting Convention

This document lists **only open errors, partial implementations, deferred work, and verification gaps**. Resolved issues are intentionally **not described** here — they live in `generated/remediation/remediation-implemented-changes.json` (87 resolved entries) and in the diff history of the codebase.

Each entry uses this schema:

```
ID · Priority · Status · Plane
Title
  Symptom        — what the user/operator sees
  Root cause     — verified technical reason
  Evidence       — artifact or grep proving the gap
  Reproduction   — how to observe it
  Fix path       — concrete implementation steps
  Owner          — team
  Blocks launch? — yes/no/scoped
```

Priorities: **P0** = blocks production launch · **P1** = degrades launch quality · **P2** = polish / ongoing hygiene.

---

## P0 — Open (3)

### OPN-P0-01 · Open · Cross-plane · External error monitoring not wired
- **Symptom**: a runtime exception in production has no off-platform sink. Internal `error_events` table captures server-side; browser-side errors disappear after the user's tab closes.
- **Root cause**: no Sentry/Datadog/Bugsnag SDK installed; no DSN secret; no `init()` in `src/main.tsx`.
- **Evidence**: `grep -ri "sentry\|datadog\|bugsnag" src/ supabase/` → 0 hits. `secrets list` → no `SENTRY_DSN`.
- **Reproduction**: throw inside any React component → only browser console shows it.
- **Fix path**:
  1. `npm install @sentry/react @sentry/tracing`
  2. Add `SENTRY_DSN` secret via Lovable Cloud secrets UI.
  3. Initialize in `src/main.tsx` with `tracesSampleRate: 0.1`, `release: import.meta.env.VITE_RELEASE_TAG`.
  4. Wrap router with `Sentry.ErrorBoundary`.
  5. For edge functions: add `Sentry.captureException` in shared `_shared/error-handler.ts`.
- **Owner**: SRE.
- **Blocks launch?**: **YES** for any plane that requires external incident SLA.

### OPN-P0-02 · Open · Backend · No emergency payments kill switch
- **Symptom**: kill-switch registry exists (14 switches) but none specifically halts **payment authorization** independent of the generic `payments` subsystem switch. A misbehaving Stripe webhook cannot be stopped without disabling the entire payments edge function.
- **Root cause**: no dedicated `payment-kill-switch` edge function; no row in `kill_switch_registry` for `KS-PAYMENTS-AUTH`.
- **Evidence**: `grep -r "KS-PAYMENTS-AUTH\|payment-kill-switch" supabase/functions/` → 0 hits.
- **Fix path**:
  1. Migration: insert kill-switch row `('KS-PAYMENTS-AUTH','blocker','dual_approval',60)`.
  2. New edge function `payment-kill-switch` reading the switch state on every authorization call.
  3. Admin UI toggle (in AR08KillSwitchCenter) bound to the switch.
  4. Audit row written to `admin_action_audit` on every state change.
- **Owner**: Payments.
- **Blocks launch?**: **YES** when Stripe is enabled.

### OPN-P0-03 · Open · Governance · No proven green CI artifacts on hosted runner
- **Symptom**: 16 release pipelines declared, all gates pass locally, but no run-history artifact stored from a hosted runner (GitHub Actions / Lovable CI) proving it.
- **Root cause**: required CI secrets (`SUPABASE_ACCESS_TOKEN`, `LOVABLE_API_KEY` for runner, etc.) not configured on the runner; latest GitHub Actions run is `not-yet-triggered`.
- **Evidence**: `.github/workflows/ci.yml` exists; no successful workflow run id stored in `generated/ci-run-history.json` (file absent).
- **Fix path**:
  1. Add CI secrets in repository settings.
  2. Trigger initial run; capture artifact bundle.
  3. Persist last-green-run id to `generated/ci-run-history.json`.
  4. Bind a new gate (`ci-history-presence`) so future drift is caught.
- **Owner**: Platform.
- **Blocks launch?**: **YES** for any "attested release" claim.

---

## P1 — Open (4)

### OPN-P1-01 · Open · Backend · Investment Office lacks dedicated APIs
- **Symptom**: 41 Investment pages route their reads/writes through generic `business-api` and `domain-data` services, which silently strip Investment-specific fields (vesting schedules, cap-table snapshots, fund rollups).
- **Root cause**: never scaffolded; carried over from initial Business OS spec.
- **Evidence**: `ls supabase/functions/investment*` → empty.
- **Fix path**:
  1. Scaffold `supabase/functions/investment-portfolio-api/` with sub-routes `/positions`, `/vesting`, `/cap-table`, `/rollup`, `/snapshot`.
  2. Add to `bounded-context-manifest.json` under `investment` context.
  3. Wire 41 pages to the new endpoints; deprecate the generic shims.
- **Owner**: Investment.
- **Blocks launch?**: NO (degrades feature completeness only).

### OPN-P1-02 · Open · Lib · Service / namespace sprawl
- **Symptom**: imports for the same logical service can resolve to two physical files. Code-search is noisy; bundler may pull both trees.
- **Root cause**: shim consolidation plan paused mid-execution.
- **Evidence**:
  - `src/lib/engine/` (44 files) and `src/lib/engines/` (37 files) — both populated.
  - `src/hooks/` (104 files) and `src/lib/hooks/` (64 files).
  - `src/lib/services/` (211 files, mostly shims) vs `src/lib/core-services/` (210 files, canonical).
  - `src/lib/ai-gateway/` and `src/lib/services/ai/`.
- **Fix path**: execute the staged merge plan in `service-consolidation-manifest.json`. Each merge step is reversible via the wrapper map.
- **Owner**: Architecture.
- **Blocks launch?**: NO.

### OPN-P1-03 · Open · Electron · Build pipeline + signing absent
- **Symptom**: a `.dmg` / `.exe` cannot be built on demand; no codesigning identity loaded.
- **Root cause**: `electron-builder` missing from `package.json`; no `build-electron.yml` workflow; no Apple Developer ID / Windows EV certificate paths declared.
- **Evidence**: `.github/workflows/build-electron.yml` does not exist; `package.json` has no `build` block.
- **Fix path**:
  1. Add `electron-builder` and a minimal `build` config (mac/win/linux targets).
  2. Add workflow that builds artifacts on tag pushes.
  3. Configure signing certs as encrypted secrets.
  4. Notarize macOS bundles via Apple notary service.
- **Owner**: Desktop.
- **Blocks launch?**: **YES** for desktop release only.

### OPN-P1-04 · Open · Admin · Demo-data audit not exhaustive
- **Symptom**: 503 admin pages exist; only spot-checks confirm "live data" presence. Some admin tiles may still render `MOCK_*` constants under empty-DB conditions.
- **Root cause**: per-page audit not yet performed; only sampled pages flagged.
- **Evidence**: `grep -rn "MOCK_\|DEMO_\|isDemoMode = true" src/pages/admin/ | wc -l` → ~24 hits remaining (down from 80+).
- **Fix path**: per-page review using the same pattern applied to `FilesOverview` (derive `isDemoMode` from auth + data counts). Add a CI gate `no-hardcoded-demo-mode` that fails on `isDemoMode\s*=\s*true`.
- **Owner**: Admin Ops.
- **Blocks launch?**: NO.

---

## P2 — Open (5)

### OPN-P2-01 · Open · Lib · Namespace merges deferred
- Same root cause as OPN-P1-02 but lower-impact namespaces: `engine/engines`, `journeys/journey`, marginal `ai-gateway/services-ai` overlap.
- **Fix path**: staged merge in low-traffic releases.
- **Blocks launch?**: NO.

### OPN-P2-02 · Open · Lib · Demo data consolidation
- **Symptom**: 58 fixture files spread across `src/lib/mock-data/`, `src/lib/demo-data/`, and per-page `mock*.ts` siblings. Risk: duplicates diverge.
- **Fix path**: single canonical `src/lib/fixtures/` namespace; deprecate the others via re-export shims; remove shims after one release.
- **Blocks launch?**: NO.

### OPN-P2-03 · Open · Frontend · Per-route ErrorBoundary coverage
- **Symptom**: only top-level `<App>` ErrorBoundary is guaranteed; route-family-scoped boundaries are inconsistently applied. A crash in one Money sub-tree currently nukes the whole shell.
- **Fix path**: add `<RouteErrorBoundary>` HOC to each registered route family in `src/routes/*.tsx`. Use the existing `error-boundary.tsx` component.
- **Blocks launch?**: NO (graceful degradation only).

### OPN-P2-04 · Open · QA · E2E coverage gap
- **Symptom**: `tests/e2e/customer-journey/` contains 1 spec (`files-upload-real-roundtrip.spec.ts`). The other 4 flagship loops emit telemetry but lack browser-driven assertions.
- **Fix path**: author 4 specs — sign-in→pulse, boardroom→summary→decision, connector→sync, recommendation→approval. Run on Playwright in CI.
- **Blocks launch?**: NO.

### OPN-P2-05 · Open · SRE · Load / performance testing
- **Symptom**: no k6/Artillery/Locust suite; no LCP/TTI baseline; no Lighthouse CI integration.
- **Fix path**:
  1. Add `tests/load/` with 3 k6 scripts: cold-cache login, AI-call burst, file upload sustained.
  2. Add Lighthouse-CI workflow producing per-PR scores.
  3. Capture P95/P99 latencies into `generated/perf-baseline.json`.
- **Blocks launch?**: NO.

---

## Continuous-Verification Gaps (not numbered — recurring)

| Area | Gap | Cadence Needed |
|---|---|---|
| RLS policies | New tables sometimes ship before policies | nightly `check-rls-coverage` cron |
| Secret rotation | No schedule | quarterly reminder + admin alert |
| View documentation | 10 of 14 views undocumented | per-PR doc-coverage check |
| Migration count in README | Stale | doc-sweep after each release |
| Edge function cold-start metrics | Not captured | add `BOOT_TS` instrumentation |
| Service truth dashboard | No alert when a service drops <50% | add admin alert rule |

---

## Summary Counters

| Bucket | Count |
|---|---|
| P0 open | **3** |
| P1 open | **4** |
| P2 open | **5** |
| Continuous-verification gaps | **6** |
| **Total outstanding work items** | **18** |

Resolved items (87) are recorded in `generated/remediation/remediation-implemented-changes.json` and are intentionally excluded from this report per the new reporting convention.

---

## Cross-References

- Master truth audit → `generated/SITA_MASTER_AUDIT.md`
- Frontend deep-dive → `generated/FRONTEND_AUDIT.md`
- Resolved items registry → `generated/remediation/remediation-implemented-changes.json`
- Pending blocker registry → `generated/remediation/remediation-pending-blockers.json`
- It's-Real gate → `generated/its-real-gate-report.json`
