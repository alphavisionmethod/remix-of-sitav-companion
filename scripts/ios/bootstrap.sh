#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Local iOS Bootstrap (macOS only)
#
# Production iOS native-project generation. Promoted from
# scripts/archive/ios/bootstrap.sh during Mobile Identity
# Reconciliation Phase 2 (native generation contract).
#
# Cold-start: web build → cap add ios → overlay templates →
# generate icons → pod install → cap sync → validate.
#
# Mirror of .github/workflows/mobile-build.yml job `ios`.
# Hardened: pre-flight diagnostics, version pins, post-generation
# validation, explicit exit codes matching the Android bootstrap.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REQUIRED_NODE_MAJOR=18

# ── 1. Pre-flight ──────────────────────────────────────────────
echo "▶ SITA OS — iOS bootstrap (local)"
echo "▶ Pre-flight checks"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "  ✘ This script requires macOS. iOS native projects can only be"
  echo "    generated and built on macOS due to Xcode/CocoaPods dependencies."
  echo "    Use the cloud workflow instead:"
  echo "    GitHub Actions → 'mobile-build' → ios job (macos-14 runner)"
  exit 2
fi

command -v node       >/dev/null || { echo "  ✘ node not found — install Node ${REQUIRED_NODE_MAJOR}+"; exit 2; }
command -v npx        >/dev/null || { echo "  ✘ npx not found"; exit 2; }
command -v pod        >/dev/null || { echo "  ✘ cocoapods not found — install with: sudo gem install cocoapods"; exit 2; }
command -v xcodebuild >/dev/null || { echo "  ✘ xcodebuild not found — install Xcode + run: xcode-select --install"; exit 2; }
command -v rsync      >/dev/null || { echo "  ✘ rsync not found"; exit 2; }
command -v sips       >/dev/null || { echo "  ✘ sips not found (should ship with macOS)"; exit 2; }

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\)\..*/\1/')
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "  ✘ Node $NODE_MAJOR detected — need >= $REQUIRED_NODE_MAJOR"; exit 2
fi
echo "  ✓ macOS host, node=$(node -v), pod=$(pod --version), xcodebuild present"

[ -f "capacitor.config.ts" ] || { echo "  ✘ capacitor.config.ts missing — run from project root"; exit 2; }
[ -f "package.json" ]        || { echo "  ✘ package.json missing — run from project root"; exit 2; }

# ── 2. Build web bundle ────────────────────────────────────────
echo "▶ Building web bundle"
npm run build
[ -d "dist" ] || { echo "  ✘ dist/ not produced — vite build failed silently"; exit 3; }
echo "  ✓ dist/ present"

# ── 3. Add iOS platform (idempotent) ───────────────────────────
if [ ! -d "ios/App/App.xcworkspace" ]; then
  echo "▶ Adding iOS platform"
  npx cap add ios
else
  echo "▶ ios/ already exists — refreshing templates only"
fi

# ── 4. Resolve template source ─────────────────────────────────
# Templates live in archive/ios-templates/ until Apple Developer
# Program enrollment is active (deliberate deferred location to
# prevent false "iOS shipped" claims). Promotion to mobile/ios-templates/
# happens automatically the first time scripts/release/ios/build-ios.sh
# runs with valid Apple credentials.
TEMPLATE_DIR=""
if   [ -d "ios-templates/App/App" ];           then TEMPLATE_DIR="ios-templates"
elif [ -d "mobile/ios-templates/App/App" ];    then TEMPLATE_DIR="mobile/ios-templates"
elif [ -d "archive/ios-templates/App/App" ];   then TEMPLATE_DIR="archive/ios-templates"
fi

if [ -n "$TEMPLATE_DIR" ]; then
  echo "▶ Overlaying ${TEMPLATE_DIR}/ → ios/"
  rsync -av "${TEMPLATE_DIR}/App/App/" ios/App/App/
  [ -f "${TEMPLATE_DIR}/App/Podfile" ] && cp "${TEMPLATE_DIR}/App/Podfile" ios/App/Podfile
else
  echo "  ⓘ No iOS template directory found — using Capacitor defaults"
fi

# ── 5. Generate icon variants from 1024 master (if present) ────
ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
MASTER="$ICON_DIR/AppIcon-1024.png"
if [ -f "$MASTER" ]; then
  echo "▶ Generating icon variants from 1024 master"
  for size in 20 29 40 58 60 76 80 87 120 152 167 180; do
    sips -Z "$size" "$MASTER" --out "$ICON_DIR/AppIcon-$size.png" >/dev/null
  done
  echo "  ✓ generated 12 icon variants"
else
  echo "  ⓘ AppIcon-1024.png not found — Capacitor default icons will be used"
fi

# ── 6. CocoaPods install ───────────────────────────────────────
echo "▶ pod install"
( cd ios/App && pod install --repo-update )

# ── 7. Capacitor sync ──────────────────────────────────────────
echo "▶ npx cap sync ios"
npx cap sync ios

# ── 8. Post-generation validation ──────────────────────────────
echo "▶ Validating generated iOS project"
[ -d "ios/App/App.xcworkspace" ] || { echo "  ✘ ios/App/App.xcworkspace missing — generation failed"; exit 5; }
[ -f "ios/App/Podfile.lock" ]    || { echo "  ✘ ios/App/Podfile.lock missing — pod install failed"; exit 4; }
[ -f "ios/App/App/Info.plist" ]  || { echo "  ✘ ios/App/App/Info.plist missing — generation incomplete"; exit 4; }
echo "  ✓ project structure valid"

echo ""
echo "✓ iOS native runtime ready at ios/App/App.xcworkspace"
echo "  Open with:  open ios/App/App.xcworkspace"
echo "  Sign+ship:  bash scripts/release/ios/build-ios.sh   # requires Apple Developer membership + 7 env vars"
