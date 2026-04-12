// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Syscall Dispatcher
// Typed syscall enum + central dispatcher with audit trail
// ═══════════════════════════════════════════════════════════════

import { ProcessTable } from "./process-manager";
import { NovaBridge, PermissionDeniedError } from "../system/bridge";

// ── Syscall Numbers ─────────────────────────────────────────────

export enum Syscall {
  SYS_CREATE_WINDOW   = 0x01,
  SYS_CLOSE_WINDOW    = 0x02,
  SYS_FOCUS_WINDOW    = 0x03,
  SYS_MINIMIZE_WINDOW = 0x04,

  SYS_OPEN_FILE       = 0x10,
  SYS_WRITE_FILE      = 0x11,
  SYS_LIST_DIR        = 0x12,
  SYS_DELETE_FILE     = 0x13,

  SYS_NOTIFY          = 0x20,
  SYS_GET_THEME       = 0x21,
  SYS_PLAY_SOUND      = 0x22,

  SYS_CLIPBOARD_READ  = 0x30,
  SYS_CLIPBOARD_WRITE = 0x31,

  SYS_LAUNCH_APP      = 0x40,
  SYS_KILL_PROCESS    = 0x41,
  SYS_GET_PROCESS     = 0x42,

  SYS_ALLOC_MEMORY    = 0x50,
  SYS_FREE_MEMORY     = 0x51,
}

// ── Audit Log ───────────────────────────────────────────────────

export interface SyscallLogEntry {
  timestamp: number;
  pid: number;
  syscall: Syscall;
  args: any[];
  result: "ok" | "denied" | "error" | "not_found";
  durationMs: number;
}

const MAX_LOG_SIZE = 1000;
const auditLog: SyscallLogEntry[] = [];

function logSyscall(entry: SyscallLogEntry) {
  auditLog.push(entry);
  if (auditLog.length > MAX_LOG_SIZE) auditLog.shift();
}

// ── Syscall name mapping for diagnostics ────────────────────────

const SYSCALL_NAMES: Record<Syscall, string> = {
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
  [Syscall.SYS_ALLOC_MEMORY]: "ALLOC_MEMORY",
  [Syscall.SYS_FREE_MEMORY]: "FREE_MEMORY",
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

// ── Main Dispatcher ─────────────────────────────────────────────

export function syscall(code: Syscall, pid: number, ...args: any[]): any {
  const start = performance.now();
  const name = SYSCALL_NAMES[code] || `0x${code.toString(16)}`;

  // 1. Validate PID
  const process = ProcessTable.getProcess(pid);
  if (!process) {
    logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "not_found", durationMs: performance.now() - start });
    console.warn(`[Kernel:Syscall] ${name} — PID ${pid} not found`);
    return undefined;
  }

  // 2. Check process is alive
  if (process.state === "terminated") {
    logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "denied", durationMs: performance.now() - start });
    console.warn(`[Kernel:Syscall] ${name} — PID ${pid} is terminated`);
    return undefined;
  }

  // 3. Route through bridge (which handles permission checks)
  const bridgeChannel = SYSCALL_TO_BRIDGE[code];
  if (bridgeChannel) {
    try {
      const result = NovaBridge.send(bridgeChannel as any, args[0]);
      // Record CPU tick
      ProcessTable.addTicks(pid, 1);
      logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "ok", durationMs: performance.now() - start });
      return result;
    } catch (e) {
      if (e instanceof PermissionDeniedError) {
        logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "denied", durationMs: performance.now() - start });
        console.warn(`[Kernel:Syscall] ${name} — Permission denied for PID ${pid}`);
        return undefined;
      }
      logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "error", durationMs: performance.now() - start });
      throw e;
    }
  }

  // 4. Handle kernel-internal syscalls
  switch (code) {
    case Syscall.SYS_KILL_PROCESS: {
      const targetPid = args[0] as number;
      const ok = ProcessTable.kill(targetPid, args[1] ?? 0);
      logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: ok ? "ok" : "error", durationMs: performance.now() - start });
      return ok;
    }
    case Syscall.SYS_GET_PROCESS: {
      const targetPid = args[0] as number;
      const proc = ProcessTable.getProcess(targetPid);
      logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: proc ? "ok" : "not_found", durationMs: performance.now() - start });
      return proc;
    }
    default: {
      logSyscall({ timestamp: Date.now(), pid, syscall: code, args, result: "error", durationMs: performance.now() - start });
      console.warn(`[Kernel:Syscall] Unknown syscall ${name}`);
      return undefined;
    }
  }
}

// ── Diagnostics ─────────────────────────────────────────────────

export function getSyscallLog(): readonly SyscallLogEntry[] {
  return auditLog;
}

export function getSyscallStats() {
  const total = auditLog.length;
  const denied = auditLog.filter(e => e.result === "denied").length;
  const errors = auditLog.filter(e => e.result === "error").length;
  const avgMs = total > 0 ? auditLog.reduce((s, e) => s + e.durationMs, 0) / total : 0;
  return { total, denied, errors, avgMs: Math.round(avgMs * 100) / 100 };
}

export function clearSyscallLog(): void {
  auditLog.length = 0;
}
