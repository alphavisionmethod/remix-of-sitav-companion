#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Raw Disk IMG Builder
#
# Produces a flashable raw disk image (`out/sita-os-<version>-amd64.img`)
# from the canonical squashfs rootfs already produced by the ISO builder.
#
# Layout (GPT, identical to A/B installer layout in
# os/image-builder/partitions/ab-layout.sh):
#
#   1  EFI            512 MiB  vfat            ESP, GRUB + signed kernel/initrd
#   2  sita_root_a    4 GiB    squashfs        active slot (verity-protected)
#   3  sita_root_b    4 GiB    squashfs        standby slot (empty, ready)
#   4  sita_verity_a  256 MiB                  Merkle tree A (root hash baked)
#   5  sita_verity_b  256 MiB                  Merkle tree B (empty)
#   6  sita_data      ~2 GiB   ext4 over LUKS2 user state (created on first boot)
#
# Use cases:
#   • direct flash to USB/SSD  →  sudo dd if=sita-os-*.img of=/dev/sdX bs=4M
#   • cloud raw import         →  AWS EC2 VM Import, GCP Compute raw import
#   • bare-metal provisioning  →  Clonezilla, ipxe chain
#
# Requires: a successful ISO build (this script reuses its rootfs + verity
# artifacts — it does not rebuild them).
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
VERSION="${VERSION:-0.0.0-dev+$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
IMG="${OUT_DIR}/sita-os-${VERSION}-amd64.img"
WORK="${OUT_DIR}/.img-work"

log()  { printf "\033[1;36m[img]\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m[img]\033[0m %s\n" "$*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then
  fail "must run as root (loop devices + mkfs require it). Use: sudo -E bash $0"
fi

for tool in sgdisk parted mkfs.vfat mkfs.ext4 losetup partprobe dd cryptsetup; do
  command -v "$tool" >/dev/null || fail "missing required tool: $tool (apt-get install gdisk parted dosfstools e2fsprogs cryptsetup-bin)"
done

ROOTFS_SQUASHFS="${OUT_DIR}/rootfs.squashfs"
VERITY_HASH="${OUT_DIR}/verity-hash-a.img"
VERITY_RECEIPT="${OUT_DIR}/verity-receipt.json"
EFI_STAGING="${OUT_DIR}/efi-staging"

[[ -f "$ROOTFS_SQUASHFS" ]] || fail "missing $ROOTFS_SQUASHFS — run os/image-builder/build.sh first"
[[ -d "$EFI_STAGING"      ]] || fail "missing $EFI_STAGING — run os/image-builder/build.sh first"
[[ -f "$VERITY_HASH"      ]] || log  "warning: $VERITY_HASH absent — image will boot non-verity dev mode"

mkdir -p "$WORK"

# ── Size calculation ────────────────────────────────────────────────────
EFI_MB=512
ROOT_MB=4096
VERITY_MB=256
DATA_MB=2048
TOTAL_MB=$(( EFI_MB + (ROOT_MB * 2) + (VERITY_MB * 2) + DATA_MB + 16 ))

log "creating sparse image: ${IMG} (${TOTAL_MB} MiB)"
rm -f "$IMG"
truncate -s "${TOTAL_MB}M" "$IMG"

# ── Partition table ─────────────────────────────────────────────────────
log "writing GPT layout"
sgdisk --zap-all "$IMG"
sgdisk \
  -n 1:0:+${EFI_MB}M     -t 1:ef00 -c 1:"EFI"           \
  -n 2:0:+${ROOT_MB}M    -t 2:8300 -c 2:"sita_root_a"   \
  -n 3:0:+${ROOT_MB}M    -t 3:8300 -c 3:"sita_root_b"   \
  -n 4:0:+${VERITY_MB}M  -t 4:8300 -c 4:"sita_verity_a" \
  -n 5:0:+${VERITY_MB}M  -t 5:8300 -c 5:"sita_verity_b" \
  -n 6:0:0               -t 6:8300 -c 6:"sita_data"     \
  "$IMG"

# ── Loop attach ─────────────────────────────────────────────────────────
LOOP="$(losetup --find --show --partscan "$IMG")"
log "attached at $LOOP"
trap 'losetup -d "$LOOP" 2>/dev/null || true' EXIT
partprobe "$LOOP"
sleep 1

# ── Format + populate partitions ────────────────────────────────────────
log "formatting ESP (${LOOP}p1)"
mkfs.vfat -F32 -n EFI "${LOOP}p1" >/dev/null

log "copying ESP contents from ${EFI_STAGING}"
ESP_MNT="${WORK}/esp"
mkdir -p "$ESP_MNT"
mount "${LOOP}p1" "$ESP_MNT"
cp -a "${EFI_STAGING}/." "$ESP_MNT/"
sync
umount "$ESP_MNT"

log "writing rootfs squashfs to slot A (${LOOP}p2)"
dd if="$ROOTFS_SQUASHFS" of="${LOOP}p2" bs=4M conv=fsync status=none

log "leaving slot B empty (${LOOP}p3) — first OTA will populate"

if [[ -f "$VERITY_HASH" ]]; then
  log "writing verity hash tree to slot A (${LOOP}p4)"
  dd if="$VERITY_HASH" of="${LOOP}p4" bs=4M conv=fsync status=none
fi

log "leaving sita_data partition (${LOOP}p6) raw — LUKS2 + ext4 created on first boot"

sync
losetup -d "$LOOP"
trap - EXIT

# ── Checksum + manifest ─────────────────────────────────────────────────
log "computing sha256"
( cd "$OUT_DIR" && sha256sum "$(basename "$IMG")" > "$(basename "$IMG").sha256" )

VERITY_ROOT="null"
if [[ -f "$VERITY_RECEIPT" ]]; then
  VERITY_ROOT="\"$(grep -oE '"root_hash"[[:space:]]*:[[:space:]]*"[^"]+"' "$VERITY_RECEIPT" | head -1 | cut -d'"' -f4)\""
fi

cat > "${IMG}.manifest.json" <<EOF
{
  "artifact": "sita-os-${VERSION}-amd64.img",
  "version": "${VERSION}",
  "format": "raw-gpt-disk",
  "size_bytes": $(stat -c%s "$IMG"),
  "sha256": "$(awk '{print $1}' "${IMG}.sha256")",
  "verity_root_hash": ${VERITY_ROOT},
  "layout": {
    "esp_mb":    ${EFI_MB},
    "root_a_mb": ${ROOT_MB},
    "root_b_mb": ${ROOT_MB},
    "verity_a_mb": ${VERITY_MB},
    "verity_b_mb": ${VERITY_MB},
    "data_mb":   ${DATA_MB}
  },
  "flash_command": "sudo dd if=${IMG} of=/dev/sdX bs=4M status=progress conv=fsync",
  "cloud_imports": {
    "aws":   "aws ec2 import-image --disk-containers Format=raw,UserBucket={S3Bucket=...,S3Key=$(basename "$IMG")}",
    "gcp":   "gcloud compute images import sita-os --source-file=$(basename "$IMG") --os=ubuntu-2204"
  },
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

rm -rf "$WORK"

log "✅ raw disk image ready"
log "   ${IMG}"
log "   ${IMG}.sha256"
log "   ${IMG}.manifest.json"
