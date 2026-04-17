#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — dm-verity Hash Tree Builder (canonical)
#
# Wraps image-builder/security/dm-verity-setup.sh and produces:
#   • verity hash device (out/verity.img)
#   • root hash + salt
#   • kernel cmdline fragment for systemd-boot
#   • verity-receipt.json
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_IMG="${1:?root squashfs/image required}"
OUT_DIR="${SITA_OUT_DIR:-out}"
mkdir -p "${OUT_DIR}"

command -v veritysetup >/dev/null || { echo "apt-get install cryptsetup-bin" >&2; exit 1; }

VERITY_IMG="${OUT_DIR}/verity.img"
RECEIPT="${OUT_DIR}/verity-receipt.json"
CMDLINE="${OUT_DIR}/verity.cmdline"

echo "🌳 building verity hash tree for ${ROOT_IMG}"
OUTPUT="$(veritysetup format "${ROOT_IMG}" "${VERITY_IMG}")"
echo "${OUTPUT}"

ROOT_HASH="$(echo "${OUTPUT}" | awk '/Root hash:/ {print $3}')"
SALT="$(echo "${OUTPUT}" | awk '/Salt:/ {print $2}')"
DATA_BLOCKS="$(echo "${OUTPUT}" | awk '/Data blocks:/ {print $3}')"
HASH_BLOCK="$(echo "${OUTPUT}" | awk '/Hash block size:/ {print $4}')"

# Kernel cmdline fragment — installer reads /tmp/verity-out/verity.cmdline
echo "rd.systemd.verity=1 systemd.verity_root_data=PARTLABEL=sita_root_a systemd.verity_root_hash=${ROOT_HASH} systemd.verity_root_options=panic-on-corruption" > "${CMDLINE}"

cat > "${RECEIPT}" <<JSON
{
  "artifact": "$(basename "${VERITY_IMG}")",
  "sourceImage": "$(basename "${ROOT_IMG}")",
  "rootHash": "${ROOT_HASH}",
  "salt": "${SALT}",
  "dataBlocks": ${DATA_BLOCKS:-0},
  "hashBlockSize": ${HASH_BLOCK:-4096},
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "panicOnCorruption": true
}
JSON

echo "✅ verity built"
echo "   hash: ${ROOT_HASH}"
echo "   cmdline: ${CMDLINE}"
echo "   receipt: ${RECEIPT}"
