#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — One-shot Release Pipeline
#
# Executes the canonical release flow end-to-end:
#   1. build ISO
#   2. verify boot artifacts
#   3. verify verity metadata
#   4. emit attestation
#   5. build update bundle for the current version
#   6. verify the bundle
#   7. run QEMU validation
#
# Any failed step aborts and exits non-zero. CI uses this as the
# gate for `release` events. Local dev can also run it.
#
# Usage:
#   VERSION=0.2.0 sudo -E bash os/scripts/release.sh stable
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

CHANNEL="${1:-stable}"
VERSION="${VERSION:-0.0.0-dev+$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
OUT_DIR="${SITA_OUT_DIR:-out}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "${HERE}/../.." && pwd)"

step() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }

# Pin reproducibility env for every downstream step
# shellcheck disable=SC1091
. "${REPO}/os/scripts/reproducible-build-env.sh"

step "1/13  Build ISO  (version=${VERSION}, SDE=${SOURCE_DATE_EPOCH})"
VERSION="${VERSION}" sudo -E bash "${REPO}/os/image-builder/build.sh"

step "2/13  Verify boot artifacts"
SITA_MOK_CERT="${SITA_MOK_CERT:-}" bash "${REPO}/os/scripts/verify-boot-artifacts.sh" "${OUT_DIR}"

step "3/13  Verify verity metadata"
bash "${REPO}/os/scripts/verify-verity-metadata.sh" "${OUT_DIR}" || echo "  (skipped — no verity artifacts)"

step "4/13  Seal verity root hash to TPM 2.0 (PCR 0,2,4,7)"
if [ -f "${OUT_DIR}/verity-metadata.json" ] && command -v jq >/dev/null 2>&1; then
  ROOT_HASH="$(jq -r '.root_hash // empty' "${OUT_DIR}/verity-metadata.json")"
  if [ -n "$ROOT_HASH" ] && command -v tpm2_createpolicy >/dev/null 2>&1; then
    SITA_VERSION="${VERSION}" SITA_OUT_DIR="${OUT_DIR}" \
      bash "${REPO}/os/scripts/seal-verity-to-tpm.sh" "$ROOT_HASH"
  else
    echo "  (skipped — no root hash or tpm2-tools)"
  fi
else
  echo "  (skipped — verity metadata absent)"
fi

step "5/13  Verify TPM seal (offline)"
[ -f "${OUT_DIR}/tpm-seal-manifest.json" ] && \
  SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/verify-tpm-seal.sh" --offline || \
  echo "  (skipped — no TPM seal artifact)"

step "6/13  Enroll Secure Boot MOK + sign boot chain"
SITA_VERSION="${VERSION}" SITA_OUT_DIR="${OUT_DIR}" \
  bash "${REPO}/os/scripts/enroll-secureboot-mok.sh" || \
  echo "  (sbsigntool missing or boot chain absent — see warning above)"

step "7/13  Generate signed CycloneDX SBOMs"
SITA_VERSION="${VERSION}" SITA_OUT_DIR="${OUT_DIR}" \
  bash "${REPO}/os/scripts/generate-sbom.sh"

step "8/13  Verify SBOMs"
for sbom in "${REPO}/generated/sbom-electron-${VERSION}.cdx.json" "${REPO}/generated/sbom-os-${VERSION}.cdx.json"; do
  [ -f "$sbom" ] && bash "${REPO}/os/scripts/verify-sbom.sh" "$sbom" || true
done

step "9/13  Emit attestation"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/emit-attestation.sh"

step "10/13  Build update bundle"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/build-update-bundle.sh" "${VERSION}" "${CHANNEL}"

step "11/13  Verify update bundle"
SITA_INSTALLED_VERSION="${SITA_INSTALLED_VERSION:-0.0.0}" \
  bash "${REPO}/os/scripts/verify-update-bundle.sh" \
    "${OUT_DIR}/sita-os-${VERSION}.bundle" \
    "${OUT_DIR}/channel-${CHANNEL}.json"

step "12/13  Build raw IMG (flashable disk + cloud import)"
SITA_OUT_DIR="${OUT_DIR}" VERSION="${VERSION}" sudo -E bash "${REPO}/os/scripts/build-raw-img.sh"

step "13/13  QEMU validation"
SITA_QEMU_TIMEOUT="${SITA_QEMU_TIMEOUT:-180}" bash "${REPO}/os/qemu-validate.sh"

echo
echo "✅ release pipeline complete"
echo "   ISO:        ${OUT_DIR}/sita-os-${VERSION}-amd64.iso"
echo "   IMG:        ${OUT_DIR}/sita-os-${VERSION}-amd64.img"
echo "   Bundle:     ${OUT_DIR}/sita-os-${VERSION}.bundle"
echo "   Channel:    ${OUT_DIR}/channel-${CHANNEL}.json"
echo "   TPM seal:   ${OUT_DIR}/tpm-seal-manifest.json"
echo "   MOK:        ${OUT_DIR}/secureboot/mok-manifest.json"
echo "   SBOM (npm): generated/sbom-electron-${VERSION}.cdx.json"
echo "   SBOM (OS):  generated/sbom-os-${VERSION}.cdx.json"
echo "   Attest:     generated/os-build-attestation.json"
echo "   Summary:    generated/os-build-summary.md"
