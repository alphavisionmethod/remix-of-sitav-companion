# SITA OS — Trust Chain, Keys & Signing

This document describes the **canonical** (and only) trust chain for SITA OS.
There is one signing flow, one key hierarchy, one verifier.

## Key hierarchy

| Key | Purpose | Storage | Rotation |
|---|---|---|---|
| **Canonical UEFI CA** | shim chain (Microsoft + Canonical) | upstream | n/a |
| **MOK (Machine Owner Key)** | signs SITA kernel + initramfs | offline HSM / GitHub Encrypted Secret | yearly |
| **Update bundle key** | signs `.bundle` artifacts | same MOK | yearly |
| **Ephemeral dev key** | local builds when no MOK present | tmpfs, never committed | per build |

The MOK is enrolled into the user's firmware during install (or auto-enrolled
on first boot via `mokutil --import` for unattended/lab images).

## Files

| Path | Role |
|---|---|
| `os/scripts/sign-kernel.sh` | sbsign + sbverify the kernel |
| `os/scripts/sign-initramfs.sh` | OpenSSL detached sig of `initrd.img` |
| `os/scripts/verify-boot-artifacts.sh` | end-to-end check used by CI |
| `os/image-builder/security/sign-kernel.sh` | low-level helper (called by canonical script) |

## Required environment

```bash
export SITA_MOK_KEY=/secure/sita-mok.priv
export SITA_MOK_CERT=/secure/sita-mok.der
```

In CI these come from:

- `secrets.SITA_MOK_KEY_BASE64`
- `secrets.SITA_MOK_CERT_BASE64`

…decoded into `${RUNNER_TEMP}/mok.{key,crt}` by `os-build-iso.yml` and removed
on cleanup. **Never commit a real MOK.**

## Verification (post-build)

```bash
SITA_MOK_CERT=/secure/sita-mok.der bash os/scripts/verify-boot-artifacts.sh out
```

Checks: kernel signature, initramfs signature, verity root hash, ISO SHA256.
Output written to `out/os-verification-report.json`.

## What "signed" means in this repo

- ✅ kernel and initramfs carry verifiable signatures from the configured key
- ✅ update bundles (`.bundle`) carry a detached `.sig`
- ✅ ISO ships with a SHA256 file
- ❌ **dev builds without `SITA_MOK_KEY` are unsigned** — clearly logged

No script will ever claim "signed" without producing real bytes.
