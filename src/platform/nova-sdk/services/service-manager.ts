// ═══════════════════════════════════════════════════════════════
// Nova SDK — Service Manager (Orchestrator)
// Lifecycle management, dependency resolution, health monitoring
// ═══════════════════════════════════════════════════════════════

import { NovaEvents } from "../input/events";

export type ServiceStatus = "stopped" | "starting" | "running" | "failed" | "stopping";
export type RestartPolicy = "always" | "on-failure" | "never";

export interface SystemService {
  id: string;
  status: ServiceStatus;
  boot(): Promise<void> | void;
  shutdown(): Promise<void> | void;
  getStats(): Record<string, unknown>;
  getDiagnostics(): Record<string, unknown>;
}

export interface ServiceDescriptor {
  id: string;
  factory: () => SystemService;
  dependencies: string[];
  priority: number;
  restartPolicy: RestartPolicy;
}

export interface ServiceLogEntry {
  serviceId: string;
  status: "ok" | "error";
  timestampMs: number;
  message: string;
}

class ServiceManagerClass {
  private descriptors = new Map<string, ServiceDescriptor>();
  private instances = new Map<string, SystemService>();
  private healthTimers = new Map<string, ReturnType<typeof setInterval>>();
  private bootLog: ServiceLogEntry[] = [];
  private booted = false;

  /** Register a service descriptor */
  register(descriptor: ServiceDescriptor): void {
    if (this.booted) {
      console.warn(`[ServiceManager] Cannot register "${descriptor.id}" after boot`);
      return;
    }
    this.descriptors.set(descriptor.id, descriptor);
  }

  /** Boot all services in dependency order */
  async boot(): Promise<ServiceLogEntry[]> {
    if (this.booted) return this.bootLog;
    this.bootLog = [];

    console.log("\n┌────────────────────────────────────────┐");
    console.log("│   SYSTEM SERVICES — BOOT SEQUENCE      │");
    console.log("└────────────────────────────────────────┘");

    const order = this.topologicalSort();

    for (const id of order) {
      const desc = this.descriptors.get(id)!;
      const start = performance.now();

      try {
        NovaEvents.emit("app:state-change", { serviceId: id, status: "starting" });
        const instance = desc.factory();
        this.instances.set(id, instance);

        await instance.boot();
        (instance as any).status = "running";

        const elapsed = performance.now() - start;
        this.bootLog.push({ serviceId: id, status: "ok", timestampMs: elapsed, message: `${id} ready` });
        console.log(`  ✓ ${id} (${elapsed.toFixed(1)}ms)`);

        NovaEvents.emit("app:state-change", { serviceId: id, status: "running" });
        this.startHealthCheck(id, desc);
      } catch (e) {
        const elapsed = performance.now() - start;
        this.bootLog.push({ serviceId: id, status: "error", timestampMs: elapsed, message: `${id} FAILED: ${e}` });
        console.error(`  ✗ ${id} FAILED:`, e);
        NovaEvents.emit("app:state-change", { serviceId: id, status: "failed" });
      }
    }

    this.booted = true;
    console.log(`[ServiceManager] All services booted (${order.length} services)`);
    return this.bootLog;
  }

  /** Shutdown all services in reverse dependency order */
  async shutdown(): Promise<void> {
    if (!this.booted) return;
    console.log("[ServiceManager] Shutdown initiated...");

    // Stop health checks
    for (const [, timer] of this.healthTimers) clearInterval(timer);
    this.healthTimers.clear();

    const order = this.topologicalSort().reverse();
    for (const id of order) {
      const instance = this.instances.get(id);
      if (!instance) continue;
      try {
        await instance.shutdown();
        (instance as any).status = "stopped";
        NovaEvents.emit("app:state-change", { serviceId: id, status: "stopped" });
      } catch (e) {
        console.error(`[ServiceManager] Error shutting down ${id}:`, e);
      }
    }

    this.instances.clear();
    this.booted = false;
    console.log("[ServiceManager] All services stopped");
  }

  /** Get a running service by ID */
  getService<T extends SystemService>(id: string): T | undefined {
    return this.instances.get(id) as T | undefined;
  }

  /** Get boot log */
  getBootLog(): readonly ServiceLogEntry[] {
    return this.bootLog;
  }

  /** Get combined stats from all services */
  getStats() {
    const stats: Record<string, Record<string, unknown>> = {};
    for (const [id, instance] of this.instances) {
      stats[id] = instance.getStats();
    }
    return { booted: this.booted, serviceCount: this.instances.size, services: stats };
  }

  /** Get combined diagnostics */
  getDiagnostics() {
    const diag: Record<string, Record<string, unknown>> = {};
    for (const [id, instance] of this.instances) {
      diag[id] = { ...instance.getDiagnostics(), status: instance.status };
    }
    return diag;
  }

  isBooted(): boolean { return this.booted; }

  reset(): void {
    for (const [, timer] of this.healthTimers) clearInterval(timer);
    this.healthTimers.clear();
    this.instances.clear();
    this.descriptors.clear();
    this.bootLog = [];
    this.booted = false;
  }

  // ── Private ──

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string, stack: Set<string>) => {
      if (visited.has(id)) return;
      if (stack.has(id)) {
        console.warn(`[ServiceManager] Circular dependency detected at "${id}"`);
        return;
      }
      stack.add(id);
      const desc = this.descriptors.get(id);
      if (desc) {
        for (const dep of desc.dependencies) visit(dep, stack);
      }
      stack.delete(id);
      visited.add(id);
      result.push(id);
    };

    // Sort by priority first, then resolve dependencies
    const sorted = [...this.descriptors.values()].sort((a, b) => a.priority - b.priority);
    for (const desc of sorted) visit(desc.id, new Set());

    return result;
  }

  private startHealthCheck(id: string, desc: ServiceDescriptor): void {
    const timer = setInterval(() => {
      const instance = this.instances.get(id);
      if (!instance) return;

      if (instance.status === "failed" && desc.restartPolicy !== "never") {
        console.log(`[ServiceManager] Restarting failed service: ${id}`);
        try {
          instance.boot();
          (instance as any).status = "running";
          NovaEvents.emit("app:state-change", { serviceId: id, status: "running" });
        } catch {
          console.error(`[ServiceManager] Restart failed for: ${id}`);
        }
      }
    }, 5000);
    this.healthTimers.set(id, timer);
  }
}

export const ServiceManager = new ServiceManagerClass();
