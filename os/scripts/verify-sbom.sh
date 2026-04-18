#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Verify SBOM Manifest + Signature
#
# Validates:
#   • sbom.manifest.json parses
#   • app + os SBOM files exist with matching sha256
#   • CycloneDX bomFormat / specVersion are correct
#   • If signed, openssl dgst verifies sbom-os.cdx.json against
#     sbom-os.cdx.json.sig using $SITA_SIGN_CRT
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${1:-${SITA_OUT_DIR:-out}}"
KEYS_DIR="${SITA_KEYS_DIR:-os/keys}"
SIGN_CRT="${SITA_SIGN_CRT:-${KEYS_DIR}/release.crt}"
MANIFEST="${OUT_DIR}/sbom.manifest.json"

[[ -f "${MANIFEST}" ]] || { echo "❌ ${MANIFEST} missing" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq required" >&2; exit 2; }

for kind in app os; do
  rel="$(jq -r ".${kind}.path"   "${MANIFEST}")"
  want="$(jq -r ".${kind}.sha256" "${MANIFEST}")"
  abs="${OUT_DIR}/${rel}"
  [[ -f "${abs}" ]] || { echo "❌ ${abs} missing" >&2; exit 3; }
  got="$(sha256sum "${abs}" | awk '{print $1}')"
  if [[ "${got}" != "${want}" ]]; then
    echo "❌ sha mismatch for ${rel}: want ${want}, got ${got}" >&2; exit 4
  fi
  fmt="$(jq -r '.bomFormat' "${abs}")"
  spec="$(jq -r '.specVersion' "${abs}")"
  if [[ "${fmt}" != "CycloneDX" ]]; then
    echo "❌ ${rel} bomFormat is '${fmt}', expected 'CycloneDX'" >&2; exit 5
  fi
  if [[ "${spec}" != "1.5" ]]; then
    echo "⚠  ${rel} specVersion is '${spec}', expected '1.5'" >&2
  fi
done

SIG_MODE="$(jq -r '.signature.mode' "${MANIFEST}")"
if [[ "${SIG_MODE}" == "signed" && -f "${SIGN_CRT}" ]]; then
  PUB="$(mktemp)"; trap 'rm -f "${PUB}"' EXIT
  openssl x509 -in "${SIGN_CRT}" -pubkey -noout > "${PUB}"
  if openssl dgst -sha256 -verify "${PUB}" \
        -signature "${OUT_DIR}/sbom-os.cdx.json.sig" \
        "${OUT_DIR}/sbom-os.cdx.json" >/dev/null; then
    echo "✅ SBOM signature verified (RSA-SHA256)"
  else
    echo "❌ SBOM signature verification FAILED" >&2; exit 6
  fi
else
  echo "ℹ  SBOM is ${SIG_MODE} (no signature check performed)"
fi

echo "✅ SBOM manifest verified"
