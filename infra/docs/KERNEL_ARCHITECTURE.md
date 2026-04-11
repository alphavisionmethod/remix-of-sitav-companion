# SITA OS — Kernel Architecture Specification

## Model Decision: Hybrid Microkernel

SITA OS uses a **hybrid microkernel** — minimal trusted kernel-space core with user-space service modules.

**Kernel-space**: scheduler, VMM, IPC, interrupt dispatch, capability enforcement
**User-space**: drivers, filesystem, networking, crypto services, runtime services

### Justification
- **Fault isolation**: crashed driver cannot panic kernel
- **Hot-swap**: user-space services can be restarted without reboot
- **Trust minimization**: smaller TCB (Trusted Computing Base)
- **Matches SITA runtime pattern**: thin kernel orchestrates isolated services

## Process/Thread Model

### MLFQ Scheduler (5 Priority Bands)

| Band | Priority Range | Quantum | Preemptible | Use Case |
|------|---------------|---------|-------------|----------|
| RT-Critical | 0-15 | 1ms | No | Security monitor, TPM, proof chain |
| RT-Normal | 16-31 | 5ms | By RT-Critical | Executor, approval pipeline |
| Interactive | 32-63 | 10ms | Yes | Desktop, UI, user apps |
| Batch | 64-95 | 50ms | Yes | Sync, indexing, projections |
| Idle | 96-127 | 100ms | Yes | GC, analytics |

- **Anti-starvation**: periodic boost every 1000 ticks
- **Priority inheritance**: prevents priority inversion on IPC
- **IO boost**: interactive processes boosted to top of band on IO completion

### Thread Model
- OS threads for compute-bound work
- Green threads for async I/O
- Per-thread: TID, stack pointer, instruction pointer, CPU affinity

## Memory Management

See `MEMORY_ARCHITECTURE.md` for full specification.

## Filesystem

See `FILESYSTEM_ARCHITECTURE.md` for SitaFS specification.

## Device Drivers

- **Default**: user-space (fault-isolated, capability-sandboxed)
- **Kernel-space exceptions**: interrupt controller (APIC), timer (HPET), MMU
- **Hot-plug**: USB, PCI, NVMe auto-detection via device tree
- **Signing**: all drivers must be signed with MOK or vendor key
- **Fault handling**: user-space drivers restart up to 3x, then disabled

## IPC Mechanisms

1. **Capability-based message passing** (primary): typed messages with capability tokens
2. **Shared memory**: for high-throughput data with explicit grant/revoke
3. **POSIX signals**: SIGTERM, SIGKILL, SIGUSR1/2, etc.
4. **Event channels**: kernel-mediated pub/sub for driver notifications

## System Calls

~126 syscalls across 7 categories. See `generated/syscall-manifest.json`.

**ABI**: x86_64 System V — `syscall` instruction, args in rdi/rsi/rdx/r10/r8/r9, return in rax.
