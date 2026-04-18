# Phase V — Graduation Certificate

**Status:** ✅ COMPLETE — `deployable=true` maintained
**Date:** 2026-04-18
**Hardening fingerprint:** `4b3b74114a2e3b856215e4ab77a6aca9fd4a8f6b4101d8be9c1011c166a2a026`

## Outcome

| Metric | Phase U | Phase V |
|---|---|---|
| Deployment-gap gates | 12 / 12 | **13 / 13** (added warn-ratchet) |
| Block-level gap gates | 9 | **10** (App Store graduated) |
| Master release gates | 35 / 35 | **35 / 35** |
| TypeScript errors | 0 | **0** |
| Warning ceiling | unbounded | **3 500** (current 3 348, 152 headroom) |

## What Phase V delivered

### App Store install gate → BLOCK
- `scripts/architecture/checks/check-app-store-install-flow.ts` graduated
  from warn-only to **block-level**.
- Asserts: `status === "real-production-grade"` AND ≥ 8 consumers AND
  ≥ 5 install-related edge functions AND `installServiceExists`.
- Fixed source-of-truth bug: gate now reads `status` (canonical) instead
  of the broader `classification` field.

### Warn-ratchet gate (new, 13th gap gate)
- `scripts/architecture/checks/check-warn-ratchet.ts` enforces a sealed
  ceiling on `os-release-readiness-report.totalWarnings`.
- Emits `generated/warn-ratchet-report.json` with headroom telemetry.
- Auto-graduates to **BLOCK** when ceiling drops to ≤ 1 000.
- Wired into the gap-gate aggregator (`run-all-deployment-gap-gates.ts`).

### Aggregator wiring
- Aggregator now runs **13 gates** instead of 12.
- All gates pass, zero regressions.

## Verification trail

```
$ npx tsc --noEmit                          → 0 errors
$ run-all-deployment-gap-gates              → 13 / 13 pass
$ check-os-release-readiness                → YELLOW 35/35, 0 errors
$ seal-profile-runtime-baseline             → 4b3b7411…
   apps=20 routes=673 adminRoutes=191 mobile=36
```

## Residuals into Phase W

1. **Warning budget 3 348** — well below ceiling but still YELLOW.
   Phase W should attack the largest warning category to drop ceiling
   toward the BLOCK threshold of 1 000.
2. **Slack/Salesforce secrets** still unset in this environment;
   runtime path is real, secrets are deferred.
3. **6 raw `<input type="file">`** intentional fallbacks — locked baseline.
4. **FE/BE matrix at 95 % (19/20)** — one archived item (mobile offline);
   raise to 22+ in Phase W by adding more substrate-backed actions.

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
