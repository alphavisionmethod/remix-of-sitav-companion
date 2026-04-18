#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Update State Inspector
#
# Detects partial / failed / interrupted A/B updates and emits a
# structured JSON consumed by the support bundle, sita-ops, and the
# CI update-readiness gate.
#
# Output: /var/lib/sita/diagnostics/update-state.json
# Exit:   0 = clean, 1 = inconsistent state needs operator attention
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

OUT_DIR="/var/lib/sita/diagnostics"
OUT="${OUT_DIR}/update-state.json"
mkdir -p "${OUT_DIR}"

UPDATES_DIR="/var/lib/sita/updates"
ROLLBACKS_DIR="/var/lib/sita/rollbacks"
ETC_SITA="/etc/sita"

ACTIVE_SLOT="$(cat ${ETC_SITA}/slot 2>/dev/null || echo unknown)"
VERSION="$(cat ${ETC_SITA}/version 2>/dev/null || echo unknown)"
CHANNEL="$(cat ${ETC_SITA}/channel 2>/dev/null || echo unknown)"

# Stale staging (> 24h old, no .activated marker) → interrupted
STAGED_BUNDLES=0
INTERRUPTED=0
if [[ -d "${UPDATES_DIR}" ]]; then
  while IFS= read -r d; do
    STAGED_BUNDLES=$((STAGED_BUNDLES + 1))
    if [[ ! -f "${d}/.activated" ]]; then
      age=$(( $(date +%s) - $(stat -c %Y "${d}" 2>/dev/null || echo 0) ))
      (( age > 86400 )) && INTERRUPTED=$((INTERRUPTED + 1))
    fi
  done < <(find "${UPDATES_DIR}" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
fi

# Failed-update marker (written by sita-updated on activation failure)
FAILED_MARKER="false"
FAILED_REASON=""
if [[ -f "${UPDATES_DIR}/.last-failure" ]]; then
  FAILED_MARKER="true"
  FAILED_REASON="$(head -c 200 "${UPDATES_DIR}/.last-failure" 2>/dev/null | tr -d '"' || echo "")"
fi

# Rollback availability
ROLLBACK_COUNT=0
[[ -d "${ROLLBACKS_DIR}" ]] && ROLLBACK_COUNT="$(find "${ROLLBACKS_DIR}" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)"

# Slot health (verify the *other* slot is bootable per loader entries)
OTHER_SLOT="b"
[[ "${ACTIVE_SLOT}" == "b" ]] && OTHER_SLOT="a"
OTHER_BOOTABLE="false"
if [[ -f "/boot/efi/loader/entries/sita-${OTHER_SLOT}.conf" ]]; then
  OTHER_BOOTABLE="true"
fi

# Last successful update timestamp
LAST_UPDATE_TS="$(stat -c %Y "${ETC_SITA}/version" 2>/dev/null || echo 0)"
LAST_UPDATE_ISO="$(date -u -d "@${LAST_UPDATE_TS}" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo unknown)"

OK=true
[[ "${FAILED_MARKER}" == "true" ]] && OK=false
[[ "${INTERRUPTED}" -gt 0 ]] && OK=false
[[ "${OTHER_BOOTABLE}" == "false" ]] && OK=false

cat > "${OUT}" <<JSON
{
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "activeSlot": "${ACTIVE_SLOT}",
  "otherSlot": "${OTHER_SLOT}",
  "otherSlotBootable": ${OTHER_BOOTABLE},
  "version": "${VERSION}",
  "channel": "${CHANNEL}",
  "lastUpdateAt": "${LAST_UPDATE_ISO}",
  "stagedBundles": ${STAGED_BUNDLES},
  "interruptedBundles": ${INTERRUPTED},
  "lastFailure": ${FAILED_MARKER},
  "lastFailureReason": "${FAILED_REASON}",
  "rollbacksAvailable": ${ROLLBACK_COUNT},
  "ok": ${OK}
}
JSON

if [[ "${OK}" == "true" ]]; then
  echo "✅ update-state OK (slot=${ACTIVE_SLOT} version=${VERSION})"
  exit 0
else
  echo "❌ update-state needs attention — see ${OUT}"
  [[ "${FAILED_MARKER}" == "true" ]] && echo "   last failure: ${FAILED_REASON}"
  [[ "${INTERRUPTED}" -gt 0 ]] && echo "   interrupted bundles: ${INTERRUPTED}"
  [[ "${OTHER_BOOTABLE}" == "false" ]] && echo "   other slot not bootable — rollback unavailable"
  exit 1
fi
