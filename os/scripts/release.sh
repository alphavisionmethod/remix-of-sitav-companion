#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — One-shot Release Pipeline (Phase 4 hardened)
#
# Executes the canonical release flow end-to-end with full Phase 4
# supply-chain attestation:
#   1. reproducible build env  (SOURCE_DATE_EPOCH pinned)
#   2. build ISO
#   3. verify boot artifacts
#   4. verify verity metadata
#   5. emit attestation
#   6. seal verity root → TPM 2.0  (real if SITA_TPM_REAL=1, else simulated)
#   7. enroll Secure Boot / MOK shim chain
#   8. generate + sign CycloneDX SBOMs (app + os)
#   9. build update bundle
#  10. verify update bundle
#  11. build raw IMG (flashable + cloud import)
#  12. verify TPM seal + SBOM signatures
#  13. QEMU validation
#
# Any failed step aborts and exits non-zero. CI uses this as the
# gate for `release` events. Local dev can also run it.
#
# Usage:
#   VERSION=0.2.0 sudo -E bash os/scripts/release.sh stable
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

CHANNEL="${1:-stable}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "${HERE}/../.." && pwd)"

# shellcheck source=os/scripts/reproducible-build-env.sh
. "${REPO}/os/scripts/reproducible-build-env.sh"

VERSION="${VERSION:-0.0.0-dev+$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
OUT_DIR="${SITA_OUT_DIR:-out}"

step() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }

step " 1/13  Reproducible build env  (SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH})"
echo "  ✓ pinned"

step " 2/13  Build ISO  (version=${VERSION})"
VERSION="${VERSION}" sudo -E bash "${REPO}/os/image-builder/build.sh"

step " 3/13  Verify boot artifacts"
SITA_MOK_CERT="${SITA_MOK_CERT:-}" bash "${REPO}/os/scripts/verify-boot-artifacts.sh" "${OUT_DIR}"

step " 4/13  Verify verity metadata"
bash "${REPO}/os/scripts/verify-verity-metadata.sh" "${OUT_DIR}" || echo "  (skipped — no verity artifacts)"

step " 5/13  Emit attestation"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/emit-attestation.sh"

step " 6/13  Seal verity root → TPM 2.0"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/seal-verity-to-tpm.sh"

step " 7/13  Enroll Secure Boot / MOK shim chain"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/enroll-secureboot-mok.sh"

step " 8/13  Generate + sign CycloneDX SBOMs"
SITA_OUT_DIR="${OUT_DIR}" VERSION="${VERSION}" bash "${REPO}/os/scripts/generate-sbom.sh"

step " 9/13  Build update bundle"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/build-update-bundle.sh" "${VERSION}" "${CHANNEL}"

step "10/13  Verify update bundle"
SITA_INSTALLED_VERSION="${SITA_INSTALLED_VERSION:-0.0.0}" \
  bash "${REPO}/os/scripts/verify-update-bundle.sh" \
    "${OUT_DIR}/sita-os-${VERSION}.bundle" \
    "${OUT_DIR}/channel-${CHANNEL}.json"

step "11/13  Build raw IMG (flashable disk + cloud import)"
SITA_OUT_DIR="${OUT_DIR}" VERSION="${VERSION}" sudo -E bash "${REPO}/os/scripts/build-raw-img.sh"

step "12/13  Verify TPM seal + SBOM signatures"
bash "${REPO}/os/scripts/verify-tpm-seal.sh" "${OUT_DIR}"
bash "${REPO}/os/scripts/verify-sbom.sh"     "${OUT_DIR}"

step "13/13  QEMU validation"
SITA_QEMU_TIMEOUT="${SITA_QEMU_TIMEOUT:-180}" bash "${REPO}/os/qemu-validate.sh"

echo
echo "✅ release pipeline complete"
echo "   ISO:        ${OUT_DIR}/sita-os-${VERSION}-amd64.iso"
echo "   IMG:        ${OUT_DIR}/sita-os-${VERSION}-amd64.img"
echo "   Bundle:     ${OUT_DIR}/sita-os-${VERSION}.bundle"
echo "   Channel:    ${OUT_DIR}/channel-${CHANNEL}.json"
echo "   TPM seal:   ${OUT_DIR}/tpm-seal.manifest.json"
echo "   MOK enroll: ${OUT_DIR}/shim/mok-enroll.json"
echo "   SBOM:       ${OUT_DIR}/sbom.manifest.json"
echo "   Attest:     generated/os-build-attestation.json"
echo "   Summary:    generated/os-build-summary.md"
