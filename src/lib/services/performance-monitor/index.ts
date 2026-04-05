// ═══════════════════════════════════════════════════════════════
// SITA OS — Performance Monitor (Web Vitals + Slow Render Detection)
// ═══════════════════════════════════════════════════════════════

interface PerfEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const thresholds = {
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  TTFB: [800, 1800],
};

function rate(metric: string, value: number): PerfEntry['rating'] {
  const t = thresholds[metric as keyof typeof thresholds];
  if (!t) return 'good';
  return value <= t[0] ? 'good' : value <= t[1] ? 'needs-improvement' : 'poor';
}

const log = (entry: PerfEntry) => {
  const color = entry.rating === 'good' ? '#22c55e' : entry.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
  console.log(`%c[Perf] ${entry.name}: ${Math.round(entry.value)}ms (${entry.rating})`, `color:${color};font-weight:bold`);
};

export function initPerformanceMonitor() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // LCP
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) log({ name: 'LCP', value: last.startTime, rating: rate('LCP', last.startTime) });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  // FID
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime;
        log({ name: 'FID', value: fid, rating: rate('FID', fid) });
      }
    }).observe({ type: 'first-input', buffered: true });
  } catch {}

  // CLS
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) clsValue += (entry as any).value;
      }
      log({ name: 'CLS', value: clsValue * 1000, rating: rate('CLS', clsValue) });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}

  // Long tasks (>50ms)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(`[Perf] Long task: ${Math.round(entry.duration)}ms`, entry);
        }
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {}

  // Memory monitoring (Chrome only)
  if ('memory' in performance) {
    setInterval(() => {
      const mem = (performance as any).memory;
      const usedMB = Math.round(mem.usedJSHeapSize / 1048576);
      const limitMB = Math.round(mem.jsHeapSizeLimit / 1048576);
      if (usedMB > limitMB * 0.8) {
        console.warn(`[Perf] High memory: ${usedMB}MB / ${limitMB}MB (${Math.round(usedMB / limitMB * 100)}%)`);
      }
    }, 30000);
  }
}
