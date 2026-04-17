#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — QEMU Production Validation
#
# Stronger than qemu-test.sh: boots the ISO headless, captures serial,
# asserts each milestone, fails non-zero on any missing assertion.
#
# Assertions (in order):
#   1. kernel reaches userspace                  ("systemd[1]: Reached")
#   2. sita-firstboot.service starts             ("Starting SITA OS First Boot")
#   3. sita-runtime.service starts OR shell line ("SITA OS Desktop Shell" / "sita-runtime")
#   4. no kernel panic                           (absence check)
#   5. no verity corruption                      (absence check)
#
# Outputs:
#   out/qemu-validation.log           full serial log
#   out/qemu-validation-report.json   structured pass/fail report
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

ISO="${1:-$(ls -t out/sita-os-*.iso 2>/dev/null | head -1 || true)}"
[[ -f "${ISO}" ]] || { echo "no ISO — run sudo bash os/image-builder/build.sh" >&2; exit 2; }

OVMF="/usr/share/OVMF/OVMF_CODE.fd"
[[ -f "${OVMF}" ]] || { echo "apt install ovmf" >&2; exit 2; }

OUT_DIR="out"
LOG="${OUT_DIR}/qemu-validation.log"
REPORT="${OUT_DIR}/qemu-validation-report.json"
TIMEOUT="${SITA_QEMU_TIMEOUT:-180}"

echo "🚀 booting ${ISO} (timeout ${TIMEOUT}s)"
timeout --preserve-status "${TIMEOUT}" \
  qemu-system-x86_64 \
    -m 3G -smp 2 -cpu qemu64 \
    -drive if=pflash,format=raw,readonly=on,file="${OVMF}" \
    -cdrom "${ISO}" -boot d \
    -netdev user,id=net0 -device virtio-net-pci,netdev=net0 \
    -display none -nographic \
    -serial mon:stdio 2>&1 | tee "${LOG}" || true

declare -A checks=(
  [kernel-userspace]="systemd\[1\]: Reached|systemd\[1\]: Starting"
  [first-boot]="SITA OS First Boot|sita-firstboot"
  [runtime-shell]="SITA OS Desktop Shell|sita-runtime"
)
declare -A negative=(
  [no-kernel-panic]="Kernel panic"
  [no-verity-corruption]="dm-verity: corruption|verity verification failed"
)

results=()
fail=0

for name in "${!checks[@]}"; do
  if grep -qE "${checks[$name]}" "${LOG}"; then
    results+=("{\"check\":\"${name}\",\"status\":\"pass\"}")
    echo "  ✅ ${name}"
  else
    results+=("{\"check\":\"${name}\",\"status\":\"fail\"}")
    echo "  ❌ ${name}"
    fail=$((fail+1))
  fi
done

for name in "${!negative[@]}"; do
  if grep -qE "${negative[$name]}" "${LOG}"; then
    results+=("{\"check\":\"${name}\",\"status\":\"fail\"}")
    echo "  ❌ ${name} (forbidden pattern present)"
    fail=$((fail+1))
  else
    results+=("{\"check\":\"${name}\",\"status\":\"pass\"}")
    echo "  ✅ ${name}"
  fi
done

printf '{"validatedAt":"%s","iso":"%s","timeoutSec":%d,"results":[%s],"failures":%d}\n' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(basename "${ISO}")" "${TIMEOUT}" \
  "$(IFS=,; echo "${results[*]}")" "${fail}" > "${REPORT}"

echo "📄 report: ${REPORT}"
[[ "${fail}" -eq 0 ]] && { echo "✅ QEMU validation PASS"; exit 0; } || { echo "❌ ${fail} assertion(s) failed"; exit 1; }
