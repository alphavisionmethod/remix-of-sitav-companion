#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Shell Health Probe
#
# Used by ExecStartPost and by metrics-agent. Exits 0 if the Electron
# shell is running and responsive; non-zero with a reason otherwise.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

reason() { echo "$1" >&2; exit "$2"; }

PID="$(pgrep -f '/usr/bin/sita-shell' | head -1 || true)"
[[ -n "${PID}" ]] || reason "shell-not-running" 10

# X server present?
if ! pgrep -x Xorg >/dev/null 2>&1 && ! pgrep -x Xwayland >/dev/null 2>&1; then
  reason "no-display-server" 11
fi

# Memory sanity (RSS < 4 GiB) — catches runaway leaks
RSS_KB="$(awk '/VmRSS/ {print $2}' "/proc/${PID}/status" 2>/dev/null || echo 0)"
if (( RSS_KB > 4194304 )); then
  reason "shell-rss-exceeded:${RSS_KB}KB" 12
fi

# Optional: IPC readiness probe (Electron writes a ready file)
READY_FILE="/run/sita/shell-ready"
if [[ -e "${READY_FILE}" ]]; then
  AGE=$(( $(date +%s) - $(stat -c %Y "${READY_FILE}" 2>/dev/null || echo 0) ))
  (( AGE < 86400 )) || reason "ready-file-stale:${AGE}s" 13
fi

echo "ok pid=${PID} rss=${RSS_KB}KB"
exit 0
