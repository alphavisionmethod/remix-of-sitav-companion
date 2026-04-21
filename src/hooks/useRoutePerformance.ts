// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Performance Hook
// Measures navigation timing (cold start + route transitions)
// and feeds data into the performance-baselines registry.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export interface PerfEntry {
  route: string;
  startMs: number;
  durationMs: number;
  type: "cold-start" | "navigation";
  timestamp: string;
}

const MAX_ENTRIES = 500;
let perfLog: PerfEntry[] = [];
let coldStartRecorded = false;

/** Get all recorded performance entries */
export function getPerfLog(): readonly PerfEntry[] {
  return perfLog;
}

/** Compute p50/p95/p99 from the log, optionally filtered by route */
export function computePercentiles(route?: string): { p50: number; p95: number; p99: number; count: number; coldStartMs: number | null } {
  let entries = route ? perfLog.filter((e) => e.route === route) : perfLog;
  if (entries.length === 0) return { p50: 0, p95: 0, p99: 0, count: 0, coldStartMs: null };

  const sorted = entries.map((e) => e.durationMs).sort((a, b) => a - b);
  const p = (pct: number) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];

  const cold = perfLog.find((e) => e.type === "cold-start");
  return {
    p50: Math.round(p(0.5)),
    p95: Math.round(p(0.95)),
    p99: Math.round(p(0.99)),
    count: entries.length,
    coldStartMs: cold ? Math.round(cold.durationMs) : null,
  };
}

/** Clear the log (for testing) */
export function clearPerfLog() {
  perfLog = [];
  coldStartRecorded = false;
}

/**
 * Hook: place once in your root layout or per-page to track route load times.
 * Uses the browser Performance API (performance.mark / measure).
 */
export function useRoutePerformance(metricLabel?: string) {
  const location = useLocation();
  const mountTime = useRef(performance.now());
  const lastPath = useRef(location.pathname);

  // Cold start: record time from navigationStart to first mount
  useEffect(() => {
    if (!coldStartRecorded) {
      coldStartRecorded = true;
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const coldMs = navEntry ? performance.now() - 0 : performance.now(); // time since timeOrigin
      perfLog.push({
        route: location.pathname,
        startMs: 0,
        durationMs: coldMs,
        type: "cold-start",
        timestamp: new Date().toISOString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track route transitions
  useEffect(() => {
    if (location.pathname === lastPath.current) return;
    const now = performance.now();
    const dur = now - mountTime.current;
    lastPath.current = location.pathname;
    mountTime.current = now;

    const entry: PerfEntry = {
      route: location.pathname,
      startMs: now - dur,
      durationMs: dur,
      type: "navigation",
      timestamp: new Date().toISOString(),
    };
    perfLog.push(entry);
    if (perfLog.length > MAX_ENTRIES) perfLog = perfLog.slice(-MAX_ENTRIES);

    // Use Performance API marks for DevTools visibility
    try {
      const label = metricLabel ?? `route:${location.pathname}`;
      performance.mark(`${label}-end`);
    } catch {
      // noop in test environments
    }
  }, [location.pathname, metricLabel]);
}