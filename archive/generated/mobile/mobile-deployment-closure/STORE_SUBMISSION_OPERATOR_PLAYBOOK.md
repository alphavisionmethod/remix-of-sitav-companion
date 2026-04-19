# Store Submission Operator Playbook

> Concrete, command-line steps to go from a clean `git pull` to "live in TestFlight + Play internal".

## TL;DR

| Track | Single-command release |
|---|---|
| Android internal | `bash scripts/release/android/build-android.sh && bundletool ... upload` |
| iOS TestFlight | `bash scripts/release/ios/build-ios.sh && xcrun altool --upload-app ...` |

## Prerequisites checklist

### Android
- [ ] CI runner: `ubuntu-latest` (or any Linux with Node 18+, JDK 17, rsync)
- [ ] Upload keystore (`.jks`) generated and stored as CI secret
- [ ] 5 env vars: `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_PACKAGE_NAME`
- [ ] Play Console app record created for `com.sita.os`
- [ ] Privacy policy live at `https://sita.os/legal/privacy`
- [ ] Screenshots captured per `mobile/store-metadata/android.screenshots.json`

### iOS
- [ ] CI runner: `macos-14` (Xcode 16+)
- [ ] Active Apple Developer Program membership
- [ ] 7 secrets: see `IOS_SIGNING_AND_RELEASE_FLOW.md` § "The 7-secret contract"
- [ ] App Store Connect app record created for `com.sita.os`
- [ ] Privacy policy + support URLs live
- [ ] Screenshots captured per `mobile/store-metadata/ios.screenshots.json`

## Android — first internal track release

```bash
# 1. Cold-start sanity check (debug APK)
bash scripts/android/bootstrap.sh
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
# Smoke-test on a real device

# 2. Signed AAB
export ANDROID_KEYSTORE_PATH=/run/secrets/sita-upload.jks
export ANDROID_KEYSTORE_PASSWORD=...
export ANDROID_KEY_ALIAS=sita-upload
export ANDROID_KEY_PASSWORD=...
export ANDROID_PACKAGE_NAME=com.sita.os
bash scripts/release/android/build-android.sh

# 3. Verify signature
jarsigner -verify -verbose -certs \
  android/app/build/outputs/bundle/release/app-release.aab

# 4. Upload via Play Console UI OR fastlane:
fastlane supply --aab android/app/build/outputs/bundle/release/app-release.aab \
  --track internal \
  --json_key /run/secrets/play-service-account.json \
  --package_name com.sita.os

# 5. Promote internal → closed alpha → production via Play Console UI
```

## iOS — first TestFlight upload

```bash
# 1. Cold-start sanity check (unsigned simulator build)
npm run build
npx cap add ios
npx cap sync ios
cd ios/App && pod install && cd -
xcodebuild -workspace ios/App/App.xcworkspace -scheme App \
  -configuration Debug -destination 'generic/platform=iOS Simulator' build

# 2. Signed .ipa (requires all 7 secrets in env)
bash scripts/release/ios/build-ios.sh

# 3. Upload to TestFlight
xcrun altool --upload-app --type ios \
  --file build/export/SitaOS.ipa \
  --apiKey "$APP_STORE_CONNECT_API_KEY_ID" \
  --apiIssuer "$APP_STORE_CONNECT_API_ISSUER_ID"

# 4. Wait ~10 min for Apple processing → build appears in TestFlight
# 5. Add internal testers in App Store Connect → invite → smoke-test
# 6. Submit for App Store review from the TestFlight build
```

## Per-release checklist

Every store submission, in order:

1. [ ] Bump `version` in `package.json` (Capacitor sync auto-bumps `versionCode`/`CFBundleVersion`)
2. [ ] Tag release: `git tag v$(node -p "require('./package.json').version")-mobile`
3. [ ] Run `npm run mobile:closure:run-all` — all 6 mobile gates GREEN
4. [ ] Trigger `mobile-build` workflow on the tag
5. [ ] Verify build artifact (`.aab` or `.ipa`) downloads cleanly
6. [ ] Upload to internal track / TestFlight
7. [ ] Smoke-test on physical device
8. [ ] Promote to next track / submit for review

## Rollback

| Store | Method |
|---|---|
| Play | Halt rollout in Play Console; promote previous build to current track |
| App Store | Phase release + halt; cannot revert (Apple policy) — submit hotfix instead |

## Resubmission after rejection

1. Read rejection reason in Play Console / App Store Connect
2. Fix in source
3. Bump `version` in `package.json`
4. Re-run release pipeline
5. Re-upload (do NOT reuse rejected versionCode/CFBundleVersion)

## Metadata + screenshot completion

Before first submission, ensure:
- [ ] All locales in `android.json.translations` filled
- [ ] All locales in `ios.json` filled
- [ ] Phone screenshots: 1080×1920 minimum (Android), 1290×2796 (iPhone 15 Pro Max)
- [ ] Tablet screenshots: 1200×1920+ (Android), 2048×2732 (iPad Pro 12.9")
- [ ] Feature graphic 1024×500 (Android only)
- [ ] App icon 1024×1024 (both stores)
- [ ] Promotional video (optional, both stores)

## Operator support

If anything in this playbook fails:
1. Check `npm run release:readiness` — release aggregator output
2. Check the specific gate report in `generated/mobile-deployment-closure/*-status.json`
3. See `MOBILE_BLOCKER_CLASSIFICATION.md` for blocker-class-specific remediation
