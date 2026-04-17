
The user pivoted hard. They don't want iOS deployment via macOS bootstrap. They want **SITA OS as its own real, installable operating system** — Linux-based (or similar), with macOS-grade security/backend, but their own OS. Fully advanced, easy to install, easy to use.

Re-reading what they have:
- `infra/docs/ARQ_PLAN_FINAL.md` already declares **Ubuntu 24.04 LTS + systemd-boot + UEFI Secure Boot + TPM 2.0 + dm-verity + LUKS2 + A/B partitions + measured boot + sita-runtime.service**. This is real, documented, approved.
- `electron/` exists for the desktop shell.
- `infra/deploy/os-artifact.yaml` packages Electron for linux/darwin/win32.

So the architecture decision is **already made**: SITA OS = Ubuntu 24.04 base + custom initramfs + dm-verity + signed boot chain + sita-runtime + Electron desktop shell. What's missing is the **actual installable image** — the ISO/IMG that boots on real hardware or in a VM.

The gap from "Electron app on someone's Mac" to "real OS you flash to a USB and boot" is:
1. **Image builder pipeline** — produces signed `sita-os-1.0.0-amd64.iso` (live + installer) and `sita-os-1.0.0-amd64.img` (preinstalled disk image for VMs/Pi).
2. **Custom initramfs** with dm-verity + LUKS2 unlock + first-boot hook.
3. **Signed boot chain** — shim → systemd-boot → kernel → initramfs → verity root.
4. **A/B partition layout** + atomic update agent (`sita-updated`).
5. **First-boot provisioning** — device ID, tenant binding, network, trust baseline, measured-boot attestation.
6. **Installer UI** — minimal Calamares-style flow OR fully custom Electron-based installer.
7. **OEM/recovery flows** — factory reset, safe mode, rescue shell.
8. **Hardware compatibility matrix** + minimum-spec preflight.
9. **Distribution channel** — signed update server, release manifest, rollback metadata.
10. **One-command developer build** — `pnpm os:build:iso` produces the ISO in CI on a Linux runner (no Mac needed, no exotic hardware).

This is multi-day work. I'll plan it as phases the user can ship incrementally, with **Phase 1** being the smallest credible "boot it in a VM" milestone so they see progress fast.

The right tool here is the live planning document. Concise, phased, no fluff.

---

## Plan: SITA OS as a real installable Linux-based OS

### North star
A signed `.iso` you (or any user) can flash to a USB stick, boot on bare metal or in a VM, and it installs SITA OS — branded, secure, hardware-bound, auto-updating. No macOS dependency. No Apple. Builds entirely on Linux CI runners.

### Foundation (already approved in `ARQ_PLAN_FINAL.md`)
- Base: **Ubuntu 24.04 LTS** kernel 6.8+, systemd, systemd-boot
- Security: UEFI Secure Boot, signed shim, dm-verity root, LUKS2, TPM 2.0 sealing, measured boot (PCRs 0/4/8/9/10)
- Updates: A/B partition swap, atomic, instant rollback
- Shell: Electron desktop (existing) running as `sita-shell.service` after `multi-user.target`

### Phase 1 — Bootable ISO in a VM (Day 1-2 milestone)
**Goal**: `pnpm os:build:iso` produces `sita-os-dev.iso` that boots in QEMU and shows the SITA shell.

| File to create | Purpose |
|---|---|
| `os/image-builder/build.sh` | Top-level builder; debootstrap → install packages → embed sita-runtime → squashfs → grub-mkrescue |
| `os/image-builder/packages.list` | Minimal Ubuntu package set (kernel, systemd, network, electron deps, no snapd) |
| `os/image-builder/sita-runtime.service` | systemd unit launching the Electron shell as PID 1 of the user session |
| `os/image-builder/branding/` | Plymouth boot splash, GRUB theme, `os-release`, wallpapers |
| `os/image-builder/first-boot.sh` | Runs once: generate device ID, prompt language/keyboard/wifi/account |
| `.github/workflows/os-build-iso.yml` | Ubuntu runner; runs build.sh; uploads ISO + SHA256 + SBOM as artifact |
| `os/qemu-test.sh` | Boots the ISO in QEMU headless to smoke-test |

**No Mac. No special hardware. Runs in GitHub Actions free tier.**

### Phase 2 — Hardened image (Day 3-4)
- dm-verity hash tree generation in the build pipeline
- LUKS2 setup wired into first-boot
- Signed kernel + initramfs (self-signed dev key now, MOK-enrolled key later)
- A/B partition layout (root_a, root_b, persistent overlay, EFI)
- `sita-updated.service` — checks update server, downloads to inactive slot, atomic switch on reboot
- TPM 2.0 detection + key sealing (graceful fallback to password)

### Phase 3 — Installer experience (Day 5)
- **Option A**: Calamares (off-the-shelf, themed) — fast
- **Option B**: Custom Electron-based installer reusing existing UI components — premium
- Recommend **Option B** because the UX bar is "premium, calm, dark-first" and it reuses `src/components/sita/boot/`. Adds ~1 day vs Calamares.

### Phase 4 — Distribution + updates (Day 6)
- Edge function `os-update-manifest` serves signed release manifest (version, channel, download URL, rollback target, PCR policy)
- `releases` table + RLS already exist (verified in canonical backend)
- Public ISO download page at `/download` with SHA256, signature, GPG key, channel selector (dev/beta/stable)
- Update agent honors channel, verifies signature before applying

### Phase 5 — Recovery + safe mode (Day 7)
- Recovery partition with rescue shell, factory reset, A/B rollback UI
- Safe mode: bypass extensions, minimal services, diagnostic console
- Crash dumps uploaded via existing `crashd` daemon

### Phase 6 — Hardware matrix + preflight (Day 8)
- Live ISO preflight: TPM presence, Secure Boot status, RAM ≥ 4GB, GPU compatibility
- Compatibility report saved to proof chain
- Tested matrix: QEMU, VirtualBox, VMware, Hyper-V, Framework laptop, ThinkPad, generic UEFI x86_64

### Build/run model (so this is easy for you)
| What | Where | Time |
|---|---|---|
| Build ISO | GitHub Actions or local Linux/WSL2 | ~12 min |
| Test in VM | QEMU/VirtualBox on any OS | ~30 sec to boot |
| Install on real hardware | USB flash with Etcher/Rufus, boot from USB | ~5 min install |
| Update | Automatic A/B from update server | ~2 min, no downtime perceived |

### What ships in Phase 1 (this turn's work after approval)
1. `os/image-builder/` complete tree (build.sh, packages.list, sita-runtime.service, branding, first-boot.sh)
2. `.github/workflows/os-build-iso.yml` — builds on every push to `main`, uploads ISO artifact
3. `os/README.md` — three commands: build, test in QEMU, flash to USB
4. `docs/os/SITA_OS_INSTALL.md` — end-user install guide with screenshots placeholders
5. Refresh `OS Deployment.md` artifact: pivot from iOS-only to "SITA OS native install + iOS as one of many surfaces"
6. New artifact `/mnt/documents/SITA OS Native Build.md` — the full 6-phase roadmap as a download

### What stays out of Phase 1 (deferred to Phase 2+)
- dm-verity, LUKS2, TPM sealing → Phase 2
- Custom installer UI → Phase 3
- Update server → Phase 4

This keeps Phase 1 to ~2 days of work and gives you a bootable ISO **this week**.

### Acceptance for Phase 1
| Check | Target |
|---|---|
| `pnpm os:build:iso` produces `sita-os-dev.iso` on Linux/WSL2/CI | ✅ |
| ISO boots in QEMU and shows SITA shell within 60s | ✅ |
| GitHub Actions workflow green, ISO available as artifact | ✅ |
| `os/README.md` + install doc + refreshed artifacts | ✅ |
| Zero macOS dependency anywhere in the build path | ✅ |

### Two quick decisions before I execute
- **Phase 1 scope**: ship just the bootable dev ISO this turn, or fold in basic dm-verity + signed kernel (adds ~1 day but image is "secure from day one")?
- **Installer**: Calamares (1 day, off-the-shelf, themed) or custom Electron installer (2 days, premium, matches brand)?

Defaults if you say "go" without answering: **Phase 1 dev ISO only** + **custom Electron installer in Phase 3** (best UX, deferred so you see boot fast).
