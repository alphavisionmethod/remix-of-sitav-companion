#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Recovery + Rescue Shell (Phase 5)
#
# Boot entry registered as: "SITA Recovery"
# Provides:
#   1. Factory reset (re-extracts pristine slot-A image, wipes data)
#   2. A/B rollback (mark inactive slot as next-boot)
#   3. Rescue shell (read-only root, network, basic tools)
#   4. Crash dump uploader (forwards /var/lib/sita/crashes/* to support edge fn)
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ACTION="${1:-menu}"

banner() {
  clear
  cat <<'BANNER'
╔══════════════════════════════════════════════════════════════════╗
║                    SITA OS — Recovery Console                    ║
║                                                                  ║
║  Your data is safe. This environment is read-only by default.    ║
╚══════════════════════════════════════════════════════════════════╝
BANNER
}

menu() {
  banner
  cat <<MENU

  1) Roll back to previous version (A/B swap)
  2) Reset to factory defaults (DESTROYS USER DATA)
  3) Open rescue shell
  4) Upload crash dumps to support
  5) Run hardware diagnostics
  6) Reboot

MENU
  read -rp "Choose: " choice
  case "${choice}" in
    1) action_rollback;;
    2) action_factory_reset;;
    3) action_rescue;;
    4) action_upload_crashes;;
    5) action_diagnostics;;
    6) systemctl reboot;;
    *) menu;;
  esac
}

action_rollback() {
  CURRENT="$(cat /etc/sita/slot 2>/dev/null || echo a)"
  OTHER=$([ "${CURRENT}" = "a" ] && echo b || echo a)
  echo "Current slot: ${CURRENT}  →  Rolling back to slot ${OTHER}"
  bootctl set-oneshot "sita-${OTHER}.conf"
  echo "Rollback armed. Reboot to apply."
  read -rp "Press Enter to reboot…" && systemctl reboot
}

action_factory_reset() {
  echo "⚠  This will erase /home, /var, all user accounts, and re-flash slot A."
  read -rp "Type FACTORY-RESET to confirm: " confirm
  [[ "${confirm}" = "FACTORY-RESET" ]] || { echo "Cancelled."; return; }
  cryptsetup close sita-data 2>/dev/null || true
  wipefs -a /dev/disk/by-partlabel/sita_data
  dd if=/run/recovery/sita-pristine.img of=/dev/disk/by-partlabel/sita_root_a bs=64M status=progress
  echo "Factory reset complete. Rebooting…"
  systemctl reboot
}

action_rescue() {
  banner
  echo "Rescue shell (root is READ-ONLY). Type 'exit' to return."
  /bin/bash --rcfile <(echo 'PS1="\[\033[1;31m\]rescue\[\033[0m\] # "')
  menu
}

action_upload_crashes() {
  COUNT=$(ls -1 /var/lib/sita/crashes/*.gz 2>/dev/null | wc -l)
  if [[ "${COUNT}" = "0" ]]; then echo "No crash dumps to upload."; sleep 2; menu; return; fi
  DEVICE_ID="$(cat /var/lib/sita/proof/device-id 2>/dev/null || echo unknown)"
  for f in /var/lib/sita/crashes/*.gz; do
    curl --fail --silent --max-time 60 \
      -H "X-SITA-Device: ${DEVICE_ID}" \
      -F "dump=@${f}" \
      "https://crashes.sita.os/v1/submit" \
      && rm "${f}" \
      && echo "✓ uploaded $(basename "${f}")" \
      || echo "✗ failed $(basename "${f}")"
  done
  read -rp "Press Enter to continue…" && menu
}

action_diagnostics() {
  banner
  echo "Hardware diagnostics:"
  echo "  CPU:       $(nproc) cores, $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
  echo "  Memory:    $(free -h | awk '/^Mem:/ {print $2 " total, " $7 " available"}')"
  echo "  Disks:     $(lsblk -dn -o NAME,SIZE,MODEL | head -5)"
  echo "  TPM:       $([ -e /dev/tpm0 ] && echo present || echo absent)"
  echo "  EFI:       $([ -d /sys/firmware/efi ] && echo yes || echo no)"
  echo "  Slot A OK: $(verity-verify /dev/disk/by-partlabel/sita_root_a /dev/disk/by-partlabel/sita_verity_a 2>&1 | tail -1)"
  read -rp "Press Enter to continue…" && menu
}

case "${ACTION}" in
  menu) menu;;
  rollback) action_rollback;;
  factory-reset) action_factory_reset;;
  rescue) action_rescue;;
  upload-crashes) action_upload_crashes;;
  diagnostics) action_diagnostics;;
  *) echo "unknown action: ${ACTION}"; exit 1;;
esac
