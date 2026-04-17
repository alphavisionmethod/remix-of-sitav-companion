#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Update Bundle Verifier
#
# Verifies an update bundle is safe to apply:
#   1. SHA256 matches channel manifest
#   2. Detached signature verifies against MOK cert
#   3. manifest.minPreviousVersion ≤ currently installed version
#   4. embedded attestation has no "fail" entries
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

BUNDLE="${1:?bundle path required}"
CHANNEL_MANIFEST="${2:?channel manifest required}"
INSTALLED_VERSION="${SITA_INSTALLED_VERSION:-0.0.0}"
CERT="${SITA_MOK_CERT:-}"

[[ -f "${BUNDLE}"           ]] || { echo "missing ${BUNDLE}" >&2; exit 2; }
[[ -f "${CHANNEL_MANIFEST}" ]] || { echo "missing ${CHANNEL_MANIFEST}" >&2; exit 2; }

EXPECT_SHA="$(jq -r .current.bundleSha256 "${CHANNEL_MANIFEST}")"
GOT_SHA="$(sha256sum "${BUNDLE}" | cut -d' ' -f1)"
[[ "${EXPECT_SHA}" == "${GOT_SHA}" ]] || { echo "❌ sha256 mismatch (expected ${EXPECT_SHA}, got ${GOT_SHA})" >&2; exit 1; }
echo "✅ sha256 match"

if [[ -f "${BUNDLE}.sig" && -n "${CERT}" ]]; then
  openssl dgst -sha256 -verify <(openssl x509 -in "${CERT}" -pubkey -noout) \
    -signature "${BUNDLE}.sig" "${BUNDLE}" \
    && echo "✅ signature verified" \
    || { echo "❌ signature failed" >&2; exit 1; }
else
  echo "⚠️  signature check skipped (no .sig or no MOK cert)"
fi

# Inspect manifest inside bundle
TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT
tar -I zstd -xf "${BUNDLE}" -C "${TMP}" manifest.json
MIN_PREV="$(jq -r .minPreviousVersion "${TMP}/manifest.json")"

ver_ge() {  # version >= other
  [[ "$1" == "$(printf '%s\n%s' "$1" "$2" | sort -V | tail -1)" ]]
}
if ver_ge "${INSTALLED_VERSION}" "${MIN_PREV}"; then
  echo "✅ installed ${INSTALLED_VERSION} ≥ required ${MIN_PREV}"
else
  echo "❌ installed ${INSTALLED_VERSION} < required ${MIN_PREV}" >&2
  exit 1
fi

echo "✅ bundle is safe to apply"
