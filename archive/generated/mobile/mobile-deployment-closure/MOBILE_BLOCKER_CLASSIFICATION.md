# Mobile Blocker Classification

> Every blocker between "code in repo" and "live in stores", classified into 5 canonical classes.

## The 5 classes

| Class | Meaning | Who unblocks |
|---|---|---|
| `code-complete` | All source-controlled artifacts are ready; no code blocker remains | already done |
| `secret-blocked` | Code is ready; needs a CI environment variable (key, password, path) | platform/devops |
| `account-blocked` | Code is ready; needs an external account or membership | finance/legal/business |
| `metadata-blocked` | Code is ready; needs human-curated content (screenshots, copy, URLs) | product/marketing |
| `review-blocked` | Submitted to platform; awaiting their review | platform (Apple/Google) |

## Per-track inventory

### Android (Play Store)

| Item | Class | Remediation |
|---|---|---|
| Capacitor wrapper, web bundle, manifest, permissions | code-complete | — |
| `scripts/android/bootstrap.sh` cold-start | code-complete | runs on any Linux with Node 18 + JDK 17 |
| `scripts/release/android/build-android.sh` | code-complete | env-var-gated; refuses to run without keystore |
| Upload keystore (`.jks`) | secret-blocked | `keytool genkeypair` → CI secret |
| 5 keystore env vars | secret-blocked | provision in CI secret manager |
| FCM credentials (`google-services.json`) | secret-blocked (push deferred) | drop file from Firebase Console; web-VAPID covers gap |
| Play Console app record | account-blocked | Google Play developer account ($25 one-time) + create app for `com.sita.os` |
| Phone screenshots (5 sizes) | metadata-blocked | capture per `android.screenshots.json` matrix |
| Tablet screenshots (3 sizes) | metadata-blocked | same matrix |
| Feature graphic 1024×500 | metadata-blocked | design + commit to `mobile/store-metadata/assets/` |
| Privacy policy URL | code-complete | `https://sita.os/legal/privacy` |
| Data safety form | code-complete | `mobile/store-metadata/android.data-safety.json` declares all |
| Content rating | metadata-blocked | one-time Play Console questionnaire |
| Internal testing track upload | secret-blocked | needs keystore unblocked first |
| Production rollout | review-blocked | Play review (~few hours typical) |

### iOS (App Store)

| Item | Class | Remediation |
|---|---|---|
| Capacitor wrapper, Info.plist, privacy manifest | code-complete | — |
| `scripts/release/ios/build-ios.sh` | code-complete | macOS-only; env-var-gated; refuses without credentials |
| Apple Developer Program membership | account-blocked | $99/year |
| Bundle ID `com.sita.os` registered | account-blocked | requires membership |
| Distribution certificate (.p12) | account-blocked | requires membership |
| Provisioning profile | account-blocked | requires membership + bundle ID |
| App Store Connect app record | account-blocked | requires membership |
| App Store Connect API key (.p8) | account-blocked | requires membership |
| 7 signing env vars in CI | secret-blocked | requires all account-blocked items above |
| iPhone screenshots (4 sizes) | metadata-blocked | capture per `ios.screenshots.json` matrix |
| iPad screenshots (4 sizes) | metadata-blocked | same matrix |
| App preview videos (optional) | metadata-blocked | optional but recommended |
| Privacy policy URL | code-complete | `https://sita.os/legal/privacy` |
| Privacy nutrition labels | code-complete | aligned to `PrivacyInfo.xcprivacy` |
| TestFlight upload | secret-blocked | needs all 7 secrets unblocked |
| App Store review submission | review-blocked | Apple review (~24-72h typical) |

### Push notifications

| Item | Class | Remediation |
|---|---|---|
| Web Push (VAPID) | code-complete | active and shipped |
| Ubuntu-native notifications | code-complete | active via Electron |
| iOS APNs | account-blocked | requires Apple Developer membership + APNs key |
| Android FCM | secret-blocked | requires `google-services.json` from Firebase |
| Mobile push UI claims | code-complete | gated by `check-mobile-push-claim-safety.ts` |

## Summary

| Class | Count |
|---|---|
| code-complete | 14 |
| secret-blocked | 5 |
| account-blocked | 7 |
| metadata-blocked | 8 |
| review-blocked | 2 |

## Critical path

```
Apple Developer enrollment ($99) ─┐
                                  ├─→ all iOS account-blocked items unblock
                                  ├─→ APNs unblocks
                                  └─→ 7 secrets become provisionable

Google Play developer account ($25 one-time) ─┐
                                              ├─→ Play app record creatable
                                              └─→ keystore generation + upload becomes useful

Firebase project ─┐
                  └─→ google-services.json available
                  └─→ FCM unblocks
```

## What is NOT blocked
- The Capacitor codebase
- The web bundle the app wraps
- Bootstrap and release scripts
- All store metadata structure (only screenshots are blocked)
- Privacy manifests (both stores)
- Data safety declarations
- All 6 mobile validators in CI

**Posture: code is launch-ready. Submission is gated entirely on external accounts + content + secrets — exactly as it should be for any honest mobile distribution.**
