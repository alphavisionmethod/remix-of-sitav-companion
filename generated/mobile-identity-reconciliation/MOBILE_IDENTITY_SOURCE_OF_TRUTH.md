# SITA OS — Mobile Identity Source of Truth

**Status:** canonical
**Authority:** this document overrides any conflicting identity declaration in any other file
**Enforcement:** `scripts/validation/check-mobile-identity-source-of-truth.ts` (gate: `mobile-identity-source-of-truth`)

---

## 1. Canonical Identity Table

Every field below has exactly **one** authoritative source. All other occurrences must match.

| Field | Canonical value | Source of truth | Allowed copies |
|---|---|---|---|
| `appId` (iOS bundle id + Android applicationId) | `com.sita.os` | `capacitor.config.ts` line 11 | `infra/deploy/mobile.yaml`, `mobile/ios/SIGNING.md`, `mobile/android/SIGNING.md`, `mobile/store-metadata/*.json` |
| `appName` (display name on home screen) | `SITA OS` | `capacitor.config.ts` line 12 | `mobile/store-metadata/android.json` (`title`), `mobile/store-metadata/ios.json` (`name`) |
| Wrapper stack | `Capacitor 6` | `capacitor.config.ts` (file presence) + `package.json` `@capacitor/core` version | `infra/deploy/mobile.yaml`, `src/planes/MOBILE_MANIFEST.md` |
| Web runtime | `Vite 5 + React 18 + TypeScript 5 (Lovable SPA)` | `package.json` + `vite.config.ts` | `infra/deploy/mobile.yaml` (`web_runtime: lovable-spa`) |
| Backend platform | `Lovable Cloud (Supabase)` | `src/integrations/supabase/client.ts` + auto-managed `.env` | none required |
| iOS scheme | `sita` | `capacitor.config.ts` line 25 | `mobile/ios/Info.plist.template` |
| iOS min SDK | `16.0` | `infra/deploy/mobile.yaml` `spec.platform.capacitor.min_sdk.ios` | iOS bootstrap, build script |
| Android min SDK | `26` | `infra/deploy/mobile.yaml` `spec.platform.capacitor.min_sdk.android` | Android bootstrap, build script |
| Android target SDK | `34` | `infra/deploy/mobile.yaml` `spec.platform.capacitor.target_sdk.android` | Android bootstrap |
| Background color | `#0a0a0f` | `capacitor.config.ts` lines 26, 33, 42, 51 | iOS `Info.plist`, Android `styles.xml` |
| Build systems | iOS=`xcodebuild`+`CocoaPods`, Android=`Gradle`, Web=`Vite` (npm) | this document | bootstrap scripts |
| Dependency managers | npm (web) + CocoaPods (iOS, post-gen) + Gradle/Maven (Android, post-gen) | this document | bootstrap scripts |
| Environment/config strategy | Lovable `.env` (web) → CI secrets (signing) → Supabase function secrets (push/backend) → Apple/Google credential stores (never in repo) | `MOBILE_ENV_AND_SECRET_STRATEGY_MODEL.md` | all signing & release scripts |

---

## 2. Forbidden Identity Values

The following values are **explicitly rejected** in mobile claim surfaces:

| Forbidden value | Reason | Validator |
|---|---|---|
| `app.lovable.*` (any placeholder Lovable-default appId) | not a real reverse-domain identifier; Apple/Google reject placeholder ids on first submission | `check-mobile-project-identification.ts` |
| Any Flutter package import | wrapper stack is Capacitor — Flutter was abandoned earlier in the project's history | `check-no-flutter-stack-drift.ts` (this pass) + `check-no-flutter-mobile-truth-drift.ts` (closure pass) |
| Any React Native / Expo dependency | wrapper stack is Capacitor only — no second mobile architecture is permitted | `check-capacitor-mobile-truth.ts` |
| Hardcoded keystore passwords / certificate strings | secrets must come from CI env or Apple/Google credential stores | covered by `check-mobile-env-strategy-consistency.ts` (Phase 3) |
| Display name longer than 30 characters | App Store Connect rejects | `check-mobile-identity-source-of-truth.ts` |

---

## 3. Change Process

Any change to a canonical identity value requires:

1. Update this document first (PR title: `mobile-identity: <field> <old> → <new>`)
2. Update the source-of-truth file (e.g. `capacitor.config.ts`)
3. Update all allowed-copy locations in the same PR
4. Run `npm run mobile:identity:run-all` — must report all 8 gates GREEN
5. Run `npm run release:readiness:aggregate` — must remain GREEN with no new RED gates
6. Document the change in `generated/mobile-identity-reconciliation/MOBILE_IDENTITY_RECONCILIATION_FINAL_VERIFICATION.md` change-log

Changing `appId` or `appName` after first store submission is a **breaking change requiring re-submission** (App Store) or **a new app entry** (Play Store). This is governed by App Store Connect / Play Console policy, not by this repo.

---

## 4. Why These Specific Choices

| Choice | Rationale |
|---|---|
| `com.sita.os` (not `app.lovable.<id>`) | reverse-domain matches the product brand; works for both Apple Developer Account and Play Console without renaming on first submission |
| `SITA OS` (uppercase) | matches the product wordmark used in the desktop Electron shell, marketing site, and web app — single brand identity across all 4 surfaces |
| Capacitor 6 (not 5, not "next") | Capacitor 6 is the current LTS line; 7 is in pre-release as of the canonical truth date and not yet recommended for production iOS submissions |
| iOS min SDK 16.0 | covers iPhone 8 and later; matches Apple's stated 2-year support window for new submissions |
| Android min SDK 26 (Android 8.0 Oreo) | covers ~96% of active Play Store devices; below this, biometric and Keystore APIs diverge significantly |
| Android target SDK 34 (Android 14) | matches Play Console's August 2024 minimum target SDK requirement |
| Background color `#0a0a0f` | matches the Electron desktop shell's splash/startup background — gives mobile users a continuous brand experience when launching from cold |
| iOS scheme `sita` | short, memorable, deep-linkable as `sita://...`; matches desktop shell's `sita://` URL handler |

---

## 5. Audit Trail

| Date | Change | Author |
|---|---|---|
| Phase Mobile Deployment Closure | initial canonical values established in `capacitor.config.ts` and `infra/deploy/mobile.yaml` | platform-distribution |
| Phase Mobile Identity Reconciliation (this doc) | promoted incidental consistency to governed source-of-truth; added 8 validators | platform-distribution |
