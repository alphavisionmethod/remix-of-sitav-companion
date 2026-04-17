# SITA OS — Install Guide

> **What you'll get**: SITA OS running on your hardware or in a virtual machine, fully provisioned, hardware-bound, and auto-updating. ~10 minutes start to finish.

---

## Before you start

| Requirement | Minimum | Recommended |
|---|---|---|
| CPU | 64-bit, 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disk | 32 GB | 128+ GB NVMe |
| Firmware | UEFI or legacy BIOS | UEFI + Secure Boot + TPM 2.0 |
| Display | 1280 × 720 | 1920 × 1080+ |

A USB stick (≥ 4 GB) **or** a virtualization tool (QEMU, VirtualBox, VMware, Hyper-V) for VM installs.

---

## Path A — Try it in a virtual machine (5 minutes, no risk)

1. Download `sita-os-0.1.0-dev-amd64.iso` from the [download page](#downloads).
2. Verify the checksum:
   ```bash
   sha256sum -c sita-os-0.1.0-dev-amd64.iso.sha256
   ```
3. Create a new VM with **UEFI firmware enabled**, 4 GB RAM, 32 GB disk.
4. Attach the ISO as the boot CD-ROM and start the VM.
5. At the GRUB menu pick **"SITA OS — Live"** to try without installing, or **"Install to disk"** to provision.

### One-liner with QEMU (Linux/macOS/WSL2)
```bash
qemu-system-x86_64 -m 4G -smp 2 -enable-kvm \
  -drive if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE.fd \
  -cdrom sita-os-*.iso -boot d -vga virtio
```

---

## Path B — Install on real hardware (10 minutes)

### 1. Flash the USB stick

> ⚠️ **This destroys all data on the USB stick.** Pick the right device.

**Linux / macOS:**
```bash
sudo dd if=sita-os-0.1.0-dev-amd64.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**Windows:** use [Rufus](https://rufus.ie) or [balenaEtcher](https://etcher.balena.io). Pick the ISO, pick the USB, click flash.

### 2. Boot from USB

1. Plug the USB into the target machine.
2. Power on while pressing the boot menu key (commonly **F12**, **F11**, **Esc**, or **F2** — depends on vendor).
3. Pick the USB device from the boot menu.
4. At the GRUB menu pick **"SITA OS — Install to disk"**.

### 3. First boot

SITA OS provisions itself automatically:

- 🔐 Generates a hardware-bound device ID
- 🔍 Detects TPM 2.0 + Secure Boot status
- 📜 Records a signed boot attestation receipt
- 🌐 Configures locale, timezone, and network
- 🚀 Launches the SITA desktop shell

The whole first boot takes ~30 seconds.

### 4. Sign in

Default user (live ISO only):
- Username: `sita`
- Password: `sita`

You'll be prompted to create a real account during install.

---

## What runs on your machine

| Component | Purpose |
|---|---|
| Linux kernel 6.8+ | Hardware abstraction |
| systemd + systemd-boot | Init + bootloader |
| `sita-firstboot.service` | One-time provisioning (this run only) |
| `sita-runtime.service` | Desktop shell (Electron host) |
| NetworkManager | Wi-Fi / Ethernet |
| PipeWire + WirePlumber | Audio |

No telemetry. No snapd. No third-party data brokers.

---

## Updates

SITA OS updates atomically using A/B partitions (Phase 2+):
- Updates download in the background to the inactive partition.
- A reboot atomically switches to the new version.
- If anything breaks, the next boot rolls back instantly.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Black screen after GRUB | Boot **"Safe mode"** from the GRUB menu |
| USB not in boot menu | Disable Secure Boot in firmware (re-enable after install) |
| "No bootable device" in VM | VM firmware not set to UEFI |
| QEMU exits immediately | Install OVMF: `sudo apt install ovmf` |

Detailed logs at `/var/log/sita/` and `journalctl -u sita-firstboot -u sita-runtime`.

---

## Downloads

ISOs are produced by CI on every push to `main`:
- GitHub Actions → workflow **"sita-os-build-iso"** → artifact **"sita-os-iso"**.

Public download page (Phase 4 milestone): `/download` on the SITA web app.

---

## Reporting issues

`bug-report` from the SITA shell, or open an issue at https://sita.dev/issues including:
- ISO version (from `cat /etc/os-release`)
- Hardware (from `cat /var/lib/sita/proof/boot-attestation-*.json`)
- Logs (`journalctl --since '10 minutes ago' > sita-logs.txt`)
