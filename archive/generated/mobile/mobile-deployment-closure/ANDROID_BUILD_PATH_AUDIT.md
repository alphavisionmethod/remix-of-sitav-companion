# Android Build Path Audit

> Cold-start (zero `android/` directory) → debug APK in one command on any Linux runner with Node 18+ and JDK 17.

## Inventory

| Asset | Path | State |
|---|---|---|
| Capacitor config | `capacitor.config.ts` | ✅ canonical |
| Cold-start bootstrap | `scripts/android/bootstrap.sh` | ✅ hardened (version pins, post-gen validation) |
| Signed AAB pipeline | `scripts/release/android/build-android.sh` | ✅ env-var-gated |
| Manifest permissions | `mobile/android/AndroidManifest.permissions.xml` | ✅ |
| Signing notes | `mobile/android/SIGNING.md` | ✅ tier=`ready-on-keystore` |
| FCM provisioning notes | `mobile/android/FCM.md` | ✅ deferred (correct posture) |
| Play listing payload | `mobile/store-metadata/android.json` | ✅ |
| Data safety form | `mobile/store-metadata/android.data-safety.json` | ✅ encryption + deletion URL declared |

## Cold-start path (verified)

```bash
# Prerequisites: node>=18, jdk>=17, rsync
bash scripts/android/bootstrap.sh
# → produces android/app/build/outputs/apk/debug/app-debug.apk
```

The hardened bootstrap performs:
1. Pre-flight: `node`, `java`, `npx`, `rsync` presence + version pins
2. `npm run build` + `dist/` presence check
3. `npx cap add android` (idempotent)
4. Optional template overlay from `android-templates/`
5. FCM advisory (no-op if `google-services.json` absent)
6. `npx cap sync android`
7. Post-generation validation: `android/app/build.gradle`, `android/build.gradle`, `AndroidManifest.xml` presence
8. `gradlew assembleDebug --no-daemon`

## Signed-release path (env-var-gated)

```bash
export ANDROID_KEYSTORE_PATH=/secure/sita.jks
export ANDROID_KEYSTORE_PASSWORD=...
export ANDROID_KEY_ALIAS=sita-upload
export ANDROID_KEY_PASSWORD=...
export ANDROID_PACKAGE_NAME=com.sita.os
bash scripts/release/android/build-android.sh
# → produces android/app/build/outputs/bundle/release/app-release.aab
```

The release script refuses to run if any of the 5 env vars are missing (no silent fake-signing).

## Gaps

| Gap | Class | Remediation |
|---|---|---|
| Production keystore not provisioned | secret-blocked | Generate JKS via `keytool`; store in CI secret; never commit |
| `google-services.json` absent | code-complete (FCM deferred) | Drop file from Firebase Console at deploy time; build is no-op without it |
| Screenshots matrix incomplete | metadata-blocked | Run app on emulators per `mobile/store-metadata/android.screenshots.json` matrix |

## Verdict
**Code-complete + secret-blocked.** Bootstrap reproducible. Signing pipeline env-var-gated and refusal-safe. Play submission gated only on keystore + screenshots.
