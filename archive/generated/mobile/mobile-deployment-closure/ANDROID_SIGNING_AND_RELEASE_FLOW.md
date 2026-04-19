# Android Signing & Release Flow

> From debug APK → signed AAB → Play Console internal track.
> Status: **secret-blocked** (no Apple-style account gate; only needs an upload keystore).

## Signing artifact

A single Java keystore (`.jks`), generated once and protected forever:

```bash
keytool -genkeypair \
  -alias sita-upload \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -keystore sita-os-upload.jks
```

> **Never commit `.jks` to the repo.** Store as a CI secret; mount at build time only.

## Env-var contract (5 variables)

| Variable | Description |
|---|---|
| `ANDROID_KEYSTORE_PATH` | Absolute path to `.jks` file (provided by CI mount) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g., `sita-upload`) |
| `ANDROID_KEY_PASSWORD` | Key password (often same as keystore password) |
| `ANDROID_PACKAGE_NAME` | e.g., `com.sita.os` |

`scripts/release/android/build-android.sh` checks all five and **refuses to run** if any is missing — no silent fake-signing.

## Release flow

```bash
# 1. Provision env vars (CI secret manager or local export)
export ANDROID_KEYSTORE_PATH=/run/secrets/sita-upload.jks
export ANDROID_KEYSTORE_PASSWORD=...
export ANDROID_KEY_ALIAS=sita-upload
export ANDROID_KEY_PASSWORD=...
export ANDROID_PACKAGE_NAME=com.sita.os

# 2. Run release pipeline
bash scripts/release/android/build-android.sh

# 3. Output
ls android/app/build/outputs/bundle/release/   # → app-release.aab
```

## Verification before submission

```bash
# Signature
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab

# Bundle structure
bundletool dump manifest --bundle=app-release.aab
```

## Play Console submission checklist

| Item | State |
|---|---|
| Upload keystore | ⚠ secret-blocked |
| AAB built and verified | ✅ once keystore present |
| Listing metadata | ✅ `mobile/store-metadata/android.json` |
| Data safety form | ✅ `mobile/store-metadata/android.data-safety.json` |
| Privacy policy URL | ✅ `https://sita.os/legal/privacy` |
| Screenshots (phone + tablet) | ⚠ metadata-blocked — capture per matrix |
| Content rating questionnaire | manual one-time setup in Play Console |
| Internal testing track | recommended first track |

## Rollback / resubmission

- Play Console keeps every uploaded build; rollback = halt rollout + promote previous build
- Resubmission after rejection: bump `versionCode` in `android/app/build.gradle` (auto-managed by Capacitor sync from `package.json` version), rebuild, re-upload

## Posture
**Code-complete. The only blocker is provisioning the upload keystore.** Once provisioned, the entire flow from `git pull` to `aab uploaded to internal track` is one CI job.
