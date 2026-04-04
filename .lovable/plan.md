

# Implement ISO Builder, OVF/OVA Packager, and PWA Manifest

## Overview

Three gaps to close: (1) a real ISO builder script with cloud-init auto-install, (2) a proper OVF/OVA packager that produces VMware-compliant artifacts, and (3) PWA installability via a web manifest (no service worker — per project constraints, only a manifest for Add-to-Home-Screen).

---

## 1. ISO Builder — `scripts/release/build-iso.sh`

Replace the stub `generate-vmware-iso-image.ts` with a real bash script that uses `xorriso`/`genisoimage` to build a bootable ISO.

**What it does:**
- Downloads Ubuntu Server 24.04 mini ISO (or uses a cached copy)
- Injects a full cloud-init `autoinstall` config (`user-data`, `meta-data`, `network-config`)
- Autoinstall provisions: disk partitioning (A/B root + encrypted data), Docker + Docker Compose install, SITA OS Docker images pre-loaded, systemd auto-start service, network config wizard via cloud-init
- Outputs `sita-os-{version}.iso` ready to boot on VMware/bare-metal
- Reads from `generated/base-os-manifest.json` for OS version, partition scheme, kernel features

**New files:**
| File | Purpose |
|------|---------|
| `scripts/release/build-iso.sh` | Main ISO builder (~200 lines) |
| `scripts/release/iso/autoinstall/user-data` | Cloud-init autoinstall config |
| `scripts/release/iso/autoinstall/meta-data` | Instance metadata |
| `scripts/release/iso/autoinstall/network-config` | Network YAML |
| `scripts/release/iso/sita-first-boot.sh` | First-boot script: loads Docker images, starts stack |
| `scripts/release/iso/sita-os.service` | Systemd unit for auto-start |

**Autoinstall covers:**
- Disk: 512MB EFI, 20GB root-A (dm-verity), 20GB root-B, rest as encrypted data (LUKS2)
- Packages: docker.io, docker-compose-plugin, tpm2-tools, cryptsetup
- Users: `sita` user with sudo, SSH key injection
- Post-install: copies Docker images from ISO media, runs `docker compose up -d`

---

## 2. OVF/OVA Packager — `scripts/release/build-ova.sh`

Replace the current tarball-only `scripts/build-ova.sh` with a proper OVA builder.

**What it does:**
- Creates a VMDK virtual disk using `qemu-img` (or raw dd + VBoxManage conversion)
- Generates a standards-compliant `.ovf` XML descriptor with proper namespaces (CIM, OVF, RASD, VSSD)
- Computes SHA256 checksums into a `.mf` manifest file
- Bundles `.ovf` + `.vmdk` + `.mf` into a `.ova` TAR archive (in correct order per OVF spec)
- Configurable: CPU count, RAM, disk size, network adapter type via CLI flags

**New/modified files:**
| File | Purpose |
|------|---------|
| `scripts/release/build-ova.sh` | Replaces `scripts/build-ova.sh` — full OVA packager (~250 lines) |
| `scripts/release/templates/sita-os.ovf.template` | OVF XML template with placeholders |

**OVF descriptor includes:**
- VirtualSystemType: vmx-21 (ESXi 8.0 compatible)
- 4 vCPU, 8GB RAM defaults (configurable)
- 80GB thin-provisioned VMDK
- VMXNET3 network adapter on `sita-net`
- ProductSection with SITA OS metadata, version, vendor URL
- EulaSection placeholder
- DeploymentOptionSection: pilot (2 vCPU/4GB) vs production (4 vCPU/8GB)

---

## 3. PWA Manifest (no service worker)

Per project constraints, we add only a `manifest.webmanifest` for installability — no `vite-plugin-pwa`, no service worker. The existing `PWAInstallPrompt` component is already wired into `ShellLayout`.

**New/modified files:**
| File | Purpose |
|------|---------|
| `public/manifest.webmanifest` | Web app manifest with SITA OS branding |
| `public/icons/icon-192.png` | Generated placeholder icon (192x192) |
| `public/icons/icon-512.png` | Generated placeholder icon (512x512) |
| `index.html` | Add `<link rel="manifest">` + theme-color meta + apple-touch-icon |

**Manifest contents:**
- `name`: "SITA OS", `short_name`: "SITA"
- `display`: "standalone", `orientation`: "any"
- `start_url`: "/", `scope`: "/"`
- `theme_color`: "#0F172A" (dark bg), `background_color`: "#0F172A"
- Icons at 192 and 512 sizes
- `categories`: ["productivity", "business"]

---

## Implementation Order

1. Create PWA manifest + icons + update `index.html`
2. Create ISO builder autoinstall configs
3. Create ISO builder script (`build-iso.sh`)
4. Create OVF template
5. Create OVA packager script (`build-ova.sh` replacement)
6. Update `Makefile` with `make iso` and `make ova` targets
7. Verify TypeScript compilation

