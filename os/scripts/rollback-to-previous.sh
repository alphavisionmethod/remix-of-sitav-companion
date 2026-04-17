#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — A/B Slot Rollback
#
# Switches the active slot back to the previous-known-good and reboots.
# Triggered:
#   • automatically by sita-updated when boot-counter exceeds threshold
#   • manually from recovery shell:   sita-rollback
#
# Reads /etc/sita/slot to find current ('a' or 'b'), flips to the other,
# rewrites systemd-boot loader.conf, emits a rollback receipt, then
# either reboots (default) or stays staged (--dry-run).
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

SLOT_FILE="/etc/sita/slot"
EFI_LOADER="/boot/efi/loader/loader.conf"
RECEIPT_DIR="/var/lib/sita/rollbacks"
mkdir -p "${RECEIPT_DIR}"

CURRENT="$(cat "${SLOT_FILE}" 2>/dev/null || echo a)"
case "${CURRENT}" in
  a) NEXT=b ;;
  b) NEXT=a ;;
  *) echo "unknown slot '${CURRENT}'" >&2; exit 2 ;;
esac

ENTRY="/boot/efi/loader/entries/sita-${NEXT}.conf"
[[ -f "${ENTRY}" ]] || { echo "no boot entry for slot ${NEXT}" >&2; exit 2; }

echo "↩️  rollback ${CURRENT} → ${NEXT}"
RECEIPT="${RECEIPT_DIR}/$(date -u +%Y%m%dT%H%M%SZ)-rollback.json"
cat > "${RECEIPT}" <<JSON
{
  "from": "${CURRENT}",
  "to":   "${NEXT}",
  "at":   "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reason": "${SITA_ROLLBACK_REASON:-manual}",
  "dryRun": ${DRY_RUN}
}
JSON
echo "📄 receipt: ${RECEIPT}"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "(dry run — no changes applied)"
  exit 0
fi

echo "${NEXT}" > "${SLOT_FILE}"
echo "default sita-${NEXT}.conf" > "${EFI_LOADER}"
sync

echo "🔁 rebooting into slot ${NEXT} in 5s (Ctrl-C to cancel)"
sleep 5
systemctl reboot
