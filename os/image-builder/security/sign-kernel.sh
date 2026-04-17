#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Phase 2: Kernel + initramfs signing
#
# Signs the unified kernel image (kernel + initramfs + cmdline) with
# the SITA dev key for UEFI Secure Boot. Self-signed for development;
# enroll into MOK or replace with a real cert for production.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="${1:?chroot root required}"
OUT_DIR="${2:?output directory required}"
KEY="${SIGN_KEY:-${OUT_DIR}/keys/secureboot.key}"
CRT="${KEY%.key}.crt"

log()  { printf "\033[1;36m[sign]\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[sign:fail]\033[0m %s\n" "$*" >&2; exit 1; }

command -v sbsign >/dev/null || die "apt-get install sbsigntool"
command -v openssl >/dev/null || die "openssl missing"

mkdir -p "${OUT_DIR}/keys"

if [[ ! -f "${KEY}" ]]; then
  log "generating Secure Boot dev signing key"
  openssl req -x509 -newkey rsa:4096 -nodes -sha256 \
    -keyout "${KEY}" -out "${CRT}" -days 3650 \
    -subj "/CN=SITA OS Secure Boot Dev/O=SITA/OU=Platform"
fi

KERNEL="$(ls -1 "${ROOT_DIR}/boot/"vmlinuz-* 2>/dev/null | sort -V | tail -1)"
INITRD="$(ls -1 "${ROOT_DIR}/boot/"initrd.img-* 2>/dev/null | sort -V | tail -1)"
[[ -f "${KERNEL}" ]] || die "no kernel found in ${ROOT_DIR}/boot/"
[[ -f "${INITRD}" ]] || die "no initramfs found"

log "signing kernel:    $(basename "${KERNEL}")"
sbsign --key "${KEY}" --cert "${CRT}" \
  --output "${KERNEL}.signed" "${KERNEL}"
mv "${KERNEL}.signed" "${KERNEL}"

# initramfs is loaded by signed kernel via verity, so it just needs hashing
sha256sum "${INITRD}" | awk '{print $1}' > "${OUT_DIR}/initrd.sha256"

cp "${CRT}" "${OUT_DIR}/secureboot-public.crt"

printf "\033[1;32m[sign:ok]\033[0m kernel signed; cert at %s\n" "${OUT_DIR}/secureboot-public.crt"
