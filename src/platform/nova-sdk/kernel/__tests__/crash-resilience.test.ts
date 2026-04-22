// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Crash Resilience Test Suite
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  CrashResilienceEngine,
  ProcessRestartManager,
  ServiceWatchdog,
  GracefulDegradation,
  CrashLogger,
} from "../crash-resilience";

describe("ProcessRestartManager", () => {
  let mgr: ProcessRestartManager;

  beforeEach(() => {
    mgr = new ProcessRestartManager();
  });

  it("registers and retrieves processes", () => {
    mgr.register(1, "Notes", "immediate");
    expect(mgr.getProcess(1)?.appName).toBe("Notes");
  });

  it("first crash restarts immediately", () => {
    mgr.register(1, "Notes", "immediate");
    const result = mgr.handleCrash(1);
    expect(result.shouldRestart).toBe(true);
    expect(result.delayMs).toBe(0);
    expect(result.attempt).toBe(1);
  });

  it("subsequent crashes use exponential backoff", () => {
    mgr.register(1, "Notes", "delayed");
    mgr.handleCrash(1); // attempt 1
    const r2 = mgr.handleCrash(1); // attempt 2
    expect(r2.shouldRestart).toBe(true);
    expect(r2.delayMs).toBeGreaterThan(0);
  });

  it("terminates after max restart attempts", () => {
    mgr.register(1, "Notes", "delayed");
    for (let i = 0; i < 5; i++) mgr.handleCrash(1);
    const result = mgr.handleCrash(1);
    expect(result.shouldRestart).toBe(false);
  });

  it("critical apps always restart", () => {
    mgr.register(1, "SecurityMonitor", "critical-always", true);
    for (let i = 0; i < 10; i++) {
      const r = mgr.handleCrash(1);
      expect(r.shouldRestart).toBe(true);
    }
  });

  it("saves and restores state", () => {
    mgr.register(1, "Notes", "immediate");
    const state = {
      windowLayout: { x: 100, y: 200, width: 800, height: 600, minimized: false },
      openFiles: ["/home/user/notes.txt"],
      memorySnapshot: new Map(),
      focusedElement: "editor",
      scrollPositions: new Map([["editor", 150]]),
    };
    mgr.saveState(1, state);
    const result = mgr.handleCrash(1);
    expect(result.savedState).toBeTruthy();
    expect(result.savedState?.openFiles).toEqual(["/home/user/notes.txt"]);
  });

  it("records syscall history (bounded at 50)", () => {
    mgr.register(1, "App", "immediate");
    for (let i = 0; i < 60; i++) {
      mgr.recordSyscall(1, `SYS_CALL_${i}`);
    }
    expect(mgr.getProcess(1)!.syscallHistory.length).toBe(50);
  });

  it("never policy never restarts", () => {
    mgr.register(1, "OneShot", "never");
    const r = mgr.handleCrash(1);
    expect(r.shouldRestart).toBe(false);
  });
});

describe("ServiceWatchdog", () => {
  let wd: ServiceWatchdog;

  beforeEach(() => {
    wd = new ServiceWatchdog();
  });

  afterEach(() => {
    wd.reset();
  });

  it("registers components with correct thresholds", () => {
    wd.registerComponent("ui-thread", "ui");
    wd.registerComponent("fs-service", "service");
    wd.registerComponent("indexer", "background");
    const status = wd.getStatus();
    expect(status).toHaveLength(3);
    expect(status.find((s) => s.componentId === "ui-thread")?.healthy).toBe(true);
  });

  it("detects frozen components", () => {
    vi.useFakeTimers();
    wd.registerComponent("ui-thread", "ui");
    // Advance past threshold
    vi.advanceTimersByTime(600);
    const frozen = wd.check();
    expect(frozen).toContain("ui-thread");
    vi.useRealTimers();
  });

  it("resets missed beats on heartbeat", () => {
    vi.useFakeTimers();
    wd.registerComponent("svc", "service");
    vi.advanceTimersByTime(100);
    wd.heartbeat("svc");
    const frozen = wd.check();
    expect(frozen).not.toContain("svc");
    vi.useRealTimers();
  });

  it("calls onRestart when frozen", () => {
    vi.useFakeTimers();
    const restartFn = vi.fn();
    wd.registerComponent("svc", "service", restartFn, 3);
    vi.advanceTimersByTime(1100);
    wd.check();
    expect(restartFn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("stops restarting after max restarts", () => {
    vi.useFakeTimers();
    const restartFn = vi.fn();
    wd.registerComponent("svc", "service", restartFn, 2);
    // Trigger 3 checks beyond threshold
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(1100);
      wd.check();
    }
    expect(restartFn).toHaveBeenCalledTimes(2); // Only 2, not 3
    vi.useRealTimers();
  });

  it("fires freeze callbacks", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    wd.onFreeze(cb);
    wd.registerComponent("bg", "background");
    vi.advanceTimersByTime(5100);
    wd.check();
    expect(cb).toHaveBeenCalledWith("bg");
    vi.useRealTimers();
  });
});

describe("GracefulDegradation", () => {
  let gd: GracefulDegradation;

  beforeEach(() => {
    gd = new GracefulDegradation();
  });

  it("starts at normal level", () => {
    expect(gd.getLevel()).toBe("normal");
    expect(gd.getPolicy().animationsEnabled).toBe(true);
  });

  it("escalates to warning at 70% usage", () => {
    gd.evaluate({ memoryUsage: 0.75, cpuUsage: 0.3, processCount: 10, maxProcesses: 100 });
    expect(gd.getLevel()).toBe("warning");
  });

  it("escalates to critical at 85% usage", () => {
    gd.evaluate({ memoryUsage: 0.9, cpuUsage: 0.3, processCount: 10, maxProcesses: 100 });
    expect(gd.getLevel()).toBe("critical");
    expect(gd.getPolicy().animationsEnabled).toBe(false);
    expect(gd.getPolicy().backgroundTasksEnabled).toBe(false);
  });

  it("escalates to emergency at 95% usage", () => {
    gd.evaluate({ memoryUsage: 0.96, cpuUsage: 0.3, processCount: 10, maxProcesses: 100 });
    expect(gd.getLevel()).toBe("emergency");
    expect(gd.getPolicy().maxNewProcesses).toBe(0);
  });

  it("fires listener on level change", () => {
    const cb = vi.fn();
    gd.onLevelChange(cb);
    gd.evaluate({ memoryUsage: 0.8, cpuUsage: 0.3, processCount: 10, maxProcesses: 100 });
    expect(cb).toHaveBeenCalledWith("warning", expect.any(Object));
  });

  it("does not fire listener if level unchanged", () => {
    const cb = vi.fn();
    gd.evaluate({ memoryUsage: 0.1, cpuUsage: 0.1, processCount: 1, maxProcesses: 100 });
    gd.onLevelChange(cb);
    gd.evaluate({ memoryUsage: 0.2, cpuUsage: 0.2, processCount: 2, maxProcesses: 100 });
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("CrashLogger", () => {
  let logger: CrashLogger;

  beforeEach(() => {
    logger = new CrashLogger();
  });

  it("logs crash reports with full context", () => {
    const report = logger.log({
      pid: 42,
      appName: "Notes",
      faultType: "segfault",
      address: "0xDEADBEEF",
      stackTrace: "at Notes.render\nat Window.mount",
      syscallHistory: ["SYS_WRITE", "SYS_READ", "SYS_MMAP"],
      memoryState: { heapUsed: 1024, heapTotal: 4096, stackDepth: 12 },
      restartAttempt: 1,
    });
    expect(report.id).toMatch(/^crash-/);
    expect(report.appName).toBe("Notes");
    expect(report.faultType).toBe("segfault");
    expect(report.resolved).toBe(false);
  });

  it("queries by PID", () => {
    logger.log({ pid: 1, appName: "A", faultType: "segfault", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    logger.log({ pid: 2, appName: "B", faultType: "segfault", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    expect(logger.queryByPid(1)).toHaveLength(1);
  });

  it("queries by app name", () => {
    logger.log({ pid: 1, appName: "Notes", faultType: "segfault", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    expect(logger.queryByApp("Notes")).toHaveLength(1);
  });

  it("resolves reports", () => {
    const r = logger.log({ pid: 1, appName: "A", faultType: "segfault", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    logger.resolve(r.id);
    expect(logger.getAll()[0].resolved).toBe(true);
  });

  it("provides stats by fault type", () => {
    logger.log({ pid: 1, appName: "A", faultType: "segfault", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    logger.log({ pid: 2, appName: "B", faultType: "timeout", address: "", stackTrace: "", syscallHistory: [], memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 }, restartAttempt: 1 });
    const stats = logger.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byType["segfault"]).toBe(1);
    expect(stats.byType["timeout"]).toBe(1);
  });
});

describe("CrashResilienceEngine (Orchestrator)", () => {
  let engine: CrashResilienceEngine;

  beforeEach(() => {
    engine = new CrashResilienceEngine();
    engine.start();
  });

  afterEach(() => {
    engine.reset();
  });

  it("reports crash → restarts → restores state", () => {
    engine.restartManager.register(10, "Notes", "immediate");
    engine.restartManager.saveState(10, {
      windowLayout: { x: 0, y: 0, width: 800, height: 600, minimized: false },
      openFiles: ["/doc.txt"],
      memorySnapshot: new Map(),
      focusedElement: null,
      scrollPositions: new Map(),
    });

    const result = engine.reportCrash(10, "segfault", "at render()");
    expect(result.restarted).toBe(true);
    expect(result.restoredState?.openFiles).toEqual(["/doc.txt"]);
    expect(result.report.faultType).toBe("segfault");
  });

  it("terminates process after repeated crashes", () => {
    engine.restartManager.register(10, "BadApp", "delayed");
    for (let i = 0; i < 5; i++) engine.reportCrash(10, "segfault", "crash");
    const final = engine.reportCrash(10, "segfault", "crash");
    expect(final.restarted).toBe(false);
  });

  it("checkHealth returns full system status", () => {
    const health = engine.checkHealth();
    expect(health.degradationLevel).toBe("normal");
    expect(health.crashStats.total).toBe(0);
    expect(Array.isArray(health.watchdogStatus)).toBe(true);
  });

  it("heartbeat keeps components alive", () => {
    vi.useFakeTimers();
    engine.watchdog.registerComponent("test-svc", "service");
    vi.advanceTimersByTime(400);
    engine.heartbeat("test-svc");
    const frozen = engine.watchdog.check();
    expect(frozen).not.toContain("test-svc");
    vi.useRealTimers();
  });
});
