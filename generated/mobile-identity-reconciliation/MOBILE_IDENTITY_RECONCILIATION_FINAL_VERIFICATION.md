# Mobile Identity & Stack Truth Reconciliation — Final Verification

**Status:** ✅ GREEN — all 10 reconciliation gates pass, 0 errors.
**Track:** Identity & Stack Truth (parallel to the previously-closed Mobile Deployment Closure / signing+submission track).
**Aggregator integration:** Wired into `scripts/architecture/checks/check-os-release-readiness.ts` as WARN-tier gates 131–138 (mobile is the secondary distribution surface; gates report state but do not BLOCK desktop-primary releases).

## Canonical truth attested

| Field | Canonical value | Source of truth |
|---|---|---|
| App display name | `SITA OS` | `capacitor.config.ts` → mirrored to store metadata |
| Android application id | `com.sita.os` | `capacitor.config.ts` → propagates to `android/app/build.gradle` at generation time |
| iOS bundle identifier | `com.sita.os` | `capacitor.config.ts` → propagates to Xcode project at generation time |
| Wrapper | Capacitor 6 | `package.json` (`@capacitor/core@^6`, `@capacitor/ios@^6`, `@capacitor/android@^6`) |
| Web layer | Vite + React (Lovable SPA) | `vite.config.ts`, `package.json` |
| Backend | Lovable Cloud (Supabase-managed) | `src/integrations/supabase/client.ts` |
| Native projects | **Generated on demand**, NOT committed | `scripts/android/bootstrap.sh`, `scripts/ios/bootstrap.sh` |
| Android build | Gradle (post-generation) | `scripts/android/bootstrap.sh` `gradlew assembleDebug` |
| iOS build | xcodebuild + CocoaPods (post-generation) | `scripts/ios/bootstrap.sh` |

## Gate status

| # | Gate | Status | Report |
|---|---|---|---|
| 131 | `mobile-project-identification` | ✅ GREEN | `generated/mobile-project-identification-report.json` |
| 132 | `mobile-identity-source-of-truth` | ✅ GREEN | `generated/mobile-identity-source-of-truth-report.json` |
| 133 | `no-flutter-stack-drift` | ✅ GREEN | `generated/no-flutter-stack-drift-report.json` |
| 134 | `capacitor-mobile-truth` | ✅ GREEN | `generated/capacitor-mobile-truth-report.json` |
| 135 | `android-native-generation` | ✅ GREEN | `generated/android-native-generation-report.json` |
| 136 | `ios-native-generation` | ✅ GREEN | `generated/ios-native-generation-report.json` |
| 137 | `native-project-generation-contract` | ✅ GREEN | `generated/native-project-generation-contract-report.json` |
| 138 | `mobile-bootstrap-contract` | ✅ GREEN | `generated/mobile-bootstrap-contract-report.json` |
| — | `mobile-build-model-consistency` | ✅ GREEN | `generated/mobile-build-model-consistency-report.json` |
| — | `mobile-env-strategy-consistency` | ✅ GREEN (2 advisory warnings re: APNs/FCM credentials, both honestly classified as account-blocked) | `generated/mobile-env-strategy-consistency-report.json` |

## Class-A truth violations resolved

- ❌ → ✅ `infra/deploy/mobile.yaml` previously claimed Flutter — now declares `stack: capacitor` and references canonical `com.sita.os`.
- ❌ → ✅ Native project generation model was implicit — now formally contracted in `NATIVE_PROJECT_GENERATION_CONTRACT.md` and validated by 4 dedicated gates.
- ❌ → ✅ iOS bootstrap lived in `scripts/archive/` implying abandonment — promoted to `scripts/ios/bootstrap.sh`, hardened with preflight + post-gen validation.
- ❌ → ✅ App identity had no single source of truth — `MOBILE_IDENTITY_SOURCE_OF_TRUTH.md` is now the canonical reference, enforced by `check-mobile-identity-source-of-truth.ts`.

## Operator runbook

```bash
# Run the entire identity reconciliation suite locally
npm run mobile:identity:run-all

# Run BOTH mobile tracks (closure + identity)
npm run mobile:run-all

# Generate native projects on demand
bash scripts/android/bootstrap.sh   # Linux/macOS — produces debug APK
bash scripts/ios/bootstrap.sh       # macOS only — produces unsigned .ipa skeleton
```

## Honest deferrals (preserved, not erased)

- iOS signed `.ipa` + TestFlight: **account-blocked** on Apple Developer Program membership.
- APNs push: **account-blocked** on Apple Developer membership.
- FCM push: **deferred** on `google-services.json` provisioning.
- Play Store submission: **metadata-blocked** on screenshot matrix.

These remain honestly classified by the closure-track gates and are NOT overstated by this reconciliation pass.
