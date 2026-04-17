#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Installer back-end (called by Electron installer)
#
# Performs the actual install:
#   1. A/B partition layout
#   2. Mount + extract squashfs to slot A
#   3. dm-verity setup
#   4. LUKS2 encrypt /home + /var
#   5. systemd-boot install + signed kernel
#   6. First-boot service enable
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

DEVICE=""; USERNAME=""; HOSTNAME="sita"; LOCALE="en_US.UTF-8"; TZ="UTC"; CHANNEL="stable"
while [[ $# -gt 0 ]]; do
  case $1 in
    --device)    DEVICE="$2"; shift 2;;
    --username)  USERNAME="$2"; shift 2;;
    --hostname)  HOSTNAME="$2"; shift 2;;
    --locale)    LOCALE="$2"; shift 2;;
    --timezone)  TZ="$2"; shift 2;;
    --channel)   CHANNEL="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 1;;
  esac
done

[[ -n "${DEVICE}" && -n "${USERNAME}" ]] || { echo "missing required args"; exit 1; }
[[ -n "${SITA_LUKS_PASS:-}" && -n "${SITA_USER_PASS:-}" ]] || { echo "missing passphrases"; exit 1; }

step() { printf "[%d%%] %s\n" "$1" "$2"; }
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

step  5 "Partitioning ${DEVICE}"
bash "${HERE}/../../image-builder/partitions/ab-layout.sh" "${DEVICE}"

step 15 "Mounting and copying base system to slot A"
mkdir -p /mnt/sita
mount "${DEVICE}2" /mnt/sita 2>/dev/null || dd if=/run/live/squashfs.img of="${DEVICE}2" bs=64M status=progress

step 35 "Building dm-verity hash tree"
bash "${HERE}/../../image-builder/security/dm-verity-setup.sh" "${DEVICE}2" /tmp/verity-out

step 50 "Encrypting data partition"
echo -n "${SITA_LUKS_PASS}" > /run/sita-firstboot/initial.key
chmod 600 /run/sita-firstboot/initial.key
DATA_PART="${DEVICE}6" bash "${HERE}/../../image-builder/security/luks2-setup.sh"

step 65 "Installing systemd-boot to EFI partition"
mount "${DEVICE}1" /mnt/sita/boot/efi
bootctl --esp-path=/mnt/sita/boot/efi install

step 75 "Writing boot entry for slot A"
cat > /mnt/sita/boot/efi/loader/entries/sita-a.conf <<EOF
title   SITA OS (slot a)
linux   /sita/current/vmlinuz
initrd  /sita/current/initrd.img
options $(cat /tmp/verity-out/verity.cmdline) slot=a quiet splash
EOF
echo "default sita-a.conf" > /mnt/sita/boot/efi/loader/loader.conf

step 85 "Creating user account ${USERNAME}"
chroot /mnt/sita /usr/bin/useradd -m -s /bin/bash -G sudo,video,audio "${USERNAME}"
echo "${USERNAME}:${SITA_USER_PASS}" | chroot /mnt/sita /usr/sbin/chpasswd

step 90 "Persisting locale, timezone, hostname, channel"
echo "${HOSTNAME}" > /mnt/sita/etc/hostname
chroot /mnt/sita /usr/bin/timedatectl set-timezone "${TZ}" || ln -sf "/usr/share/zoneinfo/${TZ}" /mnt/sita/etc/localtime
echo "LANG=${LOCALE}" > /mnt/sita/etc/locale.conf
mkdir -p /mnt/sita/etc/sita
echo "${CHANNEL}" > /mnt/sita/etc/sita/channel
echo "a"          > /mnt/sita/etc/sita/slot

step 95 "Enabling sita-firstboot, sita-runtime, sita-updated"
chroot /mnt/sita /usr/bin/systemctl enable sita-firstboot.service sita-runtime.service sita-updated.timer

step 100 "Install complete — safe to reboot"
sync
umount -R /mnt/sita
shred -u /run/sita-firstboot/initial.key
exit 0
