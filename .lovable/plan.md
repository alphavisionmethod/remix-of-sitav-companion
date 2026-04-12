

# CPU Privilege Rings + Syscall Security Model — Implementation Plan

## What Exists Today

| Component | Status |
|---|---|
| Trust ring enum (0-4) in `sandbox-engine.ts` | EXISTS — but only for sandbox policy, not wired into process lifecycle |
| Syscall dispatcher in `syscall.ts` | EXISTS — validates PID and routes through bridge, but NO privilege level checks |
| Process struct in `process-manager.ts` | EXISTS — has CPUContext but NO ring/privilege level field |
| Memory Manager address spaces | EXISTS — CR3 switching works, but no ring-based access control |
| Boot sequence | EXISTS — boots subsystems but no privilege transition simulation |

**What's missing**: The entire CPU privilege model (Ring 0/3 transitions), syscall-as-ring-transition, pointer validation, permission enforcement per ring, and the enter-user-mode / return-to-kernel-mode flow.

## Plan

### 1. Add Privilege Ring to Process Model (`process-manager.ts`)

- Add `privilegeLevel: 0 | 3` field to `Process` interface (Ring 0 = kernel, Ring 3 = user)
- Add `currentPrivilegeLevel` (CPL) to `CPUContext` — simulates the CS register's RPL bits
- Add `kernelStack` and `userStack` to `AddressSpaceRef` — processes need separate stacks per ring
- On `spawn()`: kernel processes start at Ring 0, app processes start at Ring 3
- Add `enterUserMode(pid)` method that sets CPL=3, switches to user stack, sets RIP to entry point
- Add `enterKernelMode(pid)` method that saves user context, sets CPL=0, switches to kernel stack

### 2. Create Privilege Enforcement Module (`kernel/privilege.ts`)

New file implementing the CPU privilege ring simulation:

- `PrivilegeLevel` type: `0 | 1 | 2 | 3` (only 0 and 3 used actively)
- `validatePointer(pid, ptr, accessType)` — checks pointer is within process's address space, rejects kernel-space pointers from Ring 3
- `checkHardwareAccess(pid)` — only Ring 0 processes can touch hardware (port I/O, MMIO)
- `checkMemoryAccess(pid, region)` — validates NX bit, write permissions per ring
- `enterUserMode(pid, entry, userStack)` — simulates `sysret`/`iretq`: saves kernel state, loads user registers, sets CPL=3
- `returnToKernel(pid)` — simulates `syscall` instruction: saves user registers, loads kernel stack, sets CPL=0
- `PrivilegeViolation` event type for audit logging
- Integration with `SandboxEngine.TrustRing` — maps Trust Rings to privilege levels (Ring 0→CPL 0, Rings 1-4→CPL 3)

### 3. Enhance Syscall Dispatcher (`syscall.ts`)

Rewrite the dispatcher to simulate real Ring 3→Ring 0→Ring 3 transitions:

- On syscall entry: call `returnToKernel(pid)` — save user context, switch to kernel stack, CPL=0
- Validate all pointer arguments with `validatePointer()` — reject invalid/kernel-space pointers from user processes
- Check syscall permission against process's Trust Ring (wire in `SandboxEngine.checkSyscall()`)
- After handling: call `enterUserMode(pid)` — restore user context, CPL=3
- Add `SYS_MMAP`, `SYS_MUNMAP`, `SYS_BRK`, `SYS_IOCTL`, `SYS_SCHED_YIELD` syscalls
- Track syscall latency per ring transition (entry→handler→exit timing)
- Add `SyscallContext` struct tracking the ring transition state

### 4. Wire into Process Lifecycle (`boot.ts` + `scheduler.ts`)

- Boot sequence: kernel process (PID 0) stays Ring 0, all spawned app processes enter Ring 3 via `enterUserMode()`
- Scheduler `switchTo()`: on context switch, also switch privilege level (save/restore CPL)
- Scheduler handles quantum interrupt: simulated hardware interrupt forces Ring 3→Ring 0 transition
- Process spawn flow becomes: `spawn() → createAddressSpace() → allocateStacks() → setReady() → schedule() → enterUserMode()`

### 5. Update Kernel Dashboard (`KernelDashboard.tsx`)

- Add privilege level indicator to process listings (Ring 0 badge / Ring 3 badge)
- Show ring transition count per process in scheduler drill-down
- Show pointer validation failures in security panel
- Add "Privilege Transitions" counter to top-line stats
- Scheduler event log shows ring transitions alongside context switches

### 6. Export new modules (`index.ts`)

- Export `PrivilegeLevel`, `validatePointer`, `enterUserMode`, `returnToKernel` from barrel

## Files to Create/Modify

| File | Action |
|---|---|
| `src/lib/nova-sdk/kernel/privilege.ts` | **CREATE** — privilege ring enforcement, pointer validation, mode switching |
| `src/lib/nova-sdk/kernel/process-manager.ts` | **MODIFY** — add CPL to CPUContext, dual stacks, privilege fields |
| `src/lib/nova-sdk/kernel/syscall.ts` | **MODIFY** — ring transitions on entry/exit, pointer validation, new syscalls |
| `src/lib/nova-sdk/kernel/scheduler.ts` | **MODIFY** — privilege-aware context switching |
| `src/lib/nova-sdk/kernel/boot.ts` | **MODIFY** — kernel process at Ring 0, privilege subsystem init |
| `src/pages/admin/KernelDashboard.tsx` | **MODIFY** — privilege indicators and transition metrics |
| `src/lib/nova-sdk/index.ts` | **MODIFY** — export new privilege module |

## Implementation Order

1. `privilege.ts` (core enforcement module)
2. `process-manager.ts` (CPL + dual stacks)
3. `syscall.ts` (ring transitions + validation)
4. `scheduler.ts` (privilege-aware switching)
5. `boot.ts` (init privilege subsystem)
6. `KernelDashboard.tsx` (visualize)
7. `index.ts` (exports)

