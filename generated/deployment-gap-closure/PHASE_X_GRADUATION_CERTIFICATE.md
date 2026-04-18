# Phase X — Graduation Certificate

**Status:** ✅ COMPLETE — `deployable=true` maintained
**Date:** 2026-04-18
**Hardening fingerprint:** `d888051caea3c69b9e475ac43d4b4585dc5025ba8f64f14fb4047e29bb931d9a`

## Outcome

| Metric | Phase W | Phase X |
|---|---|---|
| Deployment-gap gates | 13 / 13 | **14 / 14** (added per-bucket ratchet) |
| Block-level gap gates | 10 | **10** (per-bucket warn pending tighten) |
| Master release gates | 35 / 35 | **35 / 35** |
| TypeScript errors | 0 | **0** |
| Per-bucket ceilings | none | **3 ratchet gates with env overrides** |

## What Phase X delivered

### Per-bucket warn-ratchet gate (new, 14th gap gate)
`scripts/architecture/checks/check-per-bucket-warn-ratchet.ts` locks in
per-category warning ceilings to detect regressions before the global
warn-ratchet trips:

| Bucket | Current | Ceiling | Headroom | BLOCK threshold |
|---|---|---|---|---|
| `lib-decomposition-readiness` | 1 731 | 1 750 | 19 | ≤ 500 |
| `legacy-wrapper-usage` | 1 518 | 1 550 | 32 | ≤ 400 |
| `lib-ownership-drift` | 99 | 110 | 11 | ≤ 30 |

Each ceiling overridable via env (`LIB_DECOMP_CEILING`,
`LEGACY_WRAPPER_CEILING`, `LIB_OWNERSHIP_CEILING`). Auto-graduates to
**BLOCK** when all three drop past their tightened thresholds.

Emits `generated/per-bucket-warn-ratchet-report.json` with bucket-level
telemetry.

### Aggregator wiring
- Aggregator now runs **14 gates** instead of 13.
- All gates pass, zero regressions.

## Verification trail

```
$ npx tsc --noEmit                          → 0 errors
$ run-all-deployment-gap-gates              → 14 / 14 pass
$ check-os-release-readiness                → YELLOW 35/35, 0 errors
$ seal-profile-runtime-baseline             → d888051c…
   apps=20 routes=673 adminRoutes=191 mobile=36
```

## Residuals into Phase Y

1. **Three warning buckets** still hold 99 % of warnings — needs targeted
   migration work to bring ceilings toward BLOCK thresholds.
2. **Slack/Salesforce secrets** — runtime real, secrets deferred (not a code gap).
3. **6 raw `<input type="file">`** intentional fallbacks — locked baseline.
4. **App Store consumer minimum** could be raised to ≥ 10 in Phase Y if
   launcher panels formally adopt the install service.

— end of certificate


---

## Active Caveats

The following P1 evidence gaps remain open as of 2026-04-18. Status claims in this document are made **subject to** this list:

| # | Caveat | Owner | Tracking |
|---|---|---|---|
| 1 | TPM hardware proof on real hardware | Trust Council | `generated/final-hardening/MOK_TEST_MATRIX.md` |
| 2 | Production-shape restore drill — first scheduled live execution | DR Owner | `generated/restore-and-oauth-hardening/PRODUCTION_RESTORE_DRILL_RUNBOOK.md` |
| 3 | OAuth refresh probe — 7-day continuous health window | Connectors Owner | `generated/restore-and-oauth-hardening/OAUTH_REFRESH_PROBE_LOGGING_AND_RECEIPTS.md` |
| 4 | Boardroom L7 follow-through — operator-trained runbook drill | Boardroom Owner | `generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md` |
| 5 | MOK per-distro live tests — Fedora 40 + Arch | Install Owner | `generated/final-hardening/MOK_TEST_MATRIX.md` |

Until each caveat is independently closed with evidence linked from the corresponding tracking doc, **deployability claims must be read together with this list**, not in isolation.

Policy: `generated/claim-safety-hardening/DEPLOYMENT_WORDING_POLICY.md`
