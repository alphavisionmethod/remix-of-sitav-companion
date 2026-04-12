// ═══════════════════════════════════════════════════════════════
// Nova SDK — Managed App Runtime
// Per-app runtime environment: Memory Safety, Event Loop,
// Resource Tracking, Error Boundary (like Cocoa / .NET AppDomain)
// ═══════════════════════════════════════════════════════════════

// ── Event Loop Priority ──────────────────────────────────────

export type EventPriority = "immediate" | "normal" | "idle";

interface QueuedEvent {
  id: number;
  priority: EventPriority;
  handler: () => void;
  scheduledAt: number;
  label?: string;
}

// ── App Event Loop ───────────────────────────────────────────

export class AppEventLoop {
  private queue: QueuedEvent[] = [];
  private nextId = 1;
  private running = false;
  private paused = false;
  private rafHandle: number | null = null;
  private tickCount = 0;
  private totalProcessed = 0;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.tick();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    if (!this.running) return;
    this.paused = false;
    this.tick();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.queue = [];
  }

  postMessage(handler: () => void, label?: string): number {
    return this.enqueue("normal", handler, label);
  }

  defer(handler: () => void, label?: string): number {
    return this.enqueue("idle", handler, label);
  }

  schedule(handler: () => void, label?: string): number {
    return this.enqueue("immediate", handler, label);
  }

  cancel(eventId: number): boolean {
    const idx = this.queue.findIndex(e => e.id === eventId);
    if (idx >= 0) { this.queue.splice(idx, 1); return true; }
    return false;
  }

  get pending(): number { return this.queue.length; }
  get isRunning(): boolean { return this.running && !this.paused; }
  get stats() {
    return {
      pending: this.queue.length,
      tickCount: this.tickCount,
      totalProcessed: this.totalProcessed,
      running: this.running,
      paused: this.paused,
    };
  }

  private enqueue(priority: EventPriority, handler: () => void, label?: string): number {
    const id = this.nextId++;
    this.queue.push({ id, priority, handler, scheduledAt: Date.now(), label });
    // Sort: immediate first, then normal, then idle
    this.queue.sort((a, b) => {
      const order: Record<EventPriority, number> = { immediate: 0, normal: 1, idle: 2 };
      return order[a.priority] - order[b.priority];
    });
    return id;
  }

  private tick = (): void => {
    if (!this.running || this.paused) return;
    this.tickCount++;

    // Process up to 8 events per tick to avoid blocking
    let processed = 0;
    while (this.queue.length > 0 && processed < 8) {
      const event = this.queue.shift()!;
      try {
        event.handler();
      } catch (e) {
        console.error(`[AppEventLoop] Error in event "${event.label || event.id}":`, e);
      }
      processed++;
      this.totalProcessed++;
    }

    if (this.running) {
      this.rafHandle = requestAnimationFrame(this.tick);
    }
  };
}

// ── App Memory Guard ─────────────────────────────────────────

export interface MemoryLimits {
  softLimitMB: number;
  hardLimitMB: number;
}

interface TrackedAllocation {
  id: string;
  label: string;
  sizeBytes: number;
  allocatedAt: number;
}

export class AppMemoryGuard {
  private allocations = new Map<string, TrackedAllocation>();
  private totalAllocated = 0;
  private readonly limits: MemoryLimits;
  private nextId = 1;
  private warnings: string[] = [];

  constructor(limits: MemoryLimits = { softLimitMB: 64, hardLimitMB: 128 }) {
    this.limits = limits;
  }

  allocate(sizeBytes: number, label = "unnamed"): string | null {
    const newTotal = this.totalAllocated + sizeBytes;
    const hardBytes = this.limits.hardLimitMB * 1024 * 1024;
    const softBytes = this.limits.softLimitMB * 1024 * 1024;

    if (newTotal > hardBytes) {
      const msg = `[MemoryGuard] HARD LIMIT: Denied ${label} (${(sizeBytes / 1024).toFixed(1)}KB) — would exceed ${this.limits.hardLimitMB}MB`;
      console.error(msg);
      this.warnings.push(msg);
      return null;
    }

    if (newTotal > softBytes) {
      const msg = `[MemoryGuard] SOFT LIMIT: ${label} pushing total to ${(newTotal / 1024 / 1024).toFixed(1)}MB (soft: ${this.limits.softLimitMB}MB)`;
      console.warn(msg);
      this.warnings.push(msg);
    }

    const id = `alloc-${this.nextId++}`;
    this.allocations.set(id, { id, label, sizeBytes, allocatedAt: Date.now() });
    this.totalAllocated = newTotal;
    return id;
  }

  free(id: string): boolean {
    const alloc = this.allocations.get(id);
    if (!alloc) return false;
    this.totalAllocated -= alloc.sizeBytes;
    this.allocations.delete(id);
    return true;
  }

  cleanup(): { freedCount: number; freedBytes: number } {
    const count = this.allocations.size;
    const bytes = this.totalAllocated;
    this.allocations.clear();
    this.totalAllocated = 0;
    if (count > 0) {
      console.log(`[MemoryGuard] Cleanup: freed ${count} allocations (${(bytes / 1024).toFixed(1)}KB)`);
    }
    return { freedCount: count, freedBytes: bytes };
  }

  detectLeaks(): TrackedAllocation[] {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    return Array.from(this.allocations.values())
      .filter(a => now - a.allocatedAt > staleThreshold);
  }

  get stats() {
    return {
      totalAllocatedMB: this.totalAllocated / 1024 / 1024,
      allocationCount: this.allocations.size,
      softLimitMB: this.limits.softLimitMB,
      hardLimitMB: this.limits.hardLimitMB,
      utilizationPct: (this.totalAllocated / (this.limits.hardLimitMB * 1024 * 1024)) * 100,
      warnings: [...this.warnings],
      leaks: this.detectLeaks(),
    };
  }
}

// ── App Resource Tracker ─────────────────────────────────────

type ResourceType = "interval" | "timeout" | "listener" | "subscription";

interface TrackedResource {
  type: ResourceType;
  id: number | string;
  label?: string;
  cleanup: () => void;
  createdAt: number;
}

export class AppResourceTracker {
  private resources = new Map<string, TrackedResource>();
  private nextKey = 1;

  trackInterval(handler: () => void, ms: number, label?: string): number {
    const id = window.setInterval(handler, ms);
    const key = `interval-${this.nextKey++}`;
    this.resources.set(key, {
      type: "interval",
      id,
      label,
      cleanup: () => clearInterval(id),
      createdAt: Date.now(),
    });
    return id;
  }

  trackTimeout(handler: () => void, ms: number, label?: string): number {
    const key = `timeout-${this.nextKey++}`;
    const id = window.setTimeout(() => {
      handler();
      this.resources.delete(key); // Auto-remove on fire
    }, ms);
    this.resources.set(key, {
      type: "timeout",
      id,
      label,
      cleanup: () => clearTimeout(id),
      createdAt: Date.now(),
    });
    return id;
  }

  trackListener(target: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions, label?: string): () => void {
    target.addEventListener(event, handler, options);
    const key = `listener-${this.nextKey++}`;
    const cleanup = () => { target.removeEventListener(event, handler, options); };
    this.resources.set(key, {
      type: "listener",
      id: key,
      label: label || `${event}@${(target as any).tagName || "window"}`,
      cleanup,
      createdAt: Date.now(),
    });
    return cleanup;
  }

  trackSubscription(unsubscribe: () => void, label?: string): string {
    const key = `sub-${this.nextKey++}`;
    this.resources.set(key, {
      type: "subscription",
      id: key,
      label,
      cleanup: unsubscribe,
      createdAt: Date.now(),
    });
    return key;
  }

  untrack(key: string): void {
    const res = this.resources.get(key);
    if (res) { res.cleanup(); this.resources.delete(key); }
  }

  cleanupAll(): { freedCount: number; byType: Record<ResourceType, number> } {
    const byType: Record<ResourceType, number> = { interval: 0, timeout: 0, listener: 0, subscription: 0 };
    let count = 0;
    for (const [, res] of this.resources) {
      try { res.cleanup(); } catch {}
      byType[res.type]++;
      count++;
    }
    this.resources.clear();
    if (count > 0) {
      console.log(`[ResourceTracker] Cleaned ${count} resources:`, byType);
    }
    return { freedCount: count, byType };
  }

  get stats() {
    const byType: Record<ResourceType, number> = { interval: 0, timeout: 0, listener: 0, subscription: 0 };
    for (const res of this.resources.values()) byType[res.type]++;
    return { total: this.resources.size, byType };
  }
}

// ── App Error Boundary ───────────────────────────────────────

export type RestartPolicy = "never" | "on-crash" | "always";

export class AppErrorBoundary {
  private crashCount = 0;
  private errors: Array<{ error: Error; timestamp: number }> = [];
  private readonly maxCrashes: number;
  readonly restartPolicy: RestartPolicy;
  private onCrashCallback?: (error: Error, count: number) => void;

  constructor(restartPolicy: RestartPolicy = "on-crash", maxCrashes = 3) {
    this.restartPolicy = restartPolicy;
    this.maxCrashes = maxCrashes;
  }

  onCrash(callback: (error: Error, count: number) => void): void {
    this.onCrashCallback = callback;
  }

  handleError(error: Error): { shouldRestart: boolean } {
    this.crashCount++;
    this.errors.push({ error, timestamp: Date.now() });
    console.error(`[AppErrorBoundary] Crash #${this.crashCount}:`, error.message);

    this.onCrashCallback?.(error, this.crashCount);

    if (this.restartPolicy === "never") return { shouldRestart: false };
    if (this.crashCount >= this.maxCrashes) {
      console.error(`[AppErrorBoundary] Max crashes (${this.maxCrashes}) reached — will not restart`);
      return { shouldRestart: false };
    }
    return { shouldRestart: this.restartPolicy === "on-crash" || this.restartPolicy === "always" };
  }

  get stats() {
    return {
      crashCount: this.crashCount,
      maxCrashes: this.maxCrashes,
      restartPolicy: this.restartPolicy,
      recentErrors: this.errors.slice(-5).map(e => ({
        message: e.error.message,
        timestamp: e.timestamp,
      })),
    };
  }

  reset(): void {
    this.crashCount = 0;
    this.errors = [];
  }
}

// ── App Runtime (the unified per-app environment) ────────────

export interface AppRuntimeConfig {
  memoryLimits?: MemoryLimits;
  restartPolicy?: RestartPolicy;
  maxCrashes?: number;
}

export class AppRuntime {
  readonly appId: string;
  readonly eventLoop: AppEventLoop;
  readonly memory: AppMemoryGuard;
  readonly resources: AppResourceTracker;
  readonly errorBoundary: AppErrorBoundary;
  readonly createdAt: number;

  constructor(appId: string, config: AppRuntimeConfig = {}) {
    this.appId = appId;
    this.createdAt = Date.now();
    this.eventLoop = new AppEventLoop();
    this.memory = new AppMemoryGuard(config.memoryLimits);
    this.resources = new AppResourceTracker();
    this.errorBoundary = new AppErrorBoundary(config.restartPolicy ?? "on-crash", config.maxCrashes ?? 3);
  }

  /** Start the runtime — begins event loop processing */
  start(): void {
    this.eventLoop.start();
    console.log(`[AppRuntime] Started for "${this.appId}"`);
  }

  /** Pause — suspends event loop but retains state */
  pause(): void {
    this.eventLoop.pause();
  }

  /** Resume from pause */
  resume(): void {
    this.eventLoop.resume();
  }

  /** Full teardown — cleanup everything */
  destroy(): { memory: ReturnType<AppMemoryGuard["cleanup"]>; resources: ReturnType<AppResourceTracker["cleanupAll"]> } {
    this.eventLoop.stop();
    const memResult = this.memory.cleanup();
    const resResult = this.resources.cleanupAll();
    console.log(`[AppRuntime] Destroyed "${this.appId}" — freed ${memResult.freedCount} allocs, ${resResult.freedCount} resources`);
    return { memory: memResult, resources: resResult };
  }

  /** Full diagnostic snapshot */
  get diagnostics() {
    return {
      appId: this.appId,
      uptime: Date.now() - this.createdAt,
      eventLoop: this.eventLoop.stats,
      memory: this.memory.stats,
      resources: this.resources.stats,
      errors: this.errorBoundary.stats,
    };
  }
}
