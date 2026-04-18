#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Boot Health Collector
# Captures: boot blessing, time-to-userspace, kernel, firmware, slot,
# verity activation, last boot errors.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail
HERE="$(dirname "$(readlink -f "$0")")"
. "${HERE}/_lib.sh"

OUT="$(diag_dir)/boot-health.json"

KERNEL="$(uname -r)"
FIRMWARE="bios"
[[ -d /sys/firmware/efi ]] && FIRMWARE="uefi"
SECURE_BOOT="unknown"
if command -v mokutil >/dev/null 2>&1; then
  SECURE_BOOT="$(mokutil --sb-state 2>/dev/null | head -1 || echo unknown)"
fi
SLOT="$(read_or /etc/sita/slot unknown)"
VERSION="$(read_or /etc/sita/version unknown)"

# time-to-userspace from systemd-analyze
T2U="unknown"
if command -v systemd-analyze >/dev/null 2>&1; then
  T2U="$(systemd-analyze 2>/dev/null | head -1 | sed 's/.*=//' | xargs || echo unknown)"
fi

BLESS="unknown"
command -v systemd-bless-boot >/dev/null 2>&1 && \
  BLESS="$(systemd-bless-boot status 2>/dev/null | head -1 || echo unknown)"

VERITY="inactive"
command -v veritysetup >/dev/null 2>&1 && \
  veritysetup status sita_root >/dev/null 2>&1 && VERITY="active"

# count kernel errors in current boot
KERR=0
command -v journalctl >/dev/null 2>&1 && \
  KERR="$(journalctl -k -b -p err --no-pager 2>/dev/null | wc -l)"

cat > "${OUT}" <<JSON
{
  "collectedAt":     "$(now_iso)",
  "kernel":          "$(json_escape "${KERNEL}")",
  "firmware":        "${FIRMWARE}",
  "secureBoot":      "$(json_escape "${SECURE_BOOT}")",
  "slot":            "${SLOT}",
  "version":         "${VERSION}",
  "timeToUserspace": "$(json_escape "${T2U}")",
  "blessState":      "$(json_escape "${BLESS}")",
  "verityState":     "${VERITY}",
  "kernelErrorCount": ${KERR}
}
JSON
echo "✅ boot-health → ${OUT} (errors: ${KERR}, bless: ${BLESS})"
