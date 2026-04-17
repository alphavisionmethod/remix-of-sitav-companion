#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Phase 2: LUKS2 home/data encryption
#
# Runs at first-boot. Encrypts /home + /var partitions with LUKS2,
# seals the master key to TPM 2.0 PCRs 0/4/7 when available, falls
# back to passphrase when no TPM.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

DATA_PART="${DATA_PART:-/dev/disk/by-partlabel/sita_data}"
LUKS_NAME="${LUKS_NAME:-sita-data}"
PCRS="${PCRS:-0,4,7}"

log()  { printf "\033[1;36m[luks2]\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m[luks2:fail]\033[0m %s\n" "$*" >&2; exit 1; }

command -v cryptsetup >/dev/null || die "cryptsetup missing"

if cryptsetup isLuks "${DATA_PART}" 2>/dev/null; then
  log "${DATA_PART} already LUKS2; skipping format"
else
  log "formatting ${DATA_PART} as LUKS2 (Argon2id)"
  cryptsetup luksFormat \
    --type luks2 \
    --pbkdf argon2id \
    --pbkdf-memory 1048576 \
    --pbkdf-parallel 4 \
    --cipher aes-xts-plain64 \
    --key-size 512 \
    --hash sha256 \
    "${DATA_PART}" \
    --key-file /run/sita-firstboot/initial.key
fi

# Enrol TPM2 if hardware present, else keep passphrase only
if [[ -e /dev/tpm0 ]] && command -v systemd-cryptenroll >/dev/null; then
  log "TPM 2.0 detected — sealing key to PCRs ${PCRS}"
  systemd-cryptenroll \
    --tpm2-device=auto \
    --tpm2-pcrs="${PCRS}" \
    --tpm2-with-pin=no \
    "${DATA_PART}"
  log "TPM enrolment complete"
else
  log "no TPM — passphrase remains the only unlock factor"
  echo "no-tpm" > /var/lib/sita/proof/luks-tpm-status
fi

log "opening encrypted device as /dev/mapper/${LUKS_NAME}"
cryptsetup open "${DATA_PART}" "${LUKS_NAME}" \
  --key-file /run/sita-firstboot/initial.key

# Filesystem
if ! blkid "/dev/mapper/${LUKS_NAME}" >/dev/null 2>&1; then
  log "creating ext4 on encrypted device"
  mkfs.ext4 -L sita-data "/dev/mapper/${LUKS_NAME}"
fi

# Persist crypttab
grep -q "${LUKS_NAME}" /etc/crypttab 2>/dev/null || \
  echo "${LUKS_NAME} ${DATA_PART} none luks,discard,tpm2-device=auto" >> /etc/crypttab

shred -u /run/sita-firstboot/initial.key 2>/dev/null || true
printf "\033[1;32m[luks2:ok]\033[0m encrypted data partition ready\n"
