

# Honest Assessment and Deployment Readiness Plan

## What Actually Exists (Credit Where Due)

The OS native surface is **not** "zero code." There is substantial, well-structured infrastructure that would work if executed on a real Linux CI runner:

1. **`os/image-builder/build.sh`** (385 lines) -- A complete 9-stage ISO builder: debootstrap Ubuntu 24.04 minbase, install packages, build squashfs, configure GRUB (BIOS+UEFI hybrid), assemble ISO via xorriso, trust pipeline (kernel signing, dm-verity), SHA256 checksums, attestation.

2. **`os/qemu-validate.sh`** (109 lines) -- Real QEMU headless boot validation with 5 positive assertions (kernel userspace, first-boot service, runtime shell, networking, recovery target) and 4 negative checks (no panic, no verity corruption, no OOM, no failed mount).

3. **`.github/workflows/os-build-iso.yml`** (330 lines) -- Complete CI pipeline: build ISO for user+operator profiles, QEMU smoke test, publish to GitHub Releases, OVA appliance build.

4. **`.github/workflows/desktop-build.yml`** (157 lines) -- Cross-platform Electron packaging (Linux x64, macOS x64/arm64, Windows x64) with code signing paths.

5. **`electron/main.cjs`** (375 lines) -- Real Electron main process with BrowserWindow, crash reporter, auto-updater, license guard, DLP, runtime shield, network sentinel.

6. **`os/image-builder/sita-runtime.service`** -- Real systemd unit that starts Electron on TTY7 via xinit after first-boot completes.

## What the "OS" Actually Is

The architecture is: **Custom Ubuntu ISO -> boots to systemd -> launches Electron on X11 -> loads the Vite-built SPA as the desktop shell.** This is a legitimate approach (Chrome OS does the same with Chrome). The web app IS the OS shell.

## The Honest Gap

**None of this has been executed.** The scripts are syntactically correct and well-structured, but:

- No GitHub Actions run has ever triggered `os-build-iso.yml` (requires pushing to `main` with changes in `os/` or a manual `workflow_dispatch`)
- No ISO has ever been built
- No QEMU validation has ever run
- No Electron package has ever been produced
- The CI secrets (MOK signing keys, Apple certs) are not configured

## What Lovable Cannot Do

Lovable is a web app builder. It **cannot**:
- Run `sudo debootstrap` (needs root on Linux)
- Run `qemu-system-x86_64` (needs KVM/hardware)
- Package Electron (needs `electron` binary + native deps)
- Sign with MOK/Apple/Windows certificates

These must happen in **GitHub Actions CI** or on a **local Linux machine**.

## What Lovable CAN Do (and the plan below)

### Step 1: Ensure the web app builds cleanly for Electron embedding
- Verify `npx vite build` produces a working `dist/` with `index.html`
- Ensure the Electron main process can load `dist/index.html` (relative path)
- Check that `ELECTRON_BUILD` env var is handled in Vite config for correct base path

### Step 2: Fix any remaining TypeScript/build errors
- Continue the `isDemoMode` migration to ensure zero build errors
- The web app must compile with zero errors for any downstream packaging to work

### Step 3: Validate Electron main process statically
- Review `electron/main.cjs` for any missing imports or broken paths
- Ensure `preload.cjs` exports match what the renderer expects
- Verify `forge.config.cjs` ignore patterns don't exclude `dist/`

### Step 4: Audit the ISO build scripts for correctness
- Review `build.sh` stage ordering and path assumptions
- Verify `packages.list` has no missing/renamed Ubuntu packages
- Check that `sita-runtime.service` paths match what `build.sh` installs
- Ensure recovery scripts referenced in the service chain exist

### Step 5: Create a "first real build" checklist document
Generate a concrete runbook the user can follow outside Lovable:

```text
Prerequisites:
  - GitHub repo with Actions enabled
  - Ubuntu 24.04 runner (GitHub-hosted works)
  
First Electron build:
  1. Push code to main
  2. Go to Actions -> "Release - Desktop Matrix" -> Run workflow
  3. Download artifact from the completed run
  
First ISO build:
  1. Generate MOK keys (or skip for dev-unsigned builds)
  2. Go to Actions -> "sita-os-build-iso" -> Run workflow
  3. Wait ~30-40 min for build + QEMU validation
  4. Download ISO artifact
  5. Boot in VirtualBox/VMware/QEMU locally to verify
```

## What This Plan Does NOT Include

- Actually running the builds (impossible in Lovable)
- Setting up signing certificates (requires external accounts)
- Hardware testing (requires physical machines)
- Continuing the demo-mode migration (separate task, already in progress)

## Technical Details

Files to audit and potentially fix:
- `electron/main.cjs` -- verify dist path, preload path
- `electron/preload.cjs` -- verify IPC channel names match renderer expectations
- `vite.config.ts` -- verify `base` path handling for Electron
- `os/image-builder/build.sh` -- verify all referenced scripts exist
- `os/image-builder/packages.list` -- verify against Ubuntu Noble package names
- `os/runtime/shell-watchdog.sh` -- verify `/usr/bin/sita-shell` symlink target
- `scripts/release/desktop/build-electron.sh` -- verify packaging command

The deliverable is: a codebase that will build successfully the first time someone triggers the CI workflows, plus a clear operator runbook for that first build.

