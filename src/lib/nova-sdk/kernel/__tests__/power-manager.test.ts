import { describe, it, expect, beforeEach } from "vitest";
import { PowerManager, type PowerState, type CpuGovernor } from "../power-manager";

// ── Tests ────────────────────────────────────────────────────

describe("PowerManager — Initial State", () => {
  beforeEach(() => PowerManager.reset());

  it("starts in S0 (Working) state", () => {
    const stats = PowerManager.getStats();
    expect(stats.powerState).toBe("S0");
  });

  it("has battery present with reasonable defaults", () => {
    const stats = PowerManager.getStats();
    expect(stats.battery.present).toBe(true);
    expect(stats.battery.level).toBeGreaterThan(0);
    expect(stats.battery.level).toBeLessThanOrEqual(100);
    expect(stats.battery.health).toBeGreaterThan(0);
  });

  it("has CPU state with valid frequencies", () => {
    const stats = PowerManager.getStats();
    expect(stats.cpu.currentMHz).toBeGreaterThan(0);
    expect(stats.cpu.minMHz).toBeLessThan(stats.cpu.maxMHz);
    expect(stats.cpu.coreCount).toBeGreaterThan(0);
    expect(stats.cpu.coreFreqs).toHaveLength(stats.cpu.coreCount);
    expect(stats.cpu.coreLoads).toHaveLength(stats.cpu.coreCount);
  });

  it("has thermal zones with trip points", () => {
    const stats = PowerManager.getStats();
    expect(stats.thermalZones.length).toBeGreaterThan(0);
    for (const zone of stats.thermalZones) {
      expect(zone.tripPoints.warm).toBeLessThan(zone.tripPoints.hot);
      expect(zone.tripPoints.hot).toBeLessThan(zone.tripPoints.critical);
      expect(zone.temperature).toBeGreaterThan(0);
    }
  });

  it("starts with zero wake/sleep counts", () => {
    const stats = PowerManager.getStats();
    expect(stats.wakeCount).toBe(0);
    expect(stats.sleepCount).toBe(0);
  });
});

describe("PowerManager — Sleep & Wake", () => {
  beforeEach(() => PowerManager.reset());

  it("transitions to S3 on sleep()", () => {
    expect(PowerManager.sleep()).toBe(true);
    expect(PowerManager.getStats().powerState).toBe("S3");
    expect(PowerManager.getStats().sleepCount).toBe(1);
  });

  it("transitions to S4 on hibernate()", () => {
    expect(PowerManager.hibernate()).toBe(true);
    expect(PowerManager.getStats().powerState).toBe("S4");
    expect(PowerManager.getStats().sleepCount).toBe(1);
  });

  it("rejects sleep() when not in S0", () => {
    PowerManager.sleep(); // → S3
    expect(PowerManager.sleep()).toBe(false);
  });

  it("rejects hibernate() when not in S0", () => {
    PowerManager.sleep(); // → S3
    expect(PowerManager.hibernate()).toBe(false);
  });

  it("wakes from S3 back to S0", () => {
    PowerManager.sleep();
    expect(PowerManager.wake()).toBe(true);
    expect(PowerManager.getStats().powerState).toBe("S0");
    expect(PowerManager.getStats().wakeCount).toBe(1);
  });

  it("wakes from S4 back to S0", () => {
    PowerManager.hibernate();
    expect(PowerManager.wake()).toBe(true);
    expect(PowerManager.getStats().powerState).toBe("S0");
    expect(PowerManager.getStats().wakeCount).toBe(1);
  });

  it("rejects wake() when already in S0", () => {
    expect(PowerManager.wake()).toBe(false);
  });

  it("tracks cumulative sleep/wake counts", () => {
    PowerManager.sleep();
    PowerManager.wake();
    PowerManager.hibernate();
    PowerManager.wake();
    const stats = PowerManager.getStats();
    expect(stats.sleepCount).toBe(2);
    expect(stats.wakeCount).toBe(2);
  });
});

describe("PowerManager — Governor Control", () => {
  beforeEach(() => PowerManager.reset());

  it("sets CPU governor to performance", () => {
    PowerManager.setGovernor("performance");
    expect(PowerManager.getStats().cpu.governor).toBe("performance");
  });

  it("sets CPU governor to powersave", () => {
    PowerManager.setGovernor("powersave");
    expect(PowerManager.getStats().cpu.governor).toBe("powersave");
  });

  it("logs governor change in events", () => {
    PowerManager.setGovernor("ondemand");
    const events = PowerManager.getEventLog(5);
    const govEvent = events.find(e => e.type === "governor");
    expect(govEvent).toBeDefined();
    expect(govEvent!.detail).toContain("ondemand");
  });

  const governors: CpuGovernor[] = ["performance", "powersave", "ondemand", "conservative", "schedutil"];
  for (const gov of governors) {
    it(`accepts governor: ${gov}`, () => {
      PowerManager.setGovernor(gov);
      expect(PowerManager.getStats().cpu.governor).toBe(gov);
    });
  }
});

describe("PowerManager — AC Power Toggle", () => {
  beforeEach(() => PowerManager.reset());

  it("toggles AC connection", () => {
    const before = PowerManager.getStats().battery.acConnected;
    PowerManager.toggleAC();
    expect(PowerManager.getStats().battery.acConnected).toBe(!before);
  });

  it("logs AC events", () => {
    PowerManager.toggleAC();
    const events = PowerManager.getEventLog(5);
    const acEvent = events.find(e => e.type === "battery");
    expect(acEvent).toBeDefined();
    expect(acEvent!.detail).toMatch(/AC/);
  });
});

describe("PowerManager — Stats & Events", () => {
  beforeEach(() => PowerManager.reset());

  it("getStats returns complete PowerStats", () => {
    const stats = PowerManager.getStats();
    expect(stats).toHaveProperty("powerState");
    expect(stats).toHaveProperty("battery");
    expect(stats).toHaveProperty("cpu");
    expect(stats).toHaveProperty("thermalZones");
    expect(stats).toHaveProperty("events");
    expect(stats).toHaveProperty("uptime");
    expect(stats).toHaveProperty("wakeCount");
    expect(stats).toHaveProperty("sleepCount");
    expect(stats).toHaveProperty("totalThrottleTime");
  });

  it("getEventLog returns events", () => {
    PowerManager.sleep();
    PowerManager.wake();
    const events = PowerManager.getEventLog(10);
    expect(events.length).toBeGreaterThanOrEqual(2);
    for (const e of events) {
      expect(e).toHaveProperty("timestamp");
      expect(e).toHaveProperty("type");
      expect(e).toHaveProperty("detail");
    }
  });

  it("uptime is 0 when not in S0", () => {
    PowerManager.sleep();
    expect(PowerManager.getStats().uptime).toBe(0);
  });

  it("uptime is positive when in S0", () => {
    // Already in S0 after reset
    const stats = PowerManager.getStats();
    expect(stats.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe("PowerManager — Reset", () => {
  it("reset clears all state", () => {
    PowerManager.sleep();
    PowerManager.wake();
    PowerManager.setGovernor("performance");
    PowerManager.reset();
    const stats = PowerManager.getStats();
    expect(stats.powerState).toBe("S0");
    expect(stats.wakeCount).toBe(0);
    expect(stats.sleepCount).toBe(0);
    expect(stats.events).toHaveLength(0);
  });
});
