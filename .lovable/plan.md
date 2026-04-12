

# Kernel Subsystem Implementation Plan

## Current State

The Nova SDK has a solid **userspace** layer — manifest validation, registry, lifecycle state machine, permission-gated bridge/FS/notifications, UI components, and layout system. However, the **kernel layer** described in the spec is completely missing:

| Spec Requirement | Status |
|---|---|
| Process Manager (PID, memory isolation, process table) | MISSING — no `kernel/` directory exists |
| Memory Manager (per-app allocation, isolation) | MISSING |
| Syscall Interface (typed enum, central dispatcher) | MISSING — Bridge exists but no formal syscall layer |
| Compositor (surface tracking, z-order, hit-testing) | MISSING — DOM handles rendering directly |
| Scheduler (MLFQ time-slicing, priority bands) | MISSING |
| Lifecycle wired to close/focus/blur | MISSING — only launch fires transitions |
| Input routing: Mouse → Kernel → Window → App | MISSING — DOM handles events directly |
| Kernel boot loop (init → load → schedule → render) | MISSING |

Launch flow currently: `User clicks → ShellLayout.doLaunchApp → openWindow + lifecycle("launching"→"running")`. Close/focus/blur do NOT fire lifecycle transitions.

## Plan: Build 5 Kernel Modules + Wire Everything

### 1. Process Manager (`src/lib/nova-sdk/kernel/process-manager.ts`)
- `ProcessTable` singleton with `spawn(manifest)` returning a `Process` struct: `{ pid, appId, state, memoryBudget, memoryUsed, cpuTicks, priority, windowIds[], createdAt }`
- Auto-incrementing PID counter
- `kill(pid)`, `suspend(pid)`, `resume(pid)`, `getProcess(pid)`, `listProcesses()`
- Memory budget enforcement (configurable per-app, default 64MB)
- Links to AppRegistry state transitions

### 2. Memory Manager (`src/lib/nova-sdk/kernel/memory-manager.ts`)
- Simulated page-based allocation: `allocate(pid, pages)`, `free(pid, pages)`, `getUsage(pid)`
- 4KB page size matching kernel-architecture-manifest.json
- Per-process memory accounting with budget limits
- Guard page simulation (detect buffer overruns)
- Global stats: total allocated, free, fragmentation ratio

### 3. Syscall Dispatcher (`src/lib/nova-sdk/kernel/syscall.ts`)
- Typed enum: `SYS_CREATE_WINDOW`, `SYS_CLOSE_WINDOW`, `SYS_OPEN_FILE`, `SYS_WRITE_FILE`, `SYS_LIST_DIR`, `SYS_NOTIFY`, `SYS_GET_THEME`, `SYS_LAUNCH_APP`, `SYS_CLIPBOARD_READ`, `SYS_CLIPBOARD_WRITE`, `SYS_PLAY_SOUND`
- Central `syscall(code, pid, ...args)` dispatcher that:
  - Validates PID exists and is running
  - Checks permissions via manifest
  - Routes to Bridge/FS/WindowAPI/Notify
  - Returns result or throws `PermissionDeniedError`
  - Logs every call for audit trail
- Syscall audit log (last 1000 calls) for diagnostics

### 4. Compositor (`src/lib/nova-sdk/kernel/compositor.ts`)
- `CompositorSurface` per window: `{ windowId, pid, zIndex, bounds, visible, opacity }`
- `registerSurface()`, `removeSurface()`, `reorder()`, `findSurfaceAt(x, y)` for hit-testing
- Tracks dirty regions (which windows need repaint)
- Provides `getRenderOrder()` for DesktopSurface to consume
- Integrates with z-index management from useWindowManager

### 5. Scheduler (`src/lib/nova-sdk/kernel/scheduler.ts`)
- MLFQ with 5 priority bands from `kernel-architecture-manifest.json`: RT-Critical, RT-Normal, Interactive, Batch, Idle
- Each process assigned a band based on app type (foreground=Interactive, background=Batch, system=RT-Normal)
- `tick()` method simulates time-slice allocation
- Priority boost every 1000 ticks (anti-starvation)
- Priority inheritance on IPC calls
- Exposes `getSchedulerStats()` for diagnostics

### 6. Kernel Boot Sequence (`src/lib/nova-sdk/kernel/boot.ts`)
- `NovaKernel.boot()` initializes all subsystems in order: Memory → Process → Scheduler → Compositor → Syscall
- Logs boot sequence with timestamps
- Called from `NovaSDKContext.tsx` on provider mount
- `NovaKernel.shutdown()` for cleanup

### 7. Wire Lifecycle into DesktopSurface
- `onClose` → `lifecycleManager.transition(id, "terminated")` + `ProcessTable.kill(pid)`
- `onFocus` → `lifecycleManager.transition(id, "focused")` + Scheduler boost
- Blur (when another window focuses) → `lifecycleManager.transition(id, "blurred")`

### 8. Wire Launch Flow Through Kernel
Refactor `ShellLayout.doLaunchApp`:
```
User clicks → AppLoader.load(bundle) → ProcessTable.spawn(manifest) →
  syscall(SYS_CREATE_WINDOW, pid, opts) → Compositor.registerSurface() →
  lifecycleManager.transition("launching"→"running")
```

## Files to Create
```text
src/lib/nova-sdk/kernel/
  process-manager.ts    — Process table, PID, memory budget
  memory-manager.ts     — Page-based allocation simulation
  syscall.ts            — Typed syscall enum + dispatcher
  compositor.ts         — Window surface tracking + hit-test
  scheduler.ts          — MLFQ scheduler with 5 priority bands
  boot.ts               — Kernel boot sequence orchestrator
```

## Files to Modify
- `src/components/sita/shell/DesktopSurface.tsx` — wire close/focus/blur to lifecycle + kernel
- `src/components/sita/ShellLayout.tsx` — route launch through ProcessTable + syscall
- `src/contexts/NovaSDKContext.tsx` — call `NovaKernel.boot()` on mount
- `src/lib/nova-sdk/index.ts` — export kernel modules

## Implementation Order
1. Process Manager + Memory Manager (foundational)
2. Syscall dispatcher (routes everything)
3. Compositor + Scheduler (runtime simulation)
4. Boot sequence (ties it all together)
5. Wire lifecycle into DesktopSurface close/focus/blur
6. Refactor launch flow through kernel pipeline
7. Update barrel exports

