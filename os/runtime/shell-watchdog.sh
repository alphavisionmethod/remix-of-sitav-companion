#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Electron Shell Watchdog
#
# Wraps /usr/bin/sita-shell. Counts consecutive crashes within a window;
# on threshold, escalates from a normal restart → safe-mode → recovery
# shell on TTY7. Writes structured crash records the support bundle
# already collects from /var/log/sita/crashes/.
#
# Configured via systemd ExecStart in sita-runtime.service, e.g.:
#   ExecStart=/opt/sita/runtime/shell-watchdog.sh
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

SHELL_BIN="${SITA_SHELL_BIN:-/usr/bin/sita-shell}"
STATE_DIR="/var/lib/sita/state"
CRASH_DIR="/var/log/sita/crashes"
mkdir -p "${STATE_DIR}" "${CRASH_DIR}"

COUNT_FILE="${STATE_DIR}/shell-crash-count"
LAST_FILE="${STATE_DIR}/last-shell-crash"
SAFE_FILE="${STATE_DIR}/safe-mode.activated"

WINDOW_SEC="${SITA_CRASH_WINDOW_SEC:-60}"
THRESHOLD_SAFE="${SITA_CRASH_THRESHOLD_SAFE:-3}"
THRESHOLD_RECOVERY="${SITA_CRASH_THRESHOLD_RECOVERY:-5}"

now_epoch() { date +%s; }
now_iso()   { date -u +%Y-%m-%dT%H:%M:%SZ; }

read_count() { [[ -f "${COUNT_FILE}" ]] && cat "${COUNT_FILE}" || echo 0; }
write_count() { echo "$1" > "${COUNT_FILE}"; }

reset_window_if_stale() {
  [[ -f "${LAST_FILE}" ]] || { write_count 0; return; }
  local last_epoch
  last_epoch="$(stat -c %Y "${LAST_FILE}" 2>/dev/null || echo 0)"
  if (( $(now_epoch) - last_epoch > WINDOW_SEC )); then
    write_count 0
  fi
}

record_crash() {
  local rc="$1"
  local count
  reset_window_if_stale
  count=$(( $(read_count) + 1 ))
  write_count "${count}"
  echo "{\"ts\":\"$(now_iso)\",\"exitCode\":${rc},\"count\":${count}}" > "${LAST_FILE}"

  # crash blob (picked up by support bundle generator)
  local blob="${CRASH_DIR}/shell-$(date -u +%Y%m%dT%H%M%SZ).log"
  {
    echo "ts: $(now_iso)"
    echo "exitCode: ${rc}"
    echo "count: ${count}"
    echo "version: $(cat /etc/sita/version 2>/dev/null || echo unknown)"
    echo "slot: $(cat /etc/sita/slot 2>/dev/null || echo unknown)"
    echo "--- last 200 journal lines (sita-runtime) ---"
    journalctl -u sita-runtime.service -n 200 --no-pager 2>/dev/null || true
  } > "${blob}"
  gzip -f "${blob}" || true
  echo "${count}"
}

escalate() {
  local count="$1"
  if (( count >= THRESHOLD_RECOVERY )); then
    echo "🚨 shell crashed ${count}× in ${WINDOW_SEC}s — escalating to recovery shell on TTY7" >&2
    systemctl start sita-recovery-shell.service 2>/dev/null || true
    # let systemd take over restart policy; exit non-zero
    exit 69
  fi
  if (( count >= THRESHOLD_SAFE )); then
    echo "⚠  shell crashed ${count}× — entering safe-mode for next launch" >&2
    echo "$(now_iso)" > "${SAFE_FILE}"
  fi
}

# ── main loop (single attempt; systemd Restart=on-failure handles loop) ──
ARGS=()
if [[ -f "${SAFE_FILE}" ]]; then
  echo "ℹ  safe-mode marker present → launching with --safe-mode" >&2
  ARGS+=(--safe-mode --no-extensions)
fi

if [[ ! -x "${SHELL_BIN}" ]]; then
  echo "❌ ${SHELL_BIN} not found or not executable" >&2
  count="$(record_crash 127)"
  escalate "${count}"
  exit 127
fi

set +e
"${SHELL_BIN}" "${ARGS[@]}"
RC=$?
set -e

if [[ "${RC}" -eq 0 ]]; then
  # clean exit → reset crash counter and clear safe-mode
  write_count 0
  rm -f "${SAFE_FILE}"
  exit 0
fi

count="$(record_crash "${RC}")"
escalate "${count}"
exit "${RC}"
