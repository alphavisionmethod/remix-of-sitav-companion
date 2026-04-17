#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Local Android Bootstrap (Linux/macOS)
# Mirror of .github/workflows/android-bootstrap.yml for developers
# who prefer a local build. Most users should use the cloud
# workflow — see docs/android/ANDROID_NATIVE_RUNTIME.md.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

command -v node >/dev/null || { echo "✘ node not found"; exit 2; }
command -v java >/dev/null || { echo "✘ java not found — install JDK 17"; exit 2; }

echo "▶ SITA OS — Android bootstrap (local)"

echo "▶ Building web bundle"
npm run build

if [ ! -d "android" ]; then
  echo "▶ Adding Android platform"
  npx cap add android
else
  echo "▶ android/ already exists — overlaying templates only"
fi

echo "▶ Overlaying android-templates/ → android/"
rsync -av --exclude='google-services.json.template' android-templates/app/ android/app/

if [ -f "android/app/google-services.json" ]; then
  echo "✓ FCM credentials present"
else
  echo "⚠  android/app/google-services.json missing — FCM push will be no-op"
  echo "   Drop the real file from Firebase Console to enable push."
fi

echo "▶ npx cap sync android"
npx cap sync android

echo "▶ Gradle assembleDebug"
( cd android && ./gradlew assembleDebug --no-daemon )

APK=$(find android/app/build/outputs/apk/debug -name "*.apk" | head -n1)
echo ""
echo "✓ Android native runtime ready"
echo "  Debug APK: $APK"
echo "  Signed AAB: bash scripts/release/android/build-android.sh"
