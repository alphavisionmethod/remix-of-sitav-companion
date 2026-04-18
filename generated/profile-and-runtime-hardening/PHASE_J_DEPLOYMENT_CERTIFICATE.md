# Phase J — Operator Documentation & npm Script Integration Certificate

**Generated:** 2026-04-18
**Status:** ✅ DEPLOYABLE
**TypeScript errors:** 0
**Aggregator gates:** 36/36 GREEN (0 errors)

## What Phase J delivers

Phase J makes the hardening pipeline (Phases A–I) **discoverable, ergonomic, and operator-ready** by:

1. **8 npm scripts** added to `package.json` covering every hardening workflow
2. **Comprehensive operator runbook** at `generated/profile-and-runtime-hardening/OPERATOR_RUNBOOK.md`
3. **Production HMAC key guidance** for moving from dev key to secure secret-store key
4. **CI failure remediation flows** for both drift and tamper-detection failures

## New npm scripts (8)

| Script | Purpose |
|---|---|
| `hardening:evidence` | Regenerate the 4 evidence JSON maps |
| `hardening:gates` | Run all 10 block-level hardening gates via orchestrator |
| `hardening:seal` | Re-seal the baseline (Phase H) |
| `hardening:sign` | Re-sign the attestation (Phase I) |
| `hardening:verify` | Fast drift+attestation check (pre-commit friendly) |
| `hardening:reseal` | One-shot: evidence + seal + sign + verify |
| `hardening:release` | Full release-pipeline check including master aggregator |

## Files

| Action | File |
|---|---|
| Modified | `package.json` (+8 scripts) |
| Created | `generated/profile-and-runtime-hardening/OPERATOR_RUNBOOK.md` |
| Created | `generated/profile-and-runtime-hardening/PHASE_J_DEPLOYMENT_CERTIFICATE.md` |

## Verification

```
$ npm run hardening:release
✅ ALL 10 GATES PASS
Release readiness: YELLOW (36/36 gates, 0 errors)

$ npx tsc --noEmit
0 errors
```

## Behavior guarantees (unchanged across Phases A–J)

- 0 files moved, 0 deleted, 0 routes removed, 0 imports broken, 0 behavior changes

**Result:** The full hardening lifecycle is now ergonomically operable via npm scripts and documented end-to-end. New engineers can onboard, run, and remediate the pipeline without reading source.
