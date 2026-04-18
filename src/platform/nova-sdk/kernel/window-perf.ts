// ═══════════════════════════════════════════════════════════════
// NovaOS — Window Performance Monitor
// Tracks open time, drag latency, frame consistency
// ═══════════════════════════════════════════════════════════════

interface WindowTiming {
  requestedAt: number;
  firstFrameAt?: number;
  animCompleteAt?: number;
}

interface DragSample {
  eventTs: number;
  frameTs: number;
}

interface FrameSample {
  timestamp: number;
  delta: number;
}

class WindowPerformanceMonitorClass {
  private windowTimings = new Map<string, WindowTiming>();
  private dragSamples: DragSample[] = [];
  private frameSamples: FrameSample[] = [];
  private lastFrameTs = 0;
  private tracking = false;
  private rafId = 0;

  /** Call when a window open is requested */
  markWindowRequested(windowId: string): void {
    this.windowTimings.set(windowId, { requestedAt: performance.now() });
  }

  /** Call when window's first frame renders */
  markWindowFirstFrame(windowId: string): void {
    const t = this.windowTimings.get(windowId);
    if (t) t.firstFrameAt = performance.now();
  }

  /** Call when open animation completes */
  markWindowAnimComplete(windowId: string): void {
    const t = this.windowTimings.get(windowId);
    if (t) t.animCompleteAt = performance.now();
  }

  /** Record a drag latency sample */
  recordDragSample(pointerEventTimestamp: number): void {
    this.dragSamples.push({
      eventTs: pointerEventTimestamp,
      frameTs: performance.now(),
    });
    // Keep last 120 samples (2 seconds at 60fps)
    if (this.dragSamples.length > 120) this.dragSamples.shift();
  }

  /** Start frame-pacing tracker */
  startFrameTracking(): void {
    if (this.tracking) return;
    this.tracking = true;
    this.lastFrameTs = performance.now();
    const tick = (now: number) => {
      if (!this.tracking) return;
      const delta = now - this.lastFrameTs;
      this.frameSamples.push({ timestamp: now, delta });
      if (this.frameSamples.length > 300) this.frameSamples.shift();
      this.lastFrameTs = now;
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopFrameTracking(): void {
    this.tracking = false;
    cancelAnimationFrame(this.rafId);
  }

  /** Get window open time for a specific window */
  getWindowOpenTime(windowId: string): { total: number; toFirstFrame: number } | null {
    const t = this.windowTimings.get(windowId);
    if (!t) return null;
    return {
      total: (t.animCompleteAt || t.firstFrameAt || performance.now()) - t.requestedAt,
      toFirstFrame: (t.firstFrameAt || performance.now()) - t.requestedAt,
    };
  }

  /** Get drag latency stats */
  getDragLatency(): { avg: number; max: number; p95: number } {
    if (this.dragSamples.length === 0) return { avg: 0, max: 0, p95: 0 };
    const latencies = this.dragSamples.map(s => s.frameTs - s.eventTs).sort((a, b) => a - b);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const max = latencies[latencies.length - 1];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    return { avg: Math.round(avg * 100) / 100, max: Math.round(max * 100) / 100, p95: Math.round(p95 * 100) / 100 };
  }

  /** Get frame consistency stats */
  getFrameConsistency(): { avgFps: number; jankFrames: number; maxDelta: number } {
    if (this.frameSamples.length < 2) return { avgFps: 0, jankFrames: 0, maxDelta: 0 };
    const deltas = this.frameSamples.map(s => s.delta);
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const jankFrames = deltas.filter(d => d > 25).length;
    const maxDelta = Math.max(...deltas);
    return {
      avgFps: Math.round(1000 / avg),
      jankFrames,
      maxDelta: Math.round(maxDelta * 100) / 100,
    };
  }

  /** Full diagnostics report */
  getDiagnostics() {
    const windowStats: Record<string, { total: number; toFirstFrame: number }> = {};
    this.windowTimings.forEach((t, id) => {
      const timing = this.getWindowOpenTime(id);
      if (timing) windowStats[id] = timing;
    });

    return {
      windowOpenTimes: windowStats,
      dragLatency: this.getDragLatency(),
      frameConsistency: this.getFrameConsistency(),
      specCompliance: {
        windowOpenUnder200ms: Object.values(windowStats).every(t => t.total < 200),
        dragLatencyUnder16ms: this.getDragLatency().p95 < 16,
        noJankFrames: this.getFrameConsistency().jankFrames === 0,
      },
    };
  }

  /** Reset all data */
  reset(): void {
    this.windowTimings.clear();
    this.dragSamples = [];
    this.frameSamples = [];
    this.stopFrameTracking();
  }
}

export const WindowPerformanceMonitor = new WindowPerformanceMonitorClass();
