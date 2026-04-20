// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Performance Policy
// Drag budget, throttling, reduced-motion, deferred rendering.
// ═══════════════════════════════════════════════════════════════

const DRAG_FRAME_BUDGET_MS = 16; // 60fps target
const HEAVY_WINDOW_THRESHOLD = 8;

export function getDragFrameBudget(): number {
  return DRAG_FRAME_BUDGET_MS;
}

export function shouldUseTransformDrag(): boolean {
  return true; // always use GPU-composited transform for drag
}

export function shouldThrottleContent(isFocused: boolean): boolean {
  return !isFocused;
}

export function getReducedMotionPolicy(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function shouldDeferRendering(windowCount: number): boolean {
  return windowCount > HEAVY_WINDOW_THRESHOLD;
}

export function getAnimationDuration(baseMs: number): number {
  return getReducedMotionPolicy() ? 0 : baseMs;
}

export function getPerformanceSnapshot(windowCount: number): {
  frameBudgetMs: number;
  useTransformDrag: boolean;
  reducedMotion: boolean;
  deferRendering: boolean;
} {
  return {
    frameBudgetMs: DRAG_FRAME_BUDGET_MS,
    useTransformDrag: true,
    reducedMotion: getReducedMotionPolicy(),
    deferRendering: shouldDeferRendering(windowCount),
  };
}