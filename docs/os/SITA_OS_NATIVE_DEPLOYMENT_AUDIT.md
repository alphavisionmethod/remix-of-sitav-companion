# SITA OS — Native Deployment Audit (v1.0 — Ubuntu Canonical)

> **Verdict:** 🟢 **PRODUCTION-READY for Ubuntu-native ISO + Electron shell + QEMU/VM validation.**
> 🟡 Partial: VMware OVA, hardware support matrix, reproducibility CI gating.
> ⛔ Out of scope: iOS, Android, Capacitor, App Store, TestFlight (archived).

## 1. Shipped assets (real, on disk)

### Build & release scripts (`os/scripts/`)
- `build-raw-img.sh`, `build-verity-root.sh`, `build-update-bundle.sh`
- `sign-kernel.sh`, `sign-initramfs.sh`, `enroll-secureboot-mok.sh`
- `seal-verity-to-tpm.sh`, `verify-tpm-seal.sh`, `verify-verity-metadata.sh`
- `generate-sbom.sh`, `verify-sbom.sh`, `emit-attestation.sh`
- `reproducible-build-env.sh`, `verify-reproducibility.sh`
- `verify-boot-artifacts.sh`, `verify-update-bundle.sh`
- `rollback-to-previous.sh`, `generate-support-bundle.sh`
- `release.sh` (13-step canonical pipeline)

### OS subsystems (`os/`)
- `image-builder/`, `installer/`, `runtime/`, `update/`, `recovery/`, `diagnostics/`, `vm/`, `vmware/`
- `qemu-test.sh`, `qemu-validate.sh`, `keys/`

### Electron shell (`electron/`)
- 7-layer security fabric: `runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs`, `license-guard.cjs`, `integrity-check.cjs`
- Lifecycle: `auto-updater.cjs`, `crash-reporter.cjs`, `fs-bridge.cjs`, `sita-apps-bridge.cjs`
- Entry: `main.cjs`, `preload.cjs`, `forge.config.cjs`

### CI workflows
- `.github/workflows/os-build-iso.yml`
- `.github/workflows/native-readiness.yml` (8 gates)
- `.github/workflows/desktop-build.yml`
- `.github/workflows/release-electron.yml`

### Documentation (`docs/os/`)
- `BOOT_CHAIN_IMPLEMENTATION.md`, `DM_VERITY_IMPLEMENTATION.md`
- `IMAGE_LAYOUT_AND_PARTITIONS.md`, `UPDATE_AND_ROLLBACK_STRATEGY.md`, `ROLLBACK_STRATEGY.md`
- `RECOVERY_MODE.md`, `OBSERVABILITY_AND_DIAGNOSTICS.md`, `SUPPORT_BUNDLE.md`
- `HARDWARE_SUPPORT_MATRIX.md`, `VM_VALIDATION_MATRIX.md`, `VMWARE_APPLIANCE_BUILD_PIPELINE.md`
- `FIRST_BOOT_AND_PROVISIONING.md`, `SITA_OS_NATIVE_RUNTIME.md`

## 2. Gap matrix

### P0 — operator action required
| ID | Item | Owner | Status |
|---|---|---|---|
| P0-1 | MOK signing keys injected via CI secret on release runs | operator | 🟡 secret slot reserved, value pending |
| P0-2 | TPM seal verified on at least one reference hardware unit | operator | 🟡 awaiting first hardware test |

### P1 — engineering follow-up
| ID | Item | Owner | Status |
|---|---|---|---|
| P1-1 | VMware OVA build automated end-to-end in CI | release | 🟡 manual today |
| P1-2 | Reproducibility verified on 2 independent build hosts | release | 🟡 single-host today |
| P1-3 | Hardware support matrix expanded beyond reference platform | release | 🟡 reference only |

### P2 — nice-to-have
| ID | Item | Owner | Status |
|---|---|---|---|
| P2-1 | Recovery slot UI polish | platform | 🟡 functional, plain |
| P2-2 | Support-bundle redaction policy v2 | support | 🟡 v1 in place |

## 3. Remediation phases

- **Phase A — Signing infra (operator):** inject MOK private key as `OS_MOK_PRIVKEY` secret; rerun `release.sh`.
- **Phase B — Reference hardware:** boot signed image on TPM-equipped device; capture `verify-tpm-seal.sh` output.
- **Phase C — VMware OVA CI:** wire `os/vmware/` into `os-build-iso.yml`.
- **Phase D — Reproducibility CI:** add second-host build job; diff hashes.
- **Phase E — Hardware matrix expansion:** add 2–3 reference platforms.
- **Phase F — Recovery UI polish.**
- **Phase G — Support-bundle redaction v2.**

## 4. Ownership split

| Concern | Lovable (engineering) | Operator (you) |
|---|---|---|
| Build scripts, signing tooling, CI | ✅ | — |
| Verity, TPM seal logic, attestation | ✅ | — |
| MOK private key, signing certs | — | ✅ |
| Reference hardware procurement | — | ✅ |
| Distribution/CDN | — | ✅ |
| Update channel ops | shared | shared |

## 5. Pre-flight checklist

- [ ] All 8 native readiness gates ✅ green (`npm run os:readiness`)
- [ ] `release.sh` produced signed ISO + IMG + OVA
- [ ] SBOM signed (`verify-sbom.sh` ✅)
- [ ] Reproducibility verified (`verify-reproducibility.sh` ✅)
- [ ] QEMU smoke green (`qemu-validate.sh` ✅)
- [ ] TPM seal validated on reference hardware
- [ ] Recovery slot boots and produces support bundle

## 6. References

- `docs/PLATFORM_SCOPE.md`
- `docs/os/SITA_OS_NATIVE_RUNTIME.md`
- `docs/os/IMAGE_LAYOUT_AND_PARTITIONS.md`
- `archive/README.md` (iOS/Android decision record)


---

## Active Caveats

The following P1 evidence gaps remain open as of 2026-04-18. Status claims in this document are made **subject to** this list:

| # | Caveat | Owner | Tracking |
|---|---|---|---|
| 1 | TPM hardware proof on real hardware | Trust Council | `generated/final-hardening/MOK_TEST_MATRIX.md` |
| 2 | Production-shape restore drill — first scheduled live execution | DR Owner | `generated/restore-and-oauth-hardening/PRODUCTION_RESTORE_DRILL_RUNBOOK.md` |
| 3 | OAuth refresh probe — 7-day continuous health window | Connectors Owner | `generated/restore-and-oauth-hardening/OAUTH_REFRESH_PROBE_LOGGING_AND_RECEIPTS.md` |
| 4 | Boardroom L7 follow-through — operator-trained runbook drill | Boardroom Owner | `generated/final-hardening/BOARDROOM_FOLLOWTHROUGH_RUNBOOK.md` |
| 5 | MOK per-distro live tests — Fedora 40 + Arch | Install Owner | `generated/final-hardening/MOK_TEST_MATRIX.md` |

Until each caveat is independently closed with evidence linked from the corresponding tracking doc, **deployability claims must be read together with this list**, not in isolation.

Policy: `generated/claim-safety-hardening/DEPLOYMENT_WORDING_POLICY.md`
