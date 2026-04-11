

# Implement Full Kernel Architecture & Security Model

## Status Check
The `src/lib/core-services/kernel/` directory is **completely empty** — none of the kernel subsystems exist yet. All 18 files from the previous plan need to be created and wired into the `SitaKernel` class.

## What Gets Built

### Kernel Architecture (10 files)

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/index.ts` | Barrel export + `KernelSubsystem` facade class |
| `src/lib/core-services/kernel/process-scheduler.ts` | MLFQ scheduler with 5 priority bands (RT-Critical → Idle), ProcessControlBlock, preemption, priority inheritance |
| `src/lib/core-services/kernel/memory-manager.ts` | Virtual memory manager: 4-level page tables, demand paging, CoW, SLAB/buddy allocators, OOM policy |
| `src/lib/core-services/kernel/sita-filesystem.ts` | SitaFS: CoW B-tree filesystem with journaling, snapshots, checksums, compression + VFS mount layer |
| `src/lib/core-services/kernel/driver-manager.ts` | User-space driver framework: device tree, hot-plug, capability sandboxing, driver signing enforcement |
| `src/lib/core-services/kernel/ipc-system.ts` | Capability-based message passing, shared memory regions, POSIX signals, event channels |
| `src/lib/core-services/kernel/syscall-table.ts` | ~120 syscall definitions across 7 categories (process, memory, fs, ipc, security, device, proof) with ABI spec |
| `infra/docs/KERNEL_ARCHITECTURE.md` | Complete kernel architecture specification document |
| `infra/docs/MEMORY_ARCHITECTURE.md` | Virtual memory system design document |
| `infra/docs/FILESYSTEM_ARCHITECTURE.md` | SitaFS + VFS specification |

### Security Model (7 files)

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/sandbox-engine.ts` | 5-ring trust model, Seccomp-BPF syscall filtering, namespace isolation, Landlock LSM, capability enforcement |
| `src/lib/core-services/kernel/code-verification.ts` | Ed25519/RSA-4096 binary signing, boot chain verification, CRL revocation, enforced/permissive modes |
| `src/lib/core-services/kernel/capability-permission-system.ts` | Three-layer permissions: POSIX DAC + Linux capabilities + SITA capability tokens |
| `src/lib/core-services/kernel/crypto-subsystem.ts` | LUKS2 FDE (AES-256-XTS), TPM 2.0 key sealing, key hierarchy (master → volume → file), rotation policy |
| `src/lib/core-services/kernel/app-isolation.ts` | Per-app namespaces, cgroups v2 resource limits, private mounts, nftables firewall, crash isolation |
| `infra/docs/SECURITY_ARCHITECTURE.md` | Full security model specification with runtime protections table |
| `generated/security-model-manifest.json` | Machine-readable security controls inventory |

### Generated Manifests (2 files)

| File | Purpose |
|------|---------|
| `generated/kernel-architecture-manifest.json` | Kernel config: model, scheduler, VMM, filesystem, IPC, drivers |
| `generated/syscall-manifest.json` | Complete syscall catalog (~120 entries) with ABI conventions |

### Wiring into SitaKernel (1 edit)

| File | Change |
|------|--------|
| `src/lib/sita-kernel.ts` | Import `KernelSubsystem` from barrel, add as `readonly kernelArch` property, instantiate in constructor, emit boot receipt |

## Technical Approach

- Every TypeScript service follows the existing pattern: typed interfaces, event bus integration via `getSitaKernel()`, receipt emission for mutations
- All services are simulation-grade — they model the real kernel subsystems with proper types, state machines, and event emission, runnable in the browser runtime
- The `KernelSubsystem` facade aggregates all kernel modules behind a single entry point, keeping the `SitaKernel` constructor clean
- Docs use the same format as existing `ARQ_PLAN_FINAL.md`
- Manifests match the existing JSON schema patterns in `generated/`

## Total: 20 new files + 1 edit

