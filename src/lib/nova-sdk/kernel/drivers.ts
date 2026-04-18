// ═══════════════════════════════════════════════════════════════
// Nova SDK — Hardware Abstraction Layer (HAL)
// Simulated device drivers completing the kernel stack
// ═══════════════════════════════════════════════════════════════

export type DriverType = "display" | "input" | "audio" | "storage" | "network" | "battery";
export type DriverStatus = "unloaded" | "loading" | "ready" | "error" | "shutdown";

export interface DeviceDriver {
  id: string;
  name: string;
  type: DriverType;
  status: DriverStatus;
  init(): Promise<void> | void;
  shutdown(): void;
  getDiagnostics(): Record<string, unknown>;
}

// ── Display Driver ───────────────────────────────────────────

class DisplayDriverImpl implements DeviceDriver {
  id = "drv-display";
  name = "Display Controller";
  type: DriverType = "display";
  status: DriverStatus = "unloaded";

  init() {
    this.status = "ready";
  }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    return {
      resolution: `${window.screen?.width ?? 1920}x${window.screen?.height ?? 1080}`,
      colorDepth: window.screen?.colorDepth ?? 24,
      pixelRatio: window.devicePixelRatio ?? 1,
      refreshRate: 60,
      hdr: false,
    };
  }
}

// ── Input Driver ─────────────────────────────────────────────

class InputDriverImpl implements DeviceDriver {
  id = "drv-input";
  name = "Input Controller";
  type: DriverType = "input";
  status: DriverStatus = "unloaded";

  init() { this.status = "ready"; }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    return {
      keyboard: true,
      mouse: typeof window !== "undefined" && window.matchMedia("(pointer:fine)").matches,
      touch: typeof navigator !== "undefined" && "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0,
      gamepad: typeof navigator !== "undefined" && "getGamepads" in navigator,
    };
  }
}

// ── Audio Driver ─────────────────────────────────────────────

class AudioDriverImpl implements DeviceDriver {
  id = "drv-audio";
  name = "Audio Controller";
  type: DriverType = "audio";
  status: DriverStatus = "unloaded";

  init() { this.status = "ready"; }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    return {
      sampleRate: 48000,
      channels: 2,
      latencyMs: 10,
      webAudioSupport: typeof AudioContext !== "undefined",
    };
  }
}

// ── Storage Driver ───────────────────────────────────────────

class StorageDriverImpl implements DeviceDriver {
  id = "drv-storage";
  name = "Storage Controller";
  type: DriverType = "storage";
  status: DriverStatus = "unloaded";

  init() { this.status = "ready"; }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    return {
      indexedDB: typeof indexedDB !== "undefined",
      localStorage: typeof localStorage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      quotaEstimateSupport: typeof navigator !== "undefined" && "storage" in navigator,
    };
  }
}

// ── Network Driver ───────────────────────────────────────────

class NetworkDriverImpl implements DeviceDriver {
  id = "drv-network";
  name = "Network Controller";
  type: DriverType = "network";
  status: DriverStatus = "unloaded";

  init() { this.status = "ready"; }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    const conn = (navigator as any).connection;
    return {
      online: navigator.onLine,
      type: conn?.effectiveType ?? "unknown",
      downlinkMbps: conn?.downlink ?? null,
      rttMs: conn?.rtt ?? null,
      saveData: conn?.saveData ?? false,
    };
  }
}

// ── Battery Driver ───────────────────────────────────────────

class BatteryDriverImpl implements DeviceDriver {
  id = "drv-battery";
  name = "Battery Controller";
  type: DriverType = "battery";
  status: DriverStatus = "unloaded";
  private batteryInfo: { level: number; charging: boolean } = { level: 1, charging: false };

  async init() {
    this.status = "loading";
    try {
      const bm = await (navigator as any).getBattery?.();
      if (bm) {
        this.batteryInfo = { level: bm.level, charging: bm.charging };
        bm.addEventListener("levelchange", () => { this.batteryInfo.level = bm.level; });
        bm.addEventListener("chargingchange", () => { this.batteryInfo.charging = bm.charging; });
      }
    } catch { /* Battery API not available */ }
    this.status = "ready";
  }
  shutdown() { this.status = "shutdown"; }
  getDiagnostics() {
    return {
      level: Math.round(this.batteryInfo.level * 100),
      charging: this.batteryInfo.charging,
      apiSupported: "getBattery" in navigator,
    };
  }
}

// ── Driver Manager ───────────────────────────────────────────

class DriverManagerClass {
  private drivers = new Map<string, DeviceDriver>();
  private initOrder: string[] = [];

  registerDriver(driver: DeviceDriver): void {
    this.drivers.set(driver.id, driver);
    this.initOrder.push(driver.id);
  }

  async initAll(): Promise<{ id: string; status: DriverStatus; ms: number }[]> {
    const results: { id: string; status: DriverStatus; ms: number }[] = [];
    for (const id of this.initOrder) {
      const drv = this.drivers.get(id)!;
      const start = performance.now();
      try {
        drv.status = "loading";
        await drv.init();
        results.push({ id, status: drv.status, ms: performance.now() - start });
      } catch {
        drv.status = "error";
        results.push({ id, status: "error", ms: performance.now() - start });
      }
    }
    return results;
  }

  shutdownAll(): void {
    for (const drv of this.drivers.values()) drv.shutdown();
  }

  getDriver(id: string): DeviceDriver | undefined {
    return this.drivers.get(id);
  }

  getAllDrivers(): DeviceDriver[] {
    return Array.from(this.drivers.values());
  }

  getStats() {
    const all = this.getAllDrivers();
    return {
      total: all.length,
      ready: all.filter(d => d.status === "ready").length,
      error: all.filter(d => d.status === "error").length,
      drivers: all.map(d => ({ id: d.id, name: d.name, type: d.type, status: d.status })),
      diagnostics: Object.fromEntries(all.map(d => [d.id, d.getDiagnostics()])),
    };
  }

  reset(): void {
    this.shutdownAll();
    this.drivers.clear();
    this.initOrder = [];
  }
}

export const DriverManager = new DriverManagerClass();

// Register built-in drivers
DriverManager.registerDriver(new DisplayDriverImpl());
DriverManager.registerDriver(new InputDriverImpl());
DriverManager.registerDriver(new AudioDriverImpl());
DriverManager.registerDriver(new StorageDriverImpl());
DriverManager.registerDriver(new NetworkDriverImpl());
DriverManager.registerDriver(new BatteryDriverImpl());
