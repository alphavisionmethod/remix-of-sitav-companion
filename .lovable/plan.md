

# Syscall System — Full Advanced Spec Compliance

## Audit Summary

The existing `syscall.ts` + `privilege.ts` already cover ~70% of the spec: ring transitions, pointer validation, O(1) dispatch, audit logging, error codes, and hardware access control. Here are the gaps:

| # | Spec Requirement | Status | Fix |
|---|---|---|---|
| 1 | Copy-in / Copy-out memory safety | Missing | Add `copyFromUser()` / `copyToUser()` functions that validate + copy |
| 2 | Rate limiting per process | Missing | Add per-PID syscall counter with configurable threshold |
| 3 | Reentrancy protection | Missing | Add per-resource mutex simulation for concurrent syscall safety |
| 4 | Blocking vs non-blocking classification | Missing | Tag each syscall as fast/slow; enforce non-blocking for UI syscalls |
| 5 | Input sanitization (range/type checks) | Partial | Add explicit arg validation per syscall before dispatch |
| 6 | Performance metrics per syscall type | Partial (only avg) | Add per-syscall-type latency tracking + p95/p99 |
| 7 | Fuzz resistance | Implicit | Add explicit guard: any unexpected arg type returns error gracefully |
| 8 | Syscall tests | Missing | Create `syscall.test.ts` covering safety, security, and stress |
| 9 | Jump table dispatch | Using switch | Convert to Map-based O(1) handler table (true jump table pattern) |

## Implementation Plan

### 1. Enhance `syscall.ts` — Core hardening

**Copy-in / Copy-out**:
- Add `copyFromUser(pid, userPtr, size)` and `copyToUser(pid, userPtr, kernelData)` that call `PrivilegeEnforcement.validatePointer()` then simulate safe copy
- Use these in SYS_READ, SYS_WRITE, SYS_WRITE_FILE, SYS_OPEN_FILE handlers

**Rate Limiting**:
- Add `syscallCounters: Map<number, { count: number, windowStart: number }>` 
- Check at dispatch entry: if PID exceeds 10000 syscalls/second, return `-EAGAIN` and log

**Blocking Classification**:
- Add `BLOCKING_SYSCALLS` and `NON_BLOCKING_SYSCALLS` sets
- Fast (must not block): SYS_GETPID, SYS_GETPPID, SYS_GET_THEME, SYS_SCHED_YIELD, window ops
- Slow (can block): SYS_OPEN_FILE, SYS_READ, SYS_WRITE_FILE
- Add `isBlocking(code)` utility export

**Input Sanitization**:
- Add `validateArgs(code, args)` that checks arg count, types, and ranges per syscall
- e.g., SYS_MMAP: args[1] must be positive number, SYS_KILL_PROCESS: args[0] must be valid PID

**Jump Table Dispatch**:
- Replace switch/case with `Map<Syscall, SyscallHandler>` for true O(1) dispatch
- Each handler: `(pid: number, args: any[]) => SyscallResult`

**Per-type Metrics**:
- Track latency array per syscall type
- Add `getSyscallMetrics()` returning per-type count, avgMs, p95Ms, p99Ms

**Fuzz Guard**:
- Wrap entire dispatch in try/catch that returns `-EINVAL` on any unexpected error
- Validate syscall code is a valid enum member before dispatch

### 2. Create `syscall.test.ts` — Comprehensive test suite

- **Safety tests**: invalid pointers, null pointers, buffer overflow attempts
- **Security tests**: permission bypass, Ring 3 kernel pointer access, rate limit enforcement
- **Performance tests**: measure dispatch latency, verify < 5ms simulated
- **Stress tests**: rapid sequential syscalls, invalid IDs, random args (fuzz)
- **Concurrency tests**: mutex acquisition during concurrent syscalls

### 3. Update `boot.ts` — Initialize rate limiter on boot

- Clear syscall rate counters during kernel init

## Files

| File | Action |
|------|--------|
| `src/lib/nova-sdk/kernel/syscall.ts` | Major expansion: copy-in/out, rate limiting, jump table, sanitization, metrics, fuzz guard |
| `src/lib/nova-sdk/kernel/__tests__/syscall.test.ts` | Create: full test suite |
| `src/lib/nova-sdk/kernel/boot.ts` | Minor: init rate limiter |

