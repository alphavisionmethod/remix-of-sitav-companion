# Phase 4 — Trusted Supply Chain

Status: **shipped** · Audited against repo HEAD

Phase 4 closes the gap between "we can build a bootable ISO" (Phases 1–3) and "we can prove what's in the ISO and that it hasn't been tampered with." It introduces four interlocking guarantees:

1. **TPM 2.0 sealing** of the dm-verity root hash to PCRs 0,2,4,7
2. **Secure Boot** signing of the shim → grub → kernel chain via a SITA Machine Owner Key (MOK)
3. **Signed CycloneDX 1.5 SBOMs** for both the Electron application and the OS chroot
4. **Reproducible builds** with a pinned `SOURCE_DATE_EPOCH` and bit-for-bit verification

---

## 1. TPM 2.0 — sealing verity to measured boot

Script: `os/scripts/seal-verity-to-tpm.sh`

The verity root hash produced by `build-verity-root.sh` is sealed under a PCR policy covering UEFI firmware (PCR 0), option ROMs (PCR 2), bootloader (PCR 4), and Secure Boot policy (PCR 7). The sealed object can only be unsealed if the measured boot state matches the build-time state.

Outputs land in `out/`:

| File | Purpose |
|---|---|
| `tpm-seal-public.bin`  | Sealed object public area |
| `tpm-seal-private.bin` | Sealed object private area |
| `tpm-seal-policy.digest` | PCR policy digest |
| `tpm-seal-manifest.json` | JSON record (verity hash, PCR list, SHA256 of sealed blobs) |

### Verification modes

`os/scripts/verify-tpm-seal.sh`:

- `--offline` (CI default) — checks manifest schema and SHA256 integrity of sealed blobs. Does **not** require a real TPM.
- `--hardware` — loads the sealed object, satisfies the PCR policy, and unseals the secret. Requires `/dev/tpmrm0` and `tpm2-tools`. Used on real hardware boot smoke-tests.

---

## 2. Secure Boot — MOK enrollment + boot-chain signing

Script: `os/scripts/enroll-secureboot-mok.sh`

Generates (or reuses, via `SITA_MOK_KEY` / `SITA_MOK_CERT`) the SITA Machine Owner Key, then signs the shim, grub, and kernel binaries with `sbsign`. The MOK certificate is exported in DER form for one-shot enrollment via `mokutil --import`.

Outputs land in `out/secureboot/`:

| File | Purpose |
|---|---|
| `sita-mok.der`         | Cert in DER form (for `mokutil --import`) |
| `sita-mok.crt`         | Same cert in PEM form (for `sbverify`) |
| `mok-manifest.json`    | Provenance, SHA-256 fingerprint, signed-target table |

If no key is injected, an **ephemeral dev key** is generated and the manifest field `key_provenance` is set to `dev-ephemeral`. CI must inject the production key via the `SITA_MOK_KEY_BASE64` / `SITA_MOK_CERT_BASE64` GitHub secrets.

---

## 3. SBOMs — signed CycloneDX 1.5

Scripts:
- `os/scripts/generate-sbom.sh` — emits **two** SBOMs:
  - `generated/sbom-electron-${VERSION}.cdx.json` (npm components, via `@cyclonedx/cyclonedx-npm` with a deterministic fallback)
  - `generated/sbom-os-${VERSION}.cdx.json` (debian dpkg components from the chroot)
- `os/scripts/verify-sbom.sh` — schema check + signature/SHA256 verification.

Each SBOM is detached-signed with the SITA release key (`SITA_RELEASE_SIGN_KEY`). When no key is configured, a `.sha256` sidecar is written so downstream consumers always have an integrity anchor.

---

## 4. Reproducible builds

Script: `os/scripts/reproducible-build-env.sh` — sourced at the top of every build script. Pins:

- `SOURCE_DATE_EPOCH` (last git commit timestamp)
- `LC_ALL`, `LANG`, `TZ`, `umask`
- `SITA_MKSQUASHFS_OPTS` — deterministic squashfs flags (`-all-root -reproducible -mkfs-time ${SDE} -all-time ${SDE}`)
- `SITA_XORRISO_OPTS` — deterministic ISO flags
- `SITA_TAR_OPTS` — deterministic tar flags for update bundles

Verification: `os/scripts/verify-reproducibility.sh` runs the build twice in clean output dirs and SHA256-compares every `.iso`, `.img`, and `.squashfs` artifact. A JSON report is emitted to `generated/reproducibility-report.json`.

---

## 5. Wiring (where Phase 4 plugs in)

| Surface | What it does |
|---|---|
| `os/scripts/release.sh` | After verity build → seal to TPM → enroll Secure Boot → generate SBOMs |
| `.github/workflows/os-build-iso.yml` | Runs `os:secureboot:enroll`, `os:tpm:seal`, `os:sbom`; uploads `out/secureboot/`, `out/tpm-seal-*`, and `generated/sbom-*` as artifacts |
| `package.json` | Exposes `os:tpm:seal`, `os:tpm:verify`, `os:secureboot:enroll`, `os:sbom`, `os:sbom:verify`, `os:reproducibility`, `os:reproducibility:env` |
| `scripts/architecture/assertions/assert-phase-4-supply-chain.ps1` | Architecture-truth gate that fails CI if any Phase 4 file or wiring goes missing |

---

## 6. Operator quick-reference

```bash
# Pin reproducible env (sourced automatically by release.sh)
. os/scripts/reproducible-build-env.sh --print

# After a normal build:
ROOT_HASH=$(jq -r '.root_hash' out/verity-metadata.json)
SITA_VERSION=1.0.0 bash os/scripts/seal-verity-to-tpm.sh "$ROOT_HASH"
SITA_VERSION=1.0.0 bash os/scripts/enroll-secureboot-mok.sh
SITA_VERSION=1.0.0 bash os/scripts/generate-sbom.sh

# Verify
bash os/scripts/verify-tpm-seal.sh --offline
bash os/scripts/verify-sbom.sh generated/sbom-electron-1.0.0.cdx.json
sudo -E bash os/scripts/verify-reproducibility.sh
```

---

## 7. Threat model coverage

| Threat | Mitigation |
|---|---|
| Attacker swaps kernel/initramfs at rest | TPM unseal fails (PCR 4 changes) → boot aborts |
| Attacker disables Secure Boot in firmware | TPM unseal fails (PCR 7 changes) |
| Compromised dependency in npm tree | Detected at SBOM diff between releases; signed SBOM proves provenance |
| "Trusting trust" — opaque toolchain | Reproducibility check by independent rebuilder yields identical hash |
| MOK cert exfiltration | Cert is public; private key lives only in CI secret store, rotated per release |
