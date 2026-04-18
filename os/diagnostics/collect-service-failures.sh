#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Service Failures Collector
# Captures every failed systemd unit + last 50 log lines for each.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail
HERE="$(dirname "$(readlink -f "$0")")"
. "${HERE}/_lib.sh"

DIR="$(diag_dir)"
OUT="${DIR}/service-failures.json"
LOG_DIR="${DIR}/failed-unit-logs"
mkdir -p "${LOG_DIR}"

if ! command -v systemctl >/dev/null 2>&1; then
  echo '{"collectedAt":"'"$(now_iso)"'","systemd":false,"failures":[]}' > "${OUT}"
  echo "ℹ  systemd not present — empty report at ${OUT}"
  exit 0
fi

mapfile -t UNITS < <(systemctl --failed --no-legend --plain 2>/dev/null | awk '{print $1}')

entries=()
for u in "${UNITS[@]}"; do
  [[ -z "${u}" ]] && continue
  state="$(unit_active "${u}")"
  enabled="$(unit_enabled "${u}")"
  log="${LOG_DIR}/${u}.log"
  journalctl -u "${u}" -n 50 --no-pager > "${log}" 2>/dev/null || true
  entries+=("{\"unit\":\"$(json_escape "${u}")\",\"active\":\"${state}\",\"enabled\":\"${enabled}\",\"logFile\":\"${log}\"}")
done

printf '{"collectedAt":"%s","systemd":true,"failureCount":%d,"failures":[%s]}\n' \
  "$(now_iso)" "${#entries[@]}" "$(IFS=,; echo "${entries[*]}")" > "${OUT}"

echo "✅ service-failures → ${OUT} (count: ${#entries[@]})"
