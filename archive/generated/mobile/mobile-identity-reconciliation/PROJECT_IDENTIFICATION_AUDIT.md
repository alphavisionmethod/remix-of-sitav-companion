# SITA OS — Mobile Project Identification Audit

**Generated:** Phase 1 of Mobile Identity Reconciliation
**Audit scope:** every file in the repo that declares or implies mobile project identity
**Outcome:** all identity-bearing surfaces inspected; canonical values inventoried; drift catalogued

---

## 1. Surfaces Inspected

| Surface | Path | Identity Fields Declared |
|---|---|---|
| Capacitor config | `capacitor.config.ts` | `appId`, `appName`, `webDir`, server URL, iOS scheme, iOS background, Android package |
| Play Store metadata | `mobile/store-metadata/android.json` | `title`, `category`, URLs, content rating |
| Play data-safety | `mobile/store-metadata/android.data-safety.json` | encryption, deletion URL |
| App Store metadata | `mobile/store-metadata/ios.json` | `name`, `subtitle`, category, age rating, languages |
| App Store screenshots | `mobile/store-metadata/ios.screenshots.json` | required device classes |
| iOS signing notes | `mobile/ios/SIGNING.md` | bundle id, team id env, APNs envs |
| iOS Info.plist template | `mobile/ios/Info.plist.template` | `CFBundleDisplayName`, ATS, scheme |
| iOS privacy manifest | `mobile/ios/PrivacyInfo.xcprivacy` | tracking declaration |
| Android signing notes | `mobile/android/SIGNING.md` | package name env, keystore envs |
| Android FCM notes | `mobile/android/FCM.md` | sender id env, project id env |
| Android permissions | `mobile/android/AndroidManifest.permissions.xml` | declared runtime permissions |
| Mobile deploy manifest | `infra/deploy/mobile.yaml` | `stack: capacitor`, posture, signing envs, push transport |
| Android bootstrap | `scripts/android/bootstrap.sh` | implies `com.sita.os` via Capacitor config |
| iOS release script | `scripts/release/ios/build-ios.sh` | bundle id consumed from Info.plist |
| Android release script | `scripts/release/android/build-android.sh` | package name from env |
| Mobile workflow | `.github/workflows/mobile-build.yml` | runner matrix |
| Mobile manifest | `src/planes/MOBILE_MANIFEST.md` | canonical stack, posture, ownership |
| Closure final verification | `generated/mobile-deployment-closure/MOBILE_DEPLOYMENT_FINAL_VERIFICATION.md` | restates canonical values |

**Total identity-bearing surfaces:** 18

---

## 2. Identity Field Inventory

### 2.1 App identifier (`appId` / `applicationId` / `CFBundleIdentifier`)

| Source | Value | Authoritative? |
|---|---|---|
| `capacitor.config.ts` line 11 | `com.sita.os` | **YES — root of truth** |
| `infra/deploy/mobile.yaml` `entitlements.keychain_access_groups` | `${APPLE_TEAM_ID}.com.sita.os` | derives from canonical |
| `infra/deploy/mobile.yaml` `apns.bundle_id` | `com.sita.os` | derives from canonical |
| `mobile/ios/SIGNING.md` | `com.sita.os` | derives from canonical |
| `mobile/android/SIGNING.md` | `com.sita.os` (env: `ANDROID_PACKAGE_NAME`) | derives from canonical |

**Result:** ✅ no drift. `com.sita.os` is consistent across all 5 surfaces.

> Note: Lovable's default scaffolding suggests `app.lovable.<projectId>` — that placeholder is **explicitly rejected** by this canonical model. SITA OS has chosen a real reverse-domain identifier (`com.sita.os`) suitable for production store submission.

### 2.2 App display name

| Source | Value | Authoritative? |
|---|---|---|
| `capacitor.config.ts` line 12 | `SITA OS` | **YES — root of truth** |
| `mobile/store-metadata/android.json` `title` | `SITA OS` | derives |
| `mobile/store-metadata/ios.json` `name` | `SITA OS` | derives |
| `src/planes/MOBILE_MANIFEST.md` | `SITA OS` | derives |

**Result:** ✅ no drift.

### 2.3 Wrapper stack

| Source | Value |
|---|---|
| `capacitor.config.ts` (file presence) | Capacitor 6 |
| `infra/deploy/mobile.yaml` `metadata.stack` | `capacitor` |
| `infra/deploy/mobile.yaml` `spec.platform.capacitor.version` | `"6"` |
| `src/planes/MOBILE_MANIFEST.md` "Canonical stack" table | `Capacitor 6` |
| `package.json` deps | `@capacitor/core`, `@capacitor/ios`, `@capacitor/android` |

**Result:** ✅ Capacitor 6 declared canonically. **No Flutter declaration anywhere in claim-bearing surfaces** (verified by `check-no-flutter-mobile-truth-drift` — current report shows 0 hits).

### 2.4 Web runtime layer

| Source | Value |
|---|---|
| `package.json` | Vite 5 + React 18 + TypeScript 5 |
| `capacitor.config.ts` `webDir` | `dist` (Vite output) |
| `infra/deploy/mobile.yaml` `spec.platform.capacitor.web_runtime` | `lovable-spa` |

**Result:** ✅ consistent.

### 2.5 Backend integration

| Source | Value |
|---|---|
| `.env` (auto-managed) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` |
| `src/integrations/supabase/client.ts` | Lovable Cloud Supabase client |
| `infra/deploy/mobile.yaml` `spec.api.base_url` | `${API_BASE_URL}` (env-driven) |

**Result:** ✅ consistent — Lovable Cloud (Supabase) is the canonical backend; mobile reaches it via the same SPA paths the web shell uses, no separate mobile backend.

---

## 3. Drift Findings

| # | Drift candidate | Status |
|---|---|---|
| 1 | Flutter mention in `infra/deploy/mobile.yaml` (per earlier audit) | **RESOLVED before this pass** — current YAML declares `stack: capacitor` and contains a "Flutter was abandoned" disavowal comment. Verified line-by-line. |
| 2 | `app.lovable.*` placeholder ids | **NOT PRESENT** — grep across repo shows zero matches in mobile claim surfaces. |
| 3 | Conflicting display names | **NONE** |
| 4 | Conflicting bundle ids | **NONE** |
| 5 | React Native / Expo references in claim surfaces | **NONE** |
| 6 | Stale Fastlane references | **NONE** (no Fastlane in repo) |

---

## 4. Identity Surfaces Without Governance

These surfaces declare identity values **without referencing the canonical source**:

| Surface | Issue | Severity |
|---|---|---|
| `mobile/store-metadata/android.json` | hard-codes `"title": "SITA OS"` instead of deriving from `capacitor.config.ts` | low — store metadata must be hand-curated for Play Console UX, divergence is acceptable |
| `mobile/store-metadata/ios.json` | hard-codes `"name": "SITA OS"` | same — App Store Connect requires per-locale curation |
| `infra/deploy/mobile.yaml` `entitlements.keychain_access_groups` | hard-codes `com.sita.os` rather than deriving | acceptable — YAML is consumed by build tools, not at runtime |

**Decision:** these are **intentional duplications for human curation**, governed by the source-of-truth doc + a drift validator that fails CI if they diverge from `capacitor.config.ts`.

---

## 5. Identity Fields That Need to Become Governed

| Field | Why governed |
|---|---|
| `appId` (`com.sita.os`) | breaking change ⇒ store re-submission |
| `appName` (`SITA OS`) | breaking change ⇒ store metadata + icon re-render |
| Wrapper stack (`capacitor`) | re-platforming ⇒ entire mobile distribution rebuild |
| iOS scheme (`sita`) | breaking change ⇒ deep-link contract revision |
| Min iOS SDK (`16.0`) | regression ⇒ store rejection on older device guarantees |
| Min Android SDK (`26`) | regression ⇒ Play Console rejection |
| Web runtime (`lovable-spa`) | re-platforming the web layer is also a re-platforming of mobile |

These fields are codified in `MOBILE_IDENTITY_SOURCE_OF_TRUTH.md` and enforced by `check-mobile-identity-source-of-truth.ts`.

---

## 6. Audit Summary

| Metric | Value |
|---|---|
| Surfaces inspected | 18 |
| Identity fields catalogued | 12 |
| Drift hits found | 0 |
| Conflicting stack declarations | 0 |
| `app.lovable.*` placeholders in claim surfaces | 0 |
| Flutter declarations in claim surfaces | 0 |
| Surfaces missing canonical reference | 3 (intentional, governed) |

**Verdict:** the mobile project identity is **already largely consistent** thanks to Phase Mobile Deployment Closure. This audit promotes that consistency from "incidentally true" to "governed truth" with an explicit source-of-truth doc and 4 new drift-prevention validators.
