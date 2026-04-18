# shellcheck shell=bash
# Common helpers for SITA OS diagnostics collectors.

DIAG_DIR_DEFAULT="/var/lib/sita/diagnostics"

diag_dir() {
  local d="${SITA_DIAG_DIR:-${DIAG_DIR_DEFAULT}}"
  if ! mkdir -p "${d}" 2>/dev/null; then
    d="/tmp/sita-diagnostics"
    mkdir -p "${d}"
  fi
  echo "${d}"
}

now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

read_or() { [[ -f "$1" ]] && cat "$1" 2>/dev/null || echo "$2"; }

unit_active() { systemctl is-active "$1" 2>/dev/null || echo unknown; }
unit_enabled() { systemctl is-enabled "$1" 2>/dev/null || echo unknown; }

json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g' | tr -d '\n\r'; }
