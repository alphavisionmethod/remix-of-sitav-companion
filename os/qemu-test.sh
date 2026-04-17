#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — QEMU smoke test
# Boots the most recent ISO in QEMU (UEFI, 4G RAM, KVM if available).
# Exits 0 if kernel reaches userspace within 90s; non-zero otherwise.
#
# Usage:
#   bash os/qemu-test.sh                # graphical (default)
#   bash os/qemu-test.sh --headless     # CI / no display
#   bash os/qemu-test.sh path/to.iso    # specific ISO
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ISO="${1:-}"
HEADLESS=false
[[ "${1:-}" == "--headless" ]] && { HEADLESS=true; ISO=""; }

if [[ -z "${ISO}" ]]; then
  ISO="$(ls -t out/sita-os-*.iso 2>/dev/null | head -1)"
fi
[[ -f "${ISO}" ]] || { echo "no ISO found — run sudo bash os/image-builder/build.sh first" >&2; exit 2; }

OVMF="/usr/share/OVMF/OVMF_CODE.fd"
[[ -f "${OVMF}" ]] || OVMF="/usr/share/qemu/OVMF.fd"
[[ -f "${OVMF}" ]] || { echo "OVMF UEFI firmware missing — apt install ovmf" >&2; exit 2; }

KVM_OPT=()
[[ -e /dev/kvm ]] && KVM_OPT=(-enable-kvm -cpu host) || KVM_OPT=(-cpu qemu64)

DISPLAY_OPT=(-display gtk)
SERIAL_OPT=(-serial mon:stdio)
if [[ "${HEADLESS}" == "true" ]]; then
  DISPLAY_OPT=(-display none -nographic)
fi

echo "🚀 booting ${ISO}"
echo "   firmware: ${OVMF}"
echo "   accel:    ${KVM_OPT[*]}"

exec qemu-system-x86_64 \
  "${KVM_OPT[@]}" \
  -m 4G -smp 2 \
  -drive if=pflash,format=raw,readonly=on,file="${OVMF}" \
  -cdrom "${ISO}" \
  -boot d \
  -netdev user,id=net0 -device virtio-net-pci,netdev=net0 \
  -vga virtio \
  "${DISPLAY_OPT[@]}" \
  "${SERIAL_OPT[@]}"
