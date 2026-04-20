# SITA OS — Release Artifact Model

Every released version produces this exact set of artifacts. A release is
not considered valid unless **all** are present and verified.

## Artifacts

| File | Purpose |
|---|---|
| `sita-os-<version>-amd64.iso` | bootable hybrid BIOS+UEFI image |
| `sita-os-<version>-amd64.iso.sha256` | integrity checksum |
| `sita-os-<version>-amd64.iso.manifest.json` | build metadata |
| `sita-os-<version>.bundle` | A/B update bundle |
| `sita-os-<version>.bundle.sig` | detached MOK signature |
| `channel-<channel>.json` | channel manifest published to update server |
| `os-build-attestation.json` | full provenance |
| `os-build-summary.md` | human readable |
| `os-verification-report.json` | post-build verifier output |
| `qemu-validation-report.json` | QEMU boot proof |
| `sita-os-<version>-amd64.ova` | VMware appliance (release events + workflow_dispatch; Wave 6) |
| `sita-os-<version>-amd64.ova.sha256` | OVA integrity checksum |
| `sita-os-<version>-amd64.ova.manifest.json` | OVA build metadata + install phase (`installed-to-disk` / `live-from-cd`) |

## Versioning

`MAJOR.MINOR.PATCH[-pre]+<git-short-sha>` — example: `0.2.0-beta+a1b2c3d`.
The version is set by `VERSION` env in `os/image-builder/build.sh`.

## Release gate (no manual sign-off shortcuts)

```text
[ ] build.sh exited 0
[ ] verify-boot-artifacts.sh exited 0
[ ] verify-verity-metadata.sh exited 0
[ ] qemu-validate.sh exited 0
[ ] verify-update-bundle.sh exited 0  (against channel manifest)
[ ] generate-support-bundle.sh dry-run exited 0
[ ] docs/os/*.md unchanged or PR-reviewed
```

CI enforces all of these in `.github/workflows/os-build-iso.yml`.
