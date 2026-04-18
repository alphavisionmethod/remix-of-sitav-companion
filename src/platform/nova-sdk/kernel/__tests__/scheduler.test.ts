import { describe, it, expect, beforeEach } from "vitest";
import { Scheduler, type SchedulerStats } from "../scheduler";
import { ProcessTable } from "../process-manager";
import { MemoryManager } from "../memory-manager";
import { PrivilegeEnforcement } from "../privilege";

// ── Helpers ──────────────────────────────────────────────────

function resetKernel() {
  Scheduler.reset();
  ProcessTable.reset();
  MemoryManager.reset();
  PrivilegeEnforcement.reset();
}

const DUMMY_MANIFEST = {
  id: "test-app",
  name: "Test App",
  version: "1.0.0",
  permissions: [],
  windowDefaults: { width: 400, height: 300, resizable: true },
  designVersion: "nova-1.0",
} as any;

function spawnAndAdmit(appId = "test-app", priority = 50): number {
  const proc = ProcessTable.spawn({ ...DUMMY_MANIFEST, id: appId });
  MemoryManager.allocate(proc.pid, 4, { label: `app:${appId}:heap` });
  ProcessTable.setReady(proc.pid);
  Scheduler.admit(proc.pid);
  return proc.pid;
}

// ── Tests ────────────────────────────────────────────────────

describe("Scheduler — Admission & Eviction", () => {
  beforeEach(resetKernel);

  it("admits a process into the ready queue", () => {
    const pid = spawnAndAdmit();
    const stats = Scheduler.getStats();
    expect(stats.blockedCount).toBe(0);
    const totalReady = Object.values(stats.readyQueueDepths).reduce((s, v) => s + v, 0);
    expect(totalReady).toBeGreaterThanOrEqual(1);
  });

  it("evicts a process from the scheduler", () => {
    const pid = spawnAndAdmit();
    Scheduler.evict(pid);
    const stats = Scheduler.getStats();
    const totalReady = Object.values(stats.readyQueueDepths).reduce((s, v) => s + v, 0);
    expect(totalReady).toBe(0);
  });

  it("handles evicting the currently running process", () => {
    const pid = spawnAndAdmit();
    Scheduler.tick(); // schedule it
    expect(Scheduler.getCurrentPid()).toBe(pid);
    Scheduler.evict(pid);
    expect(Scheduler.getCurrentPid()).toBeNull();
  });
});

describe("Scheduler — Tick & Scheduling", () => {
  beforeEach(resetKernel);

  it("schedules a process on tick", () => {
    const pid = spawnAndAdmit();
    const proc = Scheduler.tick();
    expect(proc).not.toBeNull();
    expect(proc!.pid).toBe(pid);
    expect(Scheduler.getCurrentPid()).toBe(pid);
  });

  it("increments totalTicks on each tick", () => {
    spawnAndAdmit();
    const before = Scheduler.getStats().totalTicks;
    Scheduler.tick();
    Scheduler.tick();
    Scheduler.tick();
    expect(Scheduler.getStats().totalTicks).toBe(before + 3);
  });

  it("tracks idle ticks when no processes are ready", () => {
    const before = Scheduler.getStats().idleTicks;
    Scheduler.tick();
    Scheduler.tick();
    expect(Scheduler.getStats().idleTicks).toBeGreaterThanOrEqual(before + 1);
  });

  it("returns null when CPU is idle", () => {
    const proc = Scheduler.tick();
    expect(proc).toBeNull();
  });
});

describe("Scheduler — Context Switching", () => {
  beforeEach(resetKernel);

  it("performs context switch between two processes", () => {
    const pidA = spawnAndAdmit("app-a");
    const pidB = spawnAndAdmit("app-b");

    // Run enough ticks to cause a switch
    for (let i = 0; i < 20; i++) Scheduler.tick();

    const stats = Scheduler.getStats();
    expect(stats.contextSwitchCount).toBeGreaterThanOrEqual(1);
  });

  it("increments contextSwitchCount", () => {
    spawnAndAdmit("a");
    spawnAndAdmit("b");
    const before = Scheduler.getStats().contextSwitchCount;
    for (let i = 0; i < 50; i++) Scheduler.tick();
    expect(Scheduler.getStats().contextSwitchCount).toBeGreaterThan(before);
  });
});

describe("Scheduler — Blocking & Waking", () => {
  beforeEach(resetKernel);

  it("blocks a process", () => {
    const pid = spawnAndAdmit();
    Scheduler.tick(); // schedule it
    Scheduler.blockProcess(pid, "io");
    expect(Scheduler.getStats().blockedCount).toBe(1);
    expect(Scheduler.getCurrentPid()).toBeNull();
  });

  it("wakes a blocked process", () => {
    const pid = spawnAndAdmit();
    Scheduler.tick();
    Scheduler.blockProcess(pid, "io");
    expect(Scheduler.getStats().blockedCount).toBe(1);
    Scheduler.wakeProcess(pid);
    expect(Scheduler.getStats().blockedCount).toBe(0);
  });

  it("sleeping a process removes it from ready queue", () => {
    const pid = spawnAndAdmit();
    Scheduler.tick();
    Scheduler.sleepProcess(pid, 500);
    expect(Scheduler.getCurrentPid()).toBeNull();
    expect(Scheduler.getStats().blockedCount).toBe(1);
  });
});

describe("Scheduler — Stats & Event Log", () => {
  beforeEach(resetKernel);

  it("getStats returns valid SchedulerStats", () => {
    spawnAndAdmit();
    Scheduler.tick();
    const stats = Scheduler.getStats();
    expect(stats).toHaveProperty("totalTicks");
    expect(stats).toHaveProperty("contextSwitchCount");
    expect(stats).toHaveProperty("preemptionCount");
    expect(stats).toHaveProperty("ringTransitionCount");
    expect(stats).toHaveProperty("bandDistribution");
    expect(stats).toHaveProperty("readyQueueDepths");
    expect(stats).toHaveProperty("blockedCount");
    expect(stats).toHaveProperty("idleTicks");
  });

  it("event log captures scheduler events", () => {
    spawnAndAdmit();
    Scheduler.tick();
    const events = Scheduler.getEventLog(10);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("type");
    expect(events[0]).toHaveProperty("tick");
    expect(events[0]).toHaveProperty("detail");
  });

  it("band distribution reflects admitted processes", () => {
    spawnAndAdmit();
    Scheduler.tick();
    const stats = Scheduler.getStats();
    const total = Object.values(stats.bandDistribution).reduce((s, v) => s + v, 0);
    expect(total).toBeGreaterThanOrEqual(1);
  });
});

describe("Scheduler — Reset", () => {
  beforeEach(resetKernel);

  it("reset clears all state", () => {
    spawnAndAdmit();
    for (let i = 0; i < 10; i++) Scheduler.tick();
    Scheduler.reset();
    const stats = Scheduler.getStats();
    expect(stats.totalTicks).toBe(0);
    expect(stats.contextSwitchCount).toBe(0);
    expect(stats.preemptionCount).toBe(0);
    expect(stats.currentPid).toBeNull();
    expect(stats.blockedCount).toBe(0);
    expect(Scheduler.getEventLog()).toHaveLength(0);
  });
});

describe("Scheduler — Priority Inheritance", () => {
  beforeEach(resetKernel);

  it("boosts a lower-priority process for mutex holder", () => {
    const pidLow = spawnAndAdmit("low-app");
    const result = Scheduler.inheritPriority(pidLow, "RT-Normal");
    // Should return the old band if boosted
    if (result !== null) {
      expect(["Interactive", "Batch", "Idle"]).toContain(result);
    }
  });
});
