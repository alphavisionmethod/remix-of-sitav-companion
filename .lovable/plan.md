
## Audit: Does the current path match the new advanced focus areas?

I need to verify the repo is executing on these 4 focus areas (A: Ubuntu-native OS, B: Electron canonical shell, C: Native app ecosystem, D: Linux/VM distribution) — and is not still investing in deprecated paths (iOS/Apple/App Store packaging).

### Section A — Ubuntu-native OS ✅ Fully aligned
Already shipped (verified across prior phases):
- `os/image-builder/build.sh` (9-stage pipeline incl. trust + attestation)
- Signed boot: `sign-kernel.sh`, `sign-initramfs.sh`, `verify-boot-artifacts.sh`, MOK strategy
- dm-verity: `build-verity-root.sh`, `verify-verity-metadata.sh`, initramfs hook
- First-boot: `sita-firstboot.service` + provisioning docs
- OTA/update: `sita-updated.service` + `.timer`, `build-update-bundle.sh`, `verify-update-bundle.sh`, A/B slots
- Rollback: `rollback-to-previous.sh`, `systemd-bless-boot` auto-rollback
- Recovery: `os/image-builder/recovery/` (5 files, TTY7 fallback)
- Support diagnostics: `generate-support-bundle.sh`
- Hardware/VM: `qemu-validate.sh` assertions, `vmware/build-ova.sh`, hardware support matrix

### Section B — Electron as canonical native shell ⚠️ Partially aligned
Shipped:
- `sita-runtime.service` autostarts Electron via `xinit` on TTY7
- `electron/preload.cjs` exposes 22 typed IPC method groups
- Security fabric (7 layers) + DesktopHostContract governance

Gaps for "deeply integrated, resilient, observable":
1. No documented `docs/os/ELECTRON_NATIVE_SHELL.md` tying the Electron shell to Ubuntu session lifecycle (X server boot, restart policy, crash → recovery handoff)
2. No formal contract doc binding `sita-runtime.service` ↔ `electron/main.cjs` ↔ `sita-recovery-shell.service` (the failover chain)
3. Electron crash → support bundle path exists in code but is not documented as the canonical observability flow

### Section C — Native Ubuntu app ecosystem ✅ Aligned, no Apple residue to remove
Shipped:
- App Platform (4 classes: Web/PWA/External Native/Internal OS)
- `sitaApps` preload bridge (`launchNativeApp`, `checkNativeAppAvailability`, `openExternalUrl`)
- DB-backed app catalog + 7 edge functions + 17 store modules
- Trust tiers, ed25519 manifest signing, Sentinel permission engine

Gaps:
1. No `docs/os/NATIVE_APP_ECOSYSTEM.md` explaining the Ubuntu-native launcher/store model end-to-end (replacing any implicit "iOS App Store" mental model)
2. The `sitaApps.launchNativeApp` bridge needs an explicit Linux `.desktop` file / `xdg-open` discovery path documented (it works, but the Linux integration story isn't written down)

### Section D — Linux/VM distribution excellence ⚠️ Mostly shipped, one missing artifact format
Shipped:
- ISO (hybrid BIOS+UEFI)
- OVA (VMware) via `os/vmware/build-ova.sh`
- QEMU validation
- Hardware support matrix
- Release artifact signing (sbsign + OpenSSL)
- Support bundles

Gaps:
1. **No `.img` raw disk artifact builder** — explicitly listed in focus area D ("ISO, IMG, OVA/VMware"). Needed for direct `dd` flashing to USB/SD and cloud import (AWS/GCP raw imports).
2. No `docs/os/DISTRIBUTION_FORMATS.md` explaining when to use ISO vs IMG vs OVA

### Apple/iOS residue check
No Apple/iOS build pipelines in `os/`, `.github/workflows/`, or `package.json` `os:*` scripts. Mobile contracts mention "Apple APNs deferred" — that's correct posture, no action needed.

---

## Plan: Close the 4 real gaps

### 1. Add raw IMG disk builder (Section D)
**File:** `os/scripts/build-raw-img.sh`
- Convert the ISO's squashfs rootfs into a flashable raw `.img` (GPT + ESP + verity-protected root + persistent data partition)
- Emit `out/sita-os-${VERSION}-amd64.img` + `.sha256`
- Add `npm run os:build:img` script
- Wire into `os/scripts/release.sh` (new step 5b)
- Wire into `.github/workflows/os-build-iso.yml` artifact upload

### 2. Document Electron canonical shell integration (Section B)
**File:** `docs/os/ELECTRON_NATIVE_SHELL.md`
- Boot sequence: systemd `graphical.target` → `sita-firstboot` → `sita-runtime.service` → `xinit` → `electron/main.cjs`
- Restart policy: `Restart=on-failure` with 3s backoff, max 5 attempts → fallback to `sita-recovery-shell.service` on TTY7
- Crash observability: `electron/main.cjs` crash reporter → `/var/log/sita/crashes/` → support bundle inclusion → `crash-report-ingest` edge fn
- Bridge contract reference (links to existing `DesktopHostContract`)

### 3. Document native app ecosystem (Section C)
**File:** `docs/os/NATIVE_APP_ECOSYSTEM.md`
- 4-class model (Web, PWA, External Native, Internal OS) mapped to Ubuntu execution paths
- Native launch flow: `sitaApps.launchNativeApp(appId)` → check `.desktop` files in `/usr/share/applications/` → `xdg-open` or `gtk-launch` → fallback to web URL
- Allowlist enforcement (no arbitrary process spawn from renderer)
- Cross-link to App Platform memory + Sentinel engine

### 4. Document distribution formats (Section D)
**File:** `docs/os/DISTRIBUTION_FORMATS.md`
- ISO → installer media, optical/USB boot
- IMG → direct flash (`dd`), cloud raw import (AWS EC2 VM Import, GCP Compute import)
- OVA → VMware Workstation/ESXi/Fusion, vSphere
- Decision matrix + sha256/signature verification commands per format

### 5. Minor wiring updates
- `package.json`: add `os:build:img` script
- `os/scripts/release.sh`: insert IMG build between bundle and QEMU steps
- `.github/workflows/os-build-iso.yml`: add `*.img` and `*.img.sha256` to artifact upload globs
- `os/README.md`: add IMG to the artifact table

---

## Out of scope (intentionally)
- No Apple/iOS work (correctly deprecated)
- No re-implementation of already-shipped Phase 1/2 systems (would violate "no duplicates")
- No new updater, signer, or attestor (canonical ones exist)

After these 4 docs + 1 script + wiring updates land, the repo will be **100% executing on focus areas A, B, C, D** with zero Apple residue and zero stub gaps.
