#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Repair: Electron Shell
#
# Clears safe-mode marker, resets crash counters, restarts sita-runtime.
# Idempotent. Safe to run repeatedly.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

echo "── repair-shell ──────────────────────────────────────────"

SAFE_MARKER="/var/lib/sita/state/safe-mode-marker"
CRASH_COUNTER="/var/lib/sita/state/shell-crash-counter"
HEARTBEAT="/var/lib/sita/state/shell-heartbeat"

# 1. clear safe-mode escalation
if [[ -f "${SAFE_MARKER}" ]]; then
  rm -f "${SAFE_MARKER}" && echo "✓ cleared safe-mode marker"
fi

# 2. reset watchdog crash counter
if [[ -f "${CRASH_COUNTER}" ]]; then
  echo "0" > "${CRASH_COUNTER}.tmp" && mv -f "${CRASH_COUNTER}.tmp" "${CRASH_COUNTER}"
  echo "✓ reset crash counter"
fi

# 3. clear stale heartbeat (forces health probe to wait for fresh write)
rm -f "${HEARTBEAT}" 2>/dev/null && echo "✓ cleared stale heartbeat"

# 4. stop any orphaned shell processes
if pgrep -f '/usr/bin/sita-shell' >/dev/null 2>&1; then
  echo "→ killing orphaned sita-shell processes"
  pkill -TERM -f '/usr/bin/sita-shell' || true
  sleep 2
  pkill -KILL -f '/usr/bin/sita-shell' 2>/dev/null || true
fi

# 5. clean up X locks if Xorg crashed
for lock in /tmp/.X0-lock /tmp/.X11-unix/X0; do
  [[ -e "${lock}" ]] && ! pgrep -x Xorg >/dev/null && rm -f "${lock}" && echo "✓ removed stale ${lock}"
done

# 6. restart the unit
echo "→ restarting sita-runtime.service"
systemctl reset-failed sita-runtime.service 2>/dev/null || true
systemctl restart sita-runtime.service

# 7. wait for shell-ready (up to 30s)
for i in $(seq 1 30); do
  if [[ -e /run/sita/shell-ready ]]; then
    echo "✅ shell up after ${i}s"
    exit 0
  fi
  sleep 1
done

echo "❌ shell did not signal ready within 30s — see: journalctl -u sita-runtime -n 100"
exit 1
