// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Device Driver Manager
// User-space drivers, hot-plug, capability sandboxing
// ═══════════════════════════════════════════════════════════════

export type DriverSpace = "kernel" | "user";
export type DriverState = "unloaded" | "loading" | "active" | "suspended" | "failed" | "unloading";
export type BusType = "pci" | "usb" | "nvme" | "i2c" | "spi" | "platform" | "virtual";

export interface DeviceDescriptor {
  id: string;
  vendorId: string;
  productId: string;
  bus: BusType;
  class: string;
  name: string;
  path: string; // sysfs-style path
  detectedAt: number;
  hotPluggable: boolean;
}

export interface DriverDescriptor {
  id: string;
  name: string;
  version: string;
  space: DriverSpace;
  supportedDevices: { vendorId: string; productId: string; class?: string }[];
  capabilities: DriverCapability[];
  signatureValid: boolean;
  signingAuthority: string;
  state: DriverState;
  boundDevices: string[];
  faultCount: number;
  lastFaultAt: number | null;
  loadedAt: number | null;
  pid: number | null; // PID of user-space driver process
}

export interface DriverCapability {
  type: "mmio" | "dma" | "irq" | "ioport" | "gpio";
  resource: string;
  granted: boolean;
}

export interface HotPlugEvent {
  type: "attach" | "detach";
  device: DeviceDescriptor;
  timestamp: number;
  driverBound: string | null;
}

export class DriverManager {
  private devices = new Map<string, DeviceDescriptor>();
  private drivers = new Map<string, DriverDescriptor>();
  private hotPlugLog: HotPlugEvent[] = [];

  constructor() {
    // Register built-in kernel-space drivers
    this.registerDriver({
      id: "drv-timer", name: "HPET Timer", version: "1.0.0", space: "kernel",
      supportedDevices: [{ vendorId: "*", productId: "*", class: "timer" }],
      capabilities: [{ type: "irq", resource: "IRQ0", granted: true }],
      signatureValid: true, signingAuthority: "SITA OS Kernel",
      state: "active", boundDevices: [], faultCount: 0, lastFaultAt: null, loadedAt: Date.now(), pid: null,
    });
    this.registerDriver({
      id: "drv-intc", name: "APIC Interrupt Controller", version: "1.0.0", space: "kernel",
      supportedDevices: [{ vendorId: "*", productId: "*", class: "interrupt-controller" }],
      capabilities: [{ type: "mmio", resource: "0xFEE00000", granted: true }],
      signatureValid: true, signingAuthority: "SITA OS Kernel",
      state: "active", boundDevices: [], faultCount: 0, lastFaultAt: null, loadedAt: Date.now(), pid: null,
    });
    this.registerDriver({
      id: "drv-mmu", name: "MMU Driver", version: "1.0.0", space: "kernel",
      supportedDevices: [{ vendorId: "*", productId: "*", class: "mmu" }],
      capabilities: [],
      signatureValid: true, signingAuthority: "SITA OS Kernel",
      state: "active", boundDevices: [], faultCount: 0, lastFaultAt: null, loadedAt: Date.now(), pid: null,
    });
  }

  registerDriver(driver: DriverDescriptor): void {
    this.drivers.set(driver.id, driver);
  }

  detectDevice(device: DeviceDescriptor): { bound: boolean; driverId: string | null } {
    this.devices.set(device.id, device);

    // Find matching driver
    for (const [, driver] of this.drivers) {
      const match = driver.supportedDevices.some(sd =>
        (sd.vendorId === "*" || sd.vendorId === device.vendorId) &&
        (sd.productId === "*" || sd.productId === device.productId) &&
        (!sd.class || sd.class === device.class)
      );
      if (match && driver.signatureValid) {
        driver.boundDevices.push(device.id);
        if (driver.state === "unloaded") {
          driver.state = "active";
          driver.loadedAt = Date.now();
        }
        this.hotPlugLog.push({ type: "attach", device, timestamp: Date.now(), driverBound: driver.id });
        return { bound: true, driverId: driver.id };
      }
    }
    this.hotPlugLog.push({ type: "attach", device, timestamp: Date.now(), driverBound: null });
    return { bound: false, driverId: null };
  }

  detachDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    if (!device.hotPluggable) return false;

    for (const [, driver] of this.drivers) {
      const idx = driver.boundDevices.indexOf(deviceId);
      if (idx !== -1) {
        driver.boundDevices.splice(idx, 1);
        if (driver.boundDevices.length === 0 && driver.space === "user") {
          driver.state = "unloaded";
          driver.pid = null;
        }
      }
    }

    this.devices.delete(deviceId);
    this.hotPlugLog.push({ type: "detach", device, timestamp: Date.now(), driverBound: null });
    return true;
  }

  reportFault(driverId: string): { action: "restart" | "disable"; isolated: boolean } {
    const driver = this.drivers.get(driverId);
    if (!driver) return { action: "disable", isolated: false };

    driver.faultCount++;
    driver.lastFaultAt = Date.now();

    if (driver.space === "user") {
      // User-space driver crash is isolated — restart
      if (driver.faultCount < 3) {
        driver.state = "loading";
        setTimeout(() => { driver.state = "active"; }, 100);
        return { action: "restart", isolated: true };
      }
      driver.state = "failed";
      return { action: "disable", isolated: true };
    }

    // Kernel-space driver fault — more serious
    driver.state = "failed";
    return { action: "disable", isolated: false };
  }

  getDriver(id: string): DriverDescriptor | undefined { return this.drivers.get(id); }
  getDevice(id: string): DeviceDescriptor | undefined { return this.devices.get(id); }
  listDrivers(): DriverDescriptor[] { return Array.from(this.drivers.values()); }
  listDevices(): DeviceDescriptor[] { return Array.from(this.devices.values()); }
  getHotPlugLog(): HotPlugEvent[] { return [...this.hotPlugLog]; }

  getStats() {
    const bySpace: Record<string, number> = {};
    const byState: Record<string, number> = {};
    for (const d of this.drivers.values()) {
      bySpace[d.space] = (bySpace[d.space] ?? 0) + 1;
      byState[d.state] = (byState[d.state] ?? 0) + 1;
    }
    return { totalDrivers: this.drivers.size, totalDevices: this.devices.size, bySpace, byState, hotPlugEvents: this.hotPlugLog.length };
  }
}
