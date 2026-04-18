# SITA OS — Store Submission Playbook

> Phase 13 — Mobile Distribution
> Owner: Mobile Platform
> Gates: `check-mobile-store-readiness` + `check-mobile-build-pipeline`

End-to-end steps to take SITA OS from this repo to a live App Store / Play
Store listing. Every requirement is encoded in
[`src/lib/runtime/mobile-store-registry.ts`](../../src/lib/runtime/mobile-store-registry.ts)
and validated by CI.

---

## 0 · The honest baseline

| Surface | Distribution | Pipeline | Status |
|---|---|---|---|
| **Android** | Google Play | `gradle :app:bundleRelease` (CI) | **Ready-on-keystore** — pipeline complete; awaiting upload keystore. |
| **iOS** | App Store | `xcodebuild archive` (CI, macos-14) | **Deferred** — Apple Developer Program membership not yet active. |
| **Mobile PWA** | Install-to-home-screen | Existing web pipeline | **Live**. |

We never ship false readiness. The runtime contract
([`mobile-runtime-contract.ts`](../../src/lib/runtime/mobile-runtime-contract.ts))
declares `app-store-distribution=false` for iOS until Apple membership exists,
and the readiness gate enforces that honesty bidirectionally.

---

## 1 · Android — Play Console submission

### 1.1 Provision

```bash
# generate upload keystore (one-time, store offline)
keytool -genkeypair -v -keystore sita-upload.jks \
  -alias sita -keyalg RSA -keysize 4096 -validity 10000

# convert to base64 for GitHub secret
base64 -i sita-upload.jks | pbcopy
```

Add the following secrets to the GitHub repo:

| Secret | Source |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | base64 of `sita-upload.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `sita` |
| `ANDROID_KEY_PASSWORD` | key password |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Developer API service account |
| `GOOGLE_SERVICES_JSON_BASE64` | (optional) for FCM push |

### 1.2 Build

The `mobile-build` workflow runs automatically on push to `main` and on
manual dispatch. Output: `sita-os-android-aab` artifact.

### 1.3 Submit

```bash
# locally, after downloading the signed AAB
gradle publishBundle \
  --track internal \
  --release-status draft
```

Or upload via Play Console UI → Internal testing → Create new release.

### 1.4 Stamp metadata

`mobile/store-metadata/android.json` and `android.data-safety.json` are the
canonical sources. Copy fields into the Play Console listing form.

---

## 2 · iOS — App Store Connect submission

### 2.1 Provision (when Apple membership active)

| Asset | How |
|---|---|
| Distribution certificate | Apple Developer → Certificates → iOS Distribution → export `.p12` |
| Provisioning profile | Apple Developer → Profiles → App Store → `com.sita.os` |
| App Store Connect API key | App Store Connect → Users and Access → Keys → `.p8` |

Add the following secrets:

| Secret | Source |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer account |
| `APPLE_DISTRIBUTION_CERT_P12_BASE64` | base64 of `.p12` |
| `APPLE_DISTRIBUTION_CERT_PASSWORD` | export password |
| `APPLE_PROVISIONING_PROFILE_BASE64` | base64 of `.mobileprovision` |
| `APP_STORE_CONNECT_API_KEY_ID` | from `.p8` filename |
| `APP_STORE_CONNECT_API_ISSUER_ID` | from API key page |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | base64 of `.p8` |

### 2.2 Build

Re-run the `mobile-build` workflow. With the secrets present, the `ios` job
produces a signed `.ipa`.

### 2.3 Submit

```bash
xcrun altool --upload-app \
  --type ios \
  --file ios/App/build/ipa/sita-os.ipa \
  --apiKey "$APP_STORE_CONNECT_API_KEY_ID" \
  --apiIssuer "$APP_STORE_CONNECT_API_ISSUER_ID"
```

Or upload via Transporter.app.

### 2.4 Stamp metadata

`mobile/store-metadata/ios.json` and `ios.screenshots.json` are the canonical
sources. Copy into App Store Connect listing.

---

## 3 · Privacy & compliance

| Asset | Path |
|---|---|
| iOS PrivacyInfo.xcprivacy | `mobile/ios/PrivacyInfo.xcprivacy` |
| iOS Info.plist usage strings | `mobile/ios/Info.plist.template` |
| Android Data Safety form | `mobile/store-metadata/android.data-safety.json` |
| Android permissions | `mobile/android/AndroidManifest.permissions.xml` |
| Account deletion flow | `https://sita.os/account/delete` (live) |

All four privacy artifacts must remain in sync. The readiness gate enforces
their presence; manual sync of the values is a release-checklist item.

---

## 4 · Promotion path

```
internal testing → closed testing (50 testers) → open testing → production
```

Same path on TestFlight (iOS) once Apple membership is active.

---

## 5 · Verification

```bash
pnpm tsx scripts/architecture/checks/check-mobile-store-readiness.ts
pnpm tsx scripts/architecture/checks/check-mobile-build-pipeline.ts
pnpm tsx scripts/architecture/checks/check-its-real-gate.ts
```

The "It's Real" gate ([gate 6 — `mobile-runtime-explicit`](../../scripts/architecture/checks/check-its-real-gate.ts))
asserts both reports exist and are green.

---

## 6 · Related

- [`docs/architecture/MOBILE_PLATFORM_SYSTEM.md`](../architecture/MOBILE_PLATFORM_SYSTEM.md)
- [`docs/architecture/MOBILE_EXPERIENCE_SYSTEM.md`](../architecture/MOBILE_EXPERIENCE_SYSTEM.md)
- [`docs/os/DEPLOYMENT_PROFILES.md`](../os/DEPLOYMENT_PROFILES.md)
- `src/lib/runtime/mobile-runtime-contract.ts` — capability matrix (honest)
- `src/lib/runtime/mobile-store-registry.ts` — submission requirements
