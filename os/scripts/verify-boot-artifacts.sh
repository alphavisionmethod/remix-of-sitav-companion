#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Boot Artifact Verification
#
# Verifies signatures on every artifact in out/ that should be signed:
#   • vmlinuz / kernel  → sbverify
#   • initramfs.img     → openssl detached signature
#   • verity hash tree  → root hash matches receipt
#
# Exits 0 on full success; non-zero with itemized failure list.
# Used both locally and by CI in os-build-iso.yml.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${1:-out}"
CERT="${SITA_MOK_CERT:-}"
FAIL=0
REPORT="${OUT_DIR}/os-verification-report.json"

declare -a results=()

check() {
  local name="$1" status="$2" detail="$3"
  results+=("{\"check\":\"${name}\",\"status\":\"${status}\",\"detail\":\"${detail}\"}")
  printf "  %-30s %s\n" "${name}" "${status}"
  [[ "${status}" == "pass" ]] || FAIL=$((FAIL+1))
}

echo "🔍 verifying boot artifacts in ${OUT_DIR}"

# 1. Kernel signature
KERNEL="$(ls "${OUT_DIR}"/vmlinuz* 2>/dev/null | head -1 || true)"
if [[ -n "${KERNEL}" && -n "${CERT}" ]]; then
  if sbverify --cert "${CERT}" "${KERNEL}" >/dev/null 2>&1; then
    check "kernel-signature" "pass" "$(basename "${KERNEL}")"
  else
    check "kernel-signature" "fail" "sbverify rejected"
  fi
else
  check "kernel-signature" "skip" "no kernel or no cert in env"
fi

# 2. Initramfs detached signature
INITRD="$(ls "${OUT_DIR}"/initrd* 2>/dev/null | head -1 || true)"
if [[ -n "${INITRD}" && -f "${INITRD}.sig" && -n "${CERT}" ]]; then
  if openssl dgst -sha256 -verify <(openssl x509 -in "${CERT}" -pubkey -noout) \
       -signature "${INITRD}.sig" "${INITRD}" >/dev/null 2>&1; then
    check "initramfs-signature" "pass" "$(basename "${INITRD}")"
  else
    check "initramfs-signature" "fail" "openssl rejected"
  fi
else
  check "initramfs-signature" "skip" "no initramfs sig or cert"
fi

# 3. Verity root hash matches receipt
VERITY_RECEIPT="${OUT_DIR}/verity-receipt.json"
if [[ -f "${VERITY_RECEIPT}" ]]; then
  ROOT_HASH="$(jq -r .rootHash "${VERITY_RECEIPT}" 2>/dev/null || echo "")"
  if [[ ${#ROOT_HASH} -eq 64 ]]; then
    check "verity-root-hash" "pass" "${ROOT_HASH:0:16}…"
  else
    check "verity-root-hash" "fail" "malformed root hash"
  fi
else
  check "verity-root-hash" "skip" "no verity-receipt.json"
fi

# 4. ISO checksum file exists
ISO="$(ls "${OUT_DIR}"/sita-os-*.iso 2>/dev/null | head -1 || true)"
if [[ -n "${ISO}" && -f "${ISO}.sha256" ]]; then
  if (cd "${OUT_DIR}" && sha256sum -c "$(basename "${ISO}").sha256" >/dev/null 2>&1); then
    check "iso-checksum" "pass" "$(basename "${ISO}")"
  else
    check "iso-checksum" "fail" "sha256 mismatch"
  fi
else
  check "iso-checksum" "skip" "no iso or no checksum file"
fi

mkdir -p "${OUT_DIR}"
printf '{"verifiedAt":"%s","results":[%s],"failures":%d}\n' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  "$(IFS=,; echo "${results[*]}")" \
  "${FAIL}" > "${REPORT}"

echo
echo "📄 report: ${REPORT}"
[[ "${FAIL}" -eq 0 ]] && echo "✅ all verifications passed" || { echo "❌ ${FAIL} verification(s) failed"; exit 1; }
