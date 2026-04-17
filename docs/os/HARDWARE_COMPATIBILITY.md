# SITA OS — Hardware Compatibility Matrix

Tested platforms for SITA OS Phase 6+. Tiers reflect verified install + boot + 24h smoke runs.

| Platform | Arch | UEFI | Secure Boot | TPM 2.0 | GPU | Tier | Notes |
|---|---|---|---|---|---|---|---|
| **QEMU/KVM** (qemu-system-x86_64 -bios /usr/share/OVMF/OVMF_CODE.fd) | x86_64 | ✅ | ✅ | swtpm | virtio-vga | 🟢 Tier 1 | Reference dev target |
| **VirtualBox 7.x** | x86_64 | ✅ | ⚠ partial | virt-tpm | VBoxVGA | 🟢 Tier 1 | Disable 3D accel for now |
| **VMware Workstation 17 / Fusion 13** | x86_64 | ✅ | ✅ | vTPM | mesa | 🟢 Tier 1 | |
| **Hyper-V Gen 2 (Win 11)** | x86_64 | ✅ | ✅ | vTPM | synth | 🟢 Tier 1 | |
| **Framework Laptop 13 (12th-gen)** | x86_64 | ✅ | ✅ | fTPM | Intel Iris Xe | 🟢 Tier 1 | First-class flagship |
| **ThinkPad T14 / X13 (Gen 3+)** | x86_64 | ✅ | ✅ | dTPM | AMD/Intel | 🟢 Tier 1 | |
| **Generic OEM UEFI desktop** | x86_64 | ✅ | varies | varies | varies | 🟡 Tier 2 | Preflight required |
| **Apple Silicon Mac (Asahi)** | arm64 | n/a | n/a | n/a | Apple GPU | 🔴 Tier 3 | Future, port pending |
| **Raspberry Pi 5** | arm64 | partial | n/a | external | VideoCore VII | 🟡 Tier 2 | IMG image, no ISO |
| **Pre-2018 BIOS-only PCs** | x86_64 | ❌ | ❌ | ❌ | varies | ❌ Unsupported | UEFI required |

## Minimum specs (preflight gate)

| Resource | Minimum | Recommended |
|---|---|---|
| RAM | 4 GB | 8 GB+ |
| Disk | 16 GB | 64 GB+ NVMe |
| CPU | x86_64 with SSE4.2 | 4+ cores, AVX2 |
| Firmware | UEFI 2.3.1+ | UEFI + Secure Boot + TPM 2.0 |
| GPU | Any with KMS driver | Intel/AMD/NVIDIA with Mesa |

## Preflight enforcement

Live ISO runs `os/image-builder/preflight/hardware-check.sh` and writes `/run/sita-preflight.json`. The Electron installer (`os/installer/main.cjs`) reads this report and refuses to proceed when `meets_minimum: false`. Reasons are surfaced in the UI with remediation hints.

## Reporting new compatibility

File an issue at `https://github.com/<org>/sita-os/issues/new?template=hardware-report.yml` with the contents of `/run/sita-preflight.json` plus a short description of working/non-working features.
