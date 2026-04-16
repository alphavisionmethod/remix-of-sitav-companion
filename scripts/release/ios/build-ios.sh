#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — iOS Release Build Pipeline
# Phase 12 — produces a signed IPA ready for App Store submission.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "▶ SITA OS — iOS release build"

# ── 1. Validate signing environment ─────────────────────────────
required_vars=(
  "IOS_TEAM_ID"
  "IOS_BUNDLE_ID"
  "IOS_PROVISIONING_PROFILE"
  "IOS_SIGNING_CERTIFICATE"
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
  echo "iOS release blocked: signing env vars missing."
  echo "Set IOS_TEAM_ID, IOS_BUNDLE_ID, IOS_PROVISIONING_PROFILE, IOS_SIGNING_CERTIFICATE."
  exit 2
fi

# ── 2. Build web bundle ─────────────────────────────────────────
echo "▶ Building web bundle"
npm run build

# ── 3. Sync Capacitor → iOS ─────────────────────────────────────
echo "▶ Syncing Capacitor"
npx cap sync ios

# ── 4. Archive + export IPA ─────────────────────────────────────
ARCHIVE_PATH="${ARCHIVE_PATH:-build/ios/SITA-OS.xcarchive}"
EXPORT_PATH="${EXPORT_PATH:-build/ios/ipa}"
SCHEME="${IOS_SCHEME:-App}"

echo "▶ Archiving Xcode workspace"
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  DEVELOPMENT_TEAM="$IOS_TEAM_ID" \
  PRODUCT_BUNDLE_IDENTIFIER="$IOS_BUNDLE_ID" \
  archive

echo "▶ Exporting IPA"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist scripts/release/ios/exportOptions.plist

echo "✓ iOS build complete → $EXPORT_PATH"
