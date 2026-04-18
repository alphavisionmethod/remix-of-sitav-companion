# Phase H — Baseline Sealing & Drift Detection Certificate

**Generated:** 2026-04-18  
**Status:** ✅ DEPLOYABLE  
**TypeScript errors:** 0  
**Aggregator gates:** 35/35 GREEN (0 errors)

## What Phase H delivers

Phase H seals the GREEN state achieved across Phases A–G as an immutable, fingerprinted baseline, then enforces a **block-level drift detector** that fails CI when:

1. A new admin route is added without a guard (`AdminRoute` / `PermissionGatedRoute`)
2. A mobile feature's classification regresses (e.g. `live` → `partial`)
3. A previously-guarded admin route silently loses its guard
4. Any additive surface change occurs without intentional `seal-profile-runtime-baseline.ts` re-run

## Sealed surface (fingerprint `7b1626…ab95cd`)

| Surface | Sealed count |
|---|---|
| Apps in registry | 20 |
| Total routes | 673 |
| Admin routes | 191 |
| Guarded admin routes | 191 (100%) |
| Mobile features classified | 36 |

## New scripts

| Script | Purpose |
|---|---|
| `scripts/architecture/checks/seal-profile-runtime-baseline.ts` | Re-seals baseline (run only on intentional surface change) |
| `scripts/architecture/checks/check-profile-runtime-baseline-drift.ts` | Block-level CI gate; compares current evidence to sealed baseline |

## Wiring updates

- Added `profile-runtime-baseline-drift` to `run-all-profile-runtime-gates.ts` orchestrator (now 9 gates)
- Added `profile-runtime-baseline-drift` to `check-os-release-readiness.ts` master aggregator (now 35 required gates)

## Operator runbook

**Drift detected? Don't bypass.**

1. Inspect `generated/profile-runtime-baseline-drift.json` → `drift` payload
2. If hard failure (new unguarded admin route, mobile regression, guard loss): **fix the root cause**
3. If intentional additive change (new app, new route, profile expansion): re-run `npx tsx scripts/architecture/checks/seal-profile-runtime-baseline.ts` after PR review
4. Emergency override (additive only, not security): `ALLOW_BASELINE_DRIFT=1 npx tsx …check-profile-runtime-baseline-drift.ts`

## Behavior guarantees (unchanged from Phase G)

- 0 files moved, 0 deleted, 0 routes removed, 0 imports broken
- All previous wiring intact

**Result:** SITA OS profile-and-runtime hardening surface is now sealed, monitored, and provably regression-resistant.


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
