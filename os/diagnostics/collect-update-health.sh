#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Update Health Collector
# Captures: pending update, last apply result, rollback state, channel,
# updater service status, last bundle verification.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail
HERE="$(dirname "$(readlink -f "$0")")"
. "${HERE}/_lib.sh"

OUT="$(diag_dir)/update-health.json"

CHANNEL="$(read_or /etc/sita/channel unknown)"
ACTIVE_SLOT="$(read_or /etc/sita/slot unknown)"
LKG_SLOT="$(read_or /var/lib/sita/last-known-good.slot unknown)"

PENDING="none"
[[ -f /var/lib/sita/update/pending.json ]] && PENDING="$(cat /var/lib/sita/update/pending.json)"

LAST_RESULT="$(read_or /var/lib/sita/update/last-apply-result.json '{}')"
LAST_VERIFY="$(read_or /var/lib/sita/update/last-bundle-verification.json '{}')"

ROLLBACK_ARMED="no"
{ [[ -f /var/lib/sita/rollbacks/.armed ]] || [[ -f /opt/sita/.rollback-ready ]]; } && ROLLBACK_ARMED="yes"

S_UPDATED="$(unit_active sita-updated.service)"
T_UPDATED="$(unit_active sita-updated.timer)"
NEXT_RUN="unknown"
if command -v systemctl >/dev/null 2>&1; then
  NEXT_RUN="$(systemctl list-timers sita-updated.timer --no-pager 2>/dev/null | awk 'NR==2 {print $1, $2}' || echo unknown)"
fi

cat > "${OUT}" <<JSON
{
  "collectedAt":          "$(now_iso)",
  "channel":              "${CHANNEL}",
  "activeSlot":           "${ACTIVE_SLOT}",
  "lastKnownGoodSlot":    "${LKG_SLOT}",
  "rollbackArmed":        "${ROLLBACK_ARMED}",
  "updaterService":       "${S_UPDATED}",
  "updaterTimer":         "${T_UPDATED}",
  "nextRun":              "$(json_escape "${NEXT_RUN}")",
  "pendingUpdate":        ${PENDING},
  "lastApplyResult":      ${LAST_RESULT},
  "lastBundleVerification": ${LAST_VERIFY}
}
JSON
echo "✅ update-health → ${OUT} (slot: ${ACTIVE_SLOT}, rollback armed: ${ROLLBACK_ARMED})"
