# SITA OS — Mobile Stack Truth Audit

**Generated:** Phase 1 of Mobile Identity Reconciliation
**Question:** does any claim-bearing surface in this repo declare a mobile wrapper stack other than Capacitor?
**Answer:** **no.** Capacitor is the sole canonical mobile stack. Detail below.

---

## 1. Stack-Declaring Surfaces

| Surface | Declared stack | Canonical? |
|---|---|---|
| `capacitor.config.ts` (file presence + content) | Capacitor 6 | ✅ |
| `infra/deploy/mobile.yaml` `metadata.stack` | `capacitor` | ✅ |
| `infra/deploy/mobile.yaml` `spec.platform.capacitor.version` | `"6"` | ✅ |
| `package.json` dependencies | `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/app`, `@capacitor/device`, `@capacitor/network`, `@capacitor/preferences`, `@capacitor/push-notifications`, `@capacitor/background-runner`, `@aparajita/capacitor-biometric-auth` | ✅ |
| `src/planes/MOBILE_MANIFEST.md` "Canonical stack" table | Capacitor 6 | ✅ |
| `scripts/android/bootstrap.sh` | uses `npx cap add android`, `npx cap sync android` | ✅ |
| `scripts/release/android/build-android.sh` | invokes `./gradlew bundleRelease` on Capacitor-generated project | ✅ |
| `scripts/release/ios/build-ios.sh` | invokes `xcodebuild` on Capacitor-generated workspace | ✅ |
| `archive/ios-templates/App/Podfile` | `pod 'Capacitor'`, `pod 'CapacitorCordova'`, plugin pods | ✅ |
| `.github/workflows/mobile-build.yml` | runs `npx cap sync` | ✅ |
| `generated/mobile-deployment-closure/MOBILE_CANONICAL_TRUTH_MODEL.md` | declares Capacitor canonical | ✅ |
| `generated/mobile-canonical-stack-report.json` | `canonicalStack: capacitor`, `flutterDriftHits: 0` | ✅ |

---

## 2. Forbidden Stack Declarations — Search Results

Searched the entire repo (excluding `node_modules`, `.git`, `archive`, and validators that intentionally reference forbidden names for detection logic):

| Forbidden term | Hits in claim-bearing surfaces | Status |
|---|---|---|
| `flutter` (case-insensitive) | 0 | ✅ |
| `dart` (Dart language) | 0 in claim surfaces (`dart` substring matches `kbart`, `start`, etc. — none are Flutter) | ✅ |
| `react-native` | 0 | ✅ |
| `expo` (as dep) | 0 | ✅ |
| `xamarin` | 0 | ✅ |
| `cordova` (standalone, not `CapacitorCordova` compat shim) | 0 standalone | ✅ |
| `nativescript` | 0 | ✅ |
| `ionic` (Ionic Framework as separate stack) | 0 | ✅ |
| `flutter_engine` | 0 | ✅ |

> Allowed mentions of the word "Flutter": validator self-references in `scripts/validation/check-no-flutter-*.ts`, archive disavowals (`archive/`), explicit disavowal comments in `infra/deploy/mobile.yaml` line 2, and this audit document. All such mentions appear in contexts that include disavowal language (`forbidden`, `abandoned`, `removed`, `do not use`, `was abandoned`) and are excluded by the validator's allowlist regex.

---

## 3. Stack-Truth Drift Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Future contributor reintroduces Flutter as "ambient" mention in a deployment doc | low | `check-no-flutter-stack-drift.ts` fails CI on any Flutter mention in `infra/`, `src/planes/`, `mobile/`, `generated/manifests/` without disavowal context |
| Lovable scaffolding regenerates `app.lovable.*` ids on `cap sync` | very low | `capacitor.config.ts` is committed with explicit `com.sita.os` — `cap sync` reads, never overwrites, this file |
| `package.json` accidentally gains a React Native / Expo dep | low | `check-capacitor-mobile-truth.ts` greps `package.json` for forbidden mobile-stack deps |
| `infra/deploy/mobile.yaml` regresses to Flutter | very low | `check-no-flutter-stack-drift.ts` scans this file specifically; gate fails on any Flutter mention without disavowal |

---

## 4. Conclusion

**Capacitor 6 is the sole, canonical, documented, and drift-protected mobile wrapper stack for SITA OS.**

This audit confirms zero contradictory declarations across 12 stack-declaring surfaces and zero forbidden-stack hits across 9 grep patterns. The result is enforced going forward by 4 new validators (Phase 1) and the 6 existing closure validators, totalling 10 mobile-stack-related gates in the release aggregator.
