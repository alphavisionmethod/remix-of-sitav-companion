# SITA OS — First Build Runbook

This document provides step-by-step instructions for producing the first
real build artifacts from this codebase. All builds happen **outside Lovable**
— either in GitHub Actions CI or on a local Linux machine.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| GitHub repo with Actions enabled | Push this codebase to GitHub via Lovable's GitHub integration |
| Node.js 20+ | For Electron builds on local machine |
| Ubuntu 24.04 (or GitHub-hosted runner) | For ISO builds |
| `sudo` access | ISO builder runs `debootstrap` as root |

---

## 1. First Electron Desktop Build (fastest — ~10 min)

### Option A: GitHub Actions (recommended)

1. Push code to `main` branch via Lovable → GitHub sync
2. Go to **Actions → "Release — Desktop Matrix Build"**
3. Click **Run workflow** → select branch `main`
4. Wait ~10 min for Linux/macOS/Windows artifacts
5. Download artifacts from the completed workflow run

### Option B: Local machine

```bash
git clone <your-repo>
cd <your-repo>
npm ci

# Build the web app with Electron-compatible paths
ELECTRON_BUILD=1 npx vite build

# Install Electron packaging tools
npm install --save-dev electron @electron/packager

# Package for your platform
npx @electron/packager . "SITA-OS" \
  --platform=linux --arch=x64 \
  --out=electron-release --overwrite \
  --ignore='node_modules' \
  --ignore='^/src' --ignore='^/public' \
  --ignore='^/scripts' --ignore='^/supabase'

# Result: electron-release/SITA-OS-linux-x64/
```

### What to verify

- Launch `./electron-release/SITA-OS-linux-x64/sita-os`
- License activation window should appear (expected — no license server yet)
- Press Ctrl+Shift+I for DevTools — verify no `file://` 404 errors
- All CSS/JS assets should load from the local `dist/` folder

---

## 2. First ISO Build (~30-40 min)

### Option A: GitHub Actions

1. Go to **Actions → "sita-os-build-iso"**
2. Click **Run workflow**
   - `profile`: `user` (default) or `operator`
   - `version`: e.g. `0.1.0`
3. Wait ~30-40 min
4. Download ISO artifact from the completed run
5. Boot in VirtualBox, VMware, or QEMU

### Option B: Local Linux machine (Ubuntu 24.04)

```bash
# Must run as root
sudo VERSION=0.1.0 bash os/image-builder/build.sh

# Output: out/sita-os-user-0.1.0-amd64.iso
```

### What to verify

- Boot the ISO in a VM (VirtualBox or QEMU)
- GRUB menu should show: Live, Install, Safe mode, Memory test
- Select "Live" — Plymouth splash, then first-boot sequence
- After first-boot, Electron shell should launch on TTY7
- If Electron package was not included, you'll see the stub message

---

## 3. Full Release Pipeline

The canonical pipeline runs all 14 steps in sequence:

```bash
VERSION=0.1.0 sudo -E bash os/scripts/release.sh stable
```

This produces:
- ISO (`out/sita-os-user-0.1.0-amd64.iso`)
- Raw IMG (`out/sita-os-0.1.0-amd64.img`)
- OVA appliance (`out/sita-os-0.1.0-amd64.ova`)
- Update bundle (`out/sita-os-0.1.0.bundle`)
- SBOMs, attestation, TPM seal manifest

### Pre-release checklist

- [ ] `npm run build` passes with zero errors
- [ ] `npx tsc --noEmit` clean
- [ ] Electron desktop build completes on at least one platform
- [ ] ISO boots in QEMU (automated via `os/qemu-validate.sh`)

---

## 4. QEMU Validation (automated smoke test)

```bash
# After ISO is built:
bash os/qemu-validate.sh
```

Runs headless QEMU with 5 positive checks:
1. Kernel reaches userspace
2. `sita-firstboot.service` starts
3. `sita-runtime.service` starts
4. Networking comes up
5. Recovery target is reachable

And 4 negative checks: no panic, no verity corruption, no OOM, no failed mount.

---

## 5. CI Secrets to Configure

For **unsigned dev builds**, no secrets are needed.

For **production signed builds**, configure these GitHub Actions secrets:

| Secret | Purpose |
|---|---|
| `SITA_MOK_KEY` | Secure Boot MOK private key (PEM) |
| `SITA_MOK_CERT` | Secure Boot MOK certificate (PEM) |
| `APPLE_IDENTITY` | macOS code signing identity |
| `APPLE_ID` | Apple notarization account |
| `APPLE_PASSWORD` | App-specific password for notarization |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `CSC_LINK` | Windows code signing certificate (PFX, base64) |
| `CSC_KEY_PASSWORD` | Windows certificate password |

---

## 6. Build Order (recommended)

```
1. npm run build          ← verify web app compiles
2. Electron desktop build ← fastest to test, ~10 min
3. ISO build              ← takes longer, needs Linux
4. QEMU validation        ← automated smoke test
5. Release pipeline        ← full end-to-end
```

---

## 7. Troubleshooting

| Issue | Fix |
|---|---|
| Blank Electron window | Ensure `ELECTRON_BUILD=1` was set during `vite build` |
| ISO build fails at debootstrap | Must run as root on Ubuntu 24.04 |
| Package install fails in chroot | Check `packages.list` — some packages renamed in Noble (t64 transition) |
| QEMU validation hangs | Increase `SITA_QEMU_TIMEOUT` (default 180s) |
| `/usr/bin/sita-shell` not found | Build Electron first, then rebuild ISO — or use stub for testing |
| OVA build skipped | Install `qemu-utils` for `qemu-img` |