# SITA OS — Native Runtime Operator Runbook

## End-to-end flow

```
bootstrap → build → sign → release → distribute → install → first-boot → update → rollback → recover
```

## 1. Bootstrap (build host)

Required: Ubuntu 24.04 LTS host, Docker, qemu-system-x86_64, sbsigntool, mokutil, tpm2-tools.

```bash
./os/scripts/reproducible-build-env.sh
```

## 2. Build (raw IMG → ISO → OVA)

```bash
./os/scripts/build-raw-img.sh
./os/scripts/build-verity-root.sh
```

Output: `dist/sita-os-<version>.img` + verity hash.

## 3. Sign (kernel, initramfs, GRUB, SBOM)

```bash
./os/scripts/sign-kernel.sh
./os/scripts/sign-initramfs.sh
./os/scripts/generate-sbom.sh         # CycloneDX 1.5
./os/scripts/emit-attestation.sh
./os/scripts/verify-boot-artifacts.sh
```

## 4. Release pipeline

The 13-step canonical flow:

```bash
./os/scripts/release.sh <version>
```

Steps: build → verity → sign → SBOM → attestation → reproducibility check → ISO assemble → OVA wrap → QEMU smoke → boot artifact verify → checksum → publish manifest → upload artifacts.

## 5. First-boot

User flow defined in `features/first-use-master-spec` (29-screen personalization ceremony) lands at desktop arrival on `sita-runtime.service` (Electron on TTY7).

## 6. Update (A/B)

```bash
./os/scripts/build-update-bundle.sh <new-version>
./os/scripts/verify-update-bundle.sh
# bundle is then delivered via OTA channel; device flashes inactive slot
```

## 7. Rollback

```bash
./os/scripts/rollback-to-previous.sh
```

Switches the bootloader entry back to the previously known-good slot.

## 8. Recovery

Boot into recovery slot (`p6`) → generate support bundle:

```bash
./os/scripts/generate-support-bundle.sh
```

## CI surfaces

- `.github/workflows/os-build-iso.yml` — full build pipeline
- `.github/workflows/native-readiness.yml` — 8 native readiness gates
- `.github/workflows/release-electron.yml` — Electron desktop shell builds

## References

- `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`
- `docs/os/IMAGE_LAYOUT_AND_PARTITIONS.md`
- `docs/PLATFORM_SCOPE.md`
