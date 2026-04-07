// ═══════════════════════════════════════════════════════════════
// SITA OS — Client-Side Telemetry Collector
// Collects performance metrics, Web Vitals, errors, and custom events
// ═══════════════════════════════════════════════════════════════

export type MetricName =
  | "page_load" | "ttfb" | "fcp" | "lcp" | "cls" | "inp" | "fid"
  | "api_latency" | "render_time" | "js_heap" | "dom_nodes"
  | "error_count" | "navigation" | "interaction" | "custom";

export interface TelemetryEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly metric: MetricName;
  readonly value: number;
  readonly unit: "ms" | "bytes" | "count" | "score" | "nodes";
  readonly tags: Record<string, string>;
  readonly context?: Record<string, unknown>;
}

export interface TelemetryBuffer {
  readonly events: TelemetryEvent[];
  readonly flushIntervalMs: number;
  readonly maxBufferSize: number;
}

// ── Rolling window for aggregation ─────────────────────────

export interface MetricWindow {
  readonly metric: MetricName;
  readonly samples: number[];
  readonly windowMs: number;
  readonly startedAt: number;
}

export function createMetricWindow(metric: MetricName, windowMs = 60_000): MetricWindow {
  return { metric, samples: [], windowMs, startedAt: Date.now() };
}

export function addSample(window: MetricWindow, value: number): MetricWindow {
  const now = Date.now();
  const cutoff = now - window.windowMs;
  const samples = [...window.samples, value].filter((_, i, arr) => {
    // Keep samples within window (approximate — we'd need timestamps for precision)
    return i > arr.length - 100; // Keep last 100 samples
  });
  return { ...window, samples };
}

export function getWindowStats(window: MetricWindow) {
  const { samples } = window;
  if (samples.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0, count: 0 };

  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const p = (pct: number) => sorted[Math.floor(sorted.length * pct)] ?? sorted[sorted.length - 1];

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    p50: p(0.5),
    p95: p(0.95),
    p99: p(0.99),
    count: sorted.length,
  };
}

// ── Telemetry Collector ─────────────────────────────────────

class TelemetryCollector {
  private buffer: TelemetryEvent[] = [];
  private windows = new Map<MetricName, MetricWindow>();
  private listeners = new Set<(event: TelemetryEvent) => void>();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly maxBufferSize: number;
  private readonly flushIntervalMs: number;

  constructor(opts?: { maxBufferSize?: number; flushIntervalMs?: number }) {
    this.maxBufferSize = opts?.maxBufferSize ?? 200;
    this.flushIntervalMs = opts?.flushIntervalMs ?? 30_000;
  }

  start() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
    this.setupWebVitals();
    this.setupErrorTracking();
    this.setupNavigationTracking();
  }

  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  record(metric: MetricName, value: number, unit: TelemetryEvent["unit"] = "ms", tags: Record<string, string> = {}, context?: Record<string, unknown>) {
    const event: TelemetryEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      metric,
      value,
      unit,
      tags,
      context,
    };

    this.buffer.push(event);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
    }

    // Update rolling window
    if (!this.windows.has(metric)) {
      this.windows.set(metric, createMetricWindow(metric));
    }
    this.windows.set(metric, addSample(this.windows.get(metric)!, value));

    // Notify listeners
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* non-critical */ }
    }
  }

  subscribe(listener: (event: TelemetryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStats(metric: MetricName) {
    const window = this.windows.get(metric);
    if (!window) return null;
    return getWindowStats(window);
  }

  getAllStats() {
    const result: Record<string, ReturnType<typeof getWindowStats>> = {};
    for (const [metric, window] of this.windows) {
      result[metric] = getWindowStats(window);
    }
    return result;
  }

  getRecentEvents(count = 50): TelemetryEvent[] {
    return this.buffer.slice(-count);
  }

  flush() {
    if (this.buffer.length === 0) return;
    // In production, this would send to an ingestion endpoint
    // For now, we keep the buffer for in-app observability dashboards
    const snapshot = [...this.buffer];
    this.buffer = [];
    return snapshot;
  }

  // ── Auto-instrumentation ────────────────────────────────

  private setupWebVitals() {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;

    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) this.record("lcp", last.startTime, "ms", { type: "web-vital" });
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch { /* not supported */ }

    // FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            this.record("fcp", entry.startTime, "ms", { type: "web-vital" });
          }
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });
    } catch { /* not supported */ }

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as Record<string, unknown>).hadRecentInput) {
            clsValue += (entry as Record<string, unknown>).value;
          }
        }
        this.record("cls", clsValue, "score", { type: "web-vital" });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch { /* not supported */ }

    // INP (via Event Timing)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = (entry as Record<string, unknown>).duration ?? entry.startTime;
          if (duration > 0) {
            this.record("inp", duration, "ms", { type: "web-vital", name: entry.name });
          }
        }
      });
      inpObserver.observe({ type: "event", buffered: true });
    } catch { /* not supported */ }

    // Navigation timing
    if (performance.getEntriesByType) {
      setTimeout(() => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (nav) {
          this.record("ttfb", nav.responseStart - nav.requestStart, "ms", { type: "web-vital" });
          this.record("page_load", nav.loadEventEnd - nav.startTime, "ms", { type: "web-vital" });
        }
      }, 3000);
    }

    // Memory (Chrome only)
    setInterval(() => {
      const mem = (performance as Record<string, unknown>).memory;
      if (mem) {
        this.record("js_heap", mem.usedJSHeapSize, "bytes", { type: "runtime" });
      }
      this.record("dom_nodes", document.querySelectorAll("*").length, "nodes", { type: "runtime" });
    }, 30_000);
  }

  private setupErrorTracking() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", (e) => {
      this.record("error_count", 1, "count", {
        type: "error",
        message: e.message?.slice(0, 200) ?? "unknown",
        filename: e.filename?.split("/").pop() ?? "unknown",
      });
    });

    window.addEventListener("unhandledrejection", (e) => {
      this.record("error_count", 1, "count", {
        type: "unhandled-rejection",
        message: String(e.reason)?.slice(0, 200),
      });
    });
  }

  private setupNavigationTracking() {
    if (typeof window === "undefined") return;

    // Track SPA navigations via popstate
    window.addEventListener("popstate", () => {
      this.record("navigation", 1, "count", {
        type: "spa-navigation",
        path: window.location.pathname,
      });
    });
  }
}

// Singleton
export const telemetry = new TelemetryCollector();
