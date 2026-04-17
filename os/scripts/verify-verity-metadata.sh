#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Verity Metadata Verification
#
# Re-runs `veritysetup verify` against the built hash tree to prove the
# root hash in verity-receipt.json still matches both the data image and
# the hash device. Used by CI and by `npm run os:verify`.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${1:-out}"
ROOT_IMG="${SITA_ROOT_IMG:-${OUT_DIR}/sita-rootfs.squashfs}"
VERITY_IMG="${OUT_DIR}/verity.img"
RECEIPT="${OUT_DIR}/verity-receipt.json"

[[ -f "${RECEIPT}"   ]] || { echo "missing ${RECEIPT}" >&2; exit 2; }
[[ -f "${VERITY_IMG}" ]] || { echo "missing ${VERITY_IMG}" >&2; exit 2; }
[[ -f "${ROOT_IMG}"   ]] || { echo "missing ${ROOT_IMG}"   >&2; exit 2; }

ROOT_HASH="$(jq -r .rootHash "${RECEIPT}")"
echo "🔎 veritysetup verify — root hash ${ROOT_HASH:0:16}…"
veritysetup verify "${ROOT_IMG}" "${VERITY_IMG}" "${ROOT_HASH}"
echo "✅ verity metadata is consistent"
