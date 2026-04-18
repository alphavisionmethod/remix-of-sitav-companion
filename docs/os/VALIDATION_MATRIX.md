# SITA OS — Validation Matrix

> **A build is "validated" only if every row below is green.**
> Yellow rows are advisory but do not block release. Red rows block.

## Pre-release gate matrix

| # | Concern | Check | Owner script | Tier |
|---|---|---|---|---|
| 1 | ISO build | hybrid BIOS/UEFI image produced, sha256 stable | `os/scripts/build-iso.sh` | 🔴 block |
| 2 | IMG build | raw IMG produced, partition table valid | `os/scripts/build-img.sh` | 🔴 block |
| 3 | OVA build | OVA produced, ovftool validated | `os/scripts/build-ova.sh` | 🟡 advisory |
| 4 | SBOM | CycloneDX 1.5 generated and signed | `os/scripts/generate-sbom.sh` | 🔴 block |
| 5 | Trust chain | Secure Boot keys present, sbsign verified, dm-verity hashes match | `scripts/architecture/checks/check-os-trust-chain-readiness.ts` | 🔴 block |
| 6 | dm-verity | root hash matches signed manifest | `os/scripts/verity-setup.sh --verify` | 🔴 block |
| 7 | TPM attestation | quote produced and verifies against AK | `os/scripts/tpm-attest.sh --selftest` | 🟡 advisory |
| 8 | QEMU boot | image boots to graphical.target in QEMU/OVMF | `os/scripts/qemu-smoke.sh` | 🔴 block |
| 9 | First-boot | provisioning completes, marker written | `deploy/first-boot.sh` (under qemu-smoke) | 🔴 block |
| 10 | Shell start | sita-runtime active, /run/sita/shell-ready exists | `os/runtime/check-shell-health.sh` | 🔴 block |
| 11 | Service health | all required units active per SERVICE_MODEL.md | `os/diagnostics/check-boot-target.sh` | 🔴 block |
| 12 | Update bundle | bundle builds, signs, verifies, applies in QEMU | `os/scripts/{build,verify}-update-bundle.sh` | 🔴 block |
| 13 | Rollback | rollback flips slot and reboots successfully | `os/scripts/rollback-to-previous.sh` (under qemu-smoke) | 🔴 block |
| 14 | Recovery entry | systemd-boot menu shows recovery; entry boots | `os/scripts/qemu-smoke.sh --recovery` | 🟡 advisory |
| 15 | Support bundle | bundle generates, redaction passes | `os/scripts/generate-support-bundle.sh` | 🔴 block |
| 16 | Backup smoke | `deploy/backup.sh` produces tarball + manifest | `deploy/backup.sh --output-dir /tmp/bk` | 🟡 advisory |
| 17 | Diagnostics | all collectors run and emit valid JSON | `os/diagnostics/*.sh` | 🔴 block |
| 18 | Native readiness | all 8 Part-1 readiness gates pass | `scripts/architecture/checks/run-all-native-readiness.ts` | 🔴 block |
| 19 | Release readiness | aggregate report ok=true | `scripts/architecture/checks/check-os-release-readiness.ts` | 🔴 block |

## Release readiness aggregator

`scripts/architecture/checks/check-os-release-readiness.ts` reads every
`generated/*-readiness-report.json` and produces:

- `generated/os-release-readiness-report.json` (machine-readable)
- `generated/os-release-readiness-summary.md` (human-readable)

A release is **only** cuttable when the aggregator exits 0 and every 🔴 row
above is green in the report.

## CI mapping

| Workflow | Runs | Blocks |
|---|---|---|
| `.github/workflows/native-readiness.yml` | rows 5,7,8,11,14,15,17,18,19 | yes |
| `.github/workflows/os-build-iso.yml` | rows 1,2,3,4,6,8,9,12 | yes |
| `.github/workflows/release.yml` (cut tags) | row 19 (aggregator) + signature | yes |

## Manual / on-device matrix (pre-deploy)

Operators MUST run before installing onto bare metal:

```bash
sudo sita-ops status
sudo sita-ops update-status
sudo sita-ops shell-health
sudo sita-ops support-bundle    # archive baseline
```

## Related

- `HARDWARE_SUPPORT_MATRIX.md` — what we test on.
- `SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — current verdict.
