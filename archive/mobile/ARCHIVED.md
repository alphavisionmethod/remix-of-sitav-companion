# SITA OS — Archived Mobile Tree

> **Status:** `ARCHIVED` / `FUTURE_VISION_ONLY` / `NOT_LAUNCH_SURFACE`
> **Archived on:** 2026-04-19
> **Canonical honesty doc:** `docs/MOBILE_HONESTY.md`
> **Reactivation checklist:** `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md`

## What lives here

This directory preserves the previously active mobile-native scaffolding so a future mobile program can reactivate without rebuilding from zero:

- `android/` — keystore notes, FCM provisioning notes, manifest permissions
- `ios/` — signing notes, Info.plist template, privacy manifest
- `store-metadata/` — Play + App Store listing payloads, screenshot matrix, data-safety JSON
- `icons/` — source icons for native shells

## Why it's archived (not deleted)

Containment over deletion. These assets are valuable as a starting point if and when SITA OS reactivates a native mobile program — but they are **not** part of the current deployment scope. Keeping them in `archive/` prevents:

- launch-surface drift (active claims that mobile is "store-ready" when it is not)
- machine-readable truth contamination (generated reports declaring readiness)
- accidental import from active code paths

## Containment rules (enforced)

The following BLOCK validators in `scripts/validation/` enforce the archived posture:

1. `check-mobile-native-out-of-scope-truth.ts` — fails if `capacitor.config.ts` returns to repo root or `@capacitor/*` deps reappear in `package.json`
2. `check-no-active-native-mobile-claims.ts` — fails if forbidden phrases (e.g., "store-ready", "App Store submission ready") appear outside `archive/`
3. `check-install-page-mobile-honesty.ts` — fails if install surfaces stop linking to `docs/MOBILE_HONESTY.md`
4. `check-mobile-manifest-archive-classification.ts` — fails if `infra/deploy/mobile.yaml` reappears at the active path
5. `check-generated-mobile-truth-consistency.ts` — fails if any `generated/mobile-*.json` appears outside `generated/mobile-scope-closure/`

## How to reactivate

See `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md` for the full operational checklist (8 sections, ~25 boxes). All boxes must be checked before any "mobile is back" claim is allowed.
