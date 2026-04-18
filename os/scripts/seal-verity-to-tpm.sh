#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Seal dm-verity root hash to TPM 2.0 (PCR 0,2,4,7)
#
# Reads the verity root hash produced by build-verity-root.sh, then
# uses tpm2-tools to seal it under a PCR policy. The resulting
# sealed-blob + policy digest is written to the OUT_DIR so the boot
# chain can later unseal it ONLY if the measured boot state matches.
#
# PCR selection rationale:
#   PCR 0  — UEFI firmware code
#   PCR 2  — UEFI driver / option ROM
#   PCR 4  — boot loader (shim/grub)
#   PCR 7  — Secure Boot policy + signing keys
#
# Inputs:
#   $1                   verity root hash (hex)         — required
#   SITA_OUT_DIR         output directory               — default: out
#   SITA_TPM_PCRS        PCR list                       — default: sha256:0,2,4,7
#   SITA_VERSION         version string                 — required
#
# Outputs (in $SITA_OUT_DIR):
#   tpm-seal-policy.digest         — policy digest (hex)
#   tpm-seal-public.bin            — sealed object public area
#   tpm-seal-private.bin           — sealed object private area
#   tpm-seal-manifest.json         — JSON record of the sealing op
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_HASH="${1:-}"
OUT_DIR="${SITA_OUT_DIR:-out}"
PCRS="${SITA_TPM_PCRS:-sha256:0,2,4,7}"
VERSION="${SITA_VERSION:-${VERSION:-0.0.0-dev}}"

if [ -z "$ROOT_HASH" ]; then
  echo "✘ usage: $0 <verity-root-hash-hex>" >&2
  exit 2
fi

if ! command -v tpm2_createpolicy >/dev/null 2>&1; then
  echo "✘ tpm2-tools not installed (apt: tpm2-tools)" >&2
  exit 2
fi

mkdir -p "$OUT_DIR"
WORK="$(mktemp -d -t sita-tpm-seal-XXXXXX)"
trap 'rm -rf "$WORK"' EXIT

echo "▸ Computing PCR policy digest for ${PCRS}"
tpm2_createpolicy --policy-pcr -l "$PCRS" -L "$WORK/policy.digest" >/dev/null

echo "▸ Creating primary key under owner hierarchy"
tpm2_createprimary -C o -g sha256 -G rsa -c "$WORK/primary.ctx" >/dev/null

echo "▸ Sealing verity root hash under PCR policy"
printf '%s' "$ROOT_HASH" > "$WORK/secret.bin"
tpm2_create \
  -C "$WORK/primary.ctx" \
  -i "$WORK/secret.bin" \
  -L "$WORK/policy.digest" \
  -u "$OUT_DIR/tpm-seal-public.bin" \
  -r "$OUT_DIR/tpm-seal-private.bin" \
  -a "fixedtpm|fixedparent|adminwithpolicy" >/dev/null

cp "$WORK/policy.digest" "$OUT_DIR/tpm-seal-policy.digest"

POLICY_HEX="$(xxd -p -c 256 "$OUT_DIR/tpm-seal-policy.digest" | tr -d '\n')"
PUBLIC_SHA="$(sha256sum "$OUT_DIR/tpm-seal-public.bin"  | awk '{print $1}')"
PRIVATE_SHA="$(sha256sum "$OUT_DIR/tpm-seal-private.bin" | awk '{print $1}')"

cat > "$OUT_DIR/tpm-seal-manifest.json" <<JSON
{
  "version":         "${VERSION}",
  "sealed_at":       "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "verity_root_hash": "${ROOT_HASH}",
  "pcr_selection":   "${PCRS}",
  "policy_digest_hex": "${POLICY_HEX}",
  "sealed_public_sha256":  "${PUBLIC_SHA}",
  "sealed_private_sha256": "${PRIVATE_SHA}",
  "tpm2_tools_version": "$(tpm2_createpolicy --version 2>&1 | head -n1 || echo unknown)"
}
JSON

echo "✓ Sealed verity root hash → ${OUT_DIR}/tpm-seal-{public,private}.bin"
echo "  Policy digest:  ${POLICY_HEX:0:32}…"
echo "  Manifest:       ${OUT_DIR}/tpm-seal-manifest.json"
