#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Phase 2: dm-verity hash tree generator
#
# Produces a read-only verity-protected squashfs root.
# Output:
#   ${OUT}/root.squashfs          — read-only data block
#   ${OUT}/root.verity            — Merkle hash tree
#   ${OUT}/root.verity.roothash   — root hash (32 bytes hex)
#   ${OUT}/root.verity.sig        — signature over roothash (dev key)
#
# Wired by build.sh when ENABLE_VERITY=1.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOTFS_SQUASHFS="${1:?path to squashfs required}"
OUT_DIR="${2:?output directory required}"
SIGN_KEY="${SIGN_KEY:-${OUT_DIR}/keys/verity-dev.key}"

log()  { printf "\033[1;36m[verity]\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[verity:fail]\033[0m %s\n" "$*" >&2; exit 1; }

command -v veritysetup >/dev/null || die "install: apt-get install cryptsetup-bin"
command -v openssl     >/dev/null || die "install: apt-get install openssl"

mkdir -p "${OUT_DIR}/keys"

# 1) Self-signed dev signing key (replace with MOK-enrolled key in Phase 4)
if [[ ! -f "${SIGN_KEY}" ]]; then
  log "generating dev verity signing key"
  openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout "${SIGN_KEY}" \
    -out    "${SIGN_KEY%.key}.crt" \
    -days 3650 \
    -subj "/CN=SITA OS Verity Dev Key/O=SITA/OU=Platform"
fi

# 2) Generate Merkle tree
VERITY_OUT="${OUT_DIR}/root.verity"
ROOTHASH_OUT="${OUT_DIR}/root.verity.roothash"

log "building dm-verity Merkle tree over $(basename "${ROOTFS_SQUASHFS}")"
veritysetup format \
  --data-block-size=4096 \
  --hash-block-size=4096 \
  "${ROOTFS_SQUASHFS}" \
  "${VERITY_OUT}" \
  | tee "${OUT_DIR}/verity.format.log" \
  | awk -F': *' '/Root hash/ { print $2 }' \
  > "${ROOTHASH_OUT}"

ROOTHASH="$(cat "${ROOTHASH_OUT}")"
[[ -n "${ROOTHASH}" ]] || die "failed to extract root hash"
log "root hash: ${ROOTHASH}"

# 3) Sign the root hash
SIG_OUT="${OUT_DIR}/root.verity.sig"
echo -n "${ROOTHASH}" | openssl dgst -sha256 -sign "${SIGN_KEY}" -out "${SIG_OUT}"
log "signed root hash → $(basename "${SIG_OUT}")"

# 4) Emit kernel cmdline fragment
CMDLINE_OUT="${OUT_DIR}/verity.cmdline"
cat > "${CMDLINE_OUT}" <<EOF
verity.roothash=${ROOTHASH} verity.hashdev=PARTLABEL=sita_verity_a verity.datadev=PARTLABEL=sita_root_a ro
EOF
log "kernel cmdline → $(basename "${CMDLINE_OUT}")"

printf "\033[1;32m[verity:ok]\033[0m hash tree + signature + cmdline written to %s\n" "${OUT_DIR}"
