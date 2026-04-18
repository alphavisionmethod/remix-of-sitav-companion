#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Repair: First-Boot Provisioning
#
# Re-runs first-boot provisioning idempotently. Safe to invoke when:
#   - /var/lib/sita/.first-boot-complete is missing
#   - first-boot was interrupted (power loss, crash)
#   - operator wants to re-validate provisioning state
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

echo "── repair-first-boot ─────────────────────────────────────"

MARKER="/var/lib/sita/.first-boot-complete"
SCRIPT="/opt/sita/deploy/first-boot.sh"
LOG="/var/log/sita-firstboot.log"

mkdir -p /var/lib/sita

# 1. baseline checks
if [[ ! -x "${SCRIPT}" ]]; then
  echo "❌ first-boot script not found at ${SCRIPT}"
  echo "   image may be corrupt — recommend rollback (sita-ops rollback)"
  exit 2
fi

# 2. capture current state
WAS_COMPLETE="false"
[[ -f "${MARKER}" ]] && WAS_COMPLETE="true"
echo "→ marker present before: ${WAS_COMPLETE}"

# 3. remove marker so first-boot.sh re-runs (it must be idempotent)
rm -f "${MARKER}"

# 4. re-run with output captured
echo "→ executing ${SCRIPT}"
if "${SCRIPT}" 2>&1 | tee -a "${LOG}"; then
  echo "✓ first-boot script completed"
else
  rc=$?
  echo "❌ first-boot script failed with rc=${rc}"
  echo "   tail of ${LOG}:"
  tail -n 30 "${LOG}" 2>/dev/null || true
  exit "${rc}"
fi

# 5. verify marker
if [[ ! -f "${MARKER}" ]]; then
  echo "❌ marker not written — first-boot.sh exited 0 but did not complete"
  exit 3
fi

# 6. restart dependent units
echo "→ restarting dependent units"
systemctl reset-failed sita-runtime.service 2>/dev/null || true
systemctl restart sita-runtime.service || true

echo "✅ first-boot repair complete"
exit 0
