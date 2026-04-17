#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Build Attestation Emitter
#
# Aggregates every receipt in out/ into a single canonical attestation:
#   • build commit + timestamp
#   • package set (sha256 of packages.list)
#   • boot artifact hashes
#   • signing receipts (kernel, initramfs)
#   • verity receipt (root hash)
#   • runtime + first-boot service versions
#   • branding bundle hash
#   • shell version (package.json)
#
# Outputs:
#   generated/os-build-attestation.json   (machine-readable)
#   generated/os-build-summary.md         (human-readable)
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
GEN_DIR="generated"
mkdir -p "${GEN_DIR}"

ISO="$(ls "${OUT_DIR}"/sita-os-*.iso 2>/dev/null | head -1 || echo "")"
VERSION="$(jq -r .version "${OUT_DIR}"/sita-os-*.manifest.json 2>/dev/null | head -1 || echo "0.0.0-unknown")"
COMMIT="$(git rev-parse HEAD 2>/dev/null || echo "no-git")"
BUILT_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

hash_file()  { [[ -f "$1" ]] && sha256sum "$1" | cut -d' ' -f1 || echo "absent"; }
hash_dir()   { [[ -d "$1" ]] && tar -cf - --sort=name "$1" 2>/dev/null | sha256sum | cut -d' ' -f1 || echo "absent"; }
read_json()  { [[ -f "$1" ]] && cat "$1" || echo "null"; }

PACKAGES_HASH="$(hash_file os/image-builder/packages.list)"
BRANDING_HASH="$(hash_dir os/image-builder/branding)"
SHELL_VERSION="$(jq -r .version package.json 2>/dev/null || echo unknown)"
ISO_HASH="$(hash_file "${ISO}")"

ATTEST="${GEN_DIR}/os-build-attestation.json"

cat > "${ATTEST}" <<JSON
{
  "schema": "sita-os-attestation/v1",
  "version": "${VERSION}",
  "commit": "${COMMIT}",
  "builtAt": "${BUILT_AT}",
  "iso": {
    "path": "$(basename "${ISO}")",
    "sha256": "${ISO_HASH}"
  },
  "packages": {
    "list": "os/image-builder/packages.list",
    "sha256": "${PACKAGES_HASH}"
  },
  "branding": { "sha256": "${BRANDING_HASH}" },
  "shell":    { "version": "${SHELL_VERSION}" },
  "signing":  $(read_json "${OUT_DIR}/os-signing-receipt.json"),
  "initramfsSigning": $(read_json "${OUT_DIR}/os-initramfs-signing-receipt.json"),
  "verity":   $(read_json "${OUT_DIR}/verity-receipt.json"),
  "verification": $(read_json "${OUT_DIR}/os-verification-report.json"),
  "services": {
    "firstBoot": "sita-firstboot.service",
    "runtime":   "sita-runtime.service",
    "updater":   "sita-updated.service",
    "recovery":  "sita-recovery.service"
  }
}
JSON

# Human-readable summary
SUMMARY="${GEN_DIR}/os-build-summary.md"
cat > "${SUMMARY}" <<MD
# SITA OS Build Summary

| Field | Value |
|---|---|
| Version | \`${VERSION}\` |
| Commit | \`${COMMIT}\` |
| Built at | ${BUILT_AT} |
| ISO | \`$(basename "${ISO}")\` |
| ISO SHA256 | \`${ISO_HASH}\` |
| Packages SHA256 | \`${PACKAGES_HASH:0:16}…\` |
| Branding SHA256 | \`${BRANDING_HASH:0:16}…\` |
| Shell version | \`${SHELL_VERSION}\` |

## Receipts present

- [$([ -f "${OUT_DIR}/os-signing-receipt.json"          ] && echo x || echo " ")] kernel signing
- [$([ -f "${OUT_DIR}/os-initramfs-signing-receipt.json" ] && echo x || echo " ")] initramfs signing
- [$([ -f "${OUT_DIR}/verity-receipt.json"              ] && echo x || echo " ")] dm-verity hash tree
- [$([ -f "${OUT_DIR}/os-verification-report.json"      ] && echo x || echo " ")] post-build verification

Full machine-readable attestation: \`${ATTEST}\`
MD

echo "📜 attestation: ${ATTEST}"
echo "📄 summary:     ${SUMMARY}"
