# SITA OS — Mobile Build & Dependency Model

**Status:** canonical
**Authority:** this document is the source of truth for which build tools and dependency managers are used in which tier
**Enforcement:** `check-mobile-build-model-consistency.ts`

---

## 1. The Canonical Model (TL;DR)

| Tier | Build tool | Dependency manager | Output |
|---|---|---|---|
| Web | Vite 5 | npm (`package.json`) | `dist/` |
| Wrapper | `npx cap sync` | npm (`@capacitor/*` packages) | sync into `android/` and `ios/` |
| Android | Gradle 8.x (wrapper) | Gradle/Maven | `.aab` (release) or `.apk` (debug) |
| iOS | `xcodebuild` (Xcode 15+) | CocoaPods | `.ipa` |

---

## 2. Tier Boundaries (what runs where)

### Tier 1 — Web (lives in repo)
```bash
npm install              # resolve deps from package.json
npm run build            # → dist/
```

### Tier 2 — Capacitor wrapper (lives in repo + npm)
```bash
npx cap add ios          # idempotent; generates ios/ if absent
npx cap add android      # idempotent; generates android/ if absent
npx cap sync             # propagates dist/ + capacitor.config.ts → native projects
```

### Tier 3a — Android (generated, not committed)
```bash
cd android
./gradlew assembleDebug     # debug APK
./gradlew bundleRelease     # signed AAB (requires keystore env vars)
```

### Tier 3b — iOS (generated, not committed, macOS only)
```bash
cd ios/App
pod install --repo-update   # CocoaPods
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive -archivePath build/App.xcarchive
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportOptionsPlist ExportOptions.plist
```

---

## 3. Capacitor Sync as the Bridge

The Capacitor `cap sync` step is the **single integration point** between Tier 2 (wrapper) and Tier 3 (native). It performs:

1. Copies `dist/` (web bundle) into `android/app/src/main/assets/public/` and `ios/App/App/public/`
2. Reads `capacitor.config.ts` and applies values to:
   - `android/app/build.gradle` (`applicationId`, `versionName`, `versionCode`)
   - `android/app/src/main/AndroidManifest.xml` (package, scheme)
   - `ios/App/App/Info.plist` (`CFBundleIdentifier`, `CFBundleDisplayName`, `CFBundleURLSchemes`)
   - `ios/App/App.xcodeproj/project.pbxproj` (`PRODUCT_BUNDLE_IDENTIFIER`)
3. Refreshes plugin registrations:
   - Android: `android/capacitor.settings.gradle` lists installed `@capacitor/*` plugins
   - iOS: `ios/App/Podfile` lists pod entries for installed plugins
4. Triggers `pod install` in CI if Podfile changed (locally requires manual `pod install`)

**This is the only step that can change the canonical identity values in the native projects.** Direct edits to `android/app/build.gradle` or `ios/App/App/Info.plist` are forbidden — they will be overwritten by the next `cap sync`.

---

## 4. When CocoaPods Becomes Relevant

CocoaPods runs **only in Tier 3b (iOS)** and **only after `cap add ios` has generated the `ios/` directory**. Specifically:

- `pod install --repo-update` is invoked by `scripts/ios/bootstrap.sh` step 6 (after template overlay, before `cap sync ios`)
- `pod install` is **also** invoked automatically by `cap sync ios` if the Podfile has changed since last sync
- The Podfile template lives at `archive/ios-templates/App/Podfile` (deferred location pre-Apple-enrollment) and is overlaid into `ios/App/Podfile` by the bootstrap script

**CocoaPods is not relevant to:**
- Tier 1 (web) — no Pods involved
- Tier 2 (wrapper) — npm manages Capacitor
- Tier 3a (Android) — Gradle/Maven manages Android deps

---

## 5. What's Inferred Only After Generation

| Artifact | Pre-generation status | Post-generation status |
|---|---|---|
| `android/app/build.gradle` `applicationId` | inferred from `capacitor.config.ts` `appId` | concrete value |
| `android/app/build.gradle` AGP version | inferred from Capacitor 6 default | concrete value |
| Gradle wrapper version | inferred from Capacitor 6 default (8.x) | concrete value, locked in `gradle-wrapper.properties` |
| `ios/App/Podfile.lock` | does not exist | concrete pod versions, locked |
| `ios/App/App.xcodeproj/project.pbxproj` UUIDs | random | concrete after `cap add ios` |

**These inferences are the price of the on-demand generation strategy** (see `NATIVE_PROJECT_GENERATION_CONTRACT.md` section 3 for why this trade-off is correct).

---

## 6. What's Guaranteed Pre-Generation

| Guarantee | Source |
|---|---|
| `appId == com.sita.os` | `capacitor.config.ts` line 11 |
| `appName == SITA OS` | `capacitor.config.ts` line 12 |
| Web bundle output dir | `dist/` (Vite default) |
| iOS scheme `sita` | `capacitor.config.ts` line 25 |
| iOS background `#0a0a0f` | `capacitor.config.ts` line 26 |
| Min iOS 16.0, Min Android 26, Target Android 34 | `infra/deploy/mobile.yaml` |
| iOS pod set | `archive/ios-templates/App/Podfile` |
| Android plugin set | `package.json` `@capacitor/*` deps |

These are **committed, governed, and validated** before any native project exists.

---

## 7. Forbidden Patterns

| Pattern | Why forbidden |
|---|---|
| Editing `android/app/build.gradle` directly without overlay | next `cap sync` overwrites |
| Editing `ios/App/Podfile` directly without updating `archive/ios-templates/App/Podfile` | bootstrap re-overlays from template |
| Adding a Tier-1 build tool other than Vite | `vite.config.ts` is the canonical web build config |
| Adding a Tier-3a build tool other than Gradle | Capacitor 6 only supports Gradle for Android |
| Adding a Tier-3b build tool other than `xcodebuild` | Capacitor 6 only supports xcodebuild for iOS |
| Adding a second mobile wrapper (Flutter, RN, Expo) | `check-capacitor-mobile-truth.ts` enforces single wrapper |

---

## 8. Verification

This model is enforced by `check-mobile-build-model-consistency.ts` which asserts:

- `package.json` declares `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` at major 6
- `scripts/android/bootstrap.sh` invokes `npm run build` and `./gradlew`
- `scripts/release/android/build-android.sh` invokes `./gradlew bundleRelease`
- `scripts/ios/bootstrap.sh` invokes `pod install` and `npx cap sync`
- `scripts/release/ios/build-ios.sh` invokes `xcodebuild`
- `archive/ios-templates/App/Podfile` declares `platform :ios, '16.0'`
- `infra/deploy/mobile.yaml` declares matching min/target SDK values
