#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Android Release Build Pipeline
# Phase 12 — produces a signed AAB ready for Play Store submission.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "▶ SITA OS — Android release build"

# ── 1. Validate signing environment ─────────────────────────────
required_vars=(
  "ANDROID_KEYSTORE_PATH"
  "ANDROID_KEYSTORE_PASSWORD"
  "ANDROID_KEY_ALIAS"
  "ANDROID_KEY_PASSWORD"
  "ANDROID_PACKAGE_NAME"
)
missing=0
for v in "${required_vars[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "  ✘ missing env: $v"
    missing=1
  fi
done
if [ "$missing" = "1" ]; then
  echo ""
  echo "Android release blocked: signing env vars missing."
  exit 2
fi

# ── 2. Build web bundle ─────────────────────────────────────────
echo "▶ Building web bundle"
npm run build

# ── 3. Sync Capacitor → Android ─────────────────────────────────
echo "▶ Syncing Capacitor"
npx cap sync android

# ── 4. Gradle assembleRelease + bundleRelease ───────────────────
echo "▶ Gradle bundleRelease (AAB)"
cd android
./gradlew clean
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file="$ANDROID_KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD"
cd ..

OUT="android/app/build/outputs/bundle/release/app-release.aab"
if [ ! -f "$OUT" ]; then
  echo "✘ AAB not produced at $OUT"
  exit 3
fi
echo "✓ Android build complete → $OUT"
