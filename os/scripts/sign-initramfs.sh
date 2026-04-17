#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Initramfs Signing
#
# Detached-signs initramfs.img with the same MOK used for the kernel.
# The signature file (initramfs.img.sig) is verified at boot by a custom
# initramfs hook (os/image-builder/initramfs-hooks/verify-rootfs).
#
# Usage:
#   SITA_MOK_KEY=...  SITA_MOK_CERT=...  bash os/scripts/sign-initramfs.sh <initramfs>
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

INITRD="${1:?initramfs path required}"
OUT_DIR="${SITA_OUT_DIR:-out}"
RECEIPT="${OUT_DIR}/os-initramfs-signing-receipt.json"

[[ -f "${INITRD}" ]] || { echo "initramfs not found: ${INITRD}" >&2; exit 2; }

if [[ -z "${SITA_MOK_KEY:-}" || -z "${SITA_MOK_CERT:-}" ]]; then
  echo "⚠️  No MOK key — generating ephemeral dev key" >&2
  WORK="$(mktemp -d)"
  openssl req -new -x509 -newkey rsa:2048 -keyout "${WORK}/dev.key" -out "${WORK}/dev.crt" \
    -nodes -days 365 -subj "/CN=SITA OS Dev Signer/" >/dev/null 2>&1
  SITA_MOK_KEY="${WORK}/dev.key"
  SITA_MOK_CERT="${WORK}/dev.crt"
  KEY_KIND="ephemeral-dev"
else
  KEY_KIND="production-mok"
fi

mkdir -p "${OUT_DIR}"
SIG="${INITRD}.sig"
echo "🔏 signing ${INITRD}"
openssl dgst -sha256 -sign "${SITA_MOK_KEY}" -out "${SIG}" "${INITRD}"

echo "🔍 verifying"
openssl dgst -sha256 -verify <(openssl x509 -in "${SITA_MOK_CERT}" -pubkey -noout) \
  -signature "${SIG}" "${INITRD}"

SHA="$(sha256sum "${INITRD}" | cut -d' ' -f1)"
cat > "${RECEIPT}" <<JSON
{
  "artifact": "$(basename "${INITRD}")",
  "signature": "$(basename "${SIG}")",
  "sha256": "${SHA}",
  "signedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "keyKind": "${KEY_KIND}",
  "verified": true
}
JSON

echo "✅ initramfs signed: ${SIG}"
