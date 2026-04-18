#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Verify that a TPM-sealed verity hash can be unsealed
#
# Modes:
#   --offline   (default in CI without a real TPM)
#               Verifies the manifest, file presence, and SHA256
#               integrity of the sealed-blob pair. Does NOT require
#               /dev/tpmrm0.
#   --hardware  Requires a real TPM2 device. Loads the sealed object,
#               satisfies the PCR policy, and unseals the secret.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
MODE="offline"
[ "${1:-}" = "--hardware" ] && MODE="hardware"
[ "${1:-}" = "--offline"  ] && MODE="offline"

MANIFEST="${OUT_DIR}/tpm-seal-manifest.json"
PUB="${OUT_DIR}/tpm-seal-public.bin"
PRIV="${OUT_DIR}/tpm-seal-private.bin"
POLICY="${OUT_DIR}/tpm-seal-policy.digest"

for f in "$MANIFEST" "$PUB" "$PRIV" "$POLICY"; do
  if [ ! -f "$f" ]; then
    echo "✘ missing TPM seal artifact: $f" >&2
    exit 1
  fi
done

if ! command -v jq >/dev/null 2>&1; then
  echo "✘ jq required" >&2; exit 2
fi

EXPECTED_PUB_SHA="$(jq -r '.sealed_public_sha256'  "$MANIFEST")"
EXPECTED_PRI_SHA="$(jq -r '.sealed_private_sha256' "$MANIFEST")"
ACTUAL_PUB_SHA="$(sha256sum "$PUB"  | awk '{print $1}')"
ACTUAL_PRI_SHA="$(sha256sum "$PRIV" | awk '{print $1}')"

if [ "$ACTUAL_PUB_SHA" != "$EXPECTED_PUB_SHA" ]; then
  echo "✘ tpm-seal-public.bin SHA256 mismatch" >&2; exit 1
fi
if [ "$ACTUAL_PRI_SHA" != "$EXPECTED_PRI_SHA" ]; then
  echo "✘ tpm-seal-private.bin SHA256 mismatch" >&2; exit 1
fi

echo "✓ offline verification OK (manifest + sealed-blob integrity)"

if [ "$MODE" = "offline" ]; then
  exit 0
fi

# ── Hardware path ──────────────────────────────────────────────────────
if [ ! -e /dev/tpmrm0 ] && [ ! -e /dev/tpm0 ]; then
  echo "✘ --hardware requested but no /dev/tpm[rm]0 found" >&2
  exit 1
fi
if ! command -v tpm2_unseal >/dev/null 2>&1; then
  echo "✘ tpm2-tools not installed" >&2; exit 2
fi

WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
PCRS="$(jq -r '.pcr_selection' "$MANIFEST")"

tpm2_createprimary -C o -g sha256 -G rsa -c "$WORK/primary.ctx" >/dev/null
tpm2_load -C "$WORK/primary.ctx" -u "$PUB" -r "$PRIV" -c "$WORK/sealed.ctx" >/dev/null
tpm2_startauthsession --policy-session -S "$WORK/session.ctx" >/dev/null
tpm2_policypcr -S "$WORK/session.ctx" -l "$PCRS" -L "$WORK/policy.digest" >/dev/null

if ! cmp -s "$WORK/policy.digest" "$POLICY"; then
  echo "✘ measured PCR state does not satisfy sealing policy" >&2
  tpm2_flushcontext "$WORK/session.ctx" >/dev/null 2>&1 || true
  exit 1
fi

UNSEALED="$(tpm2_unseal -p session:"$WORK/session.ctx" -c "$WORK/sealed.ctx")"
tpm2_flushcontext "$WORK/session.ctx" >/dev/null 2>&1 || true

EXPECTED="$(jq -r '.verity_root_hash' "$MANIFEST")"
if [ "$UNSEALED" != "$EXPECTED" ]; then
  echo "✘ unsealed value does not match manifest verity_root_hash" >&2
  exit 1
fi

echo "✓ hardware verification OK — TPM unsealed verity root hash matches"
