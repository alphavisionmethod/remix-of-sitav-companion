// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Power Management Subsystem
// Battery monitoring, CPU frequency scaling, thermal throttling,
// sleep/hibernate states — full ACPI-style simulation
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type PowerState = "S0" | "S1" | "S2" | "S3" | "S4" | "S5";
// S0 = Working, S1 = Standby, S2 = CPU off,
// S3 = Sleep (suspend-to-RAM), S4 = Hibernate (suspend-to-disk), S5 = Soft Off

export type CpuGovernor = "performance" | "powersave" | "ondemand" | "conservative" | "schedutil";

export type ThermalZoneState = "normal" | "warm" | "hot" | "critical";

export interface CpuFreqState {
  currentMHz: number;
  minMHz: number;
  maxMHz: number;
  baseMHz: number;
  governor: CpuGovernor;
  scalingPercent: number;    // 0-100 — current scaling relative to max
  throttled: boolean;
  coreCount: number;
  coreFreqs: number[];       // per-core frequencies
  coreLoads: number[];       // per-core load %
}

export interface BatteryState {
  present: boolean;
  charging: boolean;
  level: number;             // 0-100%
  health: number;            // 0-100% capacity health
  voltage: number;           // mV
  current: number;           // mA (positive = charging, negative = discharging)
  temperature: number;       // °C
  designCapacity: number;    // mWh
  fullCapacity: number;      // mWh (degrades with health)
  remainingCapacity: number; // mWh
  cycleCount: number;
  timeToEmpty: number | null;   // minutes
  timeToFull: number | null;    // minutes
  acConnected: boolean;
}

export interface ThermalZone {
  name: string;
  temperature: number;       // °C
  tripPoints: {
    warm: number;
    hot: number;
    critical: number;
  };
  state: ThermalZoneState;
  throttlePercent: number;   // 0 = no throttle, 100 = full throttle
}

export interface PowerEvent {
  timestamp: number;
  type: "state-change" | "throttle" | "battery" | "thermal" | "governor" | "wake" | "sleep";
  detail: string;
}

export interface PowerStats {
  powerState: PowerState;
  battery: BatteryState;
  cpu: CpuFreqState;
  thermalZones: ThermalZone[];
  events: readonly PowerEvent[];
  uptime: number;            // ms since S0 entered
  wakeCount: number;
  sleepCount: number;
  totalThrottleTime: number; // ms spent throttled
}

// ── Power Manager ────────────────────────────────────────────

const MAX_EVENTS = 100;

class PowerManagerClass {
  private powerState: PowerState = "S0";
  private stateEnteredAt = Date.now();
  private wakeCount = 0;
  private sleepCount = 0;
  private totalThrottleTime = 0;
  private lastThrottleStart = 0;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  // Battery simulation
  private battery: BatteryState = {
    present: true,
    charging: false,
    level: 78,
    health: 94,
    voltage: 11400,
    current: -1250,
    temperature: 34,
    designCapacity: 72000,
    fullCapacity: 67680,
    remainingCapacity: 52790,
    cycleCount: 247,
    timeToEmpty: 196,
    timeToFull: null,
    acConnected: false,
  };

  // CPU frequency scaling
  private cpu: CpuFreqState = {
    currentMHz: 3200,
    minMHz: 800,
    maxMHz: 4800,
    baseMHz: 3200,
    governor: "schedutil",
    scalingPercent: 67,
    throttled: false,
    coreCount: 8,
    coreFreqs: [3200, 3000, 2800, 3400, 3100, 2900, 3300, 2700],
    coreLoads: [45, 22, 67, 12, 55, 8, 38, 3],
  };

  // Thermal zones
  private thermalZones: ThermalZone[] = [
    {
      name: "cpu-package",
      temperature: 62,
      tripPoints: { warm: 70, hot: 85, critical: 100 },
      state: "normal",
      throttlePercent: 0,
    },
    {
      name: "gpu-core",
      temperature: 48,
      tripPoints: { warm: 65, hot: 80, critical: 95 },
      state: "normal",
      throttlePercent: 0,
    },
    {
      name: "ssd-nvme0",
      temperature: 41,
      tripPoints: { warm: 55, hot: 70, critical: 80 },
      state: "normal",
      throttlePercent: 0,
    },
    {
      name: "battery",
      temperature: 34,
      tripPoints: { warm: 40, hot: 50, critical: 60 },
      state: "normal",
      throttlePercent: 0,
    },
  ];

  // Event log
  private events: PowerEvent[] = [];

  // ── Lifecycle ─────────────────────────────────────────────

  start(intervalMs = 1000): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), intervalMs);
    this.logEvent("state-change", "Power management started (S0 — Working)");
    console.log("[Kernel:Power] Power management subsystem started");
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  reset(): void {
    this.stop();
    this.powerState = "S0";
    this.stateEnteredAt = Date.now();
    this.wakeCount = 0;
    this.sleepCount = 0;
    this.totalThrottleTime = 0;
    this.lastThrottleStart = 0;
    this.events = [];
  }

  // ── Simulation Tick ───────────────────────────────────────

  private tick(): void {
    if (this.powerState !== "S0") return; // only simulate in working state

    this.simulateBattery();
    this.simulateCpuFreq();
    this.simulateThermal();
  }

  private simulateBattery(): void {
    const b = this.battery;
    if (!b.present) return;

    if (b.acConnected) {
      // Charging
      b.charging = b.level < 100;
      if (b.charging) {
        b.level = Math.min(100, b.level + 0.02 + Math.random() * 0.03);
        b.current = 2100 + Math.round(Math.random() * 300);
        b.remainingCapacity = (b.level / 100) * b.fullCapacity;
        const remaining = 100 - b.level;
        b.timeToFull = remaining > 0 ? Math.round((remaining / 0.025) / 60) : 0;
        b.timeToEmpty = null;
      } else {
        b.current = 50; // trickle
        b.timeToFull = 0;
        b.timeToEmpty = null;
      }
    } else {
      // Discharging
      b.charging = false;
      const drain = 0.008 + Math.random() * 0.012; // ~1% per ~50 ticks
      b.level = Math.max(0, b.level - drain);
      b.current = -(1100 + Math.round(Math.random() * 400));
      b.remainingCapacity = (b.level / 100) * b.fullCapacity;
      b.timeToEmpty = b.level > 0 ? Math.round((b.level / drain) / 60) : 0;
      b.timeToFull = null;

      // Low battery warnings
      if (b.level <= 5 && b.level > 4.9) {
        this.logEvent("battery", "CRITICAL: Battery below 5%");
      } else if (b.level <= 15 && b.level > 14.9) {
        this.logEvent("battery", "WARNING: Battery below 15%");
      }
    }

    // Temperature fluctuation
    b.temperature = 30 + Math.random() * 8 + (b.charging ? 4 : 0);
    b.voltage = b.charging ? 12600 + Math.round(Math.random() * 200) : 11000 + Math.round(b.level * 16);
  }

  private simulateCpuFreq(): void {
    const c = this.cpu;

    // Simulate per-core load fluctuation
    for (let i = 0; i < c.coreCount; i++) {
      const delta = (Math.random() - 0.5) * 15;
      c.coreLoads[i] = Math.max(0, Math.min(100, c.coreLoads[i] + delta));
    }

    // Average load drives frequency scaling
    const avgLoad = c.coreLoads.reduce((s, l) => s + l, 0) / c.coreCount;

    switch (c.governor) {
      case "performance":
        c.currentMHz = c.maxMHz;
        break;
      case "powersave":
        c.currentMHz = c.minMHz;
        break;
      case "ondemand":
        c.currentMHz = avgLoad > 60 ? c.maxMHz : c.minMHz + (c.maxMHz - c.minMHz) * (avgLoad / 100);
        break;
      case "conservative":
        // Step up/down gradually
        const target = c.minMHz + (c.maxMHz - c.minMHz) * (avgLoad / 100);
        c.currentMHz += (target - c.currentMHz) * 0.2;
        break;
      case "schedutil":
      default:
        // Kernel scheduler-driven — responsive
        c.currentMHz = c.minMHz + (c.maxMHz - c.minMHz) * Math.pow(avgLoad / 100, 0.7);
        break;
    }

    // Apply thermal throttle
    const maxThrottle = Math.max(...this.thermalZones.map(z => z.throttlePercent));
    if (maxThrottle > 0) {
      const throttleCap = c.maxMHz * (1 - maxThrottle / 100);
      c.currentMHz = Math.min(c.currentMHz, Math.max(c.minMHz, throttleCap));
      if (!c.throttled) {
        c.throttled = true;
        this.lastThrottleStart = Date.now();
        this.logEvent("throttle", `CPU throttled to ${Math.round(throttleCap)}MHz (thermal: ${maxThrottle}%)`);
      }
    } else if (c.throttled) {
      c.throttled = false;
      this.totalThrottleTime += Date.now() - this.lastThrottleStart;
      this.logEvent("throttle", "CPU throttle released");
    }

    c.currentMHz = Math.round(c.currentMHz);
    c.scalingPercent = Math.round((c.currentMHz / c.maxMHz) * 100);

    // Per-core frequencies vary around currentMHz
    for (let i = 0; i < c.coreCount; i++) {
      const loadFactor = c.coreLoads[i] / 100;
      c.coreFreqs[i] = Math.round(c.minMHz + (c.currentMHz - c.minMHz) * (0.5 + loadFactor * 0.5));
    }
  }

  private simulateThermal(): void {
    for (const zone of this.thermalZones) {
      // Drift temperature
      const drift = (Math.random() - 0.48) * 1.5; // slight upward bias
      zone.temperature = Math.max(20, Math.min(zone.tripPoints.critical + 5, zone.temperature + drift));

      // Determine state
      const prevState = zone.state;
      if (zone.temperature >= zone.tripPoints.critical) {
        zone.state = "critical";
        zone.throttlePercent = 80;
      } else if (zone.temperature >= zone.tripPoints.hot) {
        zone.state = "hot";
        zone.throttlePercent = 40 + Math.round(((zone.temperature - zone.tripPoints.hot) / (zone.tripPoints.critical - zone.tripPoints.hot)) * 40);
      } else if (zone.temperature >= zone.tripPoints.warm) {
        zone.state = "warm";
        zone.throttlePercent = Math.round(((zone.temperature - zone.tripPoints.warm) / (zone.tripPoints.hot - zone.tripPoints.warm)) * 40);
      } else {
        zone.state = "normal";
        zone.throttlePercent = 0;
      }

      if (zone.state !== prevState) {
        this.logEvent("thermal", `${zone.name}: ${prevState} → ${zone.state} (${zone.temperature.toFixed(1)}°C)`);
      }
    }
  }

  // ── Power State Transitions ───────────────────────────────

  sleep(): boolean {
    if (this.powerState !== "S0") return false;
    this.powerState = "S3";
    this.sleepCount++;
    this.logEvent("sleep", "Entering S3 (Suspend-to-RAM)");
    console.log("[Kernel:Power] Entering S3 sleep");
    return true;
  }

  hibernate(): boolean {
    if (this.powerState !== "S0") return false;
    this.powerState = "S4";
    this.sleepCount++;
    this.logEvent("sleep", "Entering S4 (Hibernate — suspend-to-disk)");
    console.log("[Kernel:Power] Entering S4 hibernate");
    return true;
  }

  wake(): boolean {
    if (this.powerState === "S0") return false;
    const from = this.powerState;
    this.powerState = "S0";
    this.stateEnteredAt = Date.now();
    this.wakeCount++;
    this.logEvent("wake", `Waking from ${from} to S0 (Working)`);
    console.log(`[Kernel:Power] Wake from ${from}`);
    return true;
  }

  // ── Governor Control ──────────────────────────────────────

  setGovernor(governor: CpuGovernor): void {
    const prev = this.cpu.governor;
    this.cpu.governor = governor;
    this.logEvent("governor", `CPU governor: ${prev} → ${governor}`);
    console.log(`[Kernel:Power] Governor set to ${governor}`);
  }

  // ── AC Power ──────────────────────────────────────────────

  toggleAC(): void {
    this.battery.acConnected = !this.battery.acConnected;
    this.logEvent("battery", `AC ${this.battery.acConnected ? "connected" : "disconnected"}`);
  }

  // ── Queries ───────────────────────────────────────────────

  getStats(): PowerStats {
    return {
      powerState: this.powerState,
      battery: { ...this.battery },
      cpu: {
        ...this.cpu,
        coreFreqs: [...this.cpu.coreFreqs],
        coreLoads: [...this.cpu.coreLoads],
      },
      thermalZones: this.thermalZones.map(z => ({ ...z, tripPoints: { ...z.tripPoints } })),
      events: this.events,
      uptime: this.powerState === "S0" ? Date.now() - this.stateEnteredAt : 0,
      wakeCount: this.wakeCount,
      sleepCount: this.sleepCount,
      totalThrottleTime: this.totalThrottleTime + (this.cpu.throttled ? Date.now() - this.lastThrottleStart : 0),
    };
  }

  getEventLog(count = 20): readonly PowerEvent[] {
    return this.events.slice(-count);
  }

  private logEvent(type: PowerEvent["type"], detail: string): void {
    this.events.push({ timestamp: Date.now(), type, detail });
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }
}

export const PowerManager = new PowerManagerClass();
