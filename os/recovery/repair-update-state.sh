#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Repair: Update State
#
# Aborts a stuck/interrupted A/B update, marks the current slot as bad
# if requested, and prepares the system for rollback. Does NOT perform
# the rollback itself — that is sita-ops rollback.
#
# Usage:
#   repair-update-state.sh                # clean stuck staging only
#   repair-update-state.sh --mark-bad     # also mark current slot as bad
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

MARK_BAD="false"
[[ "${1:-}" == "--mark-bad" ]] && MARK_BAD="true"

echo "── repair-update-state (mark-bad=${MARK_BAD}) ────────────"

UPDATES_DIR="/var/lib/sita/updates"
ETC_SITA="/etc/sita"
ACTIVE_SLOT="$(cat ${ETC_SITA}/slot 2>/dev/null || echo unknown)"

# 1. snapshot pre-state
echo "→ active slot: ${ACTIVE_SLOT}"
/opt/sita/scripts/check-update-state.sh || true

# 2. clean up interrupted staging (> 24h, no .activated marker)
CLEANED=0
if [[ -d "${UPDATES_DIR}" ]]; then
  while IFS= read -r d; do
    if [[ ! -f "${d}/.activated" ]]; then
      age=$(( $(date +%s) - $(stat -c %Y "${d}" 2>/dev/null || echo 0) ))
      if (( age > 86400 )); then
        echo "→ removing stale staging: ${d} (age=${age}s)"
        rm -rf "${d}" && CLEANED=$((CLEANED + 1))
      fi
    fi
  done < <(find "${UPDATES_DIR}" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
fi
echo "✓ cleaned ${CLEANED} interrupted bundle(s)"

# 3. clear failure marker if present
if [[ -f "${UPDATES_DIR}/.last-failure" ]]; then
  mv -f "${UPDATES_DIR}/.last-failure" "${UPDATES_DIR}/.last-failure.cleared.$(date +%s)" \
    && echo "✓ archived last-failure marker"
fi

# 4. optionally mark current slot as bad (forces boot loader to prefer other)
if [[ "${MARK_BAD}" == "true" ]]; then
  ENTRY="/boot/efi/loader/entries/sita-${ACTIVE_SLOT}.conf"
  if [[ -f "${ENTRY}" ]]; then
    BAD_ENTRY="${ENTRY%.conf}.bad.conf"
    cp -f "${ENTRY}" "${BAD_ENTRY}" && echo "✓ archived ${ENTRY} → ${BAD_ENTRY}"
    # bump priority of the other slot via loader.conf default
    OTHER="b"; [[ "${ACTIVE_SLOT}" == "b" ]] && OTHER="a"
    if [[ -f /boot/efi/loader/loader.conf ]]; then
      sed -i "s/^default .*/default sita-${OTHER}/" /boot/efi/loader/loader.conf
      echo "✓ set loader default → sita-${OTHER}"
    fi
  fi
fi

# 5. verify other slot is bootable
OTHER="b"; [[ "${ACTIVE_SLOT}" == "b" ]] && OTHER="a"
if [[ -f "/boot/efi/loader/entries/sita-${OTHER}.conf" ]]; then
  echo "✅ other slot (${OTHER}) is bootable — sita-ops rollback is safe"
  exit 0
else
  echo "⚠ other slot (${OTHER}) NOT bootable — rollback would brick the device"
  echo "   recommend: restore from backup (see BACKUP_AND_RESTORE.md)"
  exit 1
fi
