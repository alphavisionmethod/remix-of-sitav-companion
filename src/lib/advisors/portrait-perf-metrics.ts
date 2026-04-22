// ═══════════════════════════════════════════════════════════════
// SITA OS — Portrait Performance Metrics Collector
// Lightweight in-memory telemetry for advisor image loading:
//   • Lazy-load time (request → onLoad)
//   • Image decode time (via createImageBitmap or decode())
//   • Animation jank (long-frame detection via PerformanceObserver)
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "sita:portrait-perf-hud";

export function isPerfHudActive(): boolean {
  if (typeof window !== "undefined" && (window as any).__SITA_PERF_HUD) return true;
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
}

export function togglePerfHud(): boolean {
  const next = !isPerfHudActive();
  try {
    if (next) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* noop */ }
  (window as any).__SITA_PERF_HUD = next;
  return next;
}

// ── Metric types ──

export interface PortraitLoadMetric {
  domain: string;
  advisorId?: string;
  url: string;
  loadTimeMs: number;
  decodeTimeMs: number | null;
  retryCount: number;
  timestamp: number;
}

export interface JankFrame {
  durationMs: number;
  timestamp: number;
}

export interface PerfSnapshot {
  loads: PortraitLoadMetric[];
  jankFrames: JankFrame[];
  avgLoadMs: number;
  avgDecodeMs: number;
  p95LoadMs: number;
  totalJankFrames: number;
}

// ── In-memory store (capped at 100 entries) ──

const MAX_ENTRIES = 100;
const loadMetrics: PortraitLoadMetric[] = [];
const jankFrames: JankFrame[] = [];

export function recordLoadMetric(m: PortraitLoadMetric) {
  loadMetrics.push(m);
  if (loadMetrics.length > MAX_ENTRIES) loadMetrics.shift();
}

export function recordJankFrame(j: JankFrame) {
  jankFrames.push(j);
  if (jankFrames.length > MAX_ENTRIES) jankFrames.shift();
}

function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function getSnapshot(): PerfSnapshot {
  const loads = [...loadMetrics];
  const times = loads.map((l) => l.loadTimeMs);
  const decodes = loads.map((l) => l.decodeTimeMs).filter((d): d is number => d !== null);
  return {
    loads,
    jankFrames: [...jankFrames],
    avgLoadMs: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    avgDecodeMs: decodes.length ? decodes.reduce((a, b) => a + b, 0) / decodes.length : 0,
    p95LoadMs: percentile(times, 95),
    totalJankFrames: jankFrames.length,
  };
}

export function clearMetrics() {
  loadMetrics.length = 0;
  jankFrames.length = 0;
}

// ── Jank observer (long animation frames > 50ms) ──

let jankObserver: PerformanceObserver | null = null;

export function startJankObserver() {
  if (jankObserver || typeof PerformanceObserver === "undefined") return;
  try {
    jankObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          recordJankFrame({ durationMs: Math.round(entry.duration), timestamp: Date.now() });
        }
      }
    });
    // 'long-animation-frame' is Chromium-only; fall back to 'longtask'
    try {
      jankObserver.observe({ type: "long-animation-frame", buffered: true });
    } catch {
      try { jankObserver.observe({ type: "longtask", buffered: true }); } catch { /* unsupported */ }
    }
  } catch { /* noop */ }
}

export function stopJankObserver() {
  jankObserver?.disconnect();
  jankObserver = null;
}

// ── Image decode time helper ──

export async function measureDecodeTime(url: string): Promise<number | null> {
  try {
    const t0 = performance.now();
    const res = await fetch(url, { cache: "force-cache" });
    const blob = await res.blob();
    await createImageBitmap(blob);
    return Math.round(performance.now() - t0);
  } catch {
    return null;
  }
}