#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — iOS Release Build Pipeline
# Phase: Mobile Deployment Closure
# Produces a signed .ipa ready for TestFlight upload.
# ACCOUNT-BLOCKED: requires Apple Developer Program membership + 7 secrets.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "▶ SITA OS — iOS release build"

# ── 1. Platform pre-flight ─────────────────────────────────────
if [[ "$(uname)" != "Darwin" ]]; then
  echo "  ✘ iOS builds require macOS (got $(uname))"
  echo "  Run on a macos-14 GitHub runner or local Mac with Xcode 16+."
  exit 2
fi
command -v xcodebuild >/dev/null || { echo "  ✘ xcodebuild not found — install Xcode"; exit 2; }
command -v node >/dev/null || { echo "  ✘ node not found"; exit 2; }
command -v pod >/dev/null  || { echo "  ✘ CocoaPods not found — gem install cocoapods"; exit 2; }

# ── 2. Validate signing environment ────────────────────────────
required_vars=(
  "APPLE_TEAM_ID"
  "APPLE_DISTRIBUTION_CERT_P12_BASE64"
  "APPLE_DISTRIBUTION_CERT_PASSWORD"
  "APPLE_PROVISIONING_PROFILE_BASE64"
  "APP_STORE_CONNECT_API_KEY_ID"
  "APP_STORE_CONNECT_API_ISSUER_ID"
  "APP_STORE_CONNECT_API_KEY_P8_BASE64"
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
  echo "iOS release blocked: account-level credentials missing."
  echo "See mobile/ios/SIGNING.md for the 7-secret contract."
  echo "Until provisioned, this pipeline refuses to run — preserves launch honesty."
  exit 2
fi

# ── 3. Build web bundle ────────────────────────────────────────
echo "▶ Building web bundle"
npm run build

# ── 4. Add iOS platform (idempotent) + sync ────────────────────
if [ ! -d "ios" ]; then
  echo "▶ Adding iOS platform"
  npx cap add ios
fi

# Promote archived templates → active location on first signed run
if [ -d "archive/ios-templates" ] && [ ! -d "mobile/ios-templates" ]; then
  echo "▶ Promoting archive/ios-templates → mobile/ios-templates (first signed run)"
  cp -R archive/ios-templates mobile/ios-templates
fi

echo "▶ npx cap sync ios"
npx cap sync ios

# ── 5. CocoaPods install ───────────────────────────────────────
echo "▶ pod install"
( cd ios/App && pod install )

# ── 6. Decode + import signing material ────────────────────────
echo "▶ Decoding signing material"
KEYCHAIN_PATH="$HOME/Library/Keychains/sita-build.keychain-db"
KEYCHAIN_PASSWORD="$(openssl rand -hex 16)"

security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security list-keychains -d user -s "$KEYCHAIN_PATH" $(security list-keychains -d user | tr -d '"')

CERT_PATH="$(mktemp).p12"
echo "$APPLE_DISTRIBUTION_CERT_P12_BASE64" | base64 -d > "$CERT_PATH"
security import "$CERT_PATH" -k "$KEYCHAIN_PATH" -P "$APPLE_DISTRIBUTION_CERT_PASSWORD" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

PROFILE_PATH="$HOME/Library/MobileDevice/Provisioning Profiles/sita-os.mobileprovision"
mkdir -p "$(dirname "$PROFILE_PATH")"
echo "$APPLE_PROVISIONING_PROFILE_BASE64" | base64 -d > "$PROFILE_PATH"

# ── 7. Archive + export ────────────────────────────────────────
echo "▶ xcodebuild archive"
ARCHIVE_PATH="build/SitaOS.xcarchive"
EXPORT_PATH="build/export"
mkdir -p build

xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  archive

cat > build/ExportOptions.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store</string>
  <key>teamID</key><string>$APPLE_TEAM_ID</string>
  <key>uploadBitcode</key><false/>
  <key>uploadSymbols</key><true/>
  <key>signingStyle</key><string>manual</string>
</dict>
</plist>
EOF

echo "▶ xcodebuild -exportArchive"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist build/ExportOptions.plist

IPA="$(find "$EXPORT_PATH" -name "*.ipa" | head -n1)"
[ -n "$IPA" ] && [ -f "$IPA" ] || { echo "  ✘ .ipa not produced"; exit 3; }

echo ""
echo "✓ iOS signed .ipa ready: $IPA"
echo "  Next: xcrun altool --upload-app --type ios --file '$IPA' \\"
echo "         --apiKey \$APP_STORE_CONNECT_API_KEY_ID \\"
echo "         --apiIssuer \$APP_STORE_CONNECT_API_ISSUER_ID"
