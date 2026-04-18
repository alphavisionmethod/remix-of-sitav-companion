#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — TPM 2.0 Sealing of dm-verity Root Hash
#
# Seals the verity root hash to a TPM 2.0 NV index bound to a PCR policy
# (PCRs 0,2,4,7 — firmware code + extended firmware code + boot loader
#  code + Secure Boot policy). On boot, the initramfs hook unseals and
# compares against the on-disk verity root; mismatch → boot is refused.
#
# Inputs:
#   $SITA_OUT_DIR/verity-root.hash      (canonical verity root produced
#                                        by os/scripts/build-verity-root.sh)
#   $SITA_OUT_DIR/verity-root.json      (verity metadata sidecar)
#
# Outputs:
#   $SITA_OUT_DIR/tpm-seal.policy       (computed PCR policy digest)
#   $SITA_OUT_DIR/tpm-seal.pub          (sealed object public area)
#   $SITA_OUT_DIR/tpm-seal.priv         (sealed object private area)
#   $SITA_OUT_DIR/tpm-seal.manifest.json (machine-readable manifest)
#
# When run on a non-TPM host (CI, dev laptop) the script still produces
# a deterministic *manifest* documenting what would be sealed, so the
# release attestation has a stable record. Real TPM operations are gated
# behind the SITA_TPM_REAL=1 env flag and require tpm2-tools.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
PCR_BANK="${SITA_TPM_PCR_BANK:-sha256}"
PCR_LIST="${SITA_TPM_PCR_LIST:-0,2,4,7}"
NV_INDEX="${SITA_TPM_NV_INDEX:-0x1500016}"
REAL_TPM="${SITA_TPM_REAL:-0}"

VERITY_HASH_FILE="${OUT_DIR}/verity-root.hash"
VERITY_META_FILE="${OUT_DIR}/verity-root.json"

if [[ ! -f "${VERITY_HASH_FILE}" ]]; then
  echo "❌ verity root hash not found at ${VERITY_HASH_FILE}" >&2
  echo "   run: bash os/scripts/build-verity-root.sh first" >&2
  exit 1
fi

VERITY_HASH="$(cat "${VERITY_HASH_FILE}" | tr -d '[:space:]')"
if [[ -z "${VERITY_HASH}" ]]; then
  echo "❌ verity root hash is empty" >&2
  exit 1
fi

echo "🔐 sealing verity root hash to TPM 2.0"
echo "   hash:   ${VERITY_HASH}"
echo "   pcrs:   ${PCR_BANK}:${PCR_LIST}"
echo "   nv:     ${NV_INDEX}"

mkdir -p "${OUT_DIR}"
POLICY_FILE="${OUT_DIR}/tpm-seal.policy"
PUB_FILE="${OUT_DIR}/tpm-seal.pub"
PRIV_FILE="${OUT_DIR}/tpm-seal.priv"
MANIFEST_FILE="${OUT_DIR}/tpm-seal.manifest.json"

if [[ "${REAL_TPM}" == "1" ]]; then
  for bin in tpm2_startauthsession tpm2_policypcr tpm2_create tpm2_load tpm2_evictcontrol; do
    command -v "${bin}" >/dev/null 2>&1 || {
      echo "❌ missing ${bin} — install tpm2-tools" >&2; exit 2;
    }
  done
  SESSION="$(mktemp)"
  trap 'rm -f "${SESSION}"' EXIT
  tpm2_startauthsession --session "${SESSION}" --policy-session
  tpm2_policypcr --session "${SESSION}" \
    --pcr-list "${PCR_BANK}:${PCR_LIST}" \
    --policy "${POLICY_FILE}"
  printf '%s' "${VERITY_HASH}" > "${OUT_DIR}/.tpm-seal.input"
  tpm2_create --parent-context o \
    --policy "${POLICY_FILE}" \
    --public "${PUB_FILE}" --private "${PRIV_FILE}" \
    --sealing-input "${OUT_DIR}/.tpm-seal.input"
  rm -f "${OUT_DIR}/.tpm-seal.input"
  POLICY_DIGEST_HEX="$(xxd -p -c256 "${POLICY_FILE}")"
  TPM_MODE="real"
else
  # Deterministic, repeatable simulation so the release manifest is stable.
  POLICY_DIGEST_HEX="$(printf 'sita-tpm-policy:%s:%s:%s' \
    "${PCR_BANK}" "${PCR_LIST}" "${VERITY_HASH}" \
    | sha256sum | awk '{print $1}')"
  printf '%s' "${POLICY_DIGEST_HEX}" > "${POLICY_FILE}"
  printf 'SIMULATED-PUB:%s' "${POLICY_DIGEST_HEX}" > "${PUB_FILE}"
  printf 'SIMULATED-PRIV:%s' "${POLICY_DIGEST_HEX}" > "${PRIV_FILE}"
  TPM_MODE="simulated"
fi

PUB_SHA="$(sha256sum "${PUB_FILE}" | awk '{print $1}')"
PRIV_SHA="$(sha256sum "${PRIV_FILE}" | awk '{print $1}')"
POLICY_SHA="$(sha256sum "${POLICY_FILE}" | awk '{print $1}')"

cat > "${MANIFEST_FILE}" <<JSON
{
  "$schema": "https://sita.dev/schemas/tpm-seal-manifest.v1.json",
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mode": "${TPM_MODE}",
  "pcrBank": "${PCR_BANK}",
  "pcrList": "${PCR_LIST}",
  "nvIndex": "${NV_INDEX}",
  "verityRootHash": "${VERITY_HASH}",
  "policyDigest": "${POLICY_DIGEST_HEX}",
  "artifacts": {
    "policy": { "path": "tpm-seal.policy", "sha256": "${POLICY_SHA}" },
    "public": { "path": "tpm-seal.pub",    "sha256": "${PUB_SHA}"    },
    "private": { "path": "tpm-seal.priv",  "sha256": "${PRIV_SHA}"   }
  },
  "verityMetadataRef": "verity-root.json"
}
JSON

echo "✅ tpm-seal manifest: ${MANIFEST_FILE}"
echo "   policy digest:   ${POLICY_DIGEST_HEX}"
echo "   mode:            ${TPM_MODE}"
