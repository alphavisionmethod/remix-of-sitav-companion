# SITA OS — Android Signing & Play Submission

> Status: **READY-ON-KEYSTORE** — pipeline complete; awaiting upload keystore.

## What's ready

- `capacitor.config.ts` declares Android bundle id, theming, security defaults.
- `mobile/android/AndroidManifest.permissions.xml` declares the canonical permission set (matches the runtime contract).
- `mobile/android/TARGET_SDK_POLICY.md` enforces `targetSdkVersion = 34` (Play 2024 floor).
- `mobile/store-metadata/android.json` declares the Play Console listing.
- `mobile/store-metadata/android.data-safety.json` declares the Play Data Safety form payload.
- `.github/workflows/mobile-build.yml` builds an **unsigned** `.aab` via Gradle on `ubuntu-latest`.

## What's blocked on Play Console

| Step | Required input |
|---|---|
| Upload key | Generated keystore (`.jks`) + alias + password |
| Play App Signing | Play console enrollment (recommended) |
| Service account upload | Play Developer API service-account JSON |

## How to flip from ready-on-keystore → ready

1. Generate the upload keystore:
   ```bash
   keytool -genkeypair -v -keystore sita-upload.jks \
     -alias sita -keyalg RSA -keysize 4096 -validity 10000
   ```
2. Add the following secrets to the GitHub repo:
   - `ANDROID_KEYSTORE_BASE64` (base64 of `sita-upload.jks`)
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - `PLAY_SERVICE_ACCOUNT_JSON` (Play Developer API service account)
3. Set `mobile/store-metadata/android.json → submission.tier = "ready"`.
4. Re-run `pnpm tsx scripts/architecture/checks/check-mobile-store-readiness.ts` — `android-signing-config` flips to satisfied.
5. The `mobile-build` workflow's `android-signed` job will activate and produce a signed `.aab` ready for `bundletool` or `gradle publishBundle`.

## Recommended cadence

- Test builds: every PR (unsigned `.aab` for QA via internal testing track).
- Release builds: tagged via `v*-mobile` Git tag → signed `.aab` + Play Console internal track upload.
