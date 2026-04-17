#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Update Bundle Builder
#
# Packages the current ISO + receipts as an A/B-slot update bundle:
#   sita-os-<version>.bundle      tar(zstd) of:
#     ├── manifest.json           (version, channel, root-hash, prev-version)
#     ├── rootfs.squashfs         (the new slot image)
#     ├── verity.img              (matching hash tree)
#     ├── vmlinuz + initrd.img    (signed)
#     └── attestation.json        (full provenance)
#
#   sita-os-<version>.bundle.sig  detached MOK signature
#
# Apply path: sita-updated --apply <bundle>  →  writes inactive slot,
#             updates loader entry, sets next-boot, requires reboot.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

VERSION="${1:?version required (e.g. 0.2.0)}"
CHANNEL="${2:-stable}"
OUT_DIR="${SITA_OUT_DIR:-out}"
BUNDLE_DIR="${OUT_DIR}/bundle-${VERSION}"
BUNDLE="${OUT_DIR}/sita-os-${VERSION}.bundle"

[[ -f "${OUT_DIR}/sita-rootfs.squashfs" ]] || { echo "build the ISO first" >&2; exit 2; }

echo "📦 staging update bundle for ${VERSION} (${CHANNEL})"
rm -rf "${BUNDLE_DIR}"
mkdir -p "${BUNDLE_DIR}"

cp "${OUT_DIR}/sita-rootfs.squashfs" "${BUNDLE_DIR}/rootfs.squashfs"
cp "${OUT_DIR}/verity.img"           "${BUNDLE_DIR}/verity.img"
cp "${OUT_DIR}"/vmlinuz*             "${BUNDLE_DIR}/vmlinuz"
cp "${OUT_DIR}"/initrd*              "${BUNDLE_DIR}/initrd.img"
cp generated/os-build-attestation.json "${BUNDLE_DIR}/attestation.json"

ROOT_HASH="$(jq -r .rootHash "${OUT_DIR}/verity-receipt.json")"
PREV_VERSION="$(jq -r .current.version os/update/channel-manifest.template.json 2>/dev/null || echo 0.0.0)"

cat > "${BUNDLE_DIR}/manifest.json" <<JSON
{
  "schema": "sita-os-update/v1",
  "version": "${VERSION}",
  "channel": "${CHANNEL}",
  "rootHash": "${ROOT_HASH}",
  "minPreviousVersion": "${PREV_VERSION}",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "applyMode": "ab-slot",
  "rebootRequired": true,
  "rollbackAfterFailedBoots": 2
}
JSON

echo "🗜  compressing"
tar --sort=name -C "${BUNDLE_DIR}" -cf - . | zstd -19 -T0 -o "${BUNDLE}"

# Detached signature (uses same MOK path as kernel signer)
if [[ -n "${SITA_MOK_KEY:-}" ]]; then
  echo "🔏 signing bundle"
  openssl dgst -sha256 -sign "${SITA_MOK_KEY}" -out "${BUNDLE}.sig" "${BUNDLE}"
  KEY_KIND="production-mok"
else
  echo "⚠️  no MOK — bundle is unsigned (dev only)"
  KEY_KIND="unsigned"
fi

SHA="$(sha256sum "${BUNDLE}" | cut -d' ' -f1)"
SIZE="$(stat -c %s "${BUNDLE}")"

# Update channel manifest in-place
CHANNEL_MANIFEST="${OUT_DIR}/channel-${CHANNEL}.json"
jq \
  --arg v "${VERSION}" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg sha "${SHA}" --arg sz "${SIZE}" --arg key "${KEY_KIND}" \
  --arg prev "${PREV_VERSION}" \
  '.current = {
      version: $v,
      released: $ts,
      bundleSize: ($sz|tonumber),
      bundleSha256: $sha,
      bundleSignedBy: $key,
      minPreviousVersion: $prev,
      rolloutPercent: 0
   }
   | .history = ([{version: $prev, releasedBefore: $ts}] + (.history // []))[0:20]' \
  os/update/channel-manifest.template.json > "${CHANNEL_MANIFEST}"

echo "✅ bundle:           ${BUNDLE}  ($(numfmt --to=iec ${SIZE}))"
echo "✅ channel manifest: ${CHANNEL_MANIFEST}"
rm -rf "${BUNDLE_DIR}"
