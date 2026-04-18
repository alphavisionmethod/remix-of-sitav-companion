#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Secure Boot MOK enrollment + boot-chain signing
#
# Generates (or reuses) the SITA Machine Owner Key, then signs the
# shim → grub → kernel chain so a Secure Boot enabled UEFI system
# can verify each stage. The resulting MOK cert is exported in DER
# form for one-shot enrollment via `mokutil --import` on first boot.
#
# Inputs:
#   SITA_OUT_DIR     output dir            — default: out
#   SITA_MOK_KEY     existing MOK private key (PEM) — optional
#   SITA_MOK_CERT    existing MOK cert (PEM)        — optional
#   SITA_VERSION     version string                 — required
#   SHIM_PATH        path to shim binary inside ISO root
#   GRUB_PATH        path to grub binary
#   KERNEL_PATH      path to kernel image
#
# If SITA_MOK_KEY/CERT are unset, a fresh ephemeral pair is generated
# and clearly marked "DEV-ONLY" in the manifest — production builds
# MUST inject real keys via the GitHub Actions secret pipeline.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
VERSION="${SITA_VERSION:-${VERSION:-0.0.0-dev}}"
KEY="${SITA_MOK_KEY:-}"
CERT="${SITA_MOK_CERT:-}"
SHIM_PATH="${SHIM_PATH:-${OUT_DIR}/efi/boot/shimx64.efi}"
GRUB_PATH="${GRUB_PATH:-${OUT_DIR}/efi/boot/grubx64.efi}"
KERNEL_PATH="${KERNEL_PATH:-${OUT_DIR}/boot/vmlinuz}"

mkdir -p "$OUT_DIR/secureboot"

if ! command -v openssl    >/dev/null 2>&1; then echo "✘ openssl required" >&2; exit 2; fi
if ! command -v sbsign     >/dev/null 2>&1; then echo "✘ sbsigntool required (apt: sbsigntool)" >&2; exit 2; fi
if ! command -v sbverify   >/dev/null 2>&1; then echo "✘ sbverify required" >&2; exit 2; fi

PROVENANCE="production"
if [ -z "$KEY" ] || [ -z "$CERT" ]; then
  PROVENANCE="dev-ephemeral"
  echo "⚠ no SITA_MOK_KEY/SITA_MOK_CERT provided — generating EPHEMERAL dev key"
  WORK="$(mktemp -d)"
  openssl req -new -x509 -nodes -days 3650 \
    -newkey rsa:3072 \
    -subj "/CN=SITA OS Dev MOK ${VERSION}/O=SITA OS/" \
    -keyout "$WORK/mok.key" -out "$WORK/mok.crt" >/dev/null 2>&1
  KEY="$WORK/mok.key"
  CERT="$WORK/mok.crt"
fi

# Export DER for mokutil --import
openssl x509 -in "$CERT" -outform DER -out "$OUT_DIR/secureboot/sita-mok.der"
cp "$CERT" "$OUT_DIR/secureboot/sita-mok.crt"
CERT_FP="$(openssl x509 -in "$CERT" -noout -fingerprint -sha256 | sed 's/^.*=//')"

sign_one() {
  local target="$1" label="$2"
  if [ ! -f "$target" ]; then
    echo "  • ${label}: SKIP (not present at ${target})"
    return 0
  fi
  local out_signed="${target}.signed"
  sbsign --key "$KEY" --cert "$CERT" --output "$out_signed" "$target" >/dev/null
  mv "$out_signed" "$target"
  if sbverify --cert "$CERT" "$target" >/dev/null 2>&1; then
    echo "  • ${label}: signed + verified ✓"
  else
    echo "✘ ${label}: signature failed verification" >&2
    return 1
  fi
}

echo "▸ Signing boot chain"
sign_one "$SHIM_PATH"   "shim"
sign_one "$GRUB_PATH"   "grub"
sign_one "$KERNEL_PATH" "kernel"

cat > "$OUT_DIR/secureboot/mok-manifest.json" <<JSON
{
  "version":            "${VERSION}",
  "generated_at":       "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "key_provenance":     "${PROVENANCE}",
  "cert_sha256_fp":     "${CERT_FP}",
  "der_path":           "secureboot/sita-mok.der",
  "signed_targets": {
    "shim":   "$( [ -f "$SHIM_PATH"   ] && echo true || echo false )",
    "grub":   "$( [ -f "$GRUB_PATH"   ] && echo true || echo false )",
    "kernel": "$( [ -f "$KERNEL_PATH" ] && echo true || echo false )"
  },
  "enroll_command":     "mokutil --import /boot/sita-mok.der"
}
JSON

echo "✓ MOK enrollment artifacts → ${OUT_DIR}/secureboot/"
[ "$PROVENANCE" = "dev-ephemeral" ] && \
  echo "  ⚠ DEV-ONLY key — replace with SITA_MOK_KEY/CERT secrets for production"
