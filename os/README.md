# SITA OS — Image Builder

Build a bootable, installable SITA OS image. **Linux-native. No macOS. No proprietary tools.**

## Three commands

```bash
# 1. Build the ISO (Linux host or WSL2 — needs root for chroot)
sudo pnpm os:build:iso

# 2. Production-grade QEMU validation (asserts boot, first-boot, runtime)
pnpm os:test:qemu:validate

# 3. Flash to USB (replace /dev/sdX with your stick — DESTROYS DATA)
sudo dd if=out/sita-os-*.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

## Canonical npm scripts

| Script | Purpose |
|---|---|
| `os:build:iso` | build the hybrid BIOS+UEFI ISO |
| `os:build:img` | build a flashable raw GPT disk image (`dd` / cloud import) |
| `os:verify` | verify signatures + verity + checksum on boot artifacts |
| `os:verify:verity` | re-run `veritysetup verify` against built hash tree |
| `os:attest` | emit `generated/os-build-attestation.json` + summary |
| `os:test:qemu` | interactive QEMU boot |
| `os:test:qemu:headless` | headless boot (CI) |
| `os:test:qemu:validate` | **production** boot validator with assertions |
| `os:bundle <ver>` | package an A/B update bundle from current build |
| `os:bundle:verify <bundle> <channel.json>` | verify bundle is safe to apply |
| `os:rollback:dryrun` | show what `sita-rollback` would do (on a device) |
| `os:support:bundle` | collect a redacted diagnostics tarball (on a device) |
| `os:vmware:ova` | wrap latest ISO into a VMware OVA appliance |

## Artifacts

| File | Description |
|---|---|
| `out/sita-os-<version>-amd64.iso` | hybrid BIOS+UEFI bootable ISO |
| `out/sita-os-<version>-amd64.iso.sha256` | integrity checksum |
| `out/sita-os-<version>-amd64.iso.manifest.json` | build provenance |
| `out/sita-os-<version>-amd64.img` | flashable raw GPT disk (USB/SD/cloud) |
| `out/sita-os-<version>-amd64.img.sha256` | IMG integrity checksum |
| `out/sita-os-<version>-amd64.img.manifest.json` | IMG layout + cloud import commands |
| `out/os-signing-receipt.json` | kernel signing receipt |
| `out/os-initramfs-signing-receipt.json` | initramfs signing receipt |
| `out/verity-receipt.json` | dm-verity root hash |
| `out/os-verification-report.json` | post-build verifier output |
| `generated/os-build-attestation.json` | full canonical provenance |
| `generated/os-build-summary.md` | human-readable summary |
| `out/sita-os-<version>.bundle` | A/B update bundle (after `os:bundle`) |
| `out/sita-os-<version>-amd64.ova` | VMware appliance (after `os:vmware:ova`) |

## Phase status

| Phase | Feature | Status |
|---|---|---|
| 1 | Bootable dev ISO (Ubuntu base + SITA shell) | ✅ shipped |
| 2 | dm-verity + signed kernel + LUKS2 + A/B partitions + sita-updated | ✅ shipped |
| 3 | Custom Electron installer UI | ✅ shipped |
| 4 | Update server + signed release manifests + `/download` page | ✅ shipped |
| 5 | Recovery console + safe mode + factory reset + crash uploader | ✅ shipped |
| 6 | Hardware compatibility matrix + preflight | ✅ shipped |
| 7 | Canonical signing pipeline + verity verifier + attestation emitter | ✅ shipped |
| 8 | A/B update bundle builder + rollback + support bundle | ✅ shipped |
| 9 | QEMU production validator + VMware OVA + release artifact model | ✅ shipped |

## Build environment

- **Host OS:** Ubuntu 22.04+ / Debian 12+ / WSL2 / GitHub Actions `ubuntu-latest`
- **Disk space:** ~6 GB during build, ~2 GB final ISO
- **Time:** ~12 minutes cold, ~3 minutes incremental (rootfs cached)
- **Network:** required (apt mirror)

The builder auto-installs missing host deps (`debootstrap`, `xorriso`, `grub-*`,
`mksquashfs`, `sbsigntool`, `cryptsetup-bin`, `zstd`).

## Production signing

Set the following GitHub secrets to enable real MOK signing in CI:

- `SITA_MOK_KEY_BASE64` — base64-encoded RSA private key
- `SITA_MOK_CERT_BASE64` — base64-encoded x509 DER certificate

Builds without these produce an unsigned ISO and emit a clear warning.
See [`docs/os/TRUST_CHAIN_KEYS_AND_SIGNING.md`](../docs/os/TRUST_CHAIN_KEYS_AND_SIGNING.md).

## CI

Push to `main` → `.github/workflows/os-build-iso.yml`:

1. builds the ISO
2. verifies boot artifacts
3. emits the attestation
4. uploads ISO + attestation
5. runs `qemu-validate.sh` with assertions

## Documentation

- [`docs/os/SITA_OS_INSTALL.md`](../docs/os/SITA_OS_INSTALL.md) — end-user install
- [`docs/os/TRUST_CHAIN_KEYS_AND_SIGNING.md`](../docs/os/TRUST_CHAIN_KEYS_AND_SIGNING.md)
- [`docs/os/DM_VERITY_IMPLEMENTATION.md`](../docs/os/DM_VERITY_IMPLEMENTATION.md)
- [`docs/os/UPDATE_AND_ROLLBACK_STRATEGY.md`](../docs/os/UPDATE_AND_ROLLBACK_STRATEGY.md)
- [`docs/os/ROLLBACK_STRATEGY.md`](../docs/os/ROLLBACK_STRATEGY.md)
- [`docs/os/RECOVERY_MODE.md`](../docs/os/RECOVERY_MODE.md)
- [`docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md`](../docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md)
- [`docs/os/HARDWARE_SUPPORT_MATRIX.md`](../docs/os/HARDWARE_SUPPORT_MATRIX.md)
- [`docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md`](../docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md)
- [`docs/os/RELEASE_ARTIFACT_MODEL.md`](../docs/os/RELEASE_ARTIFACT_MODEL.md)
- [`docs/os/FIRST_BOOT_AND_PROVISIONING.md`](../docs/os/FIRST_BOOT_AND_PROVISIONING.md)
- [`docs/os/DISTRIBUTION_FORMATS.md`](../docs/os/DISTRIBUTION_FORMATS.md)
- [`docs/os/ELECTRON_NATIVE_SHELL.md`](../docs/os/ELECTRON_NATIVE_SHELL.md)
- [`docs/os/NATIVE_APP_ECOSYSTEM.md`](../docs/os/NATIVE_APP_ECOSYSTEM.md)
