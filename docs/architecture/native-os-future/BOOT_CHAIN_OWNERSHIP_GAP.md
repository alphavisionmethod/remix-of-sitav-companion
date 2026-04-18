# Boot Chain Ownership — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

A SITA-owned boot chain: firmware interface (UEFI/coreboot fork), bootloader, signed boot policy, kernel handoff, early-userland init, recovery partition, and OEM-key custody.

## What SITA OS actually does today

- Boots inside the host OS as a normal application or appliance VM image.
- The "boot animation" in the desktop shell is a **UI sequence**, not a real boot.
- Appliance images use stock cloud-init / standard distro boot — not a SITA boot chain.

## Honesty boundary

- ❌ No claim of "we own the boot chain."
- ❌ No claim of secure-boot custody or measured-boot attestation.
- ✅ The simulated boot sequence is allowed because it is shell decoration; `ShellSimulationBanner` exists for this exact reason.
