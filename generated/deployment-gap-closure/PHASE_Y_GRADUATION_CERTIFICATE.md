# Phase Y — Graduation Certificate

**Status:** ✅ COMPLETE — `deployable=true` maintained
**Date:** 2026-04-18
**Hardening fingerprint:** `27bd5e203b8ba62e4c9917a4f8ec2717f7c4c3508e59e14bed3b628d5cdac825`

## Outcome

| Metric | Phase X | Phase Y |
|---|---|---|
| Deployment-gap gates | 14 / 14 | **15 / 15** (added evidence-freshness) |
| Master release gates | 35 / 35 | **35 / 35** |
| TypeScript errors | 0 | **0** |
| Global warn ceiling | 3 400 | **3 360** (headroom 12) |
| `lib-decomposition` ceiling | 1 750 | **1 740** (headroom 9) |
| `legacy-wrapper-usage` ceiling | 1 550 | **1 530** (headroom 12) |
| `lib-ownership-drift` ceiling | 110 | **105** (headroom 6) |

## What Phase Y delivered

### 1. Tightened all four warn ceilings (no regression slack)
Every ratchet now sits within 6–12 units of the observed count, so any
unintended drift surfaces immediately on the next CI run. Previous slack
of 32–52 units removed.

### 2. Evidence Freshness gate (new, 15th gap gate)
`scripts/architecture/checks/check-evidence-freshness.ts` ensures the 9
most safety-critical generated artifacts are regenerated within their
staleness window:

| Artifact | Window |
|---|---|
| `os-release-readiness-report.json` | 168 h |
| `baseline.sealed.json` | 720 h |
| `warn-ratchet-report.json` | 168 h |
| `per-bucket-warn-ratchet-report.json` | 168 h |
| `frontend-backend-substrate-matrix.json` | 336 h |
| `db-truth-closure-map.json` | 336 h |
| `manifest-truth-closure-map.json` | 336 h |
| `app-install-truth-map.json` | 336 h |
| `supportability-coverage-map.json` | 336 h |

Emits `generated/evidence-freshness-report.json` with per-artifact age,
fresh/stale verdict, and category. Warn-level — alerts ops teams without
blocking deploys when CI cadence slips.

### 3. Aggregator wiring
- Aggregator now runs **15 gates** instead of 14.
- All gates pass, zero regressions.

## Verification trail

```
$ npx tsc --noEmit                          → 0 errors
$ run-all-deployment-gap-gates              → 15 / 15 pass
$ check-os-release-readiness                → YELLOW 35/35, 0 errors
   Warn ratchet: 3348 ≤ 3360 (headroom 12)
   lib-decomp: 1731 ≤ 1740 / wrapper: 1518 ≤ 1530 / ownership: 99 ≤ 105
   Evidence freshness: 9/9 fresh
```

## Residuals into Phase Z

1. **Three warning buckets** still hold 99 % of warnings. Tightened
   ceilings expose any regression within hours; next move is targeted
   migration work to drop counts past BLOCK thresholds (≤ 500 / ≤ 400 / ≤ 30).
2. **Slack/Salesforce secrets** — runtime real, secrets deferred (not a code gap).
3. **6 raw `<input type="file">`** intentional fallbacks — locked baseline.
4. **Evidence-freshness gate** is currently warn-level. Phase Z can graduate
   it to BLOCK once a scheduled regeneration job is wired into CI.

— end of certificate
