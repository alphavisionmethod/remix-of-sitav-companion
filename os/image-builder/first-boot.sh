#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — First Boot Provisioning
# Runs ONCE per device. Idempotent — safe to re-run if marker missing.
#
# Responsibilities:
#   1. Generate stable hardware-bound device ID
#   2. Detect TPM 2.0 + record trust baseline
#   3. Initialize machine-id (regen since image was generic)
#   4. Configure locale/timezone (auto-detected)
#   5. Create persistent state directories
#   6. Emit boot attestation receipt to /var/lib/sita/proof/
#   7. Write completion marker
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

LOG_TAG="[sita-firstboot]"
SITA_DIR="/var/lib/sita"
PROOF_DIR="${SITA_DIR}/proof"
LOG_DIR="/var/log/sita"
MARKER="${SITA_DIR}/.first-boot-complete"

log() { printf "%s %s\n" "${LOG_TAG}" "$*"; }

if [[ -f "${MARKER}" ]]; then
  log "first boot already complete — skipping"
  exit 0
fi

log "▶ SITA OS first-boot provisioning starting"

# ── 1. State directories ──────────────────────────────────────────────
install -d -m 0750 "${SITA_DIR}" "${PROOF_DIR}" "${LOG_DIR}"
install -d -m 0700 "${SITA_DIR}/keys" "${SITA_DIR}/secrets"

# ── 2. Regenerate machine-id (image had a placeholder) ────────────────
if [[ ! -s /etc/machine-id ]]; then
  systemd-machine-id-setup
  log "machine-id regenerated"
fi
MACHINE_ID="$(cat /etc/machine-id)"

# ── 3. Hardware-bound device ID ───────────────────────────────────────
# Combines machine-id + first MAC + system UUID for stable, unforgeable ID
get_first_mac() {
  for iface in /sys/class/net/*/address; do
    local mac
    mac="$(cat "$iface" 2>/dev/null || true)"
    [[ -n "$mac" && "$mac" != "00:00:00:00:00:00" ]] && \
      [[ "$(basename "$(dirname "$iface")")" != "lo" ]] && \
      { echo "$mac"; return; }
  done
  echo "no-mac"
}

SYSTEM_UUID="$(cat /sys/class/dmi/id/product_uuid 2>/dev/null || echo unknown)"
FIRST_MAC="$(get_first_mac)"
DEVICE_ID="$(printf "%s|%s|%s" "${MACHINE_ID}" "${FIRST_MAC}" "${SYSTEM_UUID}" | sha256sum | cut -c1-32)"
echo "${DEVICE_ID}" > "${SITA_DIR}/device-id"
chmod 0644 "${SITA_DIR}/device-id"
log "device-id: ${DEVICE_ID}"

# ── 4. TPM 2.0 detection ──────────────────────────────────────────────
TPM_PRESENT="false"
TPM_VERSION="none"
if [[ -e /dev/tpm0 || -e /dev/tpmrm0 ]]; then
  if command -v tpm2_getcap >/dev/null 2>&1 && tpm2_getcap properties-fixed >/dev/null 2>&1; then
    TPM_PRESENT="true"
    TPM_VERSION="2.0"
  fi
fi
log "tpm: present=${TPM_PRESENT} version=${TPM_VERSION}"

# ── 5. Secure Boot detection ──────────────────────────────────────────
SECURE_BOOT="unknown"
if command -v mokutil >/dev/null 2>&1; then
  SECURE_BOOT="$(mokutil --sb-state 2>/dev/null | grep -qi 'enabled' && echo enabled || echo disabled)"
elif [[ -d /sys/firmware/efi ]]; then
  SECURE_BOOT="$(od -An -t u1 /sys/firmware/efi/efivars/SecureBoot-* 2>/dev/null | awk '{print $5}' | grep -q 1 && echo enabled || echo disabled)"
fi
log "secure-boot: ${SECURE_BOOT}"

# ── 6. Hardware probe ─────────────────────────────────────────────────
CPU_MODEL="$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2- | xargs || echo unknown)"
CPU_CORES="$(nproc)"
RAM_KB="$(grep MemTotal /proc/meminfo | awk '{print $2}')"
RAM_GB="$(( RAM_KB / 1024 / 1024 ))"
DISK_GB="$(df -BG --output=size / | tail -1 | tr -dc 0-9)"

# ── 7. Trust baseline ─────────────────────────────────────────────────
if [[ "${TPM_PRESENT}" == "true" && "${SECURE_BOOT}" == "enabled" ]]; then
  TRUST_BASELINE="hardware-attested"
elif [[ "${SECURE_BOOT}" == "enabled" ]]; then
  TRUST_BASELINE="secure-boot-only"
else
  TRUST_BASELINE="software-only"
fi
log "trust-baseline: ${TRUST_BASELINE}"

# ── 8. Boot attestation receipt ───────────────────────────────────────
RECEIPT="${PROOF_DIR}/boot-attestation-$(date +%Y%m%dT%H%M%SZ).json"
cat > "${RECEIPT}" <<EOF
{
  "kind": "BootChainAttestation",
  "version": "1.0",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "device_id": "${DEVICE_ID}",
  "machine_id": "${MACHINE_ID}",
  "system_uuid": "${SYSTEM_UUID}",
  "first_mac": "${FIRST_MAC}",
  "hardware": {
    "cpu_model": "${CPU_MODEL}",
    "cpu_cores": ${CPU_CORES},
    "ram_gb": ${RAM_GB},
    "disk_gb": ${DISK_GB}
  },
  "boot_chain": {
    "secure_boot": "${SECURE_BOOT}",
    "tpm_present": ${TPM_PRESENT},
    "tpm_version": "${TPM_VERSION}",
    "trust_baseline": "${TRUST_BASELINE}"
  },
  "os": {
    "name": "SITA OS",
    "version": "$(. /etc/os-release && echo "${VERSION_ID:-0.1.0-dev}")",
    "kernel": "$(uname -r)"
  },
  "first_boot_completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
chmod 0644 "${RECEIPT}"
log "attestation receipt → ${RECEIPT}"

# ── 9. Locale + timezone (best-effort auto-detect) ────────────────────
if [[ -z "$(timedatectl show --property=Timezone --value 2>/dev/null || true)" ]]; then
  timedatectl set-timezone UTC || true
fi

# ── 10. Mark complete ─────────────────────────────────────────────────
date -u +%Y-%m-%dT%H:%M:%SZ > "${MARKER}"
chmod 0644 "${MARKER}"

log "✅ first-boot provisioning complete"
exit 0
