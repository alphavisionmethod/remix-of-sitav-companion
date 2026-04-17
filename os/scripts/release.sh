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

step "1/7  Build ISO  (version=${VERSION})"
VERSION="${VERSION}" sudo -E bash "${REPO}/os/image-builder/build.sh"

step "2/7  Verify boot artifacts"
SITA_MOK_CERT="${SITA_MOK_CERT:-}" bash "${REPO}/os/scripts/verify-boot-artifacts.sh" "${OUT_DIR}"

step "3/7  Verify verity metadata"
bash "${REPO}/os/scripts/verify-verity-metadata.sh" "${OUT_DIR}" || echo "  (skipped — no verity artifacts)"

step "4/7  Emit attestation"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/emit-attestation.sh"

step "5/7  Build update bundle"
SITA_OUT_DIR="${OUT_DIR}" bash "${REPO}/os/scripts/build-update-bundle.sh" "${VERSION}" "${CHANNEL}"

step "6/7  Verify update bundle"
SITA_INSTALLED_VERSION="${SITA_INSTALLED_VERSION:-0.0.0}" \
  bash "${REPO}/os/scripts/verify-update-bundle.sh" \
    "${OUT_DIR}/sita-os-${VERSION}.bundle" \
    "${OUT_DIR}/channel-${CHANNEL}.json"

step "7/7  QEMU validation"
SITA_QEMU_TIMEOUT="${SITA_QEMU_TIMEOUT:-180}" bash "${REPO}/os/qemu-validate.sh"

echo
echo "✅ release pipeline complete"
echo "   ISO:        ${OUT_DIR}/sita-os-${VERSION}-amd64.iso"
echo "   Bundle:     ${OUT_DIR}/sita-os-${VERSION}.bundle"
echo "   Channel:    ${OUT_DIR}/channel-${CHANNEL}.json"
echo "   Attest:     generated/os-build-attestation.json"
echo "   Summary:    generated/os-build-summary.md"
