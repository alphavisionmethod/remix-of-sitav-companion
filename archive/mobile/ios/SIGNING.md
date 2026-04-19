# SITA OS — iOS Signing & Submission

> Status: **DEFERRED** — Apple Developer Program membership not yet active.

## What's ready

- `capacitor.config.ts` declares iOS bundle id, scheme, theming.
- `mobile/ios/Info.plist.template` declares all required usage strings, deep-link scheme, background modes, ATS-strict.
- `mobile/ios/PrivacyInfo.xcprivacy` declares the privacy manifest required since May 2024.
- `mobile/store-metadata/ios.json` declares the App Store Connect listing payload.
- `mobile/store-metadata/ios.screenshots.json` declares the required device-frame matrix.
- `.github/workflows/mobile-build.yml` builds an **unsigned** `.ipa` via `xcodebuild archive` on `macos-14`.

## What's blocked on Apple membership

| Step | Required input |
|---|---|
| Code signing | Apple Team ID + signing certificate (.p12) |
| Provisioning profile | App Store distribution profile for `com.sita.os` |
| Notarization | Apple ID + app-specific password |
| Upload | App Store Connect API key (`.p8`) + key id + issuer id |

## How to flip from deferred → ready

1. Activate the Apple Developer Program membership.
2. Add the following secrets to the GitHub repo:
   - `APPLE_TEAM_ID`
   - `APPLE_DISTRIBUTION_CERT_P12_BASE64`
   - `APPLE_DISTRIBUTION_CERT_PASSWORD`
   - `APPLE_PROVISIONING_PROFILE_BASE64`
   - `APP_STORE_CONNECT_API_KEY_ID`
   - `APP_STORE_CONNECT_API_ISSUER_ID`
   - `APP_STORE_CONNECT_API_KEY_P8_BASE64`
3. Set `mobile/store-metadata/ios.json → submission.tier = "ready"`.
4. Re-run `pnpm tsx scripts/architecture/checks/check-mobile-store-readiness.ts` — the `ios-signing-config` requirement flips from warning to satisfied.
5. The `mobile-build` workflow's `ios-signed` job will activate and produce a signed `.ipa` ready for `xcrun altool --upload-app`.

## Recommended cadence

- Test builds: every PR (unsigned `.ipa` for QA).
- Release builds: tagged via `v*-mobile` Git tag → signed `.ipa` + TestFlight upload.
