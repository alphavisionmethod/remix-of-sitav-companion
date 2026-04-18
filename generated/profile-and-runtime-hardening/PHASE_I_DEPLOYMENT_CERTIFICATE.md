# Phase I — Signed Attestation & Tamper Detection Certificate

**Generated:** 2026-04-18
**Status:** ✅ DEPLOYABLE
**TypeScript errors:** 0
**Aggregator gates:** 36/36 GREEN (0 errors, 0 missing)

## What Phase I delivers

Phase I cryptographically signs the sealed baseline + all evidence files with **HMAC-SHA256**, then enforces a block-level CI gate that fails when:

1. The signed attestation file is missing
2. The HMAC signature is invalid (key mismatch or tampered attestation)
3. Any covered file's SHA-256 digest no longer matches the attested digest (manual edit detected)
4. The baseline fingerprint inside the attestation no longer matches `baseline.sealed.json` (re-seal without re-attest)

## Covered surface (5 files)

| File | Purpose |
|---|---|
| `baseline.sealed.json` | Phase H sealed surface state |
| `app-registry-map.json` | App registry evidence map |
| `app-route-profile-map.json` | Route ↔ profile evidence map |
| `mobile-capability-map.json` | Mobile feature classification map |
| `profile-separation-map.json` | Profile leakage evidence map |

## Cryptographic configuration

- **Algorithm:** HMAC-SHA256
- **Key sources (priority):** `SITA_HARDENING_HMAC_KEY` env → `.sita-hmac-dev.key` file → auto-generated dev key
- **Canonicalization:** `JSON.stringify(payload, sortedKeys, 0)` for deterministic signing
- **Verification:** `timingSafeEqual` to prevent timing oracle attacks

## New scripts

| Script | Purpose |
|---|---|
| `scripts/architecture/checks/sign-profile-runtime-attestation.ts` | Signs current state (run after intentional re-seal) |
| `scripts/architecture/checks/check-profile-runtime-attestation.ts` | Block-level CI gate; verifies signature + digests |

## Wiring updates

- Added `profile-runtime-attestation` to `run-all-profile-runtime-gates.ts` (now 10 hardening gates)
- Added `profile-runtime-attestation` to `check-os-release-readiness.ts` (master aggregator: **36/36 GREEN**)

## Operator runbook

**Attestation FAIL? Investigate before fixing.**

1. Inspect `generated/profile-runtime-attestation.json` → `digestMismatches[]`
2. Identify which file changed and review `git diff` for that file
3. If tampering: revert and audit
4. If intentional change (rare — usually means a Phase H re-seal): run
   ```
   npx tsx scripts/architecture/checks/seal-profile-runtime-baseline.ts
   npx tsx scripts/architecture/checks/sign-profile-runtime-attestation.ts
   ```
5. Production: set `SITA_HARDENING_HMAC_KEY` from a secret store; never commit the key

## Defense-in-depth chain (Phases A–I)

```
A→B: Evidence + warn-level guardrails
C:   Targeted structural fixes (no behavior change)
D→F: Verification + ratchet to block-level (8 gates)
G:   CI orchestration + master aggregator wiring
H:   Sealed baseline + drift detection (gate #9)
I:   HMAC-signed attestation + tamper detection (gate #10) ← THIS PHASE
```

## Behavior guarantees (unchanged)

- 0 files moved, 0 deleted, 0 routes removed, 0 imports broken
- All previous wiring intact

**Result:** SITA OS profile-and-runtime hardening surface is now **sealed, monitored, AND cryptographically attested**. Silent edits to any of the 5 covered files will fail CI.
