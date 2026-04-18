// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Syscall Dispatcher (Full Advanced Spec)
// Ring 3→Ring 0→Ring 3 transitions, copy-in/out memory safety,
// jump table O(1) dispatch, rate limiting, input sanitization,
// blocking classification, reentrancy mutex, fuzz guard,
// per-type latency metrics (avg/p95/p99), audit trail
// ═══════════════════════════════════════════════════════════════

import { ProcessTable } from "./process-manager";
import { MemoryManager } from "./memory-manager";
import { NovaBridge, PermissionDeniedError } from "../system/bridge";
import { PrivilegeEnforcement } from "./privilege";

// ── Error Codes (negative errno) ────────────────────────────────

export const ERRNO = {
  OK:          0,
  EPERM:      -1,   // Operation not permitted
  ENOENT:     -2,   // No such file or directory
  ESRCH:      -3,   // No such process
  EINTR:      -4,   // Interrupted
  EIO:        -5,   // I/O error
  ENOMEM:    -12,   // Out of memory
  EACCES:    -13,   // Permission denied
  EFAULT:    -14,   // Bad address (invalid pointer)
  EBUSY:     -16,   // Resource busy (mutex held)
  EINVAL:    -22,   // Invalid argument
  ENOSYS:    -38,   // Function not implemented
  EAGAIN:   -11,    // Try again (rate limited)
} as const;

// ── Syscall Numbers ─────────────────────────────────────────────

export enum Syscall {
  // Window management
  SYS_CREATE_WINDOW   = 0x01,
  SYS_CLOSE_WINDOW    = 0x02,
  SYS_FOCUS_WINDOW    = 0x03,
  SYS_MINIMIZE_WINDOW = 0x04,

  // Filesystem
  SYS_OPEN_FILE       = 0x10,
  SYS_WRITE_FILE      = 0x11,
  SYS_LIST_DIR        = 0x12,
  SYS_DELETE_FILE      = 0x13,

  // System services
  SYS_NOTIFY          = 0x20,
  SYS_GET_THEME       = 0x21,
  SYS_PLAY_SOUND      = 0x22,

  // Clipboard
  SYS_CLIPBOARD_READ  = 0x30,
  SYS_CLIPBOARD_WRITE = 0x31,

  // Process management
  SYS_LAUNCH_APP      = 0x40,
  SYS_KILL_PROCESS    = 0x41,
  SYS_GET_PROCESS     = 0x42,
  SYS_EXIT            = 0x43,
  SYS_SCHED_YIELD     = 0x44,
  SYS_GETPID          = 0x45,
  SYS_GETPPID         = 0x46,

  // Memory management
  SYS_ALLOC_MEMORY    = 0x50,
  SYS_FREE_MEMORY     = 0x51,
  SYS_MMAP            = 0x52,
  SYS_MUNMAP          = 0x53,
  SYS_BRK             = 0x54,
  SYS_MPROTECT        = 0x55,

  // Device I/O
  SYS_IOCTL           = 0x60,
  SYS_READ            = 0x61,
  SYS_WRITE           = 0x62,
}

// ── Valid syscall code set (for fuzz guard) ──────────────────────

const VALID_SYSCALL_CODES = new Set<number>(
  Object.values(Syscall).filter((v): v is number => typeof v === "number")
);

// ── Syscall Context ─────────────────────────────────────────────

export interface SyscallContext {
  pid: number;
  syscallNumber: Syscall;
  entryRing: 0 | 3;
  entryTimestamp: number;
  args: any[];
  pointerArgs: number[];
  ringTransitionMs: number;
}

// ── Audit Log ───────────────────────────────────────────────────

export interface SyscallLogEntry {
  timestamp: number;
  pid: number;
  syscall: Syscall;
  args: any[];
  result: "ok" | "denied" | "error" | "not_found" | "violation" | "rate_limited" | "invalid_args" | "mutex_blocked";
  durationMs: number;
  ringTransition: boolean;
  entryRing: 0 | 3;
}

const MAX_LOG_SIZE = 1000;
const auditLog: SyscallLogEntry[] = [];

function logSyscall(entry: SyscallLogEntry) {
  auditLog.push(entry);
  if (auditLog.length > MAX_LOG_SIZE) auditLog.shift();
}

// ── Syscall name mapping ────────────────────────────────────────

const SYSCALL_NAMES: Record<number, string> = {
  [Syscall.SYS_CREATE_WINDOW]: "CREATE_WINDOW",
  [Syscall.SYS_CLOSE_WINDOW]: "CLOSE_WINDOW",
  [Syscall.SYS_FOCUS_WINDOW]: "FOCUS_WINDOW",
  [Syscall.SYS_MINIMIZE_WINDOW]: "MINIMIZE_WINDOW",
  [Syscall.SYS_OPEN_FILE]: "OPEN_FILE",
  [Syscall.SYS_WRITE_FILE]: "WRITE_FILE",
  [Syscall.SYS_LIST_DIR]: "LIST_DIR",
  [Syscall.SYS_DELETE_FILE]: "DELETE_FILE",
  [Syscall.SYS_NOTIFY]: "NOTIFY",
  [Syscall.SYS_GET_THEME]: "GET_THEME",
  [Syscall.SYS_PLAY_SOUND]: "PLAY_SOUND",
  [Syscall.SYS_CLIPBOARD_READ]: "CLIPBOARD_READ",
  [Syscall.SYS_CLIPBOARD_WRITE]: "CLIPBOARD_WRITE",
  [Syscall.SYS_LAUNCH_APP]: "LAUNCH_APP",
  [Syscall.SYS_KILL_PROCESS]: "KILL_PROCESS",
  [Syscall.SYS_GET_PROCESS]: "GET_PROCESS",
  [Syscall.SYS_EXIT]: "EXIT",
  [Syscall.SYS_SCHED_YIELD]: "SCHED_YIELD",
  [Syscall.SYS_GETPID]: "GETPID",
  [Syscall.SYS_GETPPID]: "GETPPID",
  [Syscall.SYS_ALLOC_MEMORY]: "ALLOC_MEMORY",
  [Syscall.SYS_FREE_MEMORY]: "FREE_MEMORY",
  [Syscall.SYS_MMAP]: "MMAP",
  [Syscall.SYS_MUNMAP]: "MUNMAP",
  [Syscall.SYS_BRK]: "BRK",
  [Syscall.SYS_MPROTECT]: "MPROTECT",
  [Syscall.SYS_IOCTL]: "IOCTL",
  [Syscall.SYS_READ]: "READ",
  [Syscall.SYS_WRITE]: "WRITE",
};

// ── Bridge channel mapping ──────────────────────────────────────

const SYSCALL_TO_BRIDGE: Partial<Record<Syscall, string>> = {
  [Syscall.SYS_OPEN_FILE]: "file:open",
  [Syscall.SYS_WRITE_FILE]: "file:save",
  [Syscall.SYS_LIST_DIR]: "file:list",
  [Syscall.SYS_NOTIFY]: "notification:send",
  [Syscall.SYS_GET_THEME]: "theme:get",
  [Syscall.SYS_PLAY_SOUND]: "sound:play",
  [Syscall.SYS_CLIPBOARD_READ]: "clipboard:read",
  [Syscall.SYS_CLIPBOARD_WRITE]: "clipboard:write",
  [Syscall.SYS_LAUNCH_APP]: "app:launch",
  [Syscall.SYS_CREATE_WINDOW]: "window:create",
  [Syscall.SYS_CLOSE_WINDOW]: "window:close",
};

// ── Syscalls that take pointer arguments (need validation) ──────

const POINTER_ARG_SYSCALLS = new Set<Syscall>([
  Syscall.SYS_WRITE,
  Syscall.SYS_READ,
  Syscall.SYS_WRITE_FILE,
  Syscall.SYS_OPEN_FILE,
  Syscall.SYS_MMAP,
  Syscall.SYS_MUNMAP,
  Syscall.SYS_MPROTECT,
]);

// ═══════════════════════════════════════════════════════════════
// COPY-IN / COPY-OUT — Memory Safety Boundary
// Never operate directly on user memory. All data crosses the
// kernel boundary through validated copy operations.
// ═══════════════════════════════════════════════════════════════

export function copyFromUser(pid: number, userPtr: number, size: number): { ok: boolean; data: ArrayBuffer | null } {
  // Validate pointer before copy
  if (userPtr === 0 || size <= 0) {
    console.warn(`[Kernel:CopyIn] PID ${pid} — null/zero-size copy rejected`);
    return { ok: false, data: null };
  }

  if (!PrivilegeEnforcement.validatePointer(pid, userPtr, "read")) {
    console.warn(`[Kernel:CopyIn] PID ${pid} — invalid user pointer 0x${userPtr.toString(16)}`);
    return { ok: false, data: null };
  }

  // Validate the end of the buffer too
  if (!PrivilegeEnforcement.validatePointer(pid, userPtr + size - 1, "read")) {
    console.warn(`[Kernel:CopyIn] PID ${pid} — buffer end 0x${(userPtr + size - 1).toString(16)} invalid`);
    return { ok: false, data: null };
  }

  // Simulate safe copy into kernel-owned buffer
  const kernelBuffer = new ArrayBuffer(size);
  return { ok: true, data: kernelBuffer };
}

export function copyToUser(pid: number, userPtr: number, kernelData: ArrayBuffer): boolean {
  if (userPtr === 0 || kernelData.byteLength === 0) {
    console.warn(`[Kernel:CopyOut] PID ${pid} — null/empty copy rejected`);
    return false;
  }

  if (!PrivilegeEnforcement.validatePointer(pid, userPtr, "write")) {
    console.warn(`[Kernel:CopyOut] PID ${pid} — invalid user pointer 0x${userPtr.toString(16)}`);
    return false;
  }

  if (!PrivilegeEnforcement.validatePointer(pid, userPtr + kernelData.byteLength - 1, "write")) {
    console.warn(`[Kernel:CopyOut] PID ${pid} — buffer end invalid`);
    return false;
  }

  // Simulated: in a real kernel this would memcpy to user address space
  return true;
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING — Per-PID Syscall Throttle
// Prevents DoS via syscall flooding. Configurable threshold.
// ═══════════════════════════════════════════════════════════════

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_CALLS = 10000;

interface RateCounter {
  count: number;
  windowStart: number;
}

const syscallRateCounters = new Map<number, RateCounter>();

function checkRateLimit(pid: number): boolean {
  const now = performance.now();
  let counter = syscallRateCounters.get(pid);

  if (!counter) {
    counter = { count: 0, windowStart: now };
    syscallRateCounters.set(pid, counter);
  }

  // Reset window if expired
  if (now - counter.windowStart > RATE_LIMIT_WINDOW_MS) {
    counter.count = 0;
    counter.windowStart = now;
  }

  counter.count++;

  if (counter.count > RATE_LIMIT_MAX_CALLS) {
    console.warn(`[Kernel:RateLimit] PID ${pid} exceeded ${RATE_LIMIT_MAX_CALLS} syscalls/sec — throttled`);
    return false;
  }

  return true;
}

export function resetRateLimiter(): void {
  syscallRateCounters.clear();
}

export function getRateLimitStatus(): Array<{ pid: number; count: number; limit: number; windowMs: number }> {
  const now = performance.now();
  const result: Array<{ pid: number; count: number; limit: number; windowMs: number }> = [];
  for (const [pid, counter] of syscallRateCounters) {
    const elapsed = now - counter.windowStart;
    if (elapsed < RATE_LIMIT_WINDOW_MS * 2) {
      result.push({ pid, count: counter.count, limit: RATE_LIMIT_MAX_CALLS, windowMs: Math.round(elapsed) });
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// REENTRANCY MUTEX — Per-Resource Lock Simulation
// Prevents global state corruption from concurrent syscalls.
// ═══════════════════════════════════════════════════════════════

const resourceMutexes = new Map<string, { pid: number; acquiredAt: number }>();
const MUTEX_TIMEOUT_MS = 5000;

export function acquireMutex(resource: string, pid: number): boolean {
  const existing = resourceMutexes.get(resource);
  const now = performance.now();

  if (existing) {
    // Check for stale lock (timeout)
    if (now - existing.acquiredAt > MUTEX_TIMEOUT_MS) {
      console.warn(`[Kernel:Mutex] Stale lock on "${resource}" by PID ${existing.pid} — force releasing`);
      resourceMutexes.delete(resource);
    } else if (existing.pid !== pid) {
      return false; // Locked by another process
    } else {
      return true; // Reentrant — same PID holds the lock
    }
  }

  resourceMutexes.set(resource, { pid, acquiredAt: now });
  return true;
}

export function releaseMutex(resource: string, pid: number): boolean {
  const existing = resourceMutexes.get(resource);
  if (!existing || existing.pid !== pid) return false;
  resourceMutexes.delete(resource);
  return true;
}

export function resetMutexes(): void {
  resourceMutexes.clear();
}

export function getMutexStatus(): Array<{ resource: string; pid: number; heldMs: number }> {
  const now = performance.now();
  return Array.from(resourceMutexes.entries()).map(([resource, m]) => ({
    resource,
    pid: m.pid,
    heldMs: Math.round(now - m.acquiredAt),
  }));
}

// ═══════════════════════════════════════════════════════════════
// BLOCKING CLASSIFICATION
// Fast syscalls must NEVER block. Slow syscalls may block.
// UI-related syscalls are always non-blocking.
// ═══════════════════════════════════════════════════════════════

const FAST_SYSCALLS = new Set<Syscall>([
  Syscall.SYS_GETPID,
  Syscall.SYS_GETPPID,
  Syscall.SYS_GET_THEME,
  Syscall.SYS_SCHED_YIELD,
  Syscall.SYS_CREATE_WINDOW,
  Syscall.SYS_CLOSE_WINDOW,
  Syscall.SYS_FOCUS_WINDOW,
  Syscall.SYS_MINIMIZE_WINDOW,
  Syscall.SYS_PLAY_SOUND,
  Syscall.SYS_NOTIFY,
  Syscall.SYS_ALLOC_MEMORY,
  Syscall.SYS_FREE_MEMORY,
  Syscall.SYS_BRK,
  Syscall.SYS_MPROTECT,
  Syscall.SYS_IOCTL,
  Syscall.SYS_EXIT,
]);

const SLOW_SYSCALLS = new Set<Syscall>([
  Syscall.SYS_OPEN_FILE,
  Syscall.SYS_WRITE_FILE,
  Syscall.SYS_LIST_DIR,
  Syscall.SYS_DELETE_FILE,
  Syscall.SYS_READ,
  Syscall.SYS_WRITE,
  Syscall.SYS_MMAP,
  Syscall.SYS_MUNMAP,
  Syscall.SYS_CLIPBOARD_READ,
  Syscall.SYS_CLIPBOARD_WRITE,
  Syscall.SYS_LAUNCH_APP,
  Syscall.SYS_KILL_PROCESS,
  Syscall.SYS_GET_PROCESS,
]);

export function isBlocking(code: Syscall): boolean {
  return SLOW_SYSCALLS.has(code);
}

export function isFast(code: Syscall): boolean {
  return FAST_SYSCALLS.has(code);
}

// ═══════════════════════════════════════════════════════════════
// INPUT SANITIZATION — Per-Syscall Arg Validation
// Range-checked, type-checked. Rejects malformed input before dispatch.
// ═══════════════════════════════════════════════════════════════

function validateArgs(code: Syscall, pid: number, args: any[]): string | null {
  switch (code) {
    case Syscall.SYS_KILL_PROCESS: {
      if (args.length < 1 || typeof args[0] !== "number" || args[0] < 0) {
        return "SYS_KILL_PROCESS requires valid target PID (number >= 0)";
      }
      break;
    }
    case Syscall.SYS_GET_PROCESS: {
      if (args.length < 1 || typeof args[0] !== "number") {
        return "SYS_GET_PROCESS requires target PID (number)";
      }
      break;
    }
    case Syscall.SYS_MMAP: {
      if (args.length < 2 || typeof args[1] !== "number" || args[1] <= 0) {
        return "SYS_MMAP requires positive size (arg[1])";
      }
      if (args[1] > 1024 * 1024 * 1024) {
        return "SYS_MMAP size exceeds 1GB limit";
      }
      break;
    }
    case Syscall.SYS_BRK: {
      if (args.length < 1 || typeof args[0] !== "number") {
        return "SYS_BRK requires new_brk address (number)";
      }
      break;
    }
    case Syscall.SYS_READ:
    case Syscall.SYS_WRITE: {
      if (args.length < 3) {
        return `${SYSCALL_NAMES[code]} requires (fd, buf_ptr, count)`;
      }
      if (typeof args[0] !== "number" || args[0] < 0) {
        return `${SYSCALL_NAMES[code]} requires valid fd (number >= 0)`;
      }
      if (typeof args[2] !== "number" || args[2] < 0) {
        return `${SYSCALL_NAMES[code]} requires valid count (number >= 0)`;
      }
      break;
    }
    case Syscall.SYS_ALLOC_MEMORY: {
      if (args.length < 1 || typeof args[0] !== "number" || args[0] <= 0) {
        return "SYS_ALLOC_MEMORY requires positive size";
      }
      break;
    }
    case Syscall.SYS_CLIPBOARD_WRITE: {
      if (args.length < 1) {
        return "SYS_CLIPBOARD_WRITE requires data argument";
      }
      break;
    }
    // Window syscalls, GET_THEME, GETPID, etc. have no required args
    default:
      break;
  }
  return null; // valid
}

// ═══════════════════════════════════════════════════════════════
// PER-TYPE LATENCY METRICS — avg, p95, p99
// ═══════════════════════════════════════════════════════════════

const MAX_LATENCY_SAMPLES = 500;
const syscallLatencies = new Map<Syscall, number[]>();

function recordLatency(code: Syscall, durationMs: number): void {
  let arr = syscallLatencies.get(code);
  if (!arr) {
    arr = [];
    syscallLatencies.set(code, arr);
  }
  arr.push(durationMs);
  if (arr.length > MAX_LATENCY_SAMPLES) arr.shift();
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export interface SyscallTypeMetrics {
  syscall: string;
  code: number;
  count: number;
  avgMs: number;
  p95Ms: number;
  p99Ms: number;
  blocking: boolean;
}

export function getSyscallMetrics(): SyscallTypeMetrics[] {
  const result: SyscallTypeMetrics[] = [];

  for (const [code, samples] of syscallLatencies.entries()) {
    if (samples.length === 0) continue;
    const sorted = [...samples].sort((a, b) => a - b);
    const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;

    result.push({
      syscall: SYSCALL_NAMES[code] || `0x${code.toString(16)}`,
      code,
      count: sorted.length,
      avgMs: Math.round(avg * 1000) / 1000,
      p95Ms: Math.round(percentile(sorted, 95) * 1000) / 1000,
      p99Ms: Math.round(percentile(sorted, 99) * 1000) / 1000,
      blocking: SLOW_SYSCALLS.has(code),
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

// ═══════════════════════════════════════════════════════════════
// JUMP TABLE DISPATCH — O(1) Map-Based Handler Table
// Each handler: (pid, args) => result
// ═══════════════════════════════════════════════════════════════

type SyscallHandler = (pid: number, args: any[]) => any;

function handleBridgeSyscall(bridgeChannel: string): SyscallHandler {
  return (_pid: number, args: any[]) => {
    return NovaBridge.send(bridgeChannel as any, args[0]);
  };
}

const SYSCALL_JUMP_TABLE = new Map<Syscall, SyscallHandler>([
  // Bridge-backed syscalls
  [Syscall.SYS_OPEN_FILE, handleBridgeSyscall("file:open")],
  [Syscall.SYS_WRITE_FILE, handleBridgeSyscall("file:save")],
  [Syscall.SYS_LIST_DIR, handleBridgeSyscall("file:list")],
  [Syscall.SYS_NOTIFY, handleBridgeSyscall("notification:send")],
  [Syscall.SYS_GET_THEME, handleBridgeSyscall("theme:get")],
  [Syscall.SYS_PLAY_SOUND, handleBridgeSyscall("sound:play")],
  [Syscall.SYS_CLIPBOARD_READ, handleBridgeSyscall("clipboard:read")],
  [Syscall.SYS_CLIPBOARD_WRITE, handleBridgeSyscall("clipboard:write")],
  [Syscall.SYS_LAUNCH_APP, handleBridgeSyscall("app:launch")],
  [Syscall.SYS_CREATE_WINDOW, handleBridgeSyscall("window:create")],
  [Syscall.SYS_CLOSE_WINDOW, handleBridgeSyscall("window:close")],
  [Syscall.SYS_FOCUS_WINDOW, (_pid, args) => NovaBridge.send("window:focus" as any, args[0])],
  [Syscall.SYS_MINIMIZE_WINDOW, (_pid, args) => NovaBridge.send("window:minimize" as any, args[0])],
  [Syscall.SYS_DELETE_FILE, handleBridgeSyscall("file:delete")],

  // Kernel-internal handlers
  [Syscall.SYS_KILL_PROCESS, (pid, args) => {
    const targetPid = args[0] as number;
    const ok = ProcessTable.kill(targetPid, args[1] ?? 0);
    return ok ? 0 : ERRNO.ESRCH;
  }],

  [Syscall.SYS_GET_PROCESS, (_pid, args) => {
    const target = ProcessTable.getProcess(args[0] as number);
    return target ?? ERRNO.ESRCH;
  }],

  [Syscall.SYS_EXIT, (pid, args) => {
    ProcessTable.kill(pid, args[0] ?? 0);
    return 0;
  }],

  [Syscall.SYS_SCHED_YIELD, (pid) => {
    const p = ProcessTable.getProcess(pid);
    if (p) p.quantumRemaining = 0;
    return 0;
  }],

  [Syscall.SYS_GETPID, (pid) => pid],

  [Syscall.SYS_GETPPID, (pid) => {
    const p = ProcessTable.getProcess(pid);
    return p?.parentPid ?? 0;
  }],

  [Syscall.SYS_MMAP, (pid, args) => {
    const pages = Math.ceil((args[1] as number || 4096) / 4096);
    const region = MemoryManager.allocate(pid, pages, { label: `mmap:${pid}` });
    return region ? region.startPage * 4096 : ERRNO.ENOMEM;
  }],

  [Syscall.SYS_MUNMAP, (pid) => {
    const freed = MemoryManager.free(pid);
    return freed > 0 ? 0 : ERRNO.EINVAL;
  }],

  [Syscall.SYS_BRK, (pid, args) => {
    const p = ProcessTable.getProcess(pid);
    if (p?.addressSpace) {
      const newBrk = args[0] as number;
      if (newBrk > p.addressSpace.heapStart && newBrk < p.addressSpace.userStackBottom) {
        p.addressSpace.heapEnd = newBrk;
        return newBrk;
      }
      return p.addressSpace.heapEnd;
    }
    return ERRNO.ENOMEM;
  }],

  [Syscall.SYS_MPROTECT, () => 0], // Simulated

  [Syscall.SYS_IOCTL, (pid) => {
    console.log(`[Kernel:Syscall] IOCTL from PID ${pid} — kernel-mediated`);
    return 0;
  }],

  [Syscall.SYS_READ, (pid, args) => {
    // Copy-in: validate user buffer before reading into it
    const bufPtr = args[1] as number;
    const count = args[2] as number ?? 0;
    if (bufPtr && count > 0) {
      const copy = copyFromUser(pid, bufPtr, count);
      if (!copy.ok) return ERRNO.EFAULT;
    }
    return count;
  }],

  [Syscall.SYS_WRITE, (pid, args) => {
    // Copy-out: validate user buffer before writing from it
    const bufPtr = args[1] as number;
    const count = args[2] as number ?? 0;
    if (bufPtr && count > 0) {
      const copy = copyFromUser(pid, bufPtr, count);
      if (!copy.ok) return ERRNO.EFAULT;
    }
    return count;
  }],

  [Syscall.SYS_ALLOC_MEMORY, (pid, args) => {
    const pages = Math.ceil((args[0] as number || 4096) / 4096);
    const region = MemoryManager.allocate(pid, pages, { label: `alloc:${pid}` });
    return region ? region.startPage * 4096 : ERRNO.ENOMEM;
  }],

  [Syscall.SYS_FREE_MEMORY, (pid) => {
    const freed = MemoryManager.free(pid);
    return freed > 0 ? 0 : ERRNO.EINVAL;
  }],
]);

// ═══════════════════════════════════════════════════════════════
// MAIN DISPATCHER — Full Advanced Spec
// ═══════════════════════════════════════════════════════════════

export function syscall(code: Syscall, pid: number, ...args: any[]): any {
  const start = performance.now();

  // ── FUZZ GUARD: Validate syscall code is valid enum ──
  if (!VALID_SYSCALL_CODES.has(code)) {
    logSyscall({
      timestamp: Date.now(), pid, syscall: code, args,
      result: "error", durationMs: performance.now() - start,
      ringTransition: false, entryRing: 3,
    });
    return ERRNO.ENOSYS;
  }

  // 1. Validate PID
  const process = ProcessTable.getProcess(pid);
  if (!process) {
    logSyscall({
      timestamp: Date.now(), pid, syscall: code, args,
      result: "not_found", durationMs: performance.now() - start,
      ringTransition: false, entryRing: 3,
    });
    return ERRNO.ESRCH;
  }

  // 2. Check process is alive
  if (process.state === "terminated") {
    logSyscall({
      timestamp: Date.now(), pid, syscall: code, args,
      result: "denied", durationMs: performance.now() - start,
      ringTransition: false, entryRing: process.context.cpl as 0 | 3,
    });
    return ERRNO.ESRCH;
  }

  // 3. RATE LIMITING — reject if PID exceeds threshold
  if (!checkRateLimit(pid)) {
    logSyscall({
      timestamp: Date.now(), pid, syscall: code, args,
      result: "rate_limited", durationMs: performance.now() - start,
      ringTransition: false, entryRing: process.context.cpl as 0 | 3,
    });
    return ERRNO.EAGAIN;
  }

  // 4. INPUT SANITIZATION — validate args before dispatch
  const argError = validateArgs(code, pid, args);
  if (argError) {
    logSyscall({
      timestamp: Date.now(), pid, syscall: code, args,
      result: "invalid_args", durationMs: performance.now() - start,
      ringTransition: false, entryRing: process.context.cpl as 0 | 3,
    });
    return ERRNO.EINVAL;
  }

  const entryRing = process.context.cpl as 0 | 3;
  let didRingTransition = false;

  // 5. RING TRANSITION: Ring 3 → Ring 0 (syscall entry)
  if (entryRing === 3) {
    PrivilegeEnforcement.syscallEntry(pid);
    ProcessTable.recordRingTransition(pid);
    didRingTransition = true;
  }

  // 6. Validate pointer arguments (if Ring 3 caller)
  if (entryRing === 3 && POINTER_ARG_SYSCALLS.has(code)) {
    for (const arg of args) {
      if (typeof arg === "number" && arg > 0x1000) {
        if (!PrivilegeEnforcement.validatePointer(pid, arg, "read")) {
          if (didRingTransition) PrivilegeEnforcement.syscallExit(pid);
          logSyscall({
            timestamp: Date.now(), pid, syscall: code, args,
            result: "violation", durationMs: performance.now() - start,
            ringTransition: didRingTransition, entryRing,
          });
          return ERRNO.EFAULT;
        }
      }
    }
  }

  // 7. REENTRANCY MUTEX for resource-sensitive syscalls
  let mutexResource: string | null = null;
  if (code === Syscall.SYS_WRITE_FILE || code === Syscall.SYS_DELETE_FILE) {
    mutexResource = `fs:${args[0]}`;
    if (!acquireMutex(mutexResource, pid)) {
      if (didRingTransition) PrivilegeEnforcement.syscallExit(pid);
      logSyscall({
        timestamp: Date.now(), pid, syscall: code, args,
        result: "mutex_blocked", durationMs: performance.now() - start,
        ringTransition: didRingTransition, entryRing,
      });
      return ERRNO.EBUSY;
    }
  }

  let result: any;
  let status: SyscallLogEntry["result"] = "ok";

  try {
    // 8. JUMP TABLE DISPATCH — O(1)
    const handler = SYSCALL_JUMP_TABLE.get(code);
    if (handler) {
      try {
        result = handler(pid, args);
        ProcessTable.addTicks(pid, 1);
      } catch (e) {
        if (e instanceof PermissionDeniedError) {
          status = "denied";
          result = ERRNO.EACCES;
        } else {
          throw e;
        }
      }
    } else {
      // Unknown syscall — no handler in jump table
      status = "error";
      result = ERRNO.ENOSYS;
    }
  } catch (e) {
    // FUZZ GUARD: catch any unexpected error gracefully
    status = "error";
    result = ERRNO.EINVAL;
    console.error(`[Kernel:Syscall] Unexpected error in ${SYSCALL_NAMES[code] || code}:`, e);
  }

  // 9. Release mutex if acquired
  if (mutexResource) {
    releaseMutex(mutexResource, pid);
  }

  // 10. Set return value in RAX (registers[0])
  const postProcess = ProcessTable.getProcess(pid);
  if (postProcess && postProcess.state !== "terminated") {
    postProcess.context.registers[0] = typeof result === "number" ? result : (result ? 0 : -1);
  }

  // 11. RING TRANSITION: Ring 0 → Ring 3 (syscall exit)
  if (didRingTransition && postProcess && postProcess.state !== "terminated") {
    PrivilegeEnforcement.syscallExit(pid);
    ProcessTable.recordRingTransition(pid);
  }

  // 12. Audit log + per-type latency tracking
  const durationMs = performance.now() - start;
  recordLatency(code, durationMs);

  logSyscall({
    timestamp: Date.now(),
    pid,
    syscall: code,
    args,
    result: status,
    durationMs,
    ringTransition: didRingTransition,
    entryRing,
  });

  return result;
}

// ── Diagnostics ─────────────────────────────────────────────────

export function getSyscallLog(): readonly SyscallLogEntry[] {
  return auditLog;
}

export function getSyscallStats() {
  const total = auditLog.length;
  const denied = auditLog.filter(e => e.result === "denied").length;
  const errors = auditLog.filter(e => e.result === "error").length;
  const violations = auditLog.filter(e => e.result === "violation").length;
  const rateLimited = auditLog.filter(e => e.result === "rate_limited").length;
  const invalidArgs = auditLog.filter(e => e.result === "invalid_args").length;
  const mutexBlocked = auditLog.filter(e => e.result === "mutex_blocked").length;
  const ringTransitions = auditLog.filter(e => e.ringTransition).length;
  const avgMs = total > 0 ? auditLog.reduce((s, e) => s + e.durationMs, 0) / total : 0;
  return {
    total,
    denied,
    errors,
    violations,
    rateLimited,
    invalidArgs,
    mutexBlocked,
    ringTransitions,
    avgMs: Math.round(avgMs * 100) / 100,
    perTypeMetrics: getSyscallMetrics(),
  };
}

export function clearSyscallLog(): void {
  auditLog.length = 0;
  syscallLatencies.clear();
  syscallRateCounters.clear();
  resourceMutexes.clear();
}
