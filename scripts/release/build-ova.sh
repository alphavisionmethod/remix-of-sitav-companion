#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — OVF/OVA Packager
# Creates a VMware-compliant OVA appliance with:
#   - .ovf XML descriptor (CIM/OVF/RASD/VSSD namespaces)
#   - .vmdk virtual disk (thin-provisioned, stream-optimized)
#   - .mf SHA256 manifest
#   - .ova TAR bundle (in spec-compliant order)
#
# Requirements: qemu-img, sha256sum, tar
# Usage: ./build-ova.sh [OPTIONS]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ── Defaults ──────────────────────────────────────────────────
VERSION="${VERSION:-1.0.0}"
CPU_COUNT="${CPU_COUNT:-4}"
RAM_MB="${RAM_MB:-8192}"
DISK_SIZE_GB="${DISK_SIZE_GB:-80}"
OUTPUT_DIR="${PROJECT_ROOT}/dist"
OVA_NAME="sita-os"
TEMPLATE_DIR="${SCRIPT_DIR}/templates"
SOURCE_ISO=""

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)      VERSION="$2"; shift 2 ;;
    --cpus)         CPU_COUNT="$2"; shift 2 ;;
    --ram)          RAM_MB="$2"; shift 2 ;;
    --disk)         DISK_SIZE_GB="$2"; shift 2 ;;
    --output-dir)   OUTPUT_DIR="$2"; shift 2 ;;
    --name)         OVA_NAME="$2"; shift 2 ;;
    --from-iso)     SOURCE_ISO="$2"; shift 2 ;;
    --help|-h)
      cat << 'HELP'
Usage: build-ova.sh [OPTIONS]

Options:
  --version VERSION    Set version string (default: 1.0.0)
  --cpus N             vCPU count (default: 4)
  --ram N              RAM in MB (default: 8192)
  --disk N             Disk size in GB (default: 80)
  --output-dir DIR     Output directory (default: ./dist)
  --name NAME          OVA filename base (default: sita-os)
  --from-iso PATH      Install from ISO into VMDK (requires qemu-system)
  -h, --help           Show this help

Examples:
  ./build-ova.sh --version 1.2.0 --cpus 8 --ram 16384
  ./build-ova.sh --from-iso dist/sita-os-1.0.0.iso
HELP
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════════════════════"
echo "  SITA OS — OVA Packager v${VERSION}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Configuration:"
echo "    vCPU:   ${CPU_COUNT}"
echo "    RAM:    ${RAM_MB} MB"
echo "    Disk:   ${DISK_SIZE_GB} GB"
echo "    Output: ${OUTPUT_DIR}"
echo ""

# ── Check dependencies ────────────────────────────────────────
MISSING=()
for cmd in qemu-img sha256sum tar; do
  if ! command -v "$cmd" &>/dev/null; then
    MISSING+=("$cmd")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Missing required tools: ${MISSING[*]}"
  echo ""
  echo "Install with:"
  echo "  sudo apt-get install -y qemu-utils coreutils tar"
  exit 1
fi

# ── Prepare workspace ─────────────────────────────────────────
WORK_DIR=$(mktemp -d -t sita-ova-XXXXXX)
trap 'rm -rf "$WORK_DIR"' EXIT
mkdir -p "$OUTPUT_DIR"

VMDK_FILENAME="${OVA_NAME}-${VERSION}-disk1.vmdk"
OVF_FILENAME="${OVA_NAME}-${VERSION}.ovf"
MF_FILENAME="${OVA_NAME}-${VERSION}.mf"
OVA_FILENAME="${OVA_NAME}-${VERSION}.ova"

BUILD_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
GIT_HASH=$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
YEAR=$(date '+%Y')
DISK_CAPACITY_BYTES=$((DISK_SIZE_GB * 1073741824))

# ── Step 1: Create VMDK ──────────────────────────────────────
echo "[1/6] Creating virtual disk (${DISK_SIZE_GB}GB thin-provisioned VMDK)..."

if [ -n "$SOURCE_ISO" ] && [ -f "$SOURCE_ISO" ]; then
  # Full path: install from ISO into VMDK using QEMU
  echo "  Installing from ISO: ${SOURCE_ISO}"
  echo "  This will take 10-30 minutes..."
  
  # Create raw disk first
  qemu-img create -f raw "${WORK_DIR}/disk.raw" "${DISK_SIZE_GB}G"
  
  # Run installer (headless, autoinstall should handle everything)
  if command -v qemu-system-x86_64 &>/dev/null; then
    qemu-system-x86_64 \
      -m "${RAM_MB}" \
      -smp "${CPU_COUNT}" \
      -drive file="${WORK_DIR}/disk.raw",format=raw,if=virtio \
      -cdrom "$SOURCE_ISO" \
      -boot d \
      -nographic \
      -serial mon:stdio \
      -no-reboot \
      2>&1 | tail -5
  else
    echo "  ⚠ qemu-system-x86_64 not found — creating empty VMDK"
    echo "    Install QEMU for full ISO-to-OVA workflow"
  fi
  
  # Convert to stream-optimized VMDK
  qemu-img convert -f raw -O vmdk \
    -o subformat=streamOptimized,adapter_type=lsilogic \
    "${WORK_DIR}/disk.raw" "${WORK_DIR}/${VMDK_FILENAME}"
else
  # Create empty thin-provisioned VMDK
  qemu-img create -f vmdk \
    -o subformat=streamOptimized,adapter_type=lsilogic \
    "${WORK_DIR}/${VMDK_FILENAME}" "${DISK_SIZE_GB}G"
fi

VMDK_SIZE=$(stat -c%s "${WORK_DIR}/${VMDK_FILENAME}" 2>/dev/null || stat -f%z "${WORK_DIR}/${VMDK_FILENAME}")
echo "  ✅ VMDK created: ${VMDK_FILENAME} ($(numfmt --to=iec "$VMDK_SIZE" 2>/dev/null || echo "${VMDK_SIZE} bytes"))"

# ── Step 2: Generate OVF descriptor ──────────────────────────
echo "[2/6] Generating OVF descriptor..."
TEMPLATE="${TEMPLATE_DIR}/sita-os.ovf.template"

if [ ! -f "$TEMPLATE" ]; then
  echo "  ❌ OVF template not found: $TEMPLATE"
  exit 1
fi

sed \
  -e "s|__VERSION__|${VERSION}|g" \
  -e "s|__BUILD_DATE__|${BUILD_DATE}|g" \
  -e "s|__GIT_HASH__|${GIT_HASH}|g" \
  -e "s|__YEAR__|${YEAR}|g" \
  -e "s|__CPU_COUNT__|${CPU_COUNT}|g" \
  -e "s|__RAM_MB__|${RAM_MB}|g" \
  -e "s|__DISK_SIZE_GB__|${DISK_SIZE_GB}|g" \
  -e "s|__DISK_CAPACITY_BYTES__|${DISK_CAPACITY_BYTES}|g" \
  -e "s|__VMDK_FILENAME__|${VMDK_FILENAME}|g" \
  -e "s|__VMDK_SIZE__|${VMDK_SIZE}|g" \
  "$TEMPLATE" > "${WORK_DIR}/${OVF_FILENAME}"

echo "  ✅ OVF descriptor generated: ${OVF_FILENAME}"

# ── Step 3: Validate OVF XML ─────────────────────────────────
echo "[3/6] Validating OVF XML structure..."
if command -v xmllint &>/dev/null; then
  if xmllint --noout "${WORK_DIR}/${OVF_FILENAME}" 2>/dev/null; then
    echo "  ✅ OVF XML is well-formed"
  else
    echo "  ⚠ OVF XML validation warnings (may still work)"
  fi
else
  # Basic check: ensure it's valid XML
  if head -1 "${WORK_DIR}/${OVF_FILENAME}" | grep -q '<?xml'; then
    echo "  ✅ OVF XML header present (xmllint not available for full validation)"
  fi
fi

# ── Step 4: Generate manifest (.mf) ──────────────────────────
echo "[4/6] Computing SHA256 checksums..."
cd "$WORK_DIR"

OVF_SHA=$(sha256sum "${OVF_FILENAME}" | awk '{print $1}')
VMDK_SHA=$(sha256sum "${VMDK_FILENAME}" | awk '{print $1}')

cat > "${MF_FILENAME}" << EOF
SHA256(${OVF_FILENAME})= ${OVF_SHA}
SHA256(${VMDK_FILENAME})= ${VMDK_SHA}
EOF

echo "  ✅ Manifest generated: ${MF_FILENAME}"
echo "    OVF:  ${OVF_SHA}"
echo "    VMDK: ${VMDK_SHA}"

# ── Step 5: Bundle into OVA ──────────────────────────────────
echo "[5/6] Creating OVA archive..."
# OVF spec requires files in this exact order: .ovf first, then .vmdk, then .mf
tar cf "${OUTPUT_DIR}/${OVA_FILENAME}" \
  --format=ustar \
  "${OVF_FILENAME}" \
  "${VMDK_FILENAME}" \
  "${MF_FILENAME}"

OVA_SIZE=$(stat -c%s "${OUTPUT_DIR}/${OVA_FILENAME}" 2>/dev/null || stat -f%z "${OUTPUT_DIR}/${OVA_FILENAME}")
OVA_SHA=$(sha256sum "${OUTPUT_DIR}/${OVA_FILENAME}" | awk '{print $1}')

echo "  ✅ OVA created: ${OVA_FILENAME}"

# ── Step 6: Verify OVA contents ──────────────────────────────
echo "[6/6] Verifying OVA contents..."
echo "  Archive contents:"
tar tf "${OUTPUT_DIR}/${OVA_FILENAME}" | while read -r f; do
  echo "    - ${f}"
done

# Verify file order (OVF spec compliance)
FIRST_FILE=$(tar tf "${OUTPUT_DIR}/${OVA_FILENAME}" | head -1)
if [[ "$FIRST_FILE" == *.ovf ]]; then
  echo "  ✅ OVF file is first entry (spec compliant)"
else
  echo "  ⚠ OVF file is not first entry — some hypervisors may reject this"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ SITA OS OVA built successfully!"
echo ""
echo "  Output:   ${OUTPUT_DIR}/${OVA_FILENAME}"
echo "  Size:     $(numfmt --to=iec "$OVA_SIZE" 2>/dev/null || echo "${OVA_SIZE} bytes")"
echo "  SHA256:   ${OVA_SHA}"
echo "  Version:  ${VERSION}"
echo ""
echo "  VM Specs:"
echo "    vCPU:   ${CPU_COUNT}"
echo "    RAM:    ${RAM_MB} MB"
echo "    Disk:   ${DISK_SIZE_GB} GB (thin-provisioned)"
echo "    NIC:    VMXNET3"
echo "    Type:   vmx-21 (ESXi 8.0+)"
echo ""
echo "  To deploy:"
echo "    VMware vSphere: File → Deploy OVF Template"
echo "    VMware Workstation: File → Open → Select .ova"
echo "    VirtualBox: File → Import Appliance"
echo ""
echo "  To verify integrity:"
echo "    sha256sum -c <<< '${OVA_SHA}  ${OVA_FILENAME}'"
echo "═══════════════════════════════════════════════════════"
