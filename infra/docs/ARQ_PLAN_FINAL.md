# SITA OS — Architecture Plan (ARQ_PLAN_FINAL)

## Base OS Authority Decision

| Property | Decision |
|---|---|
| **Base OS** | Ubuntu 24.04 LTS (Noble Numbat) |
| **Kernel** | 6.8+ (HWE kernel track) |
| **Init system** | systemd (systemd-boot preferred over GRUB) |
| **Architecture** | x86_64 (aarch64 future target) |

## Secure Boot Posture

- **UEFI Secure Boot**: Required — all boot-chain binaries must be signed
- **Shim**: Canonical-signed shim for Secure Boot chain-of-trust
- **MOK (Machine Owner Key)**: Supported for custom kernel modules (e.g., hardware drivers)
- **Fallback**: Systems without Secure Boot may run in `reduced-trust` mode — user is informed, proof chain records the gap

## Hardware Assumptions

| Requirement | Minimum | Recommended |
|---|---|---|
| **CPU** | 64-bit, 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 32 GB | 128+ GB NVMe |
| **TPM** | 2.0 preferred | 2.0 with SHA-256 PCR banks |
| **Display** | 1280×720 | 1920×1080+ |
| **Network** | Optional at boot | Wi-Fi or Ethernet |

### TPM Policy

- **TPM 2.0 present**: Full measured boot, LUKS2 key sealing, hardware attestation
- **TPM absent**: Software-only key derivation, user-password LUKS2, `trust-baseline: software-only` flag recorded in proof chain
- **TPM version < 2.0**: Treated as absent

## Kernel / Initramfs Policy

### Initramfs

- **Immutable**: Initramfs is generated at build/install time and verified at boot
- **Integrity**: dm-verity hash tree covers the root filesystem
- **Contents**: Minimal — cryptsetup, systemd-init, hardware probe, SITA first-boot hook
- **Signing**: Initramfs image is signed with the MOK or distribution key

### Root Filesystem

- **dm-verity**: Enforced on the read-only root partition
- **Overlay**: Writable overlay (tmpfs or persistent partition) for runtime state
- **Updates**: A/B partition scheme — update writes to inactive slot, atomic switch on reboot

### Measured Boot Chain

```
UEFI Firmware (PCR0-1)
  → Shim (PCR4)
    → systemd-boot (PCR4)
      → Kernel + cmdline (PCR8-9)
        → Initramfs (PCR9)
          → dm-verity root (PCR10)
            → systemd units
              → sita-runtime.service
                → First-boot provisioning (if first boot)
                → Normal runtime (if subsequent boot)
```

Each stage extends PCR measurements. The SITA runtime reads the TPM event log to construct the `BootChainAttestation` proof.

## SITA Runtime Bootstrap

1. `sita-runtime.service` starts after `multi-user.target`
2. Reads TPM event log → constructs `BootChainAttestation`
3. Checks first-boot flag (`/var/lib/sita/.first-boot-complete`)
4. **First boot**: Runs provisioning envelope (device ID, tenant binding, key generation, network, trust baseline)
5. **Subsequent boot**: Loads cached trust state, connects to cloud, syncs proof chain
6. Emits `SystemReceipt` for boot completion
7. Starts capability services in dependency order (per `generated/startup-order.json`)
8. Opens desktop surface (Electron host or web fallback)

## Update Policy

- **Critical security**: Auto-apply, reboot if required, notify user post-reboot
- **Essential updates**: Download automatically, apply at next reboot or user-approved window
- **Feature updates**: Prompt user, defer up to 14 days
- **Rollback**: A/B partition allows instant rollback to previous known-good state

## Governance

- This document is the canonical authority for base OS decisions
- Changes require proof-chain recorded approval
- Generated manifests in `generated/` must stay in sync (enforced by `scripts/sync-registry-manifests.ts`)
