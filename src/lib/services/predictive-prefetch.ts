// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Prefetch Engine v2
// Top 3 predictions, idle prefetch, enhanced stats
// ═══════════════════════════════════════════════════════════════

import { prefetchRoute } from "@/hooks/useRoutePrefetch";

const STORAGE_KEY = "sita-nav-transitions";
const MAX_TRANSITIONS = 500;

interface TransitionRecord {
  from: string;
  to: string;
  count: number;
  lastAt: number;
}

class PredictivePrefetchEngine {
  private transitions: Map<string, TransitionRecord> = new Map();
  private currentPath = "";
  private prefetchedForPath = "";
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr: TransitionRecord[] = JSON.parse(raw);
      for (const t of arr) {
        this.transitions.set(`${t.from}→${t.to}`, t);
      }
    } catch {}
  }

  private save() {
    try {
      const arr = [...this.transitions.values()];
      if (arr.length > MAX_TRANSITIONS) {
        arr.sort((a, b) => b.lastAt - a.lastAt);
        arr.length = MAX_TRANSITIONS;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {}
  }

  recordNavigation(to: string) {
    if (this.currentPath && this.currentPath !== to) {
      const key = `${this.currentPath}→${to}`;
      const existing = this.transitions.get(key);
      if (existing) {
        existing.count++;
        existing.lastAt = Date.now();
      } else {
        this.transitions.set(key, {
          from: this.currentPath,
          to,
          count: 1,
          lastAt: Date.now(),
        });
      }
      this.save();
    }
    this.currentPath = to;
    this.prefetchPredicted();
    this.prefetchOnIdle();
  }

  private prefetchPredicted() {
    if (this.prefetchedForPath === this.currentPath) return;
    this.prefetchedForPath = this.currentPath;

    const predictions = this.getPredictions(this.currentPath);
    // Prefetch top 3 predicted routes
    for (const pred of predictions.slice(0, 3)) {
      if (pred.probability >= 0.15) {
        prefetchRoute(pred.path);
      }
    }
  }

  // Idle-time prefetch using requestIdleCallback
  private prefetchOnIdle() {
    const idleCb = typeof requestIdleCallback !== "undefined" ? requestIdleCallback : (fn: () => void) => setTimeout(fn, 50);
    idleCb(() => {
      const predictions = this.getPredictions(this.currentPath);
      // Prefetch remaining predictions during idle
      for (const pred of predictions.slice(3, 5)) {
        if (pred.probability >= 0.1) {
          prefetchRoute(pred.path);
        }
      }
    });
  }

  getPredictions(fromPath: string): { path: string; probability: number }[] {
    const candidates: { path: string; count: number }[] = [];
    let totalFromPath = 0;

    for (const [, t] of this.transitions) {
      if (t.from === fromPath) {
        candidates.push({ path: t.to, count: t.count });
        totalFromPath += t.count;
      }
    }

    if (totalFromPath === 0) return [];

    return candidates
      .map(c => ({ path: c.path, probability: c.count / totalFromPath }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  // ── Hover Intent Prefetch ──────────────────────────────────

  private hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();

  onHoverStart(path: string) {
    if (this.hoverTimers.has(path)) return;
    const timer = setTimeout(() => {
      prefetchRoute(path);
      this.hoverTimers.delete(path);
    }, 100);
    this.hoverTimers.set(path, timer);
  }

  onHoverEnd(path: string) {
    const timer = this.hoverTimers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(path);
    }
  }

  getStats() {
    return {
      totalTransitions: this.transitions.size,
      currentPath: this.currentPath,
      topPredictions: this.getPredictions(this.currentPath),
    };
  }
}

export const predictivePrefetch = new PredictivePrefetchEngine();
