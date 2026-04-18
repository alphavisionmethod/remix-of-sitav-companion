#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Secure Boot / shim+MOK Enrollment Automation
#
# Builds the shim chain consumed at first boot:
#
#   shimx64.efi  (Microsoft-signed loader from `shim-signed`)
#     → grubx64.efi    (signed with our MOK)
#       → vmlinuz       (signed with our MOK — see sign-kernel.sh)
#         → initrd      (signed-by-detached — see sign-initramfs.sh)
#
# Outputs (all under $SITA_OUT_DIR):
#   shim/shimx64.efi
#   shim/grubx64.efi
#   shim/MOK.cer          (DER, the cert end-users enroll in MokManager)
#   shim/MOK.fingerprint  (sha256 of cert)
#   shim/mok-enroll.json  (machine-readable manifest)
#
# At first boot, sita-firstboot.service runs `mokutil --import MOK.cer`
# so the next reboot prompts the user (one-time) to enroll the MOK.
# After enrollment, all subsequent kernels and initrds we sign with the
# matching MOK key are accepted under Secure Boot.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
KEYS_DIR="${SITA_KEYS_DIR:-os/keys}"
SHIM_OUT="${OUT_DIR}/shim"
SHIM_SRC="${SITA_SHIM_SRC:-/usr/lib/shim/shimx64.efi.signed}"
GRUB_SRC="${SITA_GRUB_SRC:-/usr/lib/grub/x86_64-efi/grubx64.efi}"
MOK_KEY="${KEYS_DIR}/MOK.key"
MOK_CRT="${KEYS_DIR}/MOK.crt"

mkdir -p "${SHIM_OUT}"

echo "🔏 Secure Boot / MOK enrollment artifacts"
echo "   keys:   ${KEYS_DIR}"
echo "   out:    ${SHIM_OUT}"

# 1. Ensure MOK keypair exists (idempotent — sign-kernel.sh also generates)
if [[ ! -f "${MOK_KEY}" || ! -f "${MOK_CRT}" ]]; then
  echo "🔑 generating MOK keypair (one-time)"
  mkdir -p "${KEYS_DIR}"
  openssl req -new -x509 -newkey rsa:3072 -keyout "${MOK_KEY}" \
    -out "${MOK_CRT}" -nodes -days 3650 \
    -subj "/CN=SITA OS Machine Owner Key/O=SITA/" \
    -addext "extendedKeyUsage=codeSigning"
  chmod 600 "${MOK_KEY}"
fi

# 2. Stage shim — accept either real shim-signed install or a passthrough
if [[ -f "${SHIM_SRC}" ]]; then
  cp "${SHIM_SRC}" "${SHIM_OUT}/shimx64.efi"
  SHIM_MODE="vendor-signed"
else
  echo "⚠  ${SHIM_SRC} not present — emitting placeholder shim wrapper"
  echo "   (build host lacks shim-signed; CI install: apt-get install -y shim-signed)"
  printf 'SITA-SHIM-PLACEHOLDER\n' > "${SHIM_OUT}/shimx64.efi"
  SHIM_MODE="placeholder"
fi

# 3. Stage and sign grub
if [[ -f "${GRUB_SRC}" ]]; then
  cp "${GRUB_SRC}" "${SHIM_OUT}/grubx64.efi"
  if command -v sbsign >/dev/null 2>&1; then
    sbsign --key "${MOK_KEY}" --cert "${MOK_CRT}" \
      --output "${SHIM_OUT}/grubx64.efi" "${SHIM_OUT}/grubx64.efi"
    GRUB_MODE="signed"
  else
    echo "⚠  sbsign not present — grub left unsigned"
    GRUB_MODE="unsigned"
  fi
else
  echo "⚠  ${GRUB_SRC} not present — emitting placeholder grub wrapper"
  printf 'SITA-GRUB-PLACEHOLDER\n' > "${SHIM_OUT}/grubx64.efi"
  GRUB_MODE="placeholder"
fi

# 4. Export MOK cert in DER form (mokutil format)
openssl x509 -in "${MOK_CRT}" -outform DER -out "${SHIM_OUT}/MOK.cer"
FP="$(openssl x509 -in "${MOK_CRT}" -noout -fingerprint -sha256 \
       | sed 's/^.*=//; s/://g' | tr 'A-F' 'a-f')"
printf '%s\n' "${FP}" > "${SHIM_OUT}/MOK.fingerprint"

# 5. Hashes
SHIM_SHA="$(sha256sum "${SHIM_OUT}/shimx64.efi" | awk '{print $1}')"
GRUB_SHA="$(sha256sum "${SHIM_OUT}/grubx64.efi" | awk '{print $1}')"
MOK_SHA="$(sha256sum "${SHIM_OUT}/MOK.cer"      | awk '{print $1}')"

cat > "${SHIM_OUT}/mok-enroll.json" <<JSON
{
  "$schema": "https://sita.dev/schemas/mok-enroll.v1.json",
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "shim":  { "path": "shim/shimx64.efi",  "sha256": "${SHIM_SHA}", "mode": "${SHIM_MODE}" },
  "grub":  { "path": "shim/grubx64.efi",  "sha256": "${GRUB_SHA}", "mode": "${GRUB_MODE}" },
  "mok":   {
    "certPath": "shim/MOK.cer",
    "sha256":   "${MOK_SHA}",
    "fingerprintSha256": "${FP}",
    "subject":  "$(openssl x509 -in "${MOK_CRT}" -noout -subject | sed 's/^subject=//')"
  },
  "firstBootCommand": "mokutil --import /boot/efi/EFI/sita/MOK.cer"
}
JSON

echo "✅ shim chain staged"
echo "   shim:   ${SHIM_OUT}/shimx64.efi  (${SHIM_MODE})"
echo "   grub:   ${SHIM_OUT}/grubx64.efi  (${GRUB_MODE})"
echo "   MOK:    ${SHIM_OUT}/MOK.cer       fp=${FP}"
echo "   manifest: ${SHIM_OUT}/mok-enroll.json"
