// ═══════════════════════════════════════════════════════════════
// SITA OS — Init System / Service Manager
// Dependency-ordered boot, service lifecycle, watchdog timers,
// target groups, parallel start within dependency tiers
// ═══════════════════════════════════════════════════════════════

export type ServiceState = "inactive" | "starting" | "running" | "stopping" | "failed" | "restarting";
export type RestartPolicy = "always" | "on-failure" | "never";

export interface ServiceUnit {
  id: string;
  description: string;
  dependencies: string[];
  target: BootTarget;
  restartPolicy: RestartPolicy;
  watchdogMs: number;
  state: ServiceState;
  pid?: number;
  startedAt?: number;
  failCount: number;
  lastError?: string;
  exitCode?: number;
}

export type BootTarget =
  | "basic.target"
  | "network.target"
  | "filesystem.target"
  | "security.target"
  | "sita-runtime.target"
  | "desktop.target";

const TARGET_ORDER: BootTarget[] = [
  "basic.target",
  "filesystem.target",
  "security.target",
  "network.target",
  "sita-runtime.target",
  "desktop.target",
];

export class InitSystem {
  private services: Map<string, ServiceUnit> = new Map();
  private bootLog: Array<{ timestamp: number; service: string; event: string; detail?: string }> = [];
  private _currentTarget: BootTarget = "basic.target";
  private _bootStarted = 0;
  private _bootCompleted = 0;
  private _pidCounter = 1000;
  private watchdogTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  register(unit: Omit<ServiceUnit, "state" | "failCount" | "pid" | "startedAt">): void {
    this.services.set(unit.id, {
      ...unit,
      state: "inactive",
      failCount: 0,
    });
  }

  /** Build dependency DAG and return start order (topological sort) */
  private resolveStartOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (id: string, stack: Set<string>) => {
      if (visited.has(id)) return;
      if (stack.has(id)) {
        this.log(id, "circular-dependency-detected", `cycle involving ${id}`);
        return;
      }
      stack.add(id);
      const unit = this.services.get(id);
      if (unit) {
        for (const dep of unit.dependencies) {
          if (this.services.has(dep)) visit(dep, stack);
        }
      }
      stack.delete(id);
      visited.add(id);
      order.push(id);
    };

    // Sort by target order first
    const byTarget = [...this.services.values()].sort(
      (a, b) => TARGET_ORDER.indexOf(a.target) - TARGET_ORDER.indexOf(b.target)
    );
    for (const unit of byTarget) visit(unit.id, new Set());
    return order;
  }

  /** Start a single service */
  private startService(id: string): boolean {
    const unit = this.services.get(id);
    if (!unit) return false;

    // Check dependencies are running
    for (const dep of unit.dependencies) {
      const depUnit = this.services.get(dep);
      if (depUnit && depUnit.state !== "running") {
        this.log(id, "blocked", `waiting on dependency: ${dep}`);
        return false;
      }
    }

    unit.state = "starting";
    this.log(id, "starting");

    // Simulate start (in real OS this would fork/exec)
    unit.pid = ++this._pidCounter;
    unit.startedAt = Date.now();
    unit.state = "running";
    this.log(id, "started", `pid=${unit.pid}`);

    // Setup watchdog
    if (unit.watchdogMs > 0) {
      this.setupWatchdog(id, unit.watchdogMs);
    }

    return true;
  }

  /** Stop a service and its dependents */
  stopService(id: string): void {
    const unit = this.services.get(id);
    if (!unit || unit.state === "inactive") return;

    // Stop dependents first (reverse dependency)
    for (const [sid, svc] of this.services) {
      if (svc.dependencies.includes(id) && svc.state === "running") {
        this.stopService(sid);
      }
    }

    unit.state = "stopping";
    this.log(id, "stopping");

    // Clear watchdog
    const timer = this.watchdogTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.watchdogTimers.delete(id);
    }

    unit.state = "inactive";
    unit.pid = undefined;
    this.log(id, "stopped");
  }

  /** Restart a service */
  restartService(id: string): boolean {
    const unit = this.services.get(id);
    if (!unit) return false;
    unit.state = "restarting";
    this.log(id, "restarting");
    this.stopService(id);
    return this.startService(id);
  }

  /** Mark a service as failed */
  failService(id: string, error: string, exitCode = 1): void {
    const unit = this.services.get(id);
    if (!unit) return;

    unit.state = "failed";
    unit.failCount++;
    unit.lastError = error;
    unit.exitCode = exitCode;
    this.log(id, "failed", error);

    if (unit.restartPolicy === "always" || unit.restartPolicy === "on-failure") {
      if (unit.failCount <= 5) {
        setTimeout(() => this.restartService(id), Math.min(1000 * unit.failCount, 30000));
      } else {
        this.log(id, "max-restarts-exceeded", `failCount=${unit.failCount}`);
      }
    }
  }

  /** Execute full boot sequence */
  boot(): { success: boolean; failed: string[]; order: string[] } {
    this._bootStarted = Date.now();
    this.log("init", "boot-started");

    const order = this.resolveStartOrder();
    const failed: string[] = [];

    for (const id of order) {
      const unit = this.services.get(id)!;
      this._currentTarget = unit.target;

      if (!this.startService(id)) {
        failed.push(id);
      }
    }

    this._bootCompleted = Date.now();
    this.log("init", "boot-completed", `duration=${this._bootCompleted - this._bootStarted}ms, failed=${failed.length}`);

    return { success: failed.length === 0, failed, order };
  }

  /** Shutdown all services in reverse order */
  shutdown(): void {
    this.log("init", "shutdown-initiated");
    const order = this.resolveStartOrder().reverse();
    for (const id of order) {
      this.stopService(id);
    }
    this.log("init", "shutdown-complete");
  }

  private setupWatchdog(id: string, intervalMs: number): void {
    const timer = setInterval(() => {
      const unit = this.services.get(id);
      if (unit && unit.state === "running") {
        // In real OS, this would check /proc or send signal
        // Here we just record the check
        this.log(id, "watchdog-ok");
      }
    }, intervalMs);
    this.watchdogTimers.set(id, timer);
  }

  private log(service: string, event: string, detail?: string): void {
    this.bootLog.push({ timestamp: Date.now(), service, event, detail });
  }

  getService(id: string): ServiceUnit | undefined {
    return this.services.get(id);
  }

  getServicesByTarget(target: BootTarget): ServiceUnit[] {
    return [...this.services.values()].filter(s => s.target === target);
  }

  getBootLog() { return [...this.bootLog]; }

  getStats() {
    const all = [...this.services.values()];
    return {
      totalServices: all.length,
      running: all.filter(s => s.state === "running").length,
      failed: all.filter(s => s.state === "failed").length,
      inactive: all.filter(s => s.state === "inactive").length,
      currentTarget: this._currentTarget,
      bootDurationMs: this._bootCompleted ? this._bootCompleted - this._bootStarted : null,
      bootLogEntries: this.bootLog.length,
    };
  }

  destroy(): void {
    for (const timer of this.watchdogTimers.values()) clearInterval(timer);
    this.watchdogTimers.clear();
  }
}
