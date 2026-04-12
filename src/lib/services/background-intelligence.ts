// ═══════════════════════════════════════════════════════════════
// SITA OS — Background Intelligence Engine
// Invisible maintenance: memory cleanup, prefetch, health monitor
// Runs entirely via requestIdleCallback — zero UI impact
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

const CLEANUP_INTERVAL = 5 * 60_000; // 5 min
const CACHE_MAX_AGE = 60 * 60_000;   // 1 hour
const HEAP_WARN_RATIO = 0.8;
const MAX_NAV_ENTRIES = 500;

interface HealthReport {
  heapUsedMB: number;
  heapLimitMB: number;
  heapRatio: number;
  localStorageKeys: number;
  cleanedKeys: number;
  lastCleanup: number;
}

let lastReport: HealthReport | null = null;

/** Get current health report */
export function getHealthReport(): HealthReport | null {
  return lastReport;
}

/** Prune stale localStorage entries */
function pruneStaleStorage(): number {
  let cleaned = 0;
  const now = Date.now();
  const keysToCheck = ["sita-nav-transitions", "sita-session-state", "sita-ambient-context"];
  
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Check TTL-based entries
      if (key.startsWith("sita-")) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (parsed?.expiresAt && parsed.expiresAt < now) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch {
          // Not JSON or no expiresAt — skip
        }
      }
    }
    
    // Trim nav transition history if too large
    try {
      const navKey = "sita-nav-transitions";
      const raw = localStorage.getItem(navKey);
      if (raw) {
        const entries = JSON.parse(raw);
        if (Array.isArray(entries) && entries.length > MAX_NAV_ENTRIES) {
          localStorage.setItem(navKey, JSON.stringify(entries.slice(-MAX_NAV_ENTRIES)));
          cleaned++;
        }
      }
    } catch { /* ignore */ }
  } catch { /* localStorage unavailable */ }
  
  return cleaned;
}

/** Monitor JS heap if available */
function checkHeapHealth(): { used: number; limit: number; ratio: number } {
  const perf = performance as any;
  if (perf.memory) {
    const used = perf.memory.usedJSHeapSize;
    const limit = perf.memory.jsHeapSizeLimit;
    const ratio = used / limit;
    
    if (ratio > HEAP_WARN_RATIO) {
      console.warn(`[BackgroundIntelligence] Heap usage high: ${(ratio * 100).toFixed(1)}%`);
    }
    
    return { used: used / 1048576, limit: limit / 1048576, ratio };
  }
  return { used: 0, limit: 0, ratio: 0 };
}

/** Prefetch predicted routes during idle */
function prefetchPredicted() {
  try {
    const raw = localStorage.getItem("sita-prefetch-predictions");
    if (!raw) return;
    const predictions: string[] = JSON.parse(raw);
    
    for (const path of predictions.slice(0, 3)) {
      // Create invisible prefetch link
      const existing = document.querySelector(`link[href="${path}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = path;
        link.as = "document";
        document.head.appendChild(link);
        
        // Remove after 30s to avoid DOM buildup
        setTimeout(() => link.remove(), 30_000);
      }
    }
  } catch { /* ignore */ }
}

/** Run a single maintenance cycle */
function runMaintenanceCycle() {
  const cleaned = pruneStaleStorage();
  const heap = checkHeapHealth();
  
  lastReport = {
    heapUsedMB: Math.round(heap.used),
    heapLimitMB: Math.round(heap.limit),
    heapRatio: Math.round(heap.ratio * 100) / 100,
    localStorageKeys: localStorage.length,
    cleanedKeys: cleaned,
    lastCleanup: Date.now(),
  };
  
  // Prefetch during idle
  prefetchPredicted();
}

/** Schedule work via requestIdleCallback */
function scheduleIdle(fn: () => void) {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout: 5000 });
  } else {
    setTimeout(fn, 100);
  }
}

/** Hook to mount background intelligence in ShellLayout */
export function useBackgroundIntelligence() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  
  useEffect(() => {
    // Initial cleanup after 10s (let app settle first)
    const initTimer = setTimeout(() => {
      scheduleIdle(runMaintenanceCycle);
    }, 10_000);
    
    // Recurring cleanup every 5 min
    intervalRef.current = setInterval(() => {
      scheduleIdle(runMaintenanceCycle);
    }, CLEANUP_INTERVAL);
    
    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalRef.current);
    };
  }, []);
}
