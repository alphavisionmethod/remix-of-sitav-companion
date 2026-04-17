# SITA OS — Key Storage Strategy

> **This directory is intentionally empty in git.** No real keys are ever
> committed. This file documents *where* keys live and *how* they reach
> the build pipeline.

## Three locations, three purposes

| Location | When used | Who can read |
|---|---|---|
| **Offline HSM / encrypted USB** | release builds | release engineer + 1 backup |
| **GitHub Encrypted Secrets** | CI (`os-build-iso.yml`) | repo admins |
| **Local tmpfs (`/tmp`)** | dev builds when no MOK present | the developer running `os:build:iso` |

## Required environment variables

```bash
export SITA_MOK_KEY=/path/to/mok.priv      # PEM RSA private key
export SITA_MOK_CERT=/path/to/mok.der      # x509 DER certificate
```

When **either** is missing, `os/scripts/sign-kernel.sh` generates an
ephemeral 2048-bit RSA pair in `/tmp/<random>` and clearly logs that the
output is **dev-unsigned**. The build manifest reflects this honestly
(`trust_baseline: "dev-unsigned"`).

## CI activation

Add these GitHub repository secrets to enable real signing:

| Secret | Format |
|---|---|
| `SITA_MOK_KEY_BASE64` | `base64 < mok.priv` |
| `SITA_MOK_CERT_BASE64` | `base64 < mok.der` |

The workflow decodes them into `${RUNNER_TEMP}/mok.{key,crt}`, exports
`SITA_MOK_KEY` / `SITA_MOK_CERT`, runs the build, then `rm -f` the
plaintext copies. They never touch the workspace checkout.

## Generating a new MOK (one-time)

```bash
openssl req -new -x509 \
  -newkey rsa:2048 -nodes \
  -keyout sita-mok.priv \
  -outform DER -out sita-mok.der \
  -days 1825 \
  -subj "/CN=SITA OS Machine Owner Key/"
```

Keep `sita-mok.priv` offline. Distribute `sita-mok.der` so devices can
enroll it via `mokutil --import sita-mok.der` (asks for one-time password
on next reboot via shim's MokManager).

## Rotation

Annual. New MOK is enrolled alongside the old one for a 6-month overlap;
update bundles signed by the old MOK still verify until the overlap ends.
