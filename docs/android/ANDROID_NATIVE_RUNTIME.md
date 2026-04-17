# Android Native Runtime

SITA OS treats Android as a first-class runtime, paired with iOS. The native
project is **generated on-demand** by CI, not committed by Lovable, so the repo
stays clean and you control exactly when binary native artifacts enter your tree.

## Activation paths

### 1. Local debug APK (zero secrets, ~5 min)
```bash
bash scripts/android/bootstrap.sh
```
Produces a debug `.apk` at `android/app/build/outputs/apk/debug/`.

### 2. Cloud debug APK (zero secrets, ~10 min)
GitHub → **Actions** → **Android · Bootstrap Native Runtime** → Run workflow.
Download the `sita-os-android-debug` artifact from the run.

### 3. Commit `android/` to the repo (one-time, ~10 min)
Same workflow with `commit_back: true` → opens a PR adding `android/`.
Merge it and `android/` becomes part of the repo.

### 4. Signed AAB for Play Store (~15 min)
1. Add GitHub repository secrets:
   - `ANDROID_KEYSTORE_PATH` — path inside CI to the keystore (use upload-artifact pattern)
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - `ANDROID_PACKAGE_NAME` — e.g. `com.sitaos.app`
2. Push a tag matching `v*-android` (or trigger `release-android.yml` manually).
3. Workflow runs `scripts/release/android/build-android.sh` → produces `app-release.aab`.

### 5. FCM push notifications
1. Create a Firebase project and add an Android app for `com.sitaos.app`.
2. Download `google-services.json` from Firebase Console.
3. Either:
   - Drop the file at `android/app/google-services.json` (local), or
   - Add it as the `FCM_SERVICE_ACCOUNT_JSON` repo secret (CI auto-writes it).
4. Re-run the bootstrap workflow.

### 6. Play Store auto-upload
Add `PLAY_SERVICE_ACCOUNT_JSON` secret (Google Play Console → Setup → API access).
The release workflow's optional `upload-to-play` job activates.

## What the templates contain

| File | Purpose |
|---|---|
| `AndroidManifest.xml` | Permissions, deep links (`sita-os://`, `https://app.sita-os.com`), FCM service |
| `network_security_config.xml` | TLS-only in production, dev-permissive in debug |
| `data_extraction_rules.xml` | Disables Auto Backup + device-to-device transfer (trust-bearing tokens) |
| `build.gradle` | Min SDK 22, target 34, R8 minify on release, conditional FCM plugin |
| `proguard-rules.pro` | Keep Capacitor/AndroidX/Firebase entry points; strip debug logs |
| Adaptive icon | Material 3 adaptive launcher (background + foreground) |
| Splash | Brand-tinted splash via `windowBackground` |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Could not find google-services` | Either drop a real `google-services.json` or remove `apply plugin: 'com.google.gms.google-services'` from `build.gradle` |
| `keystore not found` during release | Verify `ANDROID_KEYSTORE_PATH` points to a readable file in the CI workspace |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Bump `versionCode` in `android-templates/app/build.gradle` |
| Push notifications silent | Confirm `POST_NOTIFICATIONS` runtime permission is granted (Android 13+) |

## How CI keeps the repo clean

`.gitignore` (auto-managed) includes `android/` so the generated project never
accidentally lands in commits. Only the **templates** (`android-templates/`) and
the **workflow** (`.github/workflows/android-bootstrap.yml`) live in version
control. This is the same pattern as iOS — predictable, reproducible, no Mac
or Android Studio required to ship.
