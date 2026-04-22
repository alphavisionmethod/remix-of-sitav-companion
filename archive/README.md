# Archive — Governed Historical Assets

This directory holds a **minimal, governed** set of historical assets retained
for compliance maps, validator sentinels, and mobile reactivation readiness.

> **See [`archive/POLICY.md`](./POLICY.md) for retention rules and boundaries.**

## What remains

| Path | Purpose | Referenced by |
|---|---|---|
| `mobile/ARCHIVED.md` | Mobile deferral attestation sentinel | `check-mobile-deferral-attestation.ts`, `MOBILE_HONESTY.md` |
| `mobile/ios/` | iOS compliance artifacts (PrivacyInfo, Info.plist, SIGNING) | `mobile-platform-compliance-map.ts` |
| `mobile/android/` | Android compliance artifacts (SDK policy, signing, FCM) | `mobile-platform-compliance-map.ts` |
| `mobile/store-metadata/` | Store listing & data-safety templates | `mobile-platform-compliance-map.ts` |
| `mobile/icons/` | Icon assets for mobile reactivation | Future reactivation path |
| `capacitor/capacitor.config.ts` | Capacitor config sentinel | `check-mobile-manifest-archive-classification.ts` |
| `infra/mobile.yaml` | Infrastructure manifest sentinel | `emit-mobile-scope-artifacts.ts`, `PLATFORM_SCOPE.md` |

## What was removed (2026-04-21)

The following dead subtrees were deleted as they had zero active references:

- `archive/generated/` — 50+ stale JSON/MD proof artifacts creating false readiness
- `archive/android-templates/` — Dead Android build template tree
- `archive/ios-templates/` — Dead iOS App/Podfile template tree
- `archive/mobile-platform-native/` — 26 dead Capacitor/native adapter files
- `archive/src/` — Dead admin pages, mobile clients, planes barrel
- `archive/scripts/` — 18 dead mobile validation scripts
- `archive/workflows/` — 4 dead GitHub Actions workflows

## Rules

1. **Do not import** from `archive/` in active runtime code.
2. **Do not add** generated artifacts, source code, or template trees here.
3. **Do not extend** archived files — restore deliberately with a decision record.
4. CI validators reference sentinel files only; they do not execute archived code.
5. See `archive/POLICY.md` for the full governance policy.

## Active platform truth

The canonical native platform is **Ubuntu 24.04 LTS + Electron shell**.
See `docs/PLATFORM_SCOPE.md` and `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`.
