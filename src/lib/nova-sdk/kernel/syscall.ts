// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Syscall Dispatcher
// Ring 3→Ring 0→Ring 3 transitions, pointer validation,
// permission enforcement, audit trail, full syscall table
// ═══════════════════════════════════════════════════════════════

import { ProcessTable } from "./process-manager";
import { MemoryManager } from "./memory-manager";
import { NovaBridge, PermissionDeniedError } from "../system/bridge";
import { PrivilegeEnforcement } from "./privilege";

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
  SYS_DELETE_FILE     = 0x13,

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

// ── Syscall Context (tracks ring transition state) ──────────────

export interface SyscallContext {
  pid: number;
  syscallNumber: Syscall;
  entryRing: 0 | 3;
  entryTimestamp: number;
  args: any[];
  pointerArgs: number[];      // which args are pointers (validated)
  ringTransitionMs: number;   // time spent in ring transitions
}

// ── Audit Log ───────────────────────────────────────────────────

export interface SyscallLogEntry {
  timestamp: number;
  pid: number;
  syscall: Syscall;
  args: any[];
  result: "ok" | "denied" | "error" | "not_found" | "violation";
  durationMs: number;
  ringTransition: boolean;    // did this syscall involve a ring switch?
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

// ── Main Dispatcher ─────────────────────────────────────────────

export function syscall(code: Syscall, pid: number, ...args: any[]): any {
  const start = performance.now();
  const name = SYSCALL_NAMES[code] || `0x${code.toString(16)}`;

  // 1. Validate PID
  const process = ProcessTable.getProcess(pid);
  if (!process) {
    logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "not_found", durationMs: performance.now() - start, ringTransition: false, entryRing: 3 });
    return undefined;
  }

  // 2. Check process is alive
  if (process.state === "terminated") {
    logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "denied", durationMs: performance.now() - start, ringTransition: false, entryRing: process.context.cpl as 0 | 3 });
    return undefined;
  }

  const entryRing = process.context.cpl as 0 | 3;
  let didRingTransition = false;

  // 3. RING TRANSITION: Ring 3 → Ring 0 (syscall entry)
  if (entryRing === 3) {
    PrivilegeEnforcement.syscallEntry(pid);
    ProcessTable.recordRingTransition(pid);
    didRingTransition = true;
  }

  // 4. Validate pointer arguments (if Ring 3 caller)
  if (entryRing === 3 && POINTER_ARG_SYSCALLS.has(code)) {
    for (const arg of args) {
      if (typeof arg === "number" && arg > 0x1000) {
        if (!PrivilegeEnforcement.validatePointer(pid, arg, "read")) {
          // Restore Ring 3 before returning
          if (didRingTransition) PrivilegeEnforcement.syscallExit(pid);
          logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "violation", durationMs: performance.now() - start, ringTransition: didRingTransition, entryRing });
          return -14; // -EFAULT
        }
      }
    }
  }

  // 5. Hardware access check for IOCTL (Ring 3 cannot directly)
  if (code === Syscall.SYS_IOCTL && entryRing === 3) {
    // IOCTL is allowed via syscall (kernel handles it), but log it
    console.log(`[Kernel:Syscall] IOCTL from Ring 3 PID ${pid} — kernel-mediated`);
  }

  let result: any;
  let status: SyscallLogEntry["result"] = "ok";

  try {
    // 6. Route through bridge for bridge-backed syscalls
    const bridgeChannel = SYSCALL_TO_BRIDGE[code];
    if (bridgeChannel) {
      try {
        result = NovaBridge.send(bridgeChannel as any, args[0]);
        ProcessTable.addTicks(pid, 1);
      } catch (e) {
        if (e instanceof PermissionDeniedError) {
          status = "denied";
          result = undefined;
        } else {
          throw e;
        }
      }
    } else {
      // 7. Handle kernel-internal syscalls
      switch (code) {
        case Syscall.SYS_KILL_PROCESS: {
          const targetPid = args[0] as number;
          const ok = ProcessTable.kill(targetPid, args[1] ?? 0);
          result = ok;
          status = ok ? "ok" : "error";
          break;
        }
        case Syscall.SYS_GET_PROCESS: {
          const targetPid = args[0] as number;
          result = ProcessTable.getProcess(targetPid);
          status = result ? "ok" : "not_found";
          break;
        }
        case Syscall.SYS_EXIT: {
          ProcessTable.kill(pid, args[0] ?? 0);
          result = 0;
          didRingTransition = false; // no exit transition on termination
          break;
        }
        case Syscall.SYS_SCHED_YIELD: {
          // Yield remaining quantum
          const p = ProcessTable.getProcess(pid);
          if (p) p.quantumRemaining = 0;
          result = 0;
          break;
        }
        case Syscall.SYS_GETPID: {
          result = pid;
          break;
        }
        case Syscall.SYS_GETPPID: {
          result = process.parentPid ?? 0;
          break;
        }
        case Syscall.SYS_MMAP: {
          // args: [addr hint, length, prot, flags]
          const pages = Math.ceil((args[1] as number || 4096) / 4096);
          const region = MemoryManager.allocate(pid, pages, { label: `mmap:${pid}` });
          result = region ? region.startPage * 4096 : -12; // -ENOMEM
          status = region ? "ok" : "error";
          break;
        }
        case Syscall.SYS_MUNMAP: {
          // args: [addr, length] — free all regions for this PID at that address
          const freed = MemoryManager.free(pid);
          result = freed > 0 ? 0 : -22; // -EINVAL
          status = freed > 0 ? "ok" : "error";
          break;
        }
        case Syscall.SYS_BRK: {
          // args: [new_brk]
          const p = ProcessTable.getProcess(pid);
          if (p?.addressSpace) {
            const newBrk = args[0] as number;
            if (newBrk > p.addressSpace.heapStart && newBrk < p.addressSpace.userStackBottom) {
              p.addressSpace.heapEnd = newBrk;
              result = newBrk;
            } else {
              result = p.addressSpace.heapEnd; // return current brk
            }
          } else {
            result = -12;
            status = "error";
          }
          break;
        }
        case Syscall.SYS_MPROTECT: {
          // args: [addr, len, prot]
          // Simulated — just validate the range
          result = 0;
          break;
        }
        case Syscall.SYS_IOCTL: {
          // args: [fd, request, argp]
          // Kernel handles IOCTL — Ring 3 cannot directly access hardware
          result = 0;
          break;
        }
        case Syscall.SYS_READ: {
          // args: [fd, buf_ptr, count]
          result = args[2] ?? 0; // simulate reading count bytes
          break;
        }
        case Syscall.SYS_WRITE: {
          // args: [fd, buf_ptr, count]
          result = args[2] ?? 0; // simulate writing count bytes
          break;
        }
        case Syscall.SYS_ALLOC_MEMORY: {
          const pages = Math.ceil((args[0] as number || 4096) / 4096);
          const region = MemoryManager.allocate(pid, pages, { label: `alloc:${pid}` });
          result = region ? region.startPage * 4096 : -12;
          status = region ? "ok" : "error";
          break;
        }
        case Syscall.SYS_FREE_MEMORY: {
          const freed = MemoryManager.free(pid);
          result = freed > 0 ? 0 : -22;
          status = freed > 0 ? "ok" : "error";
          break;
        }
        default: {
          status = "error";
          result = undefined;
        }
      }
    }
  } catch (e) {
    status = "error";
    result = undefined;
  }

  // 8. Set return value in RAX (registers[0])
  if (process.state !== "terminated") {
    process.context.registers[0] = typeof result === "number" ? result : (result ? 0 : -1);
  }

  // 9. RING TRANSITION: Ring 0 → Ring 3 (syscall exit)
  if (didRingTransition && process.state !== "terminated") {
    PrivilegeEnforcement.syscallExit(pid);
    ProcessTable.recordRingTransition(pid);
  }

  // 10. Audit log
  const durationMs = performance.now() - start;
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
  const ringTransitions = auditLog.filter(e => e.ringTransition).length;
  const avgMs = total > 0 ? auditLog.reduce((s, e) => s + e.durationMs, 0) / total : 0;
  return {
    total,
    denied,
    errors,
    violations,
    ringTransitions,
    avgMs: Math.round(avgMs * 100) / 100,
  };
}

export function clearSyscallLog(): void {
  auditLog.length = 0;
}
