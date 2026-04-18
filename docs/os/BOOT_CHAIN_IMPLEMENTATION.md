# SITA OS — Boot Chain Implementation

This document is the canonical reference for the SITA OS trusted boot chain.
It ties together the already-shipped signing scripts, dm-verity wiring, key
strategy, and CI verification into a single end-to-end picture.

> **Status:** ✅ implemented. Every stage below is backed by real code in this
> repo. No aspirational claims.

## 1. The four-stage boot chain

```
┌──────────────────┐   ┌───────────────────┐   ┌──────────────────────┐
│  UEFI firmware   │ → │  shim (MS + Can.) │ → │  signed GRUB / sd-boot│
└──────────────────┘   └───────────────────┘   └──────────┬───────────┘
                                                          │
                                ┌─────────────────────────┘
                                ▼
                ┌──────────────────────────────┐
                │  signed kernel (sbsign)      │
                │  signed initramfs (openssl)  │
                └──────────────┬───────────────┘
                               ▼
                ┌──────────────────────────────┐
                │  dm-verity protected rootfs  │
                │  (panic-on-corruption)       │
                └──────────────────────────────┘
```

| Stage | Trust anchor | Verifier | Implementation |
|---|---|---|---|
| 1. UEFI firmware | Platform key (OEM) | firmware itself | n/a — relies on stock UEFI |
| 2. shim | Microsoft 3rd-party CA | UEFI | upstream `shim-signed` package |
| 3. Bootloader | Canonical UEFI CA → MOK | shim | systemd-boot loader entry written by `os/installer/scripts/install.sh` |
| 4. Kernel | SITA MOK | shim/sd-boot | `os/scripts/sign-kernel.sh` (sbsign) |
| 5. Initramfs | SITA MOK | kernel via detached sig | `os/scripts/sign-initramfs.sh` (openssl) |
| 6. Rootfs | verity root hash on cmdline | kernel dm-verity | `os/scripts/build-verity-root.sh` |

## 2. Files that implement this

| Path | Role |
|---|---|
| `os/scripts/sign-kernel.sh` | sbsign + sbverify the kernel; emits signing receipt |
| `os/scripts/sign-initramfs.sh` | OpenSSL SHA-256 detached signature for `initrd.img` |
| `os/scripts/verify-boot-artifacts.sh` | end-to-end check (kernel sig + initramfs sig + verity hash + ISO sha256) |
| `os/scripts/build-verity-root.sh` | `veritysetup format` over squashfs root, writes `verity.img` + receipt |
| `os/scripts/verify-verity-metadata.sh` | re-runs `veritysetup verify`, fails CI if drift |
| `os/scripts/emit-attestation.sh` | rolls all of the above into `generated/os-build-attestation.json` |
| `os/image-builder/security/sign-kernel.sh` | low-level helper (called by canonical script) |
| `os/keys/README.md` | key storage strategy (offline HSM / GH Secrets / tmpfs) |

## 3. Signature algorithms

| Artifact | Algorithm | Tool | Receipt field |
|---|---|---|---|
| Kernel | RSA-2048+ over PE → embedded | `sbsign` / `sbverify` | `os-signing-receipt.json.sha256` |
| Initramfs | SHA-256 detached signature | `openssl dgst -sha256 -sign` | `${INITRD}.sig` |
| Rootfs | Merkle tree, root hash | `veritysetup format` | `verity-receipt.json.rootHash` |
| ISO | SHA-256 checksum file | `sha256sum` | `${ISO}.sha256` |

## 4. CI verification flow

`.github/workflows/os-build-iso.yml`:

```
1. free-disk-space
2. decode SITA_MOK_KEY_BASE64 / SITA_MOK_CERT_BASE64 → ${RUNNER_TEMP}/mok.{key,crt}
3. export SITA_MOK_KEY / SITA_MOK_CERT
4. pnpm os:build:iso          # build.sh stages 1-9 inc. sign + verity
5. pnpm os:verify             # verify-boot-artifacts.sh
6. pnpm os:verify:verity      # verify-verity-metadata.sh
7. pnpm os:attest             # emit-attestation.sh
8. upload artifacts: ISO, .sha256, manifest.json, attestation.json, qemu report
9. cleanup: rm -f mok.{key,crt}   # plaintext keys never persist
```

Failure at any step fails the workflow — there is no "best effort" path that
silently downgrades trust.

## 5. Production vs dev key handling

The signing scripts behave **honestly**:

| Condition | Behaviour | Manifest field |
|---|---|---|
| `SITA_MOK_KEY` + `SITA_MOK_CERT` set | sign with production MOK | `trust_baseline: "production-signed"` |
| Either env var missing | generate ephemeral 2048-bit key in `/tmp` | `trust_baseline: "dev-unsigned"` and stderr warning |

A dev build will **never** be reported as production-signed. The build manifest
(`${ISO}.manifest.json`) reflects exactly which key kind was used, so downstream
gates (release verification, OTA channel promotion) can refuse to publish a
dev-signed image as stable.

See `os/keys/README.md` for the full key storage strategy and the one-time
`openssl req` command to mint a fresh MOK.

## 6. Enrolling the MOK on a target machine

On first install (or any time the MOK rotates), the operator runs:

```bash
sudo mokutil --import /usr/share/sita/keys/sita-mok.der
# choose a one-time password
sudo reboot
# at reboot, shim's MokManager prompts for the password and enrols the key
```

After enrolment the SITA-signed kernel and modules load cleanly under Secure
Boot. Until then, the kernel will refuse to load unsigned modules under
`lockdown=integrity`.

## 7. Failure behaviour

| Failure | Result | Recovery path |
|---|---|---|
| Kernel signature invalid | shim refuses to chain-load → UEFI shell | recovery USB |
| Initramfs signature invalid | kernel panics before pivot_root | recovery slot via systemd-boot menu |
| Verity hash mismatch on any block | kernel panic (`panic-on-corruption`) | recovery slot |
| MOK not enrolled | unsigned kernel modules refused under lockdown | `mokutil --import` then reboot |
| Update bundle signature invalid | `sita-updated` rejects bundle, no slot switch | bundle re-fetched on next tick |

The recovery slot remains bootable from the systemd-boot menu — see
`docs/os/RECOVERY_MODE.md`.

## 8. Cross-references

- [`TRUST_CHAIN_KEYS_AND_SIGNING.md`](./TRUST_CHAIN_KEYS_AND_SIGNING.md) — key hierarchy, rotation policy, env var contract
- [`DM_VERITY_IMPLEMENTATION.md`](./DM_VERITY_IMPLEMENTATION.md) — verity tree generation and cmdline wiring
- [`UPDATE_AND_ROLLBACK_STRATEGY.md`](./UPDATE_AND_ROLLBACK_STRATEGY.md) — how signed bundles flow into A/B slots
- [`RELEASE_ARTIFACT_MODEL.md`](./RELEASE_ARTIFACT_MODEL.md) — what every release publishes and how it's verified
- [`RECOVERY_MODE.md`](./RECOVERY_MODE.md) — what happens when any link in this chain breaks

## 9. What "boot chain implemented" means in this repo

- ✅ kernel and initramfs carry verifiable signatures from the configured key
- ✅ rootfs is dm-verity protected with `panic-on-corruption`
- ✅ verity root hash is on the kernel cmdline written by the installer
- ✅ CI verifies every signature and hash on every build
- ✅ build manifest reports trust baseline truthfully
- ✅ recovery slot exists for any failure in the chain
- ❌ TPM-sealed verity hash — planned, not yet wired (tracked in DM_VERITY doc)
- ❌ Per-file IMA/EVM — out of scope (verity covers the whole rootfs)

No script in this repo will ever claim a stage is "trusted" without producing
real bytes that prove it.
