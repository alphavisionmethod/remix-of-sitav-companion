// ═══════════════════════════════════════════════════════════════
// SITA OS — Zero-Latency Perception System v2
// View transitions, 120ms spring-back feedback, focus-intent
// prefetch, transition progress bar
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { predictivePrefetch } from "@/lib/services/predictive-prefetch";
import { ambientContext } from "@/lib/services/ambient-context-engine";

// ── Transition State ──────────────────────────────────────────

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
  header: 16,
  content: 80,
  charts: 200,
  complete: 400,
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

// ── Instant Click Feedback (120ms spring-back) ────────────────

export function useInstantFeedback() {
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], [data-clickable]") as HTMLElement | null;
      if (!interactive) return;

      // Add pressed state with 120ms spring-back
      interactive.classList.add("sita-pressed");
      const cleanup = () => {
        interactive.classList.remove("sita-pressed");
      };
      // Remove after 120ms for visible spring-back
      setTimeout(cleanup, 120);
    };

    document.addEventListener("pointerdown", handler, { passive: true });
    return () => document.removeEventListener("pointerdown", handler);
  }, []);
}

// ── Transition Progress Bar ───────────────────────────────────

function showProgressBar() {
  let bar = document.getElementById("sita-transition-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "sita-transition-bar";
    bar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 2px; z-index: 9999;
      background: hsl(var(--primary)); width: 0%;
      transition: width 0.3s ease-out; pointer-events: none;
    `;
    document.body.appendChild(bar);
  }
  bar.style.width = "0%";
  bar.style.opacity = "1";

  // Animate to 70% quickly
  requestAnimationFrame(() => {
    bar!.style.width = "70%";
  });
}

function completeProgressBar() {
  const bar = document.getElementById("sita-transition-bar");
  if (!bar) return;
  bar.style.width = "100%";
  setTimeout(() => {
    bar.style.opacity = "0";
    setTimeout(() => { bar.style.width = "0%"; }, 300);
  }, 200);
}

// ── Route Transition Orchestrator ─────────────────────────────

export function useRouteTransitionOrchestrator() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const now = Date.now();

    // Show progress bar on route change
    if (prevPath.current !== location.pathname) {
      showProgressBar();

      // Use View Transition API if available
      if ("startViewTransition" in document) {
        try {
          (document as any).startViewTransition(() => {
            return new Promise<void>(resolve => {
              requestAnimationFrame(() => resolve());
            });
          });
        } catch {
          // Fallback: no view transition
        }
      }
    }

    predictivePrefetch.recordNavigation(location.pathname);

    const segment = location.pathname.split("/").filter(Boolean)[0] || "home";
    const labels: Record<string, string> = {
      home: "Desktop", pulse: "Daily Pulse", business: "Business Center",
      money: "Money Center", concierge: "Concierge", files: "Files",
      settings: "Settings", boardroom: "Boardroom", tasks: "Tasks",
      calendar: "Calendar", advisors: "Advisors",
    };
    ambientContext.trackPageVisit(location.pathname, labels[segment] || segment);

    if (prevPath.current !== location.pathname) {
      ambientContext.saveContext(prevPath.current, {
        scrollY: window.scrollY,
      });
    }

    const savedCtx = ambientContext.getContext(location.pathname);
    if (savedCtx && savedCtx.scrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedCtx.scrollY, behavior: "instant" as ScrollBehavior });
      });
    }

    // Complete progress bar
    requestAnimationFrame(() => {
      completeProgressBar();
    });

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

// ── Focus-Intent Preloader (Tab key) ──────────────────────────

export function useFocusIntentPreload() {
  useEffect(() => {
    const handler = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const link = target.closest("a[href], [data-prefetch-path]");
      if (!link) return;

      const path = link.getAttribute("data-prefetch-path") ||
        link.getAttribute("href") || "";
      if (path.startsWith("/")) {
        predictivePrefetch.onHoverStart(path); // Reuse hover-intent mechanism
      }
    };

    document.addEventListener("focusin", handler, { passive: true });
    return () => document.removeEventListener("focusin", handler);
  }, []);
}

// ── Combined Hook ─────────────────────────────────────────────

export function useZeroLatency() {
  useInstantFeedback();
  useRouteTransitionOrchestrator();
  useHoverPreload();
  useFocusIntentPreload();

  useEffect(() => {
    ambientContext.init();
    predictivePrefetch.init();
    return () => {
      ambientContext.destroy();
    };
  }, []);
}
