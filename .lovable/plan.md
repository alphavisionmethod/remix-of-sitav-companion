

# Advanced Multitasking Scheduler — Implementation Plan

## What Exists Today

The current scheduler (`scheduler.ts`) and process manager (`process-manager.ts`) have basic MLFQ structure but are **missing the core mechanics of real multitasking**:

| Spec Item | Status |
|---|---|
| CPU context (registers, RIP, RSP) per process | MISSING |
| Context switching (save/restore state) | MISSING |
| Ready queue data structure | MISSING — just filters the process list each tick |
| Timer-driven preemption with proper quantum tracking | PARTIAL — ticks run but no quantum expiry tracking |
| Blocked/waiting queue with wakeup | MISSING — state exists but no block/wake mechanism |
| Round-robin within bands | PARTIAL — sorts by ticks, not true queue rotation |
| Per-process address space abstraction | MISSING |
| Scheduler event log (context switches, blocks, wakes) | MISSING |

## Plan

### 1. Enhance Process struct with CPU context and address space

Add to `process-manager.ts`:
- `CPUContext` struct: `{ rip, rsp, registers[16], flags }` — simulated saved register state
- `AddressSpace` reference: `{ pid, pageTableRoot, regions[] }` linking to MemoryManager
- `quantum_remaining` field — tracks how much of current quantum is left
- `waitReason` field — why a process is blocked (IO, sleep, IPC, mutex)
- `wakeAt` field — for timed sleep/block
- `block(pid, reason)` and `wake(pid)` methods on ProcessTable

### 2. Rewrite Scheduler with proper ready queues and context switching

Rewrite `scheduler.ts`:
- **Per-band ready queues**: `Map<PriorityBand, Process[]>` — actual FIFO queues per band
- **Context switch simulation**: `switchTo(next)` saves current process context, loads next, logs the switch, emits event
- **Quantum tracking**: each `tick()` decrements `quantum_remaining`; when exhausted, preempt and re-queue
- **Timer interrupt simulation**: `timerInterrupt()` fires every tick, checks quantum expiry, triggers `schedule()` + `switchTo()`
- **Blocking**: `blockProcess(pid, reason)` moves from running → blocked queue; `wakeProcess(pid)` moves back to ready queue
- **Sleep support**: `sleepProcess(pid, ms)` sets `wakeAt`, checked each tick
- **Round-robin within bands**: processes rotate through FIFO order within same band
- **Scheduler event log**: last 200 events (context-switch, block, wake, preempt, boost) for diagnostics
- **`currentProcess` pointer**: tracks which process is "on CPU" right now

### 3. Add address space abstraction to Memory Manager

Add to `memory-manager.ts`:
- `AddressSpace` struct: `{ pid, pageTableRoot: number, mappings: VirtualMapping[] }`
- `createAddressSpace(pid)` — creates isolated virtual address space
- `switchAddressSpace(pid)` — simulated page table switch (logs it)
- `destroyAddressSpace(pid)` — cleanup on process termination

### 4. Enhance boot sequence

Update `boot.ts`:
- Boot logs now include scheduler queue initialization
- Scheduler starts with configurable quantum tick interval
- Log context switch count after boot

### 5. Update Kernel Dashboard with new scheduler detail

Update `KernelDashboard.tsx`:
- Show **current process on CPU** with live context (simulated RIP/RSP)
- Show **ready queue depths** per band
- Show **blocked queue** with wait reasons
- Show **context switch counter** and **last 10 scheduler events** (preempt, wake, block)
- Add a "Scheduler Timeline" mini-visualization showing recent context switches

## Files to Modify

- `src/lib/nova-sdk/kernel/process-manager.ts` — CPUContext, AddressSpace, block/wake, quantum
- `src/lib/nova-sdk/kernel/scheduler.ts` — full rewrite with ready queues, context switching, event log
- `src/lib/nova-sdk/kernel/memory-manager.ts` — AddressSpace abstraction
- `src/lib/nova-sdk/kernel/boot.ts` — enhanced init
- `src/pages/admin/KernelDashboard.tsx` — new scheduler detail panel

## Implementation Order
1. Process Manager enhancements (CPUContext, block/wake)
2. Memory Manager address space
3. Scheduler rewrite (queues, context switch, preemption, events)
4. Boot sequence update
5. Dashboard scheduler detail panel

