#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Reproducible build environment
#
# Source this file (`. os/scripts/reproducible-build-env.sh`) at the
# top of any build script to pin every variable that influences
# determinism: timestamps, locale, timezone, umask, mksquashfs flags.
#
# Following https://reproducible-builds.org/docs/source-date-epoch/
# ═══════════════════════════════════════════════════════════════════════

# Use the most-recent git commit timestamp as the canonical SDE.
if [ -z "${SOURCE_DATE_EPOCH:-}" ]; then
  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    SOURCE_DATE_EPOCH="$(git log -1 --pretty=%ct 2>/dev/null || echo 1700000000)"
  else
    SOURCE_DATE_EPOCH="1700000000"
  fi
  export SOURCE_DATE_EPOCH
fi

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export TZ=UTC
umask 022

# Deterministic mksquashfs flags (no compression timestamps, fixed UID/GID)
export SITA_MKSQUASHFS_OPTS="-noappend -all-root -mkfs-time ${SOURCE_DATE_EPOCH} -all-time ${SOURCE_DATE_EPOCH} -reproducible -no-exports -no-fragments -no-xattrs -comp xz"

# Deterministic xorriso flags
export SITA_XORRISO_OPTS="-volid SITA_OS -joliet on -rock on -modification-date ${SOURCE_DATE_EPOCH}"

# Deterministic tar flags (used by update bundle builder)
export SITA_TAR_OPTS="--sort=name --owner=0 --group=0 --numeric-owner --mtime=@${SOURCE_DATE_EPOCH}"

# Node / npm determinism
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false

if [ "${1:-}" = "--print" ]; then
  echo "SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH}"
  echo "TZ=${TZ}"
  echo "LC_ALL=${LC_ALL}"
  echo "SITA_MKSQUASHFS_OPTS=${SITA_MKSQUASHFS_OPTS}"
  echo "SITA_XORRISO_OPTS=${SITA_XORRISO_OPTS}"
  echo "SITA_TAR_OPTS=${SITA_TAR_OPTS}"
fi
