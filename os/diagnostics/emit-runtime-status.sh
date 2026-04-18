#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Runtime Status Heartbeat
#
# Writes a small JSON file every invocation, intended to be called from
# a systemd timer or from deploy/metrics-agent.sh. The metrics-agent
# canonical reporter then forwards this to the cloud.
#
# Output: /var/lib/sita/diagnostics/runtime-status.json
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail
HERE="$(dirname "$(readlink -f "$0")")"
. "${HERE}/_lib.sh"

OUT="$(diag_dir)/runtime-status.json"

VERSION="$(read_or /etc/sita/version unknown)"
SLOT="$(read_or /etc/sita/slot unknown)"
CHANNEL="$(read_or /etc/sita/channel unknown)"
UPTIME="$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo 0)"

S_RUNTIME="$(unit_active sita-runtime.service)"
S_UPDATED="$(unit_active sita-updated.service)"
SHELL_OK="no"
pgrep -f '/usr/bin/sita-shell' >/dev/null 2>&1 && SHELL_OK="yes"

CRASHES="$(read_or /var/lib/sita/state/shell-crash-count 0)"
SAFE_MODE="$(read_or /var/lib/sita/state/safe-mode.activated no)"
ROLLBACK_ARMED="no"
{ [[ -f /var/lib/sita/rollbacks/.armed ]] || [[ -f /opt/sita/.rollback-ready ]]; } && ROLLBACK_ARMED="yes"

cat > "${OUT}" <<JSON
{
  "ts":               "$(now_iso)",
  "version":          "${VERSION}",
  "channel":          "${CHANNEL}",
  "slot":             "${SLOT}",
  "uptimeSec":        ${UPTIME:-0},
  "shellRunning":     "${SHELL_OK}",
  "shellCrashCount":  ${CRASHES:-0},
  "safeMode":         "${SAFE_MODE}",
  "rollbackArmed":    "${ROLLBACK_ARMED}",
  "runtimeService":   "${S_RUNTIME}",
  "updaterService":   "${S_UPDATED}"
}
JSON
echo "${OUT}"
