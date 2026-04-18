#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Repair: Runtime Services
#
# Restarts failed sita-* units in canonical dependency order.
# Idempotent. Stops at the first hard failure so the operator can
# diagnose without a cascade.
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

echo "── repair-runtime-services ───────────────────────────────"

# Canonical dependency order: foundational daemons first, UI last.
ORDER=(
  "sita-settingsd.service"
  "sita-timed.service"
  "sita-crashd.service"
  "sita-healthd.service"
  "sita-accessibilityd.service"
  "sita-runtime.service"
)

REPAIRED=()
SKIPPED=()
FAILED=()

for unit in "${ORDER[@]}"; do
  state="$(systemctl is-active "${unit}" 2>/dev/null || echo inactive)"
  result="$(systemctl show -p Result --value "${unit}" 2>/dev/null || echo unknown)"

  if [[ "${state}" == "active" && "${result}" == "success" ]]; then
    SKIPPED+=("${unit}")
    continue
  fi

  echo "→ ${unit} (state=${state} result=${result}) — restarting"
  systemctl reset-failed "${unit}" 2>/dev/null || true

  if systemctl restart "${unit}"; then
    sleep 2
    new_state="$(systemctl is-active "${unit}" 2>/dev/null || echo inactive)"
    if [[ "${new_state}" == "active" ]]; then
      REPAIRED+=("${unit}")
      echo "  ✓ ${unit} now active"
    else
      FAILED+=("${unit}")
      echo "  ❌ ${unit} restart did not stick (state=${new_state})"
      echo "     journalctl -u ${unit} -n 50"
      break  # stop cascade so operator can diagnose
    fi
  else
    FAILED+=("${unit}")
    echo "  ❌ systemctl restart ${unit} returned non-zero"
    break
  fi
done

echo ""
echo "── summary ──"
echo "  already healthy: ${#SKIPPED[@]}  (${SKIPPED[*]:-none})"
echo "  repaired:        ${#REPAIRED[@]} (${REPAIRED[*]:-none})"
echo "  failed:          ${#FAILED[@]}   (${FAILED[*]:-none})"

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo "❌ unrecoverable — see runbook: docs/os/runbooks/shell-crash-loop.md"
  exit 1
fi

echo "✅ runtime services healthy"
exit 0
