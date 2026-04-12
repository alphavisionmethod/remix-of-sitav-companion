import { describe, it, expect, beforeEach } from "vitest";
import {
  syscall,
  Syscall,
  ERRNO,
  getSyscallLog,
  getSyscallStats,
  getSyscallMetrics,
  clearSyscallLog,
  resetRateLimiter,
  resetMutexes,
  copyFromUser,
  copyToUser,
  isBlocking,
  isFast,
} from "../syscall";
import { ProcessTable } from "../process-manager";
import { MemoryManager } from "../memory-manager";
import { PrivilegeEnforcement } from "../privilege";

// ── Helpers ─────────────────────────────────────────────────────

function setupKernel() {
  ProcessTable.reset();
  MemoryManager.reset();
  PrivilegeEnforcement.reset();
  clearSyscallLog();
  resetRateLimiter();
  resetMutexes();

  // Allocate kernel memory
  MemoryManager.allocate(0, 256, { label: "kernel:heap", guardPages: true });
  MemoryManager.createAddressSpace(0);
}

function spawnUserProcess(name = "test-app"): number {
  const proc = ProcessTable.spawn({
    id: name, name, version: "1.0.0", publisher: "test",
    icon: "terminal", iconBg: "#000",
    permissions: [], windowDefaults: { width: 800, height: 600 },
  });
  MemoryManager.allocate(proc.pid, 16, { label: `${name}:heap` });
  MemoryManager.createAddressSpace(proc.pid);
  return proc.pid;
}

// ═══════════════════════════════════════════════════════════════
// SAFETY TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Safety Tests", () => {
  beforeEach(setupKernel);

  it("rejects syscall for non-existent PID", () => {
    const result = syscall(Syscall.SYS_GETPID, 9999);
    expect(result).toBe(ERRNO.ESRCH);
  });

  it("rejects invalid syscall codes (fuzz guard)", () => {
    const pid = spawnUserProcess();
    const result = syscall(0xFF as any, pid);
    expect(result).toBe(ERRNO.ENOSYS);
  });

  it("rejects negative syscall codes", () => {
    const pid = spawnUserProcess();
    const result = syscall(-1 as any, pid);
    expect(result).toBe(ERRNO.ENOSYS);
  });

  it("handles null pointer in copyFromUser", () => {
    const pid = spawnUserProcess();
    const result = copyFromUser(pid, 0, 100);
    expect(result.ok).toBe(false);
    expect(result.data).toBeNull();
  });

  it("handles zero-size in copyFromUser", () => {
    const pid = spawnUserProcess();
    const result = copyFromUser(pid, 0x1000, 0);
    expect(result.ok).toBe(false);
  });

  it("handles null pointer in copyToUser", () => {
    const pid = spawnUserProcess();
    const result = copyToUser(pid, 0, new ArrayBuffer(10));
    expect(result).toBe(false);
  });

  it("SYS_GETPID returns the process PID", () => {
    const pid = spawnUserProcess();
    const result = syscall(Syscall.SYS_GETPID, pid);
    expect(result).toBe(pid);
  });

  it("SYS_GETPPID returns parent PID", () => {
    const pid = spawnUserProcess();
    const result = syscall(Syscall.SYS_GETPPID, pid);
    expect(typeof result).toBe("number");
  });
});

// ═══════════════════════════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Security Tests", () => {
  beforeEach(setupKernel);

  it("enforces input sanitization on SYS_KILL_PROCESS", () => {
    const pid = spawnUserProcess();
    // Missing target PID
    const result = syscall(Syscall.SYS_KILL_PROCESS, pid);
    expect(result).toBe(ERRNO.EINVAL);
  });

  it("enforces input sanitization on SYS_MMAP with invalid size", () => {
    const pid = spawnUserProcess();
    // Size = -1
    const result = syscall(Syscall.SYS_MMAP, pid, 0, -1);
    expect(result).toBe(ERRNO.EINVAL);
  });

  it("enforces input sanitization on SYS_MMAP with oversized request", () => {
    const pid = spawnUserProcess();
    const result = syscall(Syscall.SYS_MMAP, pid, 0, 2 * 1024 * 1024 * 1024);
    expect(result).toBe(ERRNO.EINVAL);
  });

  it("rejects syscall from terminated process", () => {
    const pid = spawnUserProcess();
    ProcessTable.kill(pid, 0);
    const result = syscall(Syscall.SYS_GETPID, pid);
    expect(result).toBe(ERRNO.ESRCH);
  });

  it("logs violations in audit log", () => {
    const pid = spawnUserProcess();
    syscall(0xAA as any, pid); // invalid
    const log = getSyscallLog();
    expect(log.length).toBeGreaterThan(0);
    const lastEntry = log[log.length - 1];
    expect(lastEntry.result).toBe("error");
  });
});

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Rate Limiting", () => {
  beforeEach(setupKernel);

  it("allows syscalls under the rate limit", () => {
    const pid = spawnUserProcess();
    // Make a few calls — should all succeed
    for (let i = 0; i < 10; i++) {
      const result = syscall(Syscall.SYS_GETPID, pid);
      expect(result).toBe(pid);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// BLOCKING CLASSIFICATION TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Blocking Classification", () => {
  it("classifies SYS_GETPID as fast (non-blocking)", () => {
    expect(isFast(Syscall.SYS_GETPID)).toBe(true);
    expect(isBlocking(Syscall.SYS_GETPID)).toBe(false);
  });

  it("classifies SYS_OPEN_FILE as slow (blocking)", () => {
    expect(isBlocking(Syscall.SYS_OPEN_FILE)).toBe(true);
    expect(isFast(Syscall.SYS_OPEN_FILE)).toBe(false);
  });

  it("classifies window syscalls as fast", () => {
    expect(isFast(Syscall.SYS_CREATE_WINDOW)).toBe(true);
    expect(isFast(Syscall.SYS_CLOSE_WINDOW)).toBe(true);
    expect(isFast(Syscall.SYS_FOCUS_WINDOW)).toBe(true);
    expect(isFast(Syscall.SYS_MINIMIZE_WINDOW)).toBe(true);
  });

  it("classifies SYS_READ as slow", () => {
    expect(isBlocking(Syscall.SYS_READ)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE & METRICS TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Performance Metrics", () => {
  beforeEach(setupKernel);

  it("tracks per-type latency metrics", () => {
    const pid = spawnUserProcess();
    for (let i = 0; i < 20; i++) {
      syscall(Syscall.SYS_GETPID, pid);
    }
    const metrics = getSyscallMetrics();
    const getpidMetric = metrics.find(m => m.syscall === "GETPID");
    expect(getpidMetric).toBeDefined();
    expect(getpidMetric!.count).toBe(20);
    expect(getpidMetric!.avgMs).toBeGreaterThanOrEqual(0);
    expect(getpidMetric!.p95Ms).toBeGreaterThanOrEqual(0);
    expect(getpidMetric!.p99Ms).toBeGreaterThanOrEqual(0);
  });

  it("dispatch latency is under 5ms (simulated)", () => {
    const pid = spawnUserProcess();
    const start = performance.now();
    syscall(Syscall.SYS_GETPID, pid);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });

  it("getSyscallStats includes all categories", () => {
    const pid = spawnUserProcess();
    syscall(Syscall.SYS_GETPID, pid);
    syscall(0xFF as any, pid); // invalid
    const stats = getSyscallStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.denied).toBe("number");
    expect(typeof stats.errors).toBe("number");
    expect(typeof stats.violations).toBe("number");
    expect(typeof stats.rateLimited).toBe("number");
    expect(typeof stats.invalidArgs).toBe("number");
    expect(typeof stats.mutexBlocked).toBe("number");
    expect(typeof stats.avgMs).toBe("number");
    expect(Array.isArray(stats.perTypeMetrics)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// STRESS / FUZZ TESTS
// ═══════════════════════════════════════════════════════════════

describe("Syscall Stress & Fuzz Tests", () => {
  beforeEach(setupKernel);

  it("survives 1000 rapid sequential syscalls", () => {
    const pid = spawnUserProcess();
    for (let i = 0; i < 1000; i++) {
      const result = syscall(Syscall.SYS_GETPID, pid);
      expect(result).toBe(pid);
    }
  });

  it("survives random syscall codes (fuzz)", () => {
    const pid = spawnUserProcess();
    for (let i = 0; i < 100; i++) {
      const randomCode = Math.floor(Math.random() * 256);
      // Should never throw — may return error code or undefined (bridge handlers)
      expect(() => syscall(randomCode as any, pid)).not.toThrow();
    }
  });

  it("survives random args on valid syscalls (fuzz)", () => {
    const pid = spawnUserProcess();
    const codes = [Syscall.SYS_GETPID, Syscall.SYS_GETPPID, Syscall.SYS_SCHED_YIELD];
    for (let i = 0; i < 100; i++) {
      const code = codes[i % codes.length];
      const result = syscall(code, pid, null, undefined, "garbage", -99, {});
      expect(result).toBeDefined();
    }
  });

  it("kernel never panics on null/undefined args", () => {
    const pid = spawnUserProcess();
    expect(() => syscall(Syscall.SYS_KILL_PROCESS, pid)).not.toThrow();
    expect(() => syscall(Syscall.SYS_MMAP, pid, null, null)).not.toThrow();
    expect(() => syscall(Syscall.SYS_BRK, pid)).not.toThrow();
  });
});
