# iOS Build Path Audit

> Cold-start on `macos-14` → unsigned `.ipa` (code-ready) → signed `.ipa` + TestFlight (account-blocked).

## Inventory

| Asset | Path | State |
|---|---|---|
| Capacitor config | `capacitor.config.ts` | ✅ canonical |
| Signed-release pipeline | `scripts/release/ios/build-ios.sh` | ✅ NEW — env-var-gated, macOS-enforced |
| Info.plist template | `mobile/ios/Info.plist.template` | ✅ |
| Privacy manifest | `mobile/ios/PrivacyInfo.xcprivacy` | ✅ required since May 2024 |
| Signing notes | `mobile/ios/SIGNING.md` | ✅ tier=`deferred` (Apple membership) |
| App Store listing | `mobile/store-metadata/ios.json` | ✅ |
| Screenshots matrix | `mobile/store-metadata/ios.screenshots.json` | ✅ device-frame matrix declared |
| Pod template (deferred location) | `archive/ios-templates/App/Podfile` | ✅ promoted on first signed build |

## Cold-start path

```bash
# Prerequisites: macOS 14+, Xcode 16+, CocoaPods, Node 18+
npm run build
npx cap add ios            # generates ios/ directory
npx cap sync ios
cd ios/App && pod install && cd -
xcodebuild -workspace ios/App/App.xcworkspace -scheme App \
  -configuration Debug -destination 'generic/platform=iOS Simulator' build
```

This produces an unsigned simulator build — useful for development and basic CI smoke tests.

## Signed-release path (account-blocked)

```bash
# All 7 secrets required. Script refuses to run if any are missing.
export APPLE_TEAM_ID=...
export APPLE_DISTRIBUTION_CERT_P12_BASE64=...
export APPLE_DISTRIBUTION_CERT_PASSWORD=...
export APPLE_PROVISIONING_PROFILE_BASE64=...
export APP_STORE_CONNECT_API_KEY_ID=...
export APP_STORE_CONNECT_API_ISSUER_ID=...
export APP_STORE_CONNECT_API_KEY_P8_BASE64=...

bash scripts/release/ios/build-ios.sh
# → produces build/export/SitaOS.ipa, ready for altool upload
```

## What the release script does (8 steps)

1. Enforces macOS host (refuses on Linux/Windows)
2. Validates 7 secrets present (refuses if any missing)
3. `npm run build`
4. `npx cap add ios` (idempotent) + promotes `archive/ios-templates/` → `mobile/ios-templates/` on first signed run
5. `npx cap sync ios` + `pod install`
6. Decodes cert + provisioning profile into a fresh keychain
7. `xcodebuild archive` → `build/SitaOS.xcarchive`
8. `xcodebuild -exportArchive` with auto-generated `ExportOptions.plist` (manual signing, app-store method) → signed `.ipa`

## Why iOS templates live in `archive/`

`archive/ios-templates/` is intentional. Until the first signed build runs (which only happens when Apple credentials exist), promoting templates to `mobile/ios-templates/` would create a false impression of iOS readiness. The release script promotes them automatically on first signed run.

## Gaps (all account-blocked, none code-blocked)

| Gap | Class | Remediation |
|---|---|---|
| Apple Developer Program membership | account-blocked | $99/year enrollment |
| Distribution certificate (.p12) | account-blocked | generate after enrollment |
| Provisioning profile | account-blocked | App Store distribution profile for `com.sita.os` |
| App Store Connect API key (.p8) | account-blocked | App Store Connect → Users and Access → Keys |
| Screenshots (8 device sizes) | metadata-blocked | capture per `mobile/store-metadata/ios.screenshots.json` |

## Verdict
**Code-complete. Account-blocked.** The repo is ready; Apple Developer Program activation flips this from `deferred` → `live` with no source changes.
