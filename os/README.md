# SITA OS — Image Builder

Build a bootable, installable SITA OS image. **Linux-native. No macOS. No proprietary tools.**

## Three commands

```bash
# 1. Build the ISO (Linux host or WSL2 — needs root for chroot)
sudo bash os/image-builder/build.sh

# 2. Smoke-test in QEMU
bash os/qemu-test.sh

# 3. Flash to USB (replace /dev/sdX with your stick — DESTROYS DATA)
sudo dd if=out/sita-os-*.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

## What you get

| Artifact | Description |
|---|---|
| `out/sita-os-<version>-amd64.iso` | Hybrid BIOS+UEFI bootable ISO |
| `out/sita-os-<version>-amd64.iso.sha256` | Integrity checksum |
| `out/sita-os-<version>-amd64.iso.manifest.json` | Build provenance |

## Phase status

| Phase | Feature | Status |
|---|---|---|
| 1 | Bootable dev ISO (Ubuntu base + SITA shell) | ✅ shipped |
| 2 | dm-verity + signed kernel + LUKS2 + A/B partitions + sita-updated | ✅ shipped |
| 3 | Custom Electron installer UI | ✅ shipped |
| 4 | Update server (`os-update-manifest` edge fn) + signed release manifests + `/download` page | ✅ shipped |
| 5 | Recovery console + safe mode + factory reset + crash uploader | ✅ shipped |
| 6 | Hardware compatibility matrix + preflight | ✅ shipped |

## Build environment

- **Host OS**: Ubuntu 22.04+ / Debian 12+ / WSL2 / GitHub Actions `ubuntu-latest`
- **Disk space**: ~6 GB during build, ~2 GB final ISO
- **Time**: ~12 minutes cold, ~3 minutes incremental (rootfs cached)
- **Network**: required (apt mirror)

The builder auto-installs missing host deps (`debootstrap`, `xorriso`, `grub-*`, `mksquashfs`).

## CI

Push to `main` → `.github/workflows/os-build-iso.yml` builds the ISO on a free Ubuntu runner, attaches it as a workflow artifact, and posts the SHA256 to the build summary.

## End-user install guide

See [`docs/os/SITA_OS_INSTALL.md`](../docs/os/SITA_OS_INSTALL.md).
