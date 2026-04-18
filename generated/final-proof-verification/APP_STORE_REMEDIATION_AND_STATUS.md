# App Store Remediation and Status

## Status

The App Store lifecycle is **fully real** at the point of this audit. There are no partial lifecycle steps that require fixing.

## Evidence

- 5/5 required edge functions deployed (see `APP_STORE_REALITY_AUDIT.md`).
- DB-backed `installed_apps` with 31 consumers (well above the 8-consumer threshold).
- 4/4 app types pass 7/7 lifecycle steps (see `APP_STORE_TYPE_MATRIX.md`).
- Profile visibility is enforced through canonical helpers in `src/shell-runtime/launcher-profile.ts`.

## Remediation Performed in This Pass

None required. This audit was a verification pass; no source code changed.

## Drift Protection

Going forward, drift is prevented by `scripts/validation/check-app-store-lifecycle-reality.ts`, which is wired into the master release aggregator as a BLOCK gate. It re-verifies edge function presence, app type matrix completeness, and minimum install-state consumer count on every release run.
