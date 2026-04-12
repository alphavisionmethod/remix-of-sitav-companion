// ═══════════════════════════════════════════════════════════════
// SITA OS — Zero-Latency Perception System
// Predictive prefetch, hover preload, optimistic transitions,
// instant click feedback, progressive rendering orchestration
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { predictivePrefetch } from "@/lib/services/predictive-prefetch";
import { ambientContext } from "@/lib/services/ambient-context-engine";

// ── Optimistic Page Transition State ──────────────────────────

let transitionStartTime = 0;
let pendingTransition: string | null = null;

export function getTransitionLatency(): number {
  if (!transitionStartTime) return 0;
  return Date.now() - transitionStartTime;
}

export function isPendingTransition(): boolean {
  return pendingTransition !== null;
}

// ── Progressive Render Phases ─────────────────────────────────

export type RenderPhase = "skeleton" | "header" | "content" | "charts" | "complete";

const PHASE_DELAYS: Record<RenderPhase, number> = {
  skeleton: 0,
  header: 16,    // 1 frame
  content: 80,   // after header settles
  charts: 200,   // heavier components
  complete: 400, // everything done
};

export function useProgressiveRender() {
  const phases = useRef<Set<RenderPhase>>(new Set(["skeleton"]));
  const listeners = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const [phase, delay] of Object.entries(PHASE_DELAYS) as [RenderPhase, number][]) {
      timers.push(setTimeout(() => {
        phases.current.add(phase);
        for (const fn of listeners.current) fn();
      }, delay));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const isReady = useCallback((phase: RenderPhase) => phases.current.has(phase), []);

  return { isReady };
}

// ── Instant Click Feedback ────────────────────────────────────

export function useInstantFeedback() {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], [data-clickable]");
      if (!interactive) return;

      // Add instant pressed state (<8ms visual feedback)
      interactive.classList.add("sita-pressed");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          interactive.classList.remove("sita-pressed");
        });
      });
    };

    document.addEventListener("pointerdown", handler, { passive: true });
    return () => document.removeEventListener("pointerdown", handler);
  }, []);
}

// ── Route Transition Orchestrator ─────────────────────────────

export function useRouteTransitionOrchestrator() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const now = Date.now();

    // Record transition for prediction
    predictivePrefetch.recordNavigation(location.pathname);

    // Track in ambient context
    const segment = location.pathname.split("/").filter(Boolean)[0] || "home";
    const labels: Record<string, string> = {
      home: "Desktop", pulse: "Daily Pulse", business: "Business Center",
      money: "Money Center", concierge: "Concierge", files: "Files",
      settings: "Settings", boardroom: "Boardroom", tasks: "Tasks",
      calendar: "Calendar", advisors: "Advisors",
    };
    ambientContext.trackPageVisit(location.pathname, labels[segment] || segment);

    // Save context snapshot for previous page
    if (prevPath.current !== location.pathname) {
      ambientContext.saveContext(prevPath.current, {
        scrollY: window.scrollY,
      });
    }

    // Restore context for new page
    const savedCtx = ambientContext.getContext(location.pathname);
    if (savedCtx && savedCtx.scrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedCtx.scrollY, behavior: "instant" as ScrollBehavior });
      });
    }

    // Measure transition latency
    if (pendingTransition === location.pathname) {
      const latency = now - transitionStartTime;
      if (latency > 0) {
        console.debug(`[ZeroLatency] Transition to ${location.pathname}: ${latency}ms`);
      }
      pendingTransition = null;
      transitionStartTime = 0;
    }

    prevPath.current = location.pathname;
  }, [location.pathname]);
}

// ── Hover Intent Preloader ────────────────────────────────────

export function useHoverPreload() {
  useEffect(() => {
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href], [data-prefetch-path]");
      if (!link) return;

      const path = link.getAttribute("data-prefetch-path") ||
        link.getAttribute("href") || "";
      if (path.startsWith("/")) {
        predictivePrefetch.onHoverStart(path);
      }
    };

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href], [data-prefetch-path]");
      if (!link) return;

      const path = link.getAttribute("data-prefetch-path") ||
        link.getAttribute("href") || "";
      if (path.startsWith("/")) {
        predictivePrefetch.onHoverEnd(path);
      }
    };

    document.addEventListener("mouseover", handleOver, { passive: true });
    document.addEventListener("mouseout", handleOut, { passive: true });
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);
}

// ── Combined Hook ─────────────────────────────────────────────

export function useZeroLatency() {
  useInstantFeedback();
  useRouteTransitionOrchestrator();
  useHoverPreload();

  // Initialize engines
  useEffect(() => {
    ambientContext.init();
    predictivePrefetch.init();
    return () => {
      ambientContext.destroy();
    };
  }, []);
}
