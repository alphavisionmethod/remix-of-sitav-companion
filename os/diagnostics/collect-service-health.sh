#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Per-Service Health Collector
#
# Emits a structured per-unit health summary consumed by the support
# bundle and by sita-ops status. Idempotent, safe to run from cron.
#
# Output: /var/lib/sita/diagnostics/service-health.json
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

OUT_DIR="/var/lib/sita/diagnostics"
OUT="${OUT_DIR}/service-health.json"
mkdir -p "${OUT_DIR}"

UNITS=(
  "sita-firstboot.service"
  "sita-runtime.service"
  "sita-recovery-shell.service"
  "sita-updated.service"
  "sita-updated.timer"
  "sita-healthd.service"
  "sita-crashd.service"
  "sita-settingsd.service"
  "sita-timed.service"
  "sita-accessibilityd.service"
)

entries=()
for u in "${UNITS[@]}"; do
  load="$(systemctl show -p LoadState --value "${u}" 2>/dev/null || echo unknown)"
  active="$(systemctl show -p ActiveState --value "${u}" 2>/dev/null || echo unknown)"
  sub="$(systemctl show -p SubState --value "${u}" 2>/dev/null || echo unknown)"
  result="$(systemctl show -p Result --value "${u}" 2>/dev/null || echo unknown)"
  nrestarts="$(systemctl show -p NRestarts --value "${u}" 2>/dev/null || echo 0)"
  mainpid="$(systemctl show -p MainPID --value "${u}" 2>/dev/null || echo 0)"
  since="$(systemctl show -p ActiveEnterTimestamp --value "${u}" 2>/dev/null || echo "")"
  rss_kb=0
  if [[ "${mainpid}" != "0" && -r "/proc/${mainpid}/status" ]]; then
    rss_kb="$(awk '/VmRSS/ {print $2}' "/proc/${mainpid}/status" 2>/dev/null || echo 0)"
  fi
  entries+=("    {\"unit\":\"${u}\",\"load\":\"${load}\",\"active\":\"${active}\",\"sub\":\"${sub}\",\"result\":\"${result}\",\"restarts\":${nrestarts:-0},\"pid\":${mainpid:-0},\"rssKB\":${rss_kb:-0},\"since\":\"${since}\"}")
done

cat > "${OUT}" <<JSON
{
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "host": "$(hostname)",
  "services": [
$(IFS=$',\n'; echo "${entries[*]}")
  ]
}
JSON

echo "✅ service-health → ${OUT}"
