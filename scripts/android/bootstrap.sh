#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Local Android Bootstrap (Linux/macOS)
# Cold-start: web build → cap add android → overlay templates → assembleDebug
# Hardened: version pin checks, pre-flight diagnostics, post-generation validation.
# Mirror of .github/workflows/android-bootstrap.yml.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REQUIRED_NODE_MAJOR=18
REQUIRED_JAVA_MAJOR=17

# ── 1. Pre-flight ──────────────────────────────────────────────
echo "▶ SITA OS — Android bootstrap (local)"
echo "▶ Pre-flight checks"

command -v node >/dev/null || { echo "  ✘ node not found — install Node ${REQUIRED_NODE_MAJOR}+"; exit 2; }
command -v java >/dev/null || { echo "  ✘ java not found — install JDK ${REQUIRED_JAVA_MAJOR}"; exit 2; }
command -v npx  >/dev/null || { echo "  ✘ npx not found"; exit 2; }
command -v rsync >/dev/null || { echo "  ✘ rsync not found — install rsync"; exit 2; }

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\)\..*/\1/')
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "  ✘ Node $NODE_MAJOR detected — need >= $REQUIRED_NODE_MAJOR"; exit 2
fi
JAVA_MAJOR=$(java -version 2>&1 | head -n1 | sed 's/.*version "\([0-9]*\).*/\1/')
if [ "$JAVA_MAJOR" -lt "$REQUIRED_JAVA_MAJOR" ]; then
  echo "  ✘ Java $JAVA_MAJOR detected — need >= $REQUIRED_JAVA_MAJOR"; exit 2
fi
echo "  ✓ node=$(node -v), java=$JAVA_MAJOR"

[ -f "capacitor.config.ts" ] || { echo "  ✘ capacitor.config.ts missing — run from project root"; exit 2; }
[ -f "package.json" ] || { echo "  ✘ package.json missing — run from project root"; exit 2; }

# ── 2. Build web bundle ────────────────────────────────────────
echo "▶ Building web bundle"
npm run build
[ -d "dist" ] || { echo "  ✘ dist/ not produced — vite build failed silently"; exit 3; }
echo "  ✓ dist/ present"

# ── 3. Add Android platform (idempotent) ───────────────────────
if [ ! -d "android" ]; then
  echo "▶ Adding Android platform"
  npx cap add android
else
  echo "▶ android/ already exists — overlaying templates only"
fi

# ── 4. Overlay templates (if present) ──────────────────────────
if [ -d "android-templates/app" ]; then
  echo "▶ Overlaying android-templates/ → android/"
  rsync -av --exclude='google-services.json.template' android-templates/app/ android/app/
else
  echo "  ⓘ android-templates/app not present — skipping overlay"
fi

# ── 5. FCM credential check (advisory) ─────────────────────────
if [ -f "android/app/google-services.json" ]; then
  echo "  ✓ FCM credentials present — native Android push enabled"
else
  echo "  ⚠  android/app/google-services.json missing — FCM push will be no-op (web-VAPID still works)"
fi

# ── 6. Capacitor sync ──────────────────────────────────────────
echo "▶ npx cap sync android"
npx cap sync android

# ── 7. Post-generation validation ──────────────────────────────
echo "▶ Validating generated Android project"
[ -f "android/app/build.gradle" ] || { echo "  ✘ android/app/build.gradle missing — generation failed"; exit 4; }
[ -f "android/build.gradle" ] || { echo "  ✘ android/build.gradle missing — generation failed"; exit 4; }
[ -f "android/app/src/main/AndroidManifest.xml" ] || { echo "  ✘ AndroidManifest.xml missing"; exit 4; }
echo "  ✓ project structure valid"

# ── 8. Gradle assembleDebug ────────────────────────────────────
echo "▶ Gradle assembleDebug"
( cd android && ./gradlew assembleDebug --no-daemon )

APK=$(find android/app/build/outputs/apk/debug -name "*.apk" | head -n1)
[ -n "$APK" ] && [ -f "$APK" ] || { echo "  ✘ APK not produced"; exit 5; }

echo ""
echo "✓ Android native runtime ready"
echo "  Debug APK: $APK"
echo "  Next: bash scripts/release/android/build-android.sh   # signed AAB (requires keystore env vars)"
