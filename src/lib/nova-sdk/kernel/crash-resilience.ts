// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Crash Resilience Engine
// Unified process restart, service watchdog, graceful degradation,
// and structured crash logging
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type FaultType =
  | "segfault"
  | "invalid-syscall"
  | "memory-corruption"
  | "stack-overflow"
  | "division-by-zero"
  | "illegal-instruction"
  | "timeout"
  | "unknown";

export type RestartPolicy = "immediate" | "delayed" | "critical-always" | "never";

export type DegradationLevel = "normal" | "warning" | "critical" | "emergency";

export type ComponentClass = "ui" | "service" | "background";

export interface CrashReport {
  id: string;
  pid: number;
  appName: string;
  faultType: FaultType;
  address: string;
  stackTrace: string;
  syscallHistory: string[];
  memoryState: {
    heapUsed: number;
    heapTotal: number;
    stackDepth: number;
  };
  timestamp: number;
  restartAttempt: number;
  resolved: boolean;
}

export interface AppState {
  windowLayout: { x: number; y: number; width: number; height: number; minimized: boolean };
  openFiles: string[];
  memorySnapshot: Map<string, unknown>;
  focusedElement: string | null;
  scrollPositions: Map<string, number>;
}

interface ProcessEntry {
  pid: number;
  appName: string;
  restartPolicy: RestartPolicy;
  crashCount: number;
  lastCrashTime: number;
  savedState: AppState | null;
  syscallHistory: string[];
  isCritical: boolean;
}

interface HeartbeatEntry {
  componentId: string;
  componentClass: ComponentClass;
  lastBeat: number;
  thresholdMs: number;
  missedBeats: number;
  restartCount: number;
  maxRestarts: number;
  onRestart?: () => void;
}

// ── Constants ──────────────────────────────────────────────────

const HEARTBEAT_THRESHOLDS: Record<ComponentClass, number> = {
  ui: 100,
  service: 500,
  background: 2000,
};

const MAX_CRASH_REPORTS = 500;
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_DELAY_BASE_MS = 500; // Exponential backoff base
const WATCHDOG_INTERVAL_MS = 50;

// ── Process Restart Manager ────────────────────────────────────

export class ProcessRestartManager {
  private processes = new Map<number, ProcessEntry>();
  private stateSnapshots = new Map<number, AppState>();

  register(pid: number, appName: string, policy: RestartPolicy, isCritical = false): void {
    this.processes.set(pid, {
      pid,
      appName,
      restartPolicy: policy,
      crashCount: 0,
      lastCrashTime: 0,
      savedState: null,
      syscallHistory: [],
      isCritical,
    });
  }

  unregister(pid: number): void {
    this.processes.delete(pid);
    this.stateSnapshots.delete(pid);
  }

  saveState(pid: number, state: AppState): void {
    this.stateSnapshots.set(pid, { ...state });
    const proc = this.processes.get(pid);
    if (proc) proc.savedState = state;
  }

  getState(pid: number): AppState | null {
    return this.stateSnapshots.get(pid) ?? null;
  }

  recordSyscall(pid: number, syscallName: string): void {
    const proc = this.processes.get(pid);
    if (!proc) return;
    proc.syscallHistory.push(syscallName);
    // Keep last 50 syscalls
    if (proc.syscallHistory.length > 50) {
      proc.syscallHistory = proc.syscallHistory.slice(-50);
    }
  }

  /**
   * Handle a process crash. Returns restart info or null if terminated.
   */
  handleCrash(pid: number): {
    shouldRestart: boolean;
    delayMs: number;
    attempt: number;
    savedState: AppState | null;
  } {
    const proc = this.processes.get(pid);
    if (!proc) return { shouldRestart: false, delayMs: 0, attempt: 0, savedState: null };

    proc.crashCount++;
    proc.lastCrashTime = Date.now();

    if (proc.restartPolicy === "never") {
      return { shouldRestart: false, delayMs: 0, attempt: proc.crashCount, savedState: null };
    }

    // Critical apps always restart
    if (proc.isCritical || proc.restartPolicy === "critical-always") {
      const delay = proc.crashCount > 3 ? RESTART_DELAY_BASE_MS * Math.pow(2, proc.crashCount - 3) : 0;
      return {
        shouldRestart: true,
        delayMs: Math.min(delay, 30000),
        attempt: proc.crashCount,
        savedState: this.stateSnapshots.get(pid) ?? null,
      };
    }

    // Non-critical: enforce max restart limit
    if (proc.crashCount >= MAX_RESTART_ATTEMPTS) {
      return { shouldRestart: false, delayMs: 0, attempt: proc.crashCount, savedState: null };
    }

    // First crash: immediate. Subsequent: exponential backoff
    const delayMs =
      proc.restartPolicy === "immediate" && proc.crashCount === 1
        ? 0
        : RESTART_DELAY_BASE_MS * Math.pow(2, proc.crashCount - 1);

    return {
      shouldRestart: true,
      delayMs: Math.min(delayMs, 30000),
      attempt: proc.crashCount,
      savedState: this.stateSnapshots.get(pid) ?? null,
    };
  }

  getProcess(pid: number): ProcessEntry | undefined {
    return this.processes.get(pid);
  }

  getAll(): ProcessEntry[] {
    return Array.from(this.processes.values());
  }

  reset(): void {
    this.processes.clear();
    this.stateSnapshots.clear();
  }
}

// ── Service Watchdog ───────────────────────────────────────────

export class ServiceWatchdog {
  private registry = new Map<string, HeartbeatEntry>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private frozenCallbacks: Array<(componentId: string) => void> = [];

  registerComponent(
    componentId: string,
    componentClass: ComponentClass,
    onRestart?: () => void,
    maxRestarts = 3
  ): void {
    this.registry.set(componentId, {
      componentId,
      componentClass,
      lastBeat: Date.now(),
      thresholdMs: HEARTBEAT_THRESHOLDS[componentClass],
      missedBeats: 0,
      restartCount: 0,
      maxRestarts,
      onRestart,
    });
  }

  unregisterComponent(componentId: string): void {
    this.registry.delete(componentId);
  }

  heartbeat(componentId: string): void {
    const entry = this.registry.get(componentId);
    if (entry) {
      entry.lastBeat = Date.now();
      entry.missedBeats = 0;
    }
  }

  onFreeze(callback: (componentId: string) => void): void {
    this.frozenCallbacks.push(callback);
  }

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.check(), WATCHDOG_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  check(): string[] {
    const now = Date.now();
    const frozen: string[] = [];

    for (const [id, entry] of this.registry) {
      const elapsed = now - entry.lastBeat;
      if (elapsed > entry.thresholdMs) {
        entry.missedBeats++;
        frozen.push(id);

        if (entry.restartCount < entry.maxRestarts) {
          entry.restartCount++;
          entry.lastBeat = now; // Reset after restart attempt
          entry.missedBeats = 0;
          console.warn(
            `[Watchdog] Component "${id}" frozen (${elapsed}ms > ${entry.thresholdMs}ms). Restarting (attempt ${entry.restartCount}/${entry.maxRestarts})`
          );
          entry.onRestart?.();
        } else {
          console.error(
            `[Watchdog] Component "${id}" exceeded max restarts (${entry.maxRestarts}). Disabled.`
          );
        }

        for (const cb of this.frozenCallbacks) {
          try { cb(id); } catch { /* isolation */ }
        }
      }
    }

    return frozen;
  }

  getStatus(): Array<{
    componentId: string;
    componentClass: ComponentClass;
    healthy: boolean;
    lastBeatAgo: number;
    restartCount: number;
  }> {
    const now = Date.now();
    return Array.from(this.registry.values()).map((e) => ({
      componentId: e.componentId,
      componentClass: e.componentClass,
      healthy: now - e.lastBeat <= e.thresholdMs,
      lastBeatAgo: now - e.lastBeat,
      restartCount: e.restartCount,
    }));
  }

  reset(): void {
    this.stop();
    this.registry.clear();
    this.frozenCallbacks = [];
  }
}

// ── Graceful Degradation ───────────────────────────────────────

export interface DegradationPolicy {
  animationsEnabled: boolean;
  backgroundTasksEnabled: boolean;
  maxNewProcesses: number;
  compositorQuality: "full" | "reduced" | "minimal";
  syncEnabled: boolean;
}

const DEGRADATION_POLICIES: Record<DegradationLevel, DegradationPolicy> = {
  normal: {
    animationsEnabled: true,
    backgroundTasksEnabled: true,
    maxNewProcesses: Infinity,
    compositorQuality: "full",
    syncEnabled: true,
  },
  warning: {
    animationsEnabled: true,
    backgroundTasksEnabled: true,
    maxNewProcesses: 10,
    compositorQuality: "reduced",
    syncEnabled: true,
  },
  critical: {
    animationsEnabled: false,
    backgroundTasksEnabled: false,
    maxNewProcesses: 3,
    compositorQuality: "minimal",
    syncEnabled: false,
  },
  emergency: {
    animationsEnabled: false,
    backgroundTasksEnabled: false,
    maxNewProcesses: 0,
    compositorQuality: "minimal",
    syncEnabled: false,
  },
};

export class GracefulDegradation {
  private level: DegradationLevel = "normal";
  private listeners: Array<(level: DegradationLevel, policy: DegradationPolicy) => void> = [];

  /**
   * Evaluate resource pressure and return the appropriate degradation level.
   */
  evaluate(pressure: {
    memoryUsage: number; // 0-1
    cpuUsage: number; // 0-1
    processCount: number;
    maxProcesses: number;
  }): DegradationLevel {
    const memPct = pressure.memoryUsage;
    const cpuPct = pressure.cpuUsage;
    const procPct = pressure.processCount / pressure.maxProcesses;

    let newLevel: DegradationLevel = "normal";

    if (memPct > 0.95 || cpuPct > 0.95 || procPct > 0.95) {
      newLevel = "emergency";
    } else if (memPct > 0.85 || cpuPct > 0.85 || procPct > 0.85) {
      newLevel = "critical";
    } else if (memPct > 0.7 || cpuPct > 0.7 || procPct > 0.7) {
      newLevel = "warning";
    }

    if (newLevel !== this.level) {
      this.level = newLevel;
      const policy = this.getPolicy();
      console.log(`[Degradation] Level changed to ${newLevel}`, policy);
      for (const listener of this.listeners) {
        try { listener(newLevel, policy); } catch { /* isolation */ }
      }
    }

    return this.level;
  }

  getLevel(): DegradationLevel {
    return this.level;
  }

  getPolicy(): DegradationPolicy {
    return { ...DEGRADATION_POLICIES[this.level] };
  }

  onLevelChange(callback: (level: DegradationLevel, policy: DegradationPolicy) => void): void {
    this.listeners.push(callback);
  }

  setLevel(level: DegradationLevel): void {
    this.level = level;
  }

  reset(): void {
    this.level = "normal";
    this.listeners = [];
  }
}

// ── Crash Logger ───────────────────────────────────────────────

export class CrashLogger {
  private reports: CrashReport[] = [];
  private nextId = 1;

  log(params: Omit<CrashReport, "id" | "timestamp" | "resolved">): CrashReport {
    const report: CrashReport = {
      ...params,
      id: `crash-${this.nextId++}`,
      timestamp: Date.now(),
      resolved: false,
    };

    this.reports.push(report);

    // Bounded log
    if (this.reports.length > MAX_CRASH_REPORTS) {
      this.reports = this.reports.slice(-MAX_CRASH_REPORTS);
    }

    console.error(
      `[CrashLogger] ── Crash Report ──\n` +
      `  App: ${report.appName} (PID ${report.pid})\n` +
      `  Fault: ${report.faultType}\n` +
      `  Address: ${report.address}\n` +
      `  Restart Attempt: ${report.restartAttempt}\n` +
      `  Last Syscalls: [${report.syscallHistory.slice(-5).join(", ")}]`
    );

    return report;
  }

  resolve(reportId: string): void {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) report.resolved = true;
  }

  queryByPid(pid: number): CrashReport[] {
    return this.reports.filter((r) => r.pid === pid);
  }

  queryByApp(appName: string): CrashReport[] {
    return this.reports.filter((r) => r.appName === appName);
  }

  queryByTime(since: number): CrashReport[] {
    return this.reports.filter((r) => r.timestamp >= since);
  }

  getAll(): CrashReport[] {
    return [...this.reports];
  }

  getStats() {
    const unresolved = this.reports.filter((r) => !r.resolved).length;
    const byType: Record<string, number> = {};
    for (const r of this.reports) {
      byType[r.faultType] = (byType[r.faultType] || 0) + 1;
    }
    return { total: this.reports.length, unresolved, byType };
  }

  clear(): void {
    this.reports = [];
    this.nextId = 1;
  }
}

// ── Crash Resilience Engine (Orchestrator) ─────────────────────

export class CrashResilienceEngine {
  readonly restartManager = new ProcessRestartManager();
  readonly watchdog = new ServiceWatchdog();
  readonly degradation = new GracefulDegradation();
  readonly logger = new CrashLogger();

  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.watchdog.start();

    // Wire watchdog freezes to crash logger
    this.watchdog.onFreeze((componentId) => {
      this.logger.log({
        pid: -1,
        appName: componentId,
        faultType: "timeout",
        address: "N/A",
        stackTrace: `Service "${componentId}" failed heartbeat check`,
        syscallHistory: [],
        memoryState: { heapUsed: 0, heapTotal: 0, stackDepth: 0 },
        restartAttempt: 0,
      });
    });

    console.log("[CrashResilience] Engine started — watchdog active, degradation monitoring enabled");
  }

  stop(): void {
    this.running = false;
    this.watchdog.stop();
    console.log("[CrashResilience] Engine stopped");
  }

  /**
   * Report a process crash. Handles logging, restart decision, state restoration.
   */
  reportCrash(
    pid: number,
    faultType: FaultType,
    stackTrace: string,
    address = "0x00000000"
  ): {
    restarted: boolean;
    delayMs: number;
    report: CrashReport;
    restoredState: AppState | null;
  } {
    const proc = this.restartManager.getProcess(pid);
    const appName = proc?.appName ?? `pid-${pid}`;
    const syscallHistory = proc?.syscallHistory ?? [];

    // Decide restart
    const decision = this.restartManager.handleCrash(pid);

    // Log crash
    const report = this.logger.log({
      pid,
      appName,
      faultType,
      address,
      stackTrace,
      syscallHistory: [...syscallHistory],
      memoryState: {
        heapUsed: 0,
        heapTotal: 0,
        stackDepth: 0,
      },
      restartAttempt: decision.attempt,
    });

    if (decision.shouldRestart) {
      report.resolved = true;
      console.log(
        `[CrashResilience] Process "${appName}" (PID ${pid}) will restart in ${decision.delayMs}ms (attempt ${decision.attempt})`
      );
    } else {
      console.warn(
        `[CrashResilience] Process "${appName}" (PID ${pid}) terminated — restart policy exhausted after ${decision.attempt} attempts`
      );
    }

    return {
      restarted: decision.shouldRestart,
      delayMs: decision.delayMs,
      report,
      restoredState: decision.savedState,
    };
  }

  /**
   * Send heartbeat for a component.
   */
  heartbeat(componentId: string): void {
    this.watchdog.heartbeat(componentId);
  }

  /**
   * Check overall system health.
   */
  checkHealth(): {
    degradationLevel: DegradationLevel;
    policy: DegradationPolicy;
    watchdogStatus: ReturnType<ServiceWatchdog["getStatus"]>;
    crashStats: ReturnType<CrashLogger["getStats"]>;
  } {
    return {
      degradationLevel: this.degradation.getLevel(),
      policy: this.degradation.getPolicy(),
      watchdogStatus: this.watchdog.getStatus(),
      crashStats: this.logger.getStats(),
    };
  }

  getDegradationLevel(): DegradationLevel {
    return this.degradation.getLevel();
  }

  reset(): void {
    this.stop();
    this.restartManager.reset();
    this.watchdog.reset();
    this.degradation.reset();
    this.logger.clear();
  }
}

// ── Singleton ──────────────────────────────────────────────────

export const CrashResilience = new CrashResilienceEngine();
