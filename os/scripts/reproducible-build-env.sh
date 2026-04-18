#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Reproducible Build Environment
#
# Source this file (`. os/scripts/reproducible-build-env.sh`) BEFORE
# running build.sh, build-raw-img.sh, or build-update-bundle.sh. It pins
# every variable that influences output bytes:
#
#   • SOURCE_DATE_EPOCH    — clamps mtimes for tar / mksquashfs / cpio
#   • TZ                   — UTC everywhere
#   • LC_ALL / LANG        — C.UTF-8
#   • UMASK                — 0022 (predictable mode bits)
#   • PYTHONHASHSEED       — 0 (deterministic dict iteration)
#   • SITA_MKSQUASHFS_OPTS — -no-exports -all-root -mkfs-time / -fstime
#                            -all-time so squashfs is byte-identical
#   • LDFLAGS / CFLAGS     — -Wl,--build-id=none where supported
#
# Honors a caller-supplied SOURCE_DATE_EPOCH; otherwise uses the most
# recent git commit timestamp; otherwise falls back to a fixed 2024-01-01
# epoch so dev builds are still reproducible across machines.
# ═══════════════════════════════════════════════════════════════════════

if [[ -z "${SOURCE_DATE_EPOCH:-}" ]]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    SOURCE_DATE_EPOCH="$(git log -1 --pretty=%ct 2>/dev/null || echo 1704067200)"
  else
    SOURCE_DATE_EPOCH=1704067200  # 2024-01-01T00:00:00Z
  fi
fi
export SOURCE_DATE_EPOCH

export TZ=UTC
export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export PYTHONHASHSEED=0
umask 0022

# Deterministic squashfs flags consumed by build.sh
export SITA_MKSQUASHFS_OPTS="${SITA_MKSQUASHFS_OPTS:--no-exports -all-root -mkfs-time ${SOURCE_DATE_EPOCH} -fstime ${SOURCE_DATE_EPOCH} -all-time ${SOURCE_DATE_EPOCH} -no-xattrs -noappend -comp xz -Xbcj x86 -b 1M -progress}"

# Deterministic tar flags consumed by build-update-bundle.sh
export SITA_TAR_OPTS="${SITA_TAR_OPTS:---sort=name --mtime=@${SOURCE_DATE_EPOCH} --owner=0 --group=0 --numeric-owner --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime}"

# Deterministic cpio flags for initramfs assembly
export SITA_CPIO_OPTS="${SITA_CPIO_OPTS:--R 0:0 --reproducible}"

# Build-id stripped where supported (kernel modules, native helpers)
export LDFLAGS="${LDFLAGS:-} -Wl,--build-id=none"
export CFLAGS="${CFLAGS:-} -ffile-prefix-map=$(pwd)=."
export CXXFLAGS="${CXXFLAGS:-} -ffile-prefix-map=$(pwd)=."

echo "🔁 reproducible build env:"
echo "   SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH}  ($(date -u -d "@${SOURCE_DATE_EPOCH}" +%Y-%m-%dT%H:%M:%SZ))"
echo "   TZ=${TZ}  LC_ALL=${LC_ALL}  umask=$(umask)"
