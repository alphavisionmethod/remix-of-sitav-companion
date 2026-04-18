#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Boot Target Validator
#
# Asserts the system reached graphical.target with all required SITA
# units active and no critical failures. Emits structured JSON for the
# support bundle and exits non-zero on any error.
#
# Usage: sudo /opt/sita/diagnostics/check-boot-target.sh
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

OUT_DIR="/var/lib/sita/diagnostics"
OUT="${OUT_DIR}/boot-target.json"
mkdir -p "${OUT_DIR}"

REQUIRED_UNITS=(
  "sita-firstboot.service"
  "sita-runtime.service"
  "sita-healthd.service"
  "sita-settingsd.service"
  "sita-crashd.service"
  "sita-timed.service"
)

DEFAULT_TARGET="$(systemctl get-default 2>/dev/null || echo unknown)"
ACTIVE_TARGET="$(systemctl list-units --type=target --state=active --no-legend --plain \
  | awk '{print $1}' | grep -E '^(graphical|multi-user|sita-recovery)\.target$' | head -1 || echo none)"

declare -a unit_states=()
declare -a failed=()
overall_ok=true

for u in "${REQUIRED_UNITS[@]}"; do
  state="$(systemctl is-active "${u}" 2>/dev/null || echo inactive)"
  sub="$(systemctl show -p SubState --value "${u}" 2>/dev/null || echo unknown)"
  unit_states+=("    {\"unit\":\"${u}\",\"active\":\"${state}\",\"sub\":\"${sub}\"}")
  if [[ "${state}" != "active" && "${u}" != "sita-firstboot.service" ]]; then
    failed+=("${u}")
    overall_ok=false
  fi
done

# Critical failed units anywhere on the system
CRIT_FAILED="$(systemctl --failed --no-legend --plain 2>/dev/null | awk '{print $1}' | tr '\n' ',' | sed 's/,$//')"
[[ -n "${CRIT_FAILED}" ]] && overall_ok=false

# First-boot completion
FB_COMPLETE="false"
[[ -f /var/lib/sita/.first-boot-complete ]] && FB_COMPLETE="true"

cat > "${OUT}" <<JSON
{
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "defaultTarget": "${DEFAULT_TARGET}",
  "activeTarget": "${ACTIVE_TARGET}",
  "firstBootComplete": ${FB_COMPLETE},
  "requiredUnits": [
$(IFS=$',\n'; echo "${unit_states[*]}")
  ],
  "failedUnits": "${CRIT_FAILED}",
  "missing": [$(printf '"%s",' "${failed[@]}" | sed 's/,$//')] ,
  "ok": ${overall_ok}
}
JSON

if [[ "${overall_ok}" == "true" ]]; then
  echo "✅ boot-target OK (${ACTIVE_TARGET})"
  exit 0
else
  echo "❌ boot-target FAILED — see ${OUT}"
  [[ ${#failed[@]} -gt 0 ]] && echo "   missing: ${failed[*]}"
  [[ -n "${CRIT_FAILED}" ]] && echo "   failed:  ${CRIT_FAILED}"
  exit 1
fi
