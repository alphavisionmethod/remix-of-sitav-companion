# SITA OS — Android Native Templates

This folder is the **source of truth** for Android-side overrides. The CI workflow
`.github/workflows/android-bootstrap.yml` runs on `ubuntu-latest`, executes
`npx cap add android`, then **rsyncs this folder over the generated `android/`
project**, then runs `./gradlew assembleDebug` to produce a real, installable APK.

## Layout
- `app/src/main/AndroidManifest.xml` — permissions, intent filters, deep links, FCM service registration
- `app/src/main/res/values/{strings,colors,styles}.xml` — branded strings + theme tokens
- `app/src/main/res/drawable/splash.xml` — splash background
- `app/src/main/res/mipmap-anydpi-v26/ic_launcher*.xml` — adaptive icon
- `app/src/main/res/xml/{network_security_config,data_extraction_rules,file_paths}.xml`
- `app/build.gradle` — version, signing config, FCM hooks
- `app/proguard-rules.pro` — release minification rules
- `app/google-services.json.template` — schema (drop real `google-services.json` to enable FCM)

## Activation paths
| Capability | What's needed | Status |
|---|---|---|
| Debug APK build | Nothing — runs on every push | ✅ live |
| Signed AAB → Play Store | `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` GitHub secrets | 🔑 add secrets |
| FCM push notifications | Real `google-services.json` from Firebase console | 🔑 add file |
| Play Store upload automation | `PLAY_SERVICE_ACCOUNT_JSON` secret | 🔑 add secret |

See `docs/android/ANDROID_NATIVE_RUNTIME.md` for the full activation walkthrough.
