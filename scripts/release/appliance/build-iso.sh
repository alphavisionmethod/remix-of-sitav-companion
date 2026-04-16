#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Bootable ISO Builder
# Creates a fully automated Ubuntu 24.04 installer ISO with
# cloud-init autoinstall, Docker pre-configured, and the full
# SITA OS stack ready to start on first boot.
#
# Requirements: xorriso, p7zip-full, wget, docker (for image export)
# Usage: ./build-iso.sh [--version 1.0.0] [--include-images] [--output-dir ./dist]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION="${VERSION:-1.0.0}"
INCLUDE_IMAGES=false
OUTPUT_DIR="${PROJECT_ROOT}/dist"
PROFILE="user"
CACHE_DIR="${PROJECT_ROOT}/.cache/iso"

# Ubuntu 24.04 LTS live server ISO
UBUNTU_ISO_URL="https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso"
UBUNTU_ISO_NAME="ubuntu-24.04-live-server-amd64.iso"
UBUNTU_ISO_SHA256="8762f7e74e4d64d72fceb5f70682e6b069932deedb4949c6975d0f0cd0a9571e"

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)      VERSION="$2"; shift 2 ;;
    --include-images) INCLUDE_IMAGES=true; shift ;;
    --output-dir)   OUTPUT_DIR="$2"; shift 2 ;;
    --profile)      PROFILE="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --version VERSION    Set OS version (default: 1.0.0)"
      echo "  --include-images     Export and embed Docker images into ISO"
      echo "  --output-dir DIR     Output directory (default: ./dist)"
      echo "  --profile PROFILE    Build profile: admin or user (default: user)"
      echo "  -h, --help           Show this help"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════════════════════"
echo "  SITA OS — ISO Builder v${VERSION}"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Check dependencies ────────────────────────────────────────
MISSING=()
for cmd in xorriso 7z wget sha256sum; do
  if ! command -v "$cmd" &>/dev/null; then
    MISSING+=("$cmd")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Missing required tools: ${MISSING[*]}"
  echo ""
  echo "Install them with:"
  echo "  sudo apt-get install -y xorriso p7zip-full wget coreutils"
  exit 1
fi

# ── Prepare directories ──────────────────────────────────────
WORK_DIR=$(mktemp -d -t sita-iso-XXXXXX)
trap 'rm -rf "$WORK_DIR"' EXIT

mkdir -p "$CACHE_DIR" "$OUTPUT_DIR"

# ── Step 1: Download Ubuntu ISO ──────────────────────────────
echo "[1/8] Downloading Ubuntu Server 24.04 ISO..."
if [ -f "${CACHE_DIR}/${UBUNTU_ISO_NAME}" ]; then
  echo "  Using cached ISO: ${CACHE_DIR}/${UBUNTU_ISO_NAME}"
else
  wget -q --show-progress -O "${CACHE_DIR}/${UBUNTU_ISO_NAME}" "$UBUNTU_ISO_URL"
fi

echo "  Verifying checksum..."
ACTUAL_SHA=$(sha256sum "${CACHE_DIR}/${UBUNTU_ISO_NAME}" | awk '{print $1}')
if [ "$ACTUAL_SHA" != "$UBUNTU_ISO_SHA256" ]; then
  echo "  ⚠ SHA256 mismatch (ISO may have been updated). Continuing with warning."
  echo "    Expected: ${UBUNTU_ISO_SHA256}"
  echo "    Got:      ${ACTUAL_SHA}"
fi

# ── Step 2: Extract ISO contents ─────────────────────────────
echo "[2/8] Extracting Ubuntu ISO..."
7z x -o"${WORK_DIR}/iso" "${CACHE_DIR}/${UBUNTU_ISO_NAME}" &>/dev/null
echo "  ✅ Extracted to ${WORK_DIR}/iso"

# ── Step 3: Inject autoinstall configuration ─────────────────
echo "[3/8] Injecting SITA OS autoinstall configuration..."
AUTOINSTALL_SRC="${SCRIPT_DIR}/iso/autoinstall"
AUTOINSTALL_DST="${WORK_DIR}/iso/autoinstall"
mkdir -p "$AUTOINSTALL_DST"

# Copy and template autoinstall files
for f in user-data meta-data network-config; do
  if [ -f "${AUTOINSTALL_SRC}/${f}" ]; then
    sed "s/__VERSION__/${VERSION}/g" "${AUTOINSTALL_SRC}/${f}" > "${AUTOINSTALL_DST}/${f}"
  fi
done

# ── Step 3b: Build frontend with self-hosted env vars ────────
echo "[3b/8] Building frontend for self-hosted deployment..."
cd "$PROJECT_ROOT"

# Set self-hosted Supabase URL (Kong exposes on 8000, proxied by Traefik)
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-http://localhost:8000}"
export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-CHANGE_ME_ANON_KEY}"

if command -v npm &>/dev/null; then
  npm run build 2>&1 | tail -5
  echo "  ✅ Frontend built with VITE_SUPABASE_URL=${VITE_SUPABASE_URL}"
elif command -v bun &>/dev/null; then
  bun run build 2>&1 | tail -5
  echo "  ✅ Frontend built with VITE_SUPABASE_URL=${VITE_SUPABASE_URL}"
else
  echo "  ⚠ Neither npm nor bun found — skipping frontend build"
  echo "    Ensure dist/ exists before packaging ISO"
fi

# ── Step 4: Inject SITA OS deployment files ──────────────────
echo "[4/8] Injecting SITA OS deployment files..."
SITA_DST="${WORK_DIR}/iso/sita"
mkdir -p "${SITA_DST}/deploy"

# Copy first-boot script and systemd service
cp "${SCRIPT_DIR}/iso/sita-first-boot.sh" "${SITA_DST}/"
cp "${SCRIPT_DIR}/iso/sita-os.service" "${SITA_DST}/"
chmod +x "${SITA_DST}/sita-first-boot.sh"

# Copy Docker Compose stack
if [ -f "${PROJECT_ROOT}/docker-compose.yml" ]; then
  cp "${PROJECT_ROOT}/docker-compose.yml" "${SITA_DST}/deploy/"
fi
if [ -f "${PROJECT_ROOT}/.env.example" ]; then
  cp "${PROJECT_ROOT}/.env.example" "${SITA_DST}/deploy/"
fi

# Copy deploy configs (Dockerfiles, nginx, kong, etc.)
if [ -d "${PROJECT_ROOT}/deploy" ]; then
  cp -r "${PROJECT_ROOT}/deploy/"* "${SITA_DST}/deploy/" 2>/dev/null || true
fi

# Copy built frontend
if [ -d "${PROJECT_ROOT}/dist" ]; then
  cp -r "${PROJECT_ROOT}/dist" "${SITA_DST}/deploy/dist"
  echo "  ✅ Frontend dist/ included in ISO"
else
  echo "  ⚠ No dist/ found — frontend will not be available"
fi

# Copy database init scripts
if [ -d "${PROJECT_ROOT}/deploy/db-init" ]; then
  mkdir -p "${SITA_DST}/deploy/db-init"
  cp "${PROJECT_ROOT}/deploy/db-init/"*.sql "${SITA_DST}/deploy/db-init/" 2>/dev/null || true
fi

# Copy Supabase migrations (required for DB init)
if [ -d "${PROJECT_ROOT}/supabase/migrations" ]; then
  mkdir -p "${SITA_DST}/deploy/supabase/migrations"
  cp "${PROJECT_ROOT}/supabase/migrations/"*.sql "${SITA_DST}/deploy/supabase/migrations/" 2>/dev/null || true
  MIGRATION_COUNT=$(ls -1 "${SITA_DST}/deploy/supabase/migrations/"*.sql 2>/dev/null | wc -l)
  echo "  ✅ ${MIGRATION_COUNT} Supabase migrations bundled"
else
  echo "  ⚠ No supabase/migrations/ found — DB tables may be missing"
fi

# Copy EULA
if [ -f "${PROJECT_ROOT}/deploy/sita-eula.sh" ]; then
  cp "${PROJECT_ROOT}/deploy/sita-eula.sh" "${SITA_DST}/"
fi

# Copy logrotate config
if [ -f "${PROJECT_ROOT}/deploy/logrotate-sita.conf" ]; then
  cp "${PROJECT_ROOT}/deploy/logrotate-sita.conf" "${SITA_DST}/"
fi

# ── Step 5: Export Docker images (optional) ──────────────────
if [ "$INCLUDE_IMAGES" = true ]; then
  echo "[5/8] Exporting Docker images (this may take a while)..."
  IMAGES_DIR="${SITA_DST}/images"
  mkdir -p "$IMAGES_DIR"

  IMAGES=(
    "sita-web:latest"
    "sita-api-gateway:latest"
    "sita-brain-core:latest"
  )

  for img in "${IMAGES[@]}"; do
    SAFE_NAME=$(echo "$img" | tr ':/' '-')
    if docker image inspect "$img" &>/dev/null; then
      echo "  Exporting ${img}..."
      docker save "$img" | gzip > "${IMAGES_DIR}/${SAFE_NAME}.tar.gz"
    else
      echo "  ⚠ Image ${img} not found locally — skipping"
    fi
  done
  echo "  ✅ Docker images exported."
else
  echo "[5/8] Skipping Docker image export (use --include-images to embed)"
fi

# ── Step 6: Modify GRUB to use autoinstall ───────────────────
echo "[6/8] Configuring GRUB for automated install..."
GRUB_CFG="${WORK_DIR}/iso/boot/grub/grub.cfg"
if [ -f "$GRUB_CFG" ]; then
  # Add autoinstall parameter to the default boot entry
  sed -i 's|---| autoinstall ds=nocloud;s=/cdrom/autoinstall/ ---|g' "$GRUB_CFG"
  
  # Set timeout to 5 seconds (enough to interrupt if needed)
  sed -i 's/set timeout=.*/set timeout=5/' "$GRUB_CFG"
  
  echo "  ✅ GRUB configured for autoinstall"
else
  echo "  ⚠ GRUB config not found — manual boot configuration may be needed"
fi

# ── Step 7: Read manifest for metadata ───────────────────────
echo "[7/8] Embedding build metadata..."
MANIFEST="${PROJECT_ROOT}/generated/base-os-manifest.json"
BUILD_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
GIT_HASH=$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")

cat > "${SITA_DST}/build-info.json" << EOF
{
  "product": "SITA OS",
  "version": "${VERSION}",
  "build_date": "${BUILD_DATE}",
  "git_hash": "${GIT_HASH}",
  "base_os": "Ubuntu 24.04 LTS (Noble Numbat)",
  "architecture": "x86_64",
  "kernel_track": "HWE 6.8+",
  "includes_docker_images": ${INCLUDE_IMAGES},
  "partition_scheme": "A/B root + LUKS2 encrypted data",
  "security": {
    "secure_boot": true,
    "dm_verity": true,
    "luks2_encryption": true,
    "tpm2_support": true,
    "firewall": "ufw",
    "intrusion_detection": "fail2ban"
  }
}
EOF

# ── Step 8: Repack ISO with xorriso ──────────────────────────
echo "[8/8] Building SITA OS ISO image..."
ISO_OUTPUT="${OUTPUT_DIR}/sita-os-${VERSION}.iso"

xorriso -as mkisofs \
  -r -V "SITA-OS-${VERSION}" \
  -o "$ISO_OUTPUT" \
  -J -joliet-long \
  -l \
  -iso-level 3 \
  --grub2-mbr "${WORK_DIR}/iso/boot/grub/i386-pc/boot_hybrid.img" \
  -partition_offset 16 \
  -append_partition 2 0xEF "${WORK_DIR}/iso/boot/grub/efi.img" \
  -appended_part_as_gpt \
  --mbr-force-bootable \
  -eltorito-boot boot/grub/i386-pc/eltorito.img \
    -no-emul-boot -boot-load-size 4 -boot-info-table --grub2-boot-info \
  -eltorito-alt-boot \
  -e '--interval:appended_partition_2:all::' \
    -no-emul-boot \
  "${WORK_DIR}/iso" \
  2>/dev/null

ISO_SIZE=$(du -h "$ISO_OUTPUT" | awk '{print $1}')
ISO_SHA=$(sha256sum "$ISO_OUTPUT" | awk '{print $1}')

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ SITA OS ISO built successfully!"
echo ""
echo "  Output:   ${ISO_OUTPUT}"
echo "  Size:     ${ISO_SIZE}"
echo "  SHA256:   ${ISO_SHA}"
echo "  Version:  ${VERSION}"
echo ""
echo "  To deploy:"
echo "    1. Boot from ISO in VMware / bare-metal / Proxmox"
echo "    2. Installation is fully automated (5-10 min)"
echo "    3. System reboots into SITA OS"
echo "    4. Web UI available at http://<ip>:8080"
echo ""
echo "  To test in QEMU:"
echo "    qemu-system-x86_64 -m 4096 -cdrom ${ISO_OUTPUT} \\"
echo "      -boot d -enable-kvm -cpu host"
echo "═══════════════════════════════════════════════════════"
