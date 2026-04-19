# iOS Signing & Release Flow

> From cold-start → signed `.ipa` → TestFlight → App Store review.
> Status: **account-blocked**. Code is ready; awaiting Apple Developer Program membership.

## What's blocking, classified

| Item | Class | External requirement |
|---|---|---|
| Apple Developer Program membership | account-blocked | $99/year, ~24h enrollment |
| Distribution certificate (.p12) | account-blocked | requires membership |
| App Store provisioning profile | account-blocked | requires membership + bundle ID registration |
| App Store Connect API key (.p8) | account-blocked | requires membership |
| App Store Connect listing | metadata-blocked | requires membership for app record creation |
| 8 device-size screenshots | metadata-blocked | can be prepared in advance |
| App review | review-blocked | Apple's queue, ~1-3 days typical |

**No code blockers remain.** The 7-secret env-var contract is honored by `scripts/release/ios/build-ios.sh`.

## The 7-secret contract

| Secret | Source |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer → Membership → Team ID |
| `APPLE_DISTRIBUTION_CERT_P12_BASE64` | Keychain → export distribution cert as `.p12` → `base64 -i` |
| `APPLE_DISTRIBUTION_CERT_PASSWORD` | password set during `.p12` export |
| `APPLE_PROVISIONING_PROFILE_BASE64` | Apple Developer → Profiles → download `.mobileprovision` → `base64 -i` |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect → Users and Access → Keys |
| `APP_STORE_CONNECT_API_ISSUER_ID` | same page, Issuer ID at top |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | downloaded `.p8` file → `base64 -i` |

Add all 7 as GitHub Actions repository secrets (or your CI equivalent). The pipeline refuses to run with any missing.

## Release flow (one command)

```bash
# Prerequisites: macos-14 runner, Xcode 16, all 7 secrets in env
bash scripts/release/ios/build-ios.sh
# → build/export/SitaOS.ipa
```

## Upload to TestFlight

```bash
xcrun altool --upload-app --type ios \
  --file build/export/SitaOS.ipa \
  --apiKey "$APP_STORE_CONNECT_API_KEY_ID" \
  --apiIssuer "$APP_STORE_CONNECT_API_ISSUER_ID"
```

Once upload completes, the build appears in App Store Connect → TestFlight within ~10 min after Apple processes it.

## App Store submission checklist

| Item | State | Notes |
|---|---|---|
| Bundle ID `com.sita.os` registered | account-blocked | one-time |
| Distribution certificate | account-blocked | one-time, valid 1 year |
| Provisioning profile | account-blocked | regenerate after cert renewal |
| App Store Connect app record | account-blocked | one-time |
| Listing metadata | ✅ `mobile/store-metadata/ios.json` |
| Privacy manifest | ✅ `mobile/ios/PrivacyInfo.xcprivacy` |
| ATS strict | ✅ declared in `Info.plist.template` |
| Screenshots (8 device sizes) | metadata-blocked | per `ios.screenshots.json` |
| Privacy policy URL | ✅ `https://sita.os/legal/privacy` |
| Support URL | ✅ in listing |
| TestFlight build uploaded | account-blocked | requires above |
| App Store review | review-blocked | submit from App Store Connect |

## Rollback / resubmission

- TestFlight: builds are stable; expire after 90 days; new uploads supersede
- App Store: rejected builds → fix issue → bump `CFBundleVersion` (Capacitor auto-syncs from `package.json`) → re-upload
- Live rollback: phase release, then halt; cannot revert to prior version (Apple policy)

## How to flip from `deferred` → `live`

1. Activate Apple Developer Program membership ($99)
2. Add the 7 secrets to repo
3. Set `mobile/store-metadata/ios.json` → `submission.tier = "ready"`
4. Re-run `npx tsx scripts/validation/check-ios-release-path.ts` — gate stays GREEN
5. Trigger the `mobile-build` workflow's `ios-signed` job

No source changes needed.
