# SITA OS — Hardware Support Matrix

> **Truth discipline:** only configurations that have actually booted to
> `graphical.target` are listed. We do not claim "boots on anything."

## Officially supported

| Class | Target | Status |
|---|---|---|
| Virtual | QEMU/KVM ≥ 7.0 with OVMF | ✅ tier-1 (CI on every commit) |
| Virtual | VMware Workstation 17, ESXi 7+, Fusion 13 | ✅ tier-1 (OVA shipped) |
| Virtual | VirtualBox 7.0+ | ⚠️ tier-2 (manual smoke only) |
| Virtual | Hyper-V (Gen 2, Secure Boot off) | ⚠️ tier-2 |
| Bare metal | Intel NUC 11/12/13 (Tiger/Alder/Raptor Lake) | ✅ tier-1 |
| Bare metal | Framework Laptop 13 (11–13th gen Intel) | ✅ tier-1 |
| Bare metal | Dell XPS 13 (9310, 9320) | ⚠️ tier-2 |
| Bare metal | ThinkPad T14/T16 (gen 3+) | ⚠️ tier-2 |
| Cloud | Hetzner CX/CPX (KVM) | ✅ tier-1 |
| Cloud | AWS EC2 m5/m6i (UEFI boot) | ⚠️ tier-2 |

## Architecture

- **amd64 only** for v1. arm64 build matrix is scaffolded in
  `.github/workflows/os-build-iso.yml` but disabled (no test hardware).

## Hard requirements

| Component | Minimum |
|---|---|
| CPU | x86-64-v2 (2010+) |
| RAM | 4 GB (8 GB recommended for shell) |
| Storage | 32 GB SSD/NVMe |
| Firmware | UEFI; Legacy BIOS supported via hybrid ISO |
| GPU | any with kernel modesetting (Intel iGPU, AMD radeon, virtio-gpu) |
| Network | at least one wired or known wifi adapter |

## Known incompatible

- NVIDIA proprietary blob is **not** included (signed-modules policy).
  Devices that require it for display will boot but stay in `safe-mode`.
- Apple Silicon — no plans (no virtio storage path on M-series UEFI).
