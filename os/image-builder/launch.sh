#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Desktop Shell Launcher (canonical xinit entrypoint)
#
# Invoked by sita-runtime.service via:
#   xinit /opt/sita/shell/launch.sh -- :0 vt7 -nolisten tcp
#
# Delegates to the canonical shell watchdog, which in turn launches
# /usr/bin/sita-shell (Electron) with crash-counting + safe-mode +
# recovery-shell escalation. There is exactly one launch path.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

# Mark X session ready for health checks
mkdir -p /run/sita
echo "$(date +%s)" > /run/sita/x-session-ready

# Ensure crash + state dirs (idempotent)
install -d -m 0755 -o sita -g sita /var/lib/sita/state /var/log/sita/crashes 2>/dev/null || true

WATCHDOG="/opt/sita/runtime/shell-watchdog.sh"
if [[ ! -x "${WATCHDOG}" ]]; then
  echo "❌ canonical watchdog missing: ${WATCHDOG}" >&2
  # Fail loudly so systemd Restart=on-failure kicks in (not infinite loop)
  exit 127
fi

exec "${WATCHDOG}"
