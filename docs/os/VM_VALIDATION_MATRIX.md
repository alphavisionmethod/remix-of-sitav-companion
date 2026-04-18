# SITA OS — VM Validation Matrix

Truthful posture on what is **actually validated** vs **expected to
work** vs **planned**. This document is the single source of truth for
support; do not claim VM support beyond what is listed below.

## Status legend

| Status | Meaning |
|---|---|
| ✅ **validated** | Boots cleanly in CI or on a maintainer's workstation; assertion-tested |
| 🟡 **expected** | Architecturally compatible; not yet asserted in CI |
| 🔬 **experimental** | Boots but with known caveats (see notes) |
| ⛔ **unsupported** | Known-broken or out of scope |

## Hypervisor matrix

| Hypervisor | Format | Status | How it's validated | Notes |
|---|---|---|---|---|
| **QEMU/KVM (UEFI)** | `.iso` | ✅ validated | `os/qemu-validate.sh` (CI: `os-build-iso.yml` → `smoke-test`) | 5 assertions: kernel-userspace, first-boot, runtime-shell, no-panic, no-verity-corruption |
| **QEMU/KVM (BIOS)** | `.iso` | 🟡 expected | not asserted in CI | Hybrid ISO supports BIOS; manual test only |
| **VMware Workstation 17+** | `.ova` | 🟡 expected | `os/vm/validate-vm-profile.sh vmware` (skipped if `vmrun` absent) | OVA built by `os/vmware/build-ova.sh` |
| **VMware Fusion 13+** | `.ova` | 🟡 expected | same as Workstation | Apple Silicon untested |
| **VMware ESXi 7/8** | `.ova` | 🔬 experimental | manual import only | Driver paravirt may need adjustment |
| **VirtualBox 7+** | `.ova` | 🟡 expected | `os/vm/validate-vm-profile.sh virtualbox` | Use the OVA, not the ISO directly |
| **Hyper-V (Gen 2)** | `.img` | 🔬 experimental | manual flash of raw IMG | Secure Boot keys not enrolled for Hyper-V |
| **AWS EC2 (VM Import)** | `.img` | 🔬 experimental | none yet | Use `aws ec2 import-image` against the raw IMG |
| **GCP Compute Import** | `.img` | 🔬 experimental | none yet | Use `gcloud compute images import` |
| **Proxmox VE** | `.iso` / `.img` | 🟡 expected | manual | KVM-based; should match QEMU posture |
| **Parallels Desktop** | `.iso` | ⛔ unsupported | n/a | x86_64 only; Apple Silicon out of scope |

## How to re-validate locally

```bash
# QEMU (default in CI)
npm run os:test:qemu:validate

# VMware (requires vmrun on PATH)
bash os/vm/validate-vm-profile.sh vmware

# VirtualBox (requires VBoxManage on PATH)
bash os/vm/validate-vm-profile.sh virtualbox
```

Each run writes `out/vm-profile-<profile>.json` with `status`,
`reason`, and `ranAt`. Status values: `passed | failed | skipped`. A
missing CLI yields `skipped`, never `passed` — this is intentional.

## What is NOT in this matrix

- macOS / Apple Silicon hosts as VM targets (out of scope; SITA is x86_64 first)
- Nested virtualization beyond the host hypervisor's defaults
- Bare-metal hardware (see `docs/os/HARDWARE_SUPPORT_MATRIX.md`)

Cross-references:
- `docs/os/DISTRIBUTION_FORMATS.md` — when to pick ISO vs IMG vs OVA
- `docs/os/VMWARE_APPLIANCE_BUILD_PIPELINE.md` — OVA build pipeline
- `docs/os/HARDWARE_SUPPORT_MATRIX.md` — bare-metal support
