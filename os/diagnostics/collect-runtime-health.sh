#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Runtime Health Collector
# Captures sita-* services, X session, Electron shell PID, resource use.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail
HERE="$(dirname "$(readlink -f "$0")")"
. "${HERE}/_lib.sh"

OUT="$(diag_dir)/runtime-health.json"

S_RUNTIME="$(unit_active sita-runtime.service)"
S_RECOVERY_SHELL="$(unit_active sita-recovery-shell.service)"
S_UPDATED="$(unit_active sita-updated.service)"
S_FIRSTBOOT="$(unit_active sita-firstboot.service)"

# X server present?
X_RUNNING="no"
pgrep -x Xorg >/dev/null 2>&1 && X_RUNNING="yes"
pgrep -x Xwayland >/dev/null 2>&1 && X_RUNNING="yes(wayland)"

# Electron shell
SHELL_PID="$(pgrep -f '/usr/bin/sita-shell' | head -1 || echo "")"
SHELL_RSS_KB=0
if [[ -n "${SHELL_PID}" ]]; then
  SHELL_RSS_KB="$(awk '/VmRSS/ {print $2}' /proc/${SHELL_PID}/status 2>/dev/null || echo 0)"
fi

# Crash counter (incremented by shell-watchdog.sh)
CRASHES="$(read_or /var/lib/sita/state/shell-crash-count 0)"
LAST_CRASH="$(read_or /var/lib/sita/state/last-shell-crash none)"
SAFE_MODE="$(read_or /var/lib/sita/state/safe-mode.activated no)"

# Heartbeat
LOAD="$(awk '{print $1","$2","$3}' /proc/loadavg 2>/dev/null || echo "0,0,0")"
MEM_FREE_MB="$(awk '/MemAvailable/ {printf "%.0f", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)"

cat > "${OUT}" <<JSON
{
  "collectedAt":   "$(now_iso)",
  "services": {
    "sita-runtime":        "${S_RUNTIME}",
    "sita-recovery-shell": "${S_RECOVERY_SHELL}",
    "sita-updated":        "${S_UPDATED}",
    "sita-firstboot":      "${S_FIRSTBOOT}"
  },
  "xServerRunning":  "${X_RUNNING}",
  "shellPid":        "${SHELL_PID}",
  "shellRssKb":      ${SHELL_RSS_KB:-0},
  "shellCrashCount": ${CRASHES:-0},
  "lastShellCrash":  "$(json_escape "${LAST_CRASH}")",
  "safeMode":        "${SAFE_MODE}",
  "loadAvg":         [${LOAD}],
  "memAvailableMb":  ${MEM_FREE_MB:-0}
}
JSON
echo "✅ runtime-health → ${OUT} (shell pid: ${SHELL_PID:-none}, crashes: ${CRASHES})"
