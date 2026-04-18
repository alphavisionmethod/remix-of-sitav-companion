#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Verify TPM Seal Manifest
#
# Validates that:
#   • tpm-seal.manifest.json exists and parses
#   • referenced policy/pub/priv files exist with matching sha256
#   • verityRootHash matches verity-root.hash on disk
#   • policyDigest is non-empty
#
# Used in the release pipeline (step 5b) and by CI before publishing.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${1:-${SITA_OUT_DIR:-out}}"
MANIFEST="${OUT_DIR}/tpm-seal.manifest.json"

if [[ ! -f "${MANIFEST}" ]]; then
  echo "❌ ${MANIFEST} not found" >&2
  exit 1
fi

command -v jq >/dev/null 2>&1 || { echo "❌ jq required" >&2; exit 2; }

VERITY_HASH_DISK="$(cat "${OUT_DIR}/verity-root.hash" 2>/dev/null | tr -d '[:space:]' || echo "")"
VERITY_HASH_MANIFEST="$(jq -r '.verityRootHash' "${MANIFEST}")"
POLICY_DIGEST="$(jq -r '.policyDigest' "${MANIFEST}")"

if [[ -z "${POLICY_DIGEST}" || "${POLICY_DIGEST}" == "null" ]]; then
  echo "❌ policyDigest missing in manifest" >&2; exit 3
fi
if [[ -n "${VERITY_HASH_DISK}" && "${VERITY_HASH_DISK}" != "${VERITY_HASH_MANIFEST}" ]]; then
  echo "❌ verity hash mismatch:" >&2
  echo "   disk:     ${VERITY_HASH_DISK}" >&2
  echo "   manifest: ${VERITY_HASH_MANIFEST}" >&2
  exit 4
fi

for key in policy public private; do
  rel_path="$(jq -r ".artifacts.${key}.path"   "${MANIFEST}")"
  want_sha="$(jq -r ".artifacts.${key}.sha256" "${MANIFEST}")"
  abs_path="${OUT_DIR}/${rel_path}"
  if [[ ! -f "${abs_path}" ]]; then
    echo "❌ missing artifact: ${abs_path}" >&2; exit 5
  fi
  got_sha="$(sha256sum "${abs_path}" | awk '{print $1}')"
  if [[ "${got_sha}" != "${want_sha}" ]]; then
    echo "❌ sha256 mismatch for ${rel_path}: want ${want_sha}, got ${got_sha}" >&2; exit 6
  fi
done

echo "✅ TPM seal manifest verified"
echo "   policy digest: ${POLICY_DIGEST}"
echo "   mode:          $(jq -r '.mode' "${MANIFEST}")"
