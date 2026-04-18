# SITA OS — Phase 4: Trusted Supply Chain

Phase 4 closes the supply-chain attestation loop on top of the Phase 1–3
foundation. It adds **four** hard requirements that any production-grade
operating system must satisfy:

| # | Capability | Canonical script | Output | Verifier |
|---|---|---|---|---|
| 1 | TPM 2.0 sealing of dm-verity root | `os/scripts/seal-verity-to-tpm.sh` | `out/tpm-seal.{policy,pub,priv,manifest.json}` | `os/scripts/verify-tpm-seal.sh` |
| 2 | Secure Boot shim + MOK enrollment | `os/scripts/enroll-secureboot-mok.sh` | `out/shim/{shimx64.efi,grubx64.efi,MOK.cer,mok-enroll.json}` | `os/scripts/verify-boot-artifacts.sh` |
| 3 | Signed CycloneDX SBOM | `os/scripts/generate-sbom.sh` | `out/sbom-{app,os}.cdx.json[.sig]`, `out/sbom.manifest.json` | `os/scripts/verify-sbom.sh` |
| 4 | Reproducible builds | `os/scripts/reproducible-build-env.sh` | `generated/reproducibility-report.{json,md}` | `os/scripts/verify-reproducibility.sh` |

All four are wired into:

- `os/scripts/release.sh` (steps 6, 7, 8, 12)
- `.github/workflows/os-build-iso.yml` (Phase 4 steps + artifact upload)
- `package.json` (`os:tpm:*`, `os:secureboot:*`, `os:sbom:*`, `os:reproducible:*`)

---

## 1. TPM 2.0 sealing

The verity root hash (the cryptographic identity of the immutable rootfs)
is sealed against PCR policy `sha256:0,2,4,7`:

| PCR | Measures |
|---|---|
| 0 | Firmware code (CRTM, BIOS) |
| 2 | Extended firmware code (option ROMs) |
| 4 | Boot loader code (shim → grub → kernel) |
| 7 | Secure Boot state + signing certs |

If any of those measurements drift (firmware update, evil-maid swap of
shim, Secure Boot disabled), the TPM refuses to unseal — and the
initramfs hook refuses to mount the rootfs.

```bash
# real TPM (requires tpm2-tools and access to /dev/tpmrm0)
SITA_TPM_REAL=1 npm run os:tpm:seal

# CI / dev — deterministic simulation; manifest is still produced
npm run os:tpm:seal
npm run os:tpm:verify
```

## 2. Secure Boot / MOK enrollment

Builds the canonical shim chain:

```
shimx64.efi (Microsoft-signed)  →  grubx64.efi (MOK-signed)  →  vmlinuz (MOK-signed)  →  initrd (MOK-signed)
```

`MOK.cer` is staged on the ESP at `/boot/efi/EFI/sita/MOK.cer`. The
first-boot service runs `mokutil --import`, prompting the user once
(via MokManager) to enroll the cert. After enrollment, all SITA-signed
kernels and initramfs images are accepted under Secure Boot without
intervention.

```bash
npm run os:secureboot:enroll
```

CI installs `shim-signed` + `sbsigntool` automatically; on a host
without those packages the script emits placeholder artifacts and
records `mode: placeholder` in `mok-enroll.json` so downstream
attestation never silently passes a fake build.

## 3. Signed CycloneDX SBOM

Two SBOMs are produced per release:

1. `sbom-app.cdx.json` — npm dependency tree of the React/Vite/Electron app.
2. `sbom-os.cdx.json` — the chroot's `dpkg` package list **plus** every
   release artifact (ISO, IMG, bundle, verity hash) as `type:file`
   components with SHA-256.

The OS SBOM is signed with the release key (RSA-SHA256, detached
signature). Consumers verify with:

```bash
openssl dgst -sha256 -verify <(openssl x509 -in os/keys/release.crt -pubkey -noout) \
  -signature out/sbom-os.cdx.json.sig out/sbom-os.cdx.json
# or, simpler:
npm run os:sbom:verify
```

CycloneDX 1.5 is consumable by Dependency Track, Grype, Trivy, OSS
Review Toolkit, and the GitHub Advanced Security advisory matcher.

## 4. Reproducible builds

`os/scripts/reproducible-build-env.sh` is sourced by `release.sh` (and
should be sourced before any manual `os:build:*` invocation). It pins:

- `SOURCE_DATE_EPOCH` (defaults to last git commit timestamp)
- `TZ=UTC`, `LC_ALL=C.UTF-8`
- `umask 0022`
- `mksquashfs`: `-all-root -mkfs-time -fstime -all-time -no-xattrs -noappend`
- `tar`: `--sort=name --mtime=@$SOURCE_DATE_EPOCH --owner=0 --group=0 --numeric-owner`
- `cpio`: `-R 0:0 --reproducible`
- `LDFLAGS`: `-Wl,--build-id=none`

Verify with:

```bash
npm run os:reproducible:verify   # builds twice, diffs ISO + squashfs
```

Exit codes:

| Code | Meaning |
|---|---|
| 0 | bit-identical (or degraded mode on non-builder host) |
| 1 | ISO bytes differ (likely metadata only — investigate) |
| 2 | squashfs payload differs (rootfs is non-deterministic — fix required) |

Reports are emitted to `generated/reproducibility-report.{json,md}`.

---

## End-to-end provenance map

```
┌─────────────────────────────────────────────────────────────┐
│                       Release Pipeline                      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
  reproducible-build-env.sh   ── SOURCE_DATE_EPOCH pinned
        │
        ▼
  build.sh                    ── ISO + verity-root.hash
        │
        ▼
  emit-attestation.sh         ── generated/os-build-attestation.json
        │
        ├──► seal-verity-to-tpm.sh   ──► out/tpm-seal.manifest.json
        ├──► enroll-secureboot-mok.sh ──► out/shim/mok-enroll.json
        ├──► generate-sbom.sh         ──► out/sbom.manifest.json (signed)
        │
        ▼
  build-update-bundle.sh + verify-update-bundle.sh
        │
        ▼
  verify-tpm-seal.sh + verify-sbom.sh + qemu-validate.sh
```

Every artifact in `out/` is referenced by exactly one manifest, every
manifest is referenced by `generated/os-build-attestation.json`, and
the entire chain is reproducible from the git SHA + `SOURCE_DATE_EPOCH`.
