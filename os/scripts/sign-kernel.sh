#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Canonical Kernel Signing
#
# Wraps the existing image-builder/security/sign-kernel.sh and adds:
#   • secure-boot key resolution (SITA_MOK_KEY / SITA_MOK_CERT env)
#   • signature verification post-sign
#   • emits signing receipt to generated/os-signing-receipt.json
#
# Usage:
#   SITA_MOK_KEY=/secure/MOK.priv \
#   SITA_MOK_CERT=/secure/MOK.der \
#     bash os/scripts/sign-kernel.sh <kernel-image>
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

KERNEL="${1:?kernel image path required}"
OUT_DIR="${SITA_OUT_DIR:-out}"
RECEIPT="${OUT_DIR}/os-signing-receipt.json"

[[ -f "${KERNEL}" ]] || { echo "kernel not found: ${KERNEL}" >&2; exit 2; }

if [[ -z "${SITA_MOK_KEY:-}" || -z "${SITA_MOK_CERT:-}" ]]; then
  echo "⚠️  SITA_MOK_KEY / SITA_MOK_CERT not set — using ephemeral dev key (UNSIGNED for production)" >&2
  WORK="$(mktemp -d)"
  openssl req -new -x509 -newkey rsa:2048 -keyout "${WORK}/dev.key" -out "${WORK}/dev.crt" \
    -nodes -days 365 -subj "/CN=SITA OS Dev Signer/" >/dev/null 2>&1
  SITA_MOK_KEY="${WORK}/dev.key"
  SITA_MOK_CERT="${WORK}/dev.crt"
  KEY_KIND="ephemeral-dev"
else
  KEY_KIND="production-mok"
fi

command -v sbsign >/dev/null || { echo "apt-get install sbsigntool" >&2; exit 1; }

mkdir -p "${OUT_DIR}"
SIGNED="${KERNEL%.unsigned}"
[[ "${SIGNED}" == "${KERNEL}" ]] && SIGNED="${KERNEL}.signed"

echo "🔏 signing ${KERNEL} → ${SIGNED}"
sbsign --key "${SITA_MOK_KEY}" --cert "${SITA_MOK_CERT}" --output "${SIGNED}" "${KERNEL}"

echo "🔍 verifying signature"
sbverify --cert "${SITA_MOK_CERT}" "${SIGNED}"

SHA="$(sha256sum "${SIGNED}" | cut -d' ' -f1)"
cat > "${RECEIPT}" <<JSON
{
  "artifact": "$(basename "${SIGNED}")",
  "sha256": "${SHA}",
  "signedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "keyKind": "${KEY_KIND}",
  "verifier": "sbverify",
  "verified": true
}
JSON

echo "✅ signed kernel: ${SIGNED}"
echo "📄 receipt:       ${RECEIPT}"
