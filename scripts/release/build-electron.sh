#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Electron Desktop Build Script
# Cross-platform packaging using @electron/packager
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION="${VERSION:-1.0.0}"
OUTPUT_DIR="${PROJECT_ROOT}/electron-release"
ARTIFACTS_DIR="${PROJECT_ROOT}/dist-electron"
PLATFORM="${1:-linux}"
ARCH="${2:-x64}"

log() { echo "[$(date -u '+%H:%M:%S')] $*"; }

# ── Parse arguments ──────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform) PLATFORM="$2"; shift 2 ;;
    --arch) ARCH="$2"; shift 2 ;;
    --version) VERSION="$2"; shift 2 ;;
    --output) ARTIFACTS_DIR="$2"; shift 2 ;;
    linux|darwin|win32) PLATFORM="$1"; shift ;;
    x64|arm64) ARCH="$1"; shift ;;
    *) shift ;;
  esac
done

log "═══════════════════════════════════════════════════════"
log "  SITA OS — Electron Build"
log "  Platform: ${PLATFORM} | Arch: ${ARCH} | Version: ${VERSION}"
log "═══════════════════════════════════════════════════════"

# ── Step 1: Build frontend ───────────────────────────────────
log "[1/4] Building frontend with Electron base path..."
cd "$PROJECT_ROOT"
ELECTRON_BUILD=1 npx vite build

# ── Step 2: Install Electron deps if needed ──────────────────
log "[2/4] Ensuring Electron dependencies..."
if ! npx electron --version &>/dev/null; then
  npm install --save-dev electron @electron/packager
fi

# ── Step 3: Package ──────────────────────────────────────────
log "[3/4] Packaging for ${PLATFORM}-${ARCH}..."
mkdir -p "$OUTPUT_DIR"

npx @electron/packager "$PROJECT_ROOT" "SITA-OS" \
  --platform="$PLATFORM" \
  --arch="$ARCH" \
  --out="$OUTPUT_DIR" \
  --overwrite \
  --app-version="$VERSION" \
  --icon="$PROJECT_ROOT/public/icons/icon" \
  --ignore='node_modules' \
  --ignore='^/src' \
  --ignore='^/public' \
  --ignore='^/scripts' \
  --ignore='^/deploy' \
  --ignore='^/supabase' \
  --ignore='^/e2e' \
  --ignore='^/tests' \
  --ignore='^/\.github' \
  --ignore='^/electron-release' \
  --ignore='^/dist-electron'

# ── Step 4: Archive ──────────────────────────────────────────
log "[4/4] Creating release archive..."
mkdir -p "$ARTIFACTS_DIR"

APP_DIR="SITA-OS-${PLATFORM}-${ARCH}"

case "$PLATFORM" in
  linux)
    tar czf "${ARTIFACTS_DIR}/sita-os-${VERSION}-${PLATFORM}-${ARCH}.tar.gz" \
      -C "$OUTPUT_DIR" "$APP_DIR"
    log "  → ${ARTIFACTS_DIR}/sita-os-${VERSION}-${PLATFORM}-${ARCH}.tar.gz"
    ;;
  darwin|win32)
    cd "$OUTPUT_DIR"
    zip -r "${ARTIFACTS_DIR}/sita-os-${VERSION}-${PLATFORM}-${ARCH}.zip" "$APP_DIR"
    log "  → ${ARTIFACTS_DIR}/sita-os-${VERSION}-${PLATFORM}-${ARCH}.zip"
    ;;
esac

log ""
log "═══════════════════════════════════════════════════════"
log "  ✅ Build complete: ${PLATFORM}-${ARCH}"
log "═══════════════════════════════════════════════════════"
