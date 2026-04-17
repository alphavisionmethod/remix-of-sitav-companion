#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Local iOS Bootstrap (macOS only)
# Mirror of .github/workflows/ios-bootstrap.yml for developers
# who happen to have a Mac. Most users should use the cloud
# workflow instead — see docs/ios/IOS_NATIVE_RUNTIME.md.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

if [ "$(uname -s)" != "Darwin" ]; then
  echo "✘ This script requires macOS. Use the cloud workflow instead:"
  echo "  GitHub Actions → 'iOS · Bootstrap Native Runtime' → Run workflow"
  exit 2
fi

command -v node >/dev/null || { echo "✘ node not found"; exit 2; }
command -v pod  >/dev/null || { echo "✘ cocoapods not found — install with: sudo gem install cocoapods"; exit 2; }
command -v xcodebuild >/dev/null || { echo "✘ Xcode command-line tools not found"; exit 2; }

echo "▶ SITA OS — iOS bootstrap (local Mac)"

echo "▶ Building web bundle"
npm run build

if [ ! -d "ios/App/App.xcworkspace" ]; then
  echo "▶ Adding iOS platform"
  npx cap add ios
else
  echo "▶ ios/ already exists — refreshing templates only"
fi

echo "▶ Overlaying ios-templates/ → ios/"
rsync -av ios-templates/App/App/ ios/App/App/
[ -f ios-templates/App/Podfile ] && cp ios-templates/App/Podfile ios/App/Podfile

echo "▶ Generating icon variants from 1024 master"
ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
MASTER="$ICON_DIR/AppIcon-1024.png"
for size in 20 29 40 58 60 76 80 87 120 152 167 180; do
  sips -Z "$size" "$MASTER" --out "$ICON_DIR/AppIcon-$size.png" >/dev/null
done

echo "▶ pod install"
( cd ios/App && pod install --repo-update )

echo "▶ npx cap sync ios"
npx cap sync ios

echo ""
echo "✓ iOS native runtime ready at ios/App/App.xcworkspace"
echo "  Open with:  open ios/App/App.xcworkspace"
echo "  Sign + ship: bash scripts/release/ios/build-ios.sh"
