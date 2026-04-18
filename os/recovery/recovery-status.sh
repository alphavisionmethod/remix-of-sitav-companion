#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Recovery Status
#
# Read-only inspection of the running system's recovery-relevant state.
# Safe to run in normal mode or recovery mode. Emits human-readable text
# AND a structured JSON snapshot to /var/lib/sita/diagnostics/recovery-status.json
# (or ./recovery-status.json when /var/lib/sita is read-only).
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

OUT_DIR="/var/lib/sita/diagnostics"
mkdir -p "${OUT_DIR}" 2>/dev/null || OUT_DIR="$(pwd)"
JSON="${OUT_DIR}/recovery-status.json"

read_or() { [[ -f "$1" ]] && cat "$1" 2>/dev/null || echo "$2"; }

VERSION="$(read_or /etc/sita/version unknown)"
CHANNEL="$(read_or /etc/sita/channel unknown)"
SLOT="$(read_or /etc/sita/slot unknown)"
LAST_GOOD="$(read_or /var/lib/sita/last-known-good.slot unknown)"
PENDING_UPDATE="$(read_or /var/lib/sita/update/pending.json none)"
ROLLBACK_MARKER="no"
[[ -f /var/lib/sita/rollbacks/.armed ]] && ROLLBACK_MARKER="yes"
[[ -f /opt/sita/.rollback-ready    ]] && ROLLBACK_MARKER="yes"

# verity state (best-effort)
VERITY_STATE="unknown"
if command -v veritysetup >/dev/null 2>&1; then
  if veritysetup status sita_root >/dev/null 2>&1; then
    VERITY_STATE="active"
  else
    VERITY_STATE="inactive"
  fi
fi

# shell crash counter (set by shell-watchdog.sh)
SHELL_CRASHES="$(read_or /var/lib/sita/state/shell-crash-count 0)"
SAFE_MODE="$(read_or /var/lib/sita/state/safe-mode.activated no)"

# failed systemd units (count + names)
FAILED_UNITS_COUNT=0
FAILED_UNITS=""
if command -v systemctl >/dev/null 2>&1; then
  FAILED_UNITS="$(systemctl --failed --no-legend --plain 2>/dev/null | awk '{print $1}' | tr '\n' ',' | sed 's/,$//')"
  FAILED_UNITS_COUNT="$(systemctl --failed --no-legend --plain 2>/dev/null | wc -l)"
fi

# core sita services
core_status() {
  systemctl is-active "$1" 2>/dev/null || echo "unknown"
}
S_FIRSTBOOT="$(core_status sita-firstboot.service)"
S_RUNTIME="$(core_status sita-runtime.service)"
S_UPDATED="$(core_status sita-updated.service)"
S_RECOVERY="$(core_status sita-recovery.service)"

# boot success (systemd-bless-boot)
BLESS_STATE="unknown"
if command -v systemd-bless-boot >/dev/null 2>&1; then
  BLESS_STATE="$(systemd-bless-boot status 2>/dev/null | head -1 || echo unknown)"
fi

cat <<EOF
╔══════════════════════════════════════════════════════════════════╗
║              SITA OS — Recovery Status Snapshot                  ║
╚══════════════════════════════════════════════════════════════════╝

  Version:           ${VERSION}
  Channel:           ${CHANNEL}
  Active slot:       ${SLOT}    (last-known-good: ${LAST_GOOD})
  Boot blessed:      ${BLESS_STATE}
  dm-verity:         ${VERITY_STATE}
  Pending update:    ${PENDING_UPDATE}
  Rollback armed:    ${ROLLBACK_MARKER}
  Safe-mode marker:  ${SAFE_MODE}
  Shell crashes:     ${SHELL_CRASHES}

  Core services:
    sita-firstboot:  ${S_FIRSTBOOT}
    sita-runtime:    ${S_RUNTIME}
    sita-updated:    ${S_UPDATED}
    sita-recovery:   ${S_RECOVERY}

  Failed units (${FAILED_UNITS_COUNT}):
    ${FAILED_UNITS:-<none>}

  Next steps:
    sudo os/recovery/recovery-entry.sh        # open recovery menu
    sudo os/recovery/recovery-collect.sh      # generate support bundle
    sudo os/scripts/rollback-to-previous.sh   # arm rollback
EOF

# JSON snapshot
cat > "${JSON}" <<JSON
{
  "collectedAt":      "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version":          "${VERSION}",
  "channel":          "${CHANNEL}",
  "slot":             "${SLOT}",
  "lastKnownGood":    "${LAST_GOOD}",
  "blessState":       "${BLESS_STATE}",
  "verityState":      "${VERITY_STATE}",
  "pendingUpdate":    "${PENDING_UPDATE}",
  "rollbackArmed":    "${ROLLBACK_MARKER}",
  "safeMode":         "${SAFE_MODE}",
  "shellCrashCount":  ${SHELL_CRASHES:-0},
  "services": {
    "firstboot":  "${S_FIRSTBOOT}",
    "runtime":    "${S_RUNTIME}",
    "updated":    "${S_UPDATED}",
    "recovery":   "${S_RECOVERY}"
  },
  "failedUnits": {
    "count": ${FAILED_UNITS_COUNT:-0},
    "list":  "${FAILED_UNITS}"
  }
}
JSON
echo ""
echo "📄 snapshot: ${JSON}"
