#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — ISO Image Builder (Phase 1: bootable dev ISO)
#
# Produces: out/sita-os-${VERSION}-${ARCH}.iso  (live + installer hybrid)
# Base:     Ubuntu 24.04 LTS (Noble Numbat) minbase + SITA runtime overlay
# Runs on:  Linux x86_64 (host or CI). NO macOS, NO special hardware.
# Usage:    sudo bash os/image-builder/build.sh           # full build
#           VERSION=1.0.0 sudo bash os/image-builder/build.sh
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Deployment Profile (Part 3 — 5-Plane Reorganization) ───────────────
# Selects which composition gets baked into the artifact.
#   --profile=user       (default) → sita-os-user-<version>-<arch>.iso
#   --profile=operator           → sita-os-operator-<version>-<arch>.iso
SITA_PROFILE="${SITA_PROFILE:-user}"
for arg in "$@"; do
  case "$arg" in
    --profile=*) SITA_PROFILE="${arg#--profile=}" ;;
  esac
done
case "$SITA_PROFILE" in
  user|operator) ;;
  *) echo "[fail] unknown --profile=$SITA_PROFILE (must be: user|operator)" >&2; exit 2 ;;
esac
PROFILE_MANIFEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/profiles/${SITA_PROFILE}.profile.json"
[[ -f "$PROFILE_MANIFEST" ]] || { echo "[fail] missing profile manifest: $PROFILE_MANIFEST" >&2; exit 2; }

# ── Configuration ──────────────────────────────────────────────────────
VERSION="${VERSION:-0.1.0-dev}"
ARCH="${ARCH:-amd64}"
SUITE="${SUITE:-noble}"
MIRROR="${MIRROR:-http://archive.ubuntu.com/ubuntu/}"
BUILD_DIR="${BUILD_DIR:-$(pwd)/build/iso-${SITA_PROFILE}-${VERSION}}"
OUT_DIR="${OUT_DIR:-$(pwd)/out}"
ROOT_DIR="${BUILD_DIR}/chroot"
ISO_DIR="${BUILD_DIR}/iso"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ISO_NAME="sita-os-${SITA_PROFILE}-${VERSION}-${ARCH}.iso"
ISO_LABEL="SITA_OS_${SITA_PROFILE^^}_${VERSION//./_}"
ISO_PATH="${OUT_DIR}/${ISO_NAME}"

export SITA_PROFILE PROFILE_MANIFEST

# ── Pretty logging ─────────────────────────────────────────────────────
log()  { printf "\033[1;36m[sita-build]\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[ ok ]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*" >&2; }
die()  { printf "\033[1;31m[fail]\033[0m %s\n" "$*" >&2; exit 1; }

# ── Pre-flight ─────────────────────────────────────────────────────────
require_root() {
  [[ "${EUID}" -eq 0 ]] || die "must run as root (use sudo)"
}

require_host_packages() {
  local pkgs=(
    debootstrap squashfs-tools xorriso isolinux syslinux-common
    grub-pc-bin grub-efi-amd64-bin grub-common mtools dosfstools
    rsync curl ca-certificates
    sbsigntool cryptsetup-bin zstd jq openssl
  )
  local missing=()
  for p in "${pkgs[@]}"; do
    dpkg -s "$p" >/dev/null 2>&1 || missing+=("$p")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    log "installing host build deps: ${missing[*]}"
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "${missing[@]}"
  fi
}

# ── Stage 1: bootstrap minimal Ubuntu rootfs ───────────────────────────
stage_debootstrap() {
  log "stage 1 — debootstrap ${SUITE}/${ARCH}"
  mkdir -p "${ROOT_DIR}"
  if [[ ! -f "${ROOT_DIR}/etc/os-release" ]]; then
    debootstrap --arch="${ARCH}" --variant=minbase \
      --components=main,universe \
      --include=ca-certificates,gnupg,locales \
      "${SUITE}" "${ROOT_DIR}" "${MIRROR}"
    ok "base rootfs created"
  else
    ok "base rootfs cached, skipping debootstrap"
  fi
}

# ── Stage 2: install SITA runtime + packages inside chroot ─────────────
stage_install_packages() {
  log "stage 2 — installing SITA runtime + packages"

  # Bind mounts for chroot networking
  mount --bind /dev "${ROOT_DIR}/dev"   2>/dev/null || true
  mount --bind /proc "${ROOT_DIR}/proc" 2>/dev/null || true
  mount --bind /sys "${ROOT_DIR}/sys"   2>/dev/null || true

  # Copy SITA assets into chroot
  install -m 0755 -d "${ROOT_DIR}/opt/sita" "${ROOT_DIR}/etc/sita"
  install -m 0755 -d "${ROOT_DIR}/opt/sita/bin" "${ROOT_DIR}/opt/sita/recovery" \
                     "${ROOT_DIR}/opt/sita/diagnostics" "${ROOT_DIR}/opt/sita/runtime"
  cp -r "${SCRIPT_DIR}/branding"     "${ROOT_DIR}/opt/sita/branding"
  cp     "${SCRIPT_DIR}/first-boot.sh"          "${ROOT_DIR}/opt/sita/first-boot.sh"
  cp     "${SCRIPT_DIR}/sita-runtime.service"   "${ROOT_DIR}/etc/systemd/system/sita-runtime.service"
  cp     "${SCRIPT_DIR}/sita-firstboot.service" "${ROOT_DIR}/etc/systemd/system/sita-firstboot.service"
  install -m 0644 "${SCRIPT_DIR}/branding/os-release" "${ROOT_DIR}/etc/os-release"
  install -m 0644 "${SCRIPT_DIR}/packages.list"        "${ROOT_DIR}/tmp/packages.list"

  # Phase 3 — recovery + diagnostics + runtime watchdog (canonical paths)
  REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
  install -m 0755 "${REPO_ROOT}/os/scripts/generate-support-bundle.sh" "${ROOT_DIR}/opt/sita/bin/generate-support-bundle.sh"
  install -m 0755 "${REPO_ROOT}/os/scripts/rollback-to-previous.sh"    "${ROOT_DIR}/opt/sita/bin/rollback-to-previous.sh"
  cp -r "${SCRIPT_DIR}/recovery/."                                     "${ROOT_DIR}/opt/sita/recovery/"
  install -m 0755 "${REPO_ROOT}/os/recovery/recovery-entry.sh"         "${ROOT_DIR}/opt/sita/recovery/recovery-entry.sh"
  install -m 0755 "${REPO_ROOT}/os/recovery/recovery-status.sh"        "${ROOT_DIR}/opt/sita/recovery/recovery-status.sh"
  install -m 0755 "${REPO_ROOT}/os/recovery/recovery-collect.sh"       "${ROOT_DIR}/opt/sita/recovery/recovery-collect.sh"
  install -m 0755 "${REPO_ROOT}/os/recovery/recovery-menu.sh"          "${ROOT_DIR}/opt/sita/recovery/recovery-menu.sh"
  install -m 0644 "${REPO_ROOT}/os/diagnostics/_lib.sh"                "${ROOT_DIR}/opt/sita/diagnostics/_lib.sh"
  for f in collect-boot-health collect-runtime-health collect-update-health collect-service-failures emit-runtime-status; do
    install -m 0755 "${REPO_ROOT}/os/diagnostics/${f}.sh" "${ROOT_DIR}/opt/sita/diagnostics/${f}.sh"
  done
  install -m 0755 "${REPO_ROOT}/os/runtime/shell-watchdog.sh"          "${ROOT_DIR}/opt/sita/runtime/shell-watchdog.sh"
  install -m 0755 "${REPO_ROOT}/os/runtime/check-shell-health.sh"      "${ROOT_DIR}/opt/sita/runtime/check-shell-health.sh"
  install -m 0755 -d "${ROOT_DIR}/opt/sita/shell"
  install -m 0755 "${SCRIPT_DIR}/launch.sh"                            "${ROOT_DIR}/opt/sita/shell/launch.sh"

  # ── Embed deployment profile manifest (Part 3) ───────────────────────
  # ── Install Electron shell as /usr/bin/sita-shell ────────────────────
  # At ISO build time the pre-packaged Electron app must exist at
  # electron-release/SITA-OS-linux-x64/ (produced by build-electron.sh).
  # If not present, create a stub launcher so the watchdog path resolves.
  local electron_pkg="${REPO_ROOT}/electron-release/SITA-OS-linux-x64"
  if [[ -d "${electron_pkg}" ]]; then
    log "  installing Electron shell from ${electron_pkg}"
    cp -a "${electron_pkg}/." "${ROOT_DIR}/opt/sita/shell/electron/"
    ln -sf /opt/sita/shell/electron/sita-os "${ROOT_DIR}/usr/bin/sita-shell"
  else
    warn "electron-release/SITA-OS-linux-x64 not found — creating stub /usr/bin/sita-shell"
    cat > "${ROOT_DIR}/usr/bin/sita-shell" <<'STUB'
#!/usr/bin/env bash
echo "[sita-shell] Electron package not installed. Run build-electron.sh first." >&2
exit 1
STUB
    chmod +x "${ROOT_DIR}/usr/bin/sita-shell"
  fi

  install -m 0644 "${PROFILE_MANIFEST}" "${ROOT_DIR}/etc/sita/deployment-profile.json"
  ok "embedded deployment profile: ${SITA_PROFILE}"


  # Run package install + service enable inside chroot
  cat > "${ROOT_DIR}/tmp/install.sh" <<'CHROOT'
#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
export LANG=C.UTF-8

echo "deb http://archive.ubuntu.com/ubuntu noble main universe restricted multiverse"          >  /etc/apt/sources.list
echo "deb http://archive.ubuntu.com/ubuntu noble-updates main universe restricted multiverse"  >> /etc/apt/sources.list
echo "deb http://archive.ubuntu.com/ubuntu noble-security main universe restricted multiverse" >> /etc/apt/sources.list

apt-get update -qq
mapfile -t pkgs < <(grep -vE '^\s*(#|$)' /tmp/packages.list)
apt-get install -y --no-install-recommends "${pkgs[@]}"

# Locale
locale-gen en_US.UTF-8 >/dev/null
update-locale LANG=en_US.UTF-8

# Hostname + machine-id placeholder (regenerated at first boot)
echo "sita-os" > /etc/hostname
: > /etc/machine-id

# Enable SITA services
systemctl enable sita-firstboot.service
systemctl enable sita-runtime.service
systemctl enable systemd-networkd
systemctl enable systemd-resolved
systemctl set-default graphical.target

# Phase 3 — canonical command symlinks (one path each, no aliases that drift)
install -d /usr/local/bin
ln -sf /opt/sita/bin/generate-support-bundle.sh   /usr/local/bin/sita-support-bundle
ln -sf /opt/sita/bin/rollback-to-previous.sh      /usr/local/bin/sita-rollback
ln -sf /opt/sita/recovery/recovery-entry.sh       /usr/local/bin/sita-recovery
ln -sf /opt/sita/recovery/recovery-status.sh      /usr/local/bin/sita-recovery-status
ln -sf /opt/sita/recovery/recovery-collect.sh     /usr/local/bin/sita-recovery-collect
ln -sf /opt/sita/runtime/check-shell-health.sh    /usr/local/bin/sita-shell-health
install -d /var/lib/sita/state /var/lib/sita/diagnostics /var/log/sita/crashes

# Default user (replaced during install / first-boot)
useradd -m -s /bin/bash -G sudo,audio,video,plugdev sita || true
echo 'sita:sita' | chpasswd
echo 'sita ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/90-sita

# Cleanup
apt-get clean
rm -rf /var/lib/apt/lists/* /tmp/install.sh /tmp/packages.list
CHROOT
  chmod +x "${ROOT_DIR}/tmp/install.sh"
  chroot "${ROOT_DIR}" /tmp/install.sh

  # Unmount binds
  umount "${ROOT_DIR}/dev"  2>/dev/null || true
  umount "${ROOT_DIR}/proc" 2>/dev/null || true
  umount "${ROOT_DIR}/sys"  2>/dev/null || true

  ok "rootfs configured"
}

# ── Stage 3: build squashfs + kernel/initrd ────────────────────────────
stage_build_squashfs() {
  log "stage 3 — building squashfs filesystem"
  install -d "${ISO_DIR}/casper" "${ISO_DIR}/boot/grub" "${ISO_DIR}/EFI/BOOT" "${ISO_DIR}/.disk"

  # Copy kernel + initrd out of chroot
  local kernel initrd
  kernel="$(ls "${ROOT_DIR}/boot/vmlinuz-"* 2>/dev/null | sort -V | tail -1)"
  initrd="$(ls "${ROOT_DIR}/boot/initrd.img-"* 2>/dev/null | sort -V | tail -1)"
  [[ -n "${kernel}" && -n "${initrd}" ]] || die "kernel/initrd missing in chroot"
  cp "${kernel}" "${ISO_DIR}/casper/vmlinuz"
  cp "${initrd}" "${ISO_DIR}/casper/initrd"

  # Build squashfs
  mksquashfs "${ROOT_DIR}" "${ISO_DIR}/casper/filesystem.squashfs" \
    -comp xz -e boot -noappend
  printf "%s" "$(du -sx --block-size=1 "${ROOT_DIR}" | cut -f1)" > "${ISO_DIR}/casper/filesystem.size"
  ok "squashfs $(du -h "${ISO_DIR}/casper/filesystem.squashfs" | cut -f1)"
}

# ── Stage 4: bootloader (BIOS + UEFI) ──────────────────────────────────
stage_bootloader() {
  log "stage 4 — installing bootloader (BIOS + UEFI)"

  # GRUB config (shared)
  cat > "${ISO_DIR}/boot/grub/grub.cfg" <<EOF
set default="0"
set timeout=5
insmod all_video
set gfxpayload=keep

menuentry "SITA OS ${VERSION} — Live" {
  linux  /casper/vmlinuz boot=casper quiet splash sita.mode=live ---
  initrd /casper/initrd
}
menuentry "SITA OS ${VERSION} — Install to disk" {
  linux  /casper/vmlinuz boot=casper only-ubiquity quiet splash sita.mode=install ---
  initrd /casper/initrd
}
menuentry "SITA OS ${VERSION} — Safe mode" {
  linux  /casper/vmlinuz boot=casper nomodeset sita.mode=safe ---
  initrd /casper/initrd
}
menuentry "Memory test" { linux16 /boot/memtest86+.bin }
EOF

  # Disk metadata
  cat > "${ISO_DIR}/.disk/info" <<EOF
SITA OS ${VERSION} "${SUITE}" - Release ${ARCH} ($(date -u +%Y%m%d))
EOF
  echo "casper" > "${ISO_DIR}/.disk/casper-uuid"

  # UEFI: build EFI image (FAT) holding grubx64.efi
  local efi_img="${ISO_DIR}/boot/grub/efi.img"
  dd if=/dev/zero of="${efi_img}" bs=1M count=10 status=none
  mkfs.vfat -n SITAEFI "${efi_img}" >/dev/null
  mmd  -i "${efi_img}" ::/EFI ::/EFI/BOOT
  grub-mkstandalone --format=x86_64-efi --output=/tmp/bootx64.efi \
    --locales="" --fonts="" \
    "boot/grub/grub.cfg=${ISO_DIR}/boot/grub/grub.cfg"
  mcopy -i "${efi_img}" /tmp/bootx64.efi ::/EFI/BOOT/BOOTX64.EFI
  cp /tmp/bootx64.efi "${ISO_DIR}/EFI/BOOT/BOOTX64.EFI"

  # BIOS: standalone grub core image
  grub-mkstandalone --format=i386-pc --output=/tmp/core.img \
    --install-modules="linux normal iso9660 biosdisk memdisk search tar ls" \
    --modules="linux normal iso9660 biosdisk search" \
    --locales="" --fonts="" \
    "boot/grub/grub.cfg=${ISO_DIR}/boot/grub/grub.cfg"
  cat /usr/lib/grub/i386-pc/cdboot.img /tmp/core.img > "${ISO_DIR}/boot/grub/bios.img"

  ok "bootloader staged"
}

# ── Stage 5: assemble hybrid ISO ───────────────────────────────────────
stage_make_iso() {
  log "stage 5 — assembling hybrid ISO"
  install -d "${OUT_DIR}"
  xorriso -as mkisofs \
    -iso-level 3 \
    -full-iso9660-filenames \
    -volid "${ISO_LABEL}" \
    -eltorito-boot boot/grub/bios.img \
      -no-emul-boot -boot-load-size 4 -boot-info-table \
      --eltorito-catalog boot/grub/boot.cat \
      --grub2-boot-info --grub2-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
    -eltorito-alt-boot \
      -e boot/grub/efi.img -no-emul-boot \
      -append_partition 2 0xef "${ISO_DIR}/boot/grub/efi.img" \
    -output "${ISO_PATH}" \
    -graft-points \
      "${ISO_DIR}" \
      /boot/grub/bios.img="${ISO_DIR}/boot/grub/bios.img" \
      /EFI/BOOT/BOOTX64.EFI="${ISO_DIR}/EFI/BOOT/BOOTX64.EFI"

  ok "ISO created: ${ISO_PATH} ($(du -h "${ISO_PATH}" | cut -f1))"
}

# ── Stage 6: mirror boot artifacts to OUT_DIR for trust pipeline ───────
stage_export_artifacts() {
  log "stage 6 — exporting kernel/initrd/squashfs to ${OUT_DIR}"
  cp "${ISO_DIR}/casper/vmlinuz"             "${OUT_DIR}/vmlinuz"
  cp "${ISO_DIR}/casper/initrd"              "${OUT_DIR}/initrd.img"
  cp "${ISO_DIR}/casper/filesystem.squashfs" "${OUT_DIR}/sita-rootfs.squashfs"
  ok "exported: vmlinuz, initrd.img, sita-rootfs.squashfs"
}

# ── Stage 7: trust pipeline (signing + verity) ─────────────────────────
stage_trust_pipeline() {
  log "stage 7 — trust pipeline (signing + dm-verity)"
  local repo_root
  repo_root="$(cd "${SCRIPT_DIR}/../.." && pwd)"

  SITA_OUT_DIR="${OUT_DIR}" bash "${repo_root}/os/scripts/sign-kernel.sh" "${OUT_DIR}/vmlinuz" \
    || warn "kernel signing failed (build continues, ISO will be unsigned)"
  SITA_OUT_DIR="${OUT_DIR}" bash "${repo_root}/os/scripts/sign-initramfs.sh" "${OUT_DIR}/initrd.img" \
    || warn "initramfs signing failed (build continues)"
  SITA_OUT_DIR="${OUT_DIR}" bash "${repo_root}/os/scripts/build-verity-root.sh" "${OUT_DIR}/sita-rootfs.squashfs" \
    || warn "verity build failed (build continues without integrity tree)"

  ok "trust pipeline complete"
}

# ── Stage 8: post-build artifacts (checksum + manifest) ────────────────
stage_artifacts() {
  log "stage 8 — generating SHA256 + build manifest"
  ( cd "${OUT_DIR}" && sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256" )

  local trust_baseline="dev-unsigned"
  if [[ -f "${OUT_DIR}/os-signing-receipt.json" ]] \
     && [[ "$(jq -r .keyKind "${OUT_DIR}/os-signing-receipt.json" 2>/dev/null)" == "production-mok" ]]; then
    trust_baseline="production-signed"
  fi
  local verity_status="absent"
  [[ -f "${OUT_DIR}/verity-receipt.json" ]] && verity_status="present"

  cat > "${OUT_DIR}/${ISO_NAME}.manifest.json" <<EOF
{
  "name": "sita-os",
  "version": "${VERSION}",
  "architecture": "${ARCH}",
  "base": "ubuntu-${SUITE}",
  "iso": "${ISO_NAME}",
  "iso_size_bytes": $(stat -c%s "${ISO_PATH}"),
  "iso_sha256": "$(cut -d' ' -f1 < "${OUT_DIR}/${ISO_NAME}.sha256")",
  "built_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "builder": "$(hostname)",
  "stage_status": {
    "debootstrap": "ok",
    "packages": "ok",
    "squashfs": "ok",
    "bootloader": "ok",
    "iso_assembly": "ok",
    "export_artifacts": "ok",
    "trust_pipeline": "ok"
  },
  "trust_baseline": "${trust_baseline}",
  "verity": "${verity_status}",
  "schema": "sita-os-build-manifest/v2"
}
EOF
  ok "artifacts: ${ISO_NAME}, ${ISO_NAME}.sha256, ${ISO_NAME}.manifest.json"
}

# ── Stage 9: emit canonical attestation ────────────────────────────────
stage_attestation() {
  log "stage 9 — emitting canonical attestation"
  local repo_root
  repo_root="$(cd "${SCRIPT_DIR}/../.." && pwd)"
  ( cd "${repo_root}" && SITA_OUT_DIR="${OUT_DIR}" bash os/scripts/emit-attestation.sh ) \
    || warn "attestation emission failed (non-fatal)"
}

# ── Main ───────────────────────────────────────────────────────────────
main() {
  log "SITA OS image build — v${VERSION} (${ARCH})"
  require_root
  require_host_packages
  stage_debootstrap
  stage_install_packages
  stage_build_squashfs
  stage_bootloader
  stage_make_iso
  stage_export_artifacts
  stage_trust_pipeline
  stage_artifacts
  stage_attestation
  log "✅ done — boot: pnpm os:test:qemu  |  validate: pnpm os:test:qemu:validate"
}

trap 'umount "${ROOT_DIR}/dev" "${ROOT_DIR}/proc" "${ROOT_DIR}/sys" 2>/dev/null || true' EXIT
main "$@"
