# 05 — Mobile Deployment Final Status

> Generated: 2026-04-19 · Aggregated by `check-final-mobile-truth.ts`

## Stack truth

**Canonical:** Capacitor 6 wrapping the Vite/React/Lovable SPA.

- ❌ Flutter: explicitly forbidden (validator: `check-no-flutter-stack-drift.ts`)
- ❌ React Native: not used
- ❌ Expo: not used
- ✅ Capacitor: canonical (validator: `check-capacitor-mobile-truth.ts`)

## Identity (canonical)

| Field | Value | Source of truth |
|---|---|---|
| App display name | SITA | `mobile/store-metadata/{android,ios}.json` |
| Android `applicationId` | `com.sita.os` | `capacitor.config.ts` |
| iOS bundle id | `com.sita.os` | `capacitor.config.ts` |

## Native project model

Both `android/` and `ios/` are **generated on demand** via:
- `scripts/android/bootstrap.sh`
- `scripts/ios/bootstrap.sh`

Validators enforce reproducibility:
- `check-android-native-generation.ts`
- `check-ios-native-generation.ts`
- `check-mobile-bootstrap-contract.ts`

## Build & dependency truth

- **Web layer:** Vite + Bun (lockfile: `bun.lockb`)
- **Capacitor sync:** `npx cap sync` after web build
- **Android:** Gradle (versions pinned in generated project)
- **iOS:** Xcodebuild + CocoaPods (Pods installed by bootstrap)

## Submission readiness

| Layer | Status | Blocker class |
|---|---|---|
| Code path | ✅ Complete | — |
| Android signing | ✅ Documented | Operator credentials |
| iOS signing | ✅ Documented | Operator credentials |
| Apple Developer Program | ❌ | **External — account** |
| Google Play Console | ❌ | **External — account** |
| APNs push certificate | ⏸️ | **Gated by Apple Dev** |

## Verdict

**Mobile code is ready.** Submission is gated only by external account
credentials, honestly classified as WARN-tier in `mobile-submission-blockers-report.json`.
