#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Phase 2: A/B partition layout for atomic updates
#
# Layout (GPT):
#   1  EFI         512 MiB  vfat            EFI System Partition
#   2  sita_root_a 4 GiB    squashfs+verity primary system slot
#   3  sita_root_b 4 GiB    squashfs+verity standby system slot
#   4  sita_verity_a 256 MiB                Merkle tree A
#   5  sita_verity_b 256 MiB                Merkle tree B
#   6  sita_data   rest     ext4 over LUKS2 user data + state
#
# Used both by the installer and the QEMU disk-image builder.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

DEVICE="${1:?target block device required (e.g. /dev/sdX)}"
log()  { printf "\033[1;36m[partition]\033[0m %s\n" "$*"; }

command -v sgdisk >/dev/null || { echo "apt-get install gdisk" >&2; exit 1; }

log "wiping ${DEVICE} and writing GPT"
sgdisk --zap-all "${DEVICE}"

sgdisk \
  -n 1:0:+512M  -t 1:ef00 -c 1:"EFI"            \
  -n 2:0:+4G    -t 2:8300 -c 2:"sita_root_a"    \
  -n 3:0:+4G    -t 3:8300 -c 3:"sita_root_b"    \
  -n 4:0:+256M  -t 4:8300 -c 4:"sita_verity_a"  \
  -n 5:0:+256M  -t 5:8300 -c 5:"sita_verity_b"  \
  -n 6:0:0      -t 6:8300 -c 6:"sita_data"      \
  "${DEVICE}"

partprobe "${DEVICE}"
sleep 1

mkfs.vfat -F32 -n EFI "${DEVICE}1"
log "A/B partition layout ready on ${DEVICE}"
