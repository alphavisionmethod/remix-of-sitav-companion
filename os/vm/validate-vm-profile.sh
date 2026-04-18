#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — VM Profile Validator
#
# Runs the right validation harness for a given hypervisor profile.
# Honest: profiles without an installed CLI are reported as "skipped",
# never as "passed".
#
# Usage:
#   bash os/vm/validate-vm-profile.sh qemu
#   bash os/vm/validate-vm-profile.sh vmware
#   bash os/vm/validate-vm-profile.sh virtualbox
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

PROFILE="${1:-qemu}"
ROOT="$(dirname "$(readlink -f "$0")")/.."
OUT_DIR="${ROOT}/../out"
mkdir -p "${OUT_DIR}"
REPORT="${OUT_DIR}/vm-profile-${PROFILE}.json"

write_report() {
  cat > "${REPORT}" <<JSON
{
  "profile":  "${PROFILE}",
  "status":   "$1",
  "reason":   "$2",
  "ranAt":    "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON
  echo "📄 ${REPORT}"
}

case "${PROFILE}" in
  qemu)
    if ! command -v qemu-system-x86_64 >/dev/null 2>&1; then
      write_report "skipped" "qemu-system-x86_64 not installed"
      exit 0
    fi
    if bash "${ROOT}/qemu-validate.sh"; then
      write_report "passed" "qemu-validate.sh assertions all green"
      exit 0
    else
      write_report "failed" "qemu-validate.sh reported failures"
      exit 1
    fi
    ;;

  vmware)
    OVA="$(ls -t ${OUT_DIR}/sita-os-*.ova 2>/dev/null | head -1 || true)"
    if [[ -z "${OVA}" ]]; then
      write_report "skipped" "no .ova in out/ — run npm run os:vmware:ova first"
      exit 0
    fi
    if ! command -v vmrun >/dev/null 2>&1; then
      write_report "skipped" "vmrun not installed (VMware Workstation/Fusion required)"
      exit 0
    fi
    # Best-effort headless boot probe (timeout 90s)
    TMP="$(mktemp -d)"
    if vmrun -T ws start "${OVA}" nogui >"${TMP}/log" 2>&1; then
      sleep 30
      vmrun -T ws stop "${OVA}" hard >/dev/null 2>&1 || true
      write_report "passed" "vmrun started+stopped OVA"
      exit 0
    else
      write_report "failed" "vmrun could not start OVA: $(head -1 "${TMP}/log")"
      exit 1
    fi
    ;;

  virtualbox)
    OVA="$(ls -t ${OUT_DIR}/sita-os-*.ova 2>/dev/null | head -1 || true)"
    if [[ -z "${OVA}" ]]; then
      write_report "skipped" "no .ova in out/ — run npm run os:vmware:ova first"
      exit 0
    fi
    if ! command -v VBoxManage >/dev/null 2>&1; then
      write_report "skipped" "VBoxManage not installed"
      exit 0
    fi
    NAME="sita-vm-validate-$$"
    if VBoxManage import "${OVA}" --vsys 0 --vmname "${NAME}" >/dev/null 2>&1; then
      VBoxManage startvm "${NAME}" --type headless >/dev/null 2>&1 || true
      sleep 45
      VBoxManage controlvm "${NAME}" poweroff >/dev/null 2>&1 || true
      VBoxManage unregistervm "${NAME}" --delete >/dev/null 2>&1 || true
      write_report "passed" "VBoxManage import+headless boot succeeded"
      exit 0
    else
      write_report "failed" "VBoxManage import failed"
      exit 1
    fi
    ;;

  *)
    write_report "skipped" "unknown profile: ${PROFILE}"
    echo "❌ unknown profile: ${PROFILE}" >&2
    echo "   valid: qemu | vmware | virtualbox" >&2
    exit 2
    ;;
esac
