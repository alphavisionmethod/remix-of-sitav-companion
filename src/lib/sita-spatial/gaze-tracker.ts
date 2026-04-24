// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Gaze Tracker (cursor-proxy fallback)
// True gaze requires a face-landmark model. Until the user enables
// the heavy model, we proxy "gaze" with the cursor position +
// dwell time. The contract is identical for callers.
// ═══════════════════════════════════════════════════════════════

import { logSpatialEvent } from "./spatial-events";

export interface GazeTarget {
  windowId: string | null;
  x: number;
  y: number;
  dwellMs: number;
}

type GazeListener = (target: GazeTarget) => void;

interface State {
  running: boolean;
  listeners: Set<GazeListener>;
  lastX: number;
  lastY: number;
  lastWindowId: string | null;
  dwellStartAt: number;
  raf: number | null;
}

const state: State = {
  running: false,
  listeners: new Set(),
  lastX: 0,
  lastY: 0,
  lastWindowId: null,
  dwellStartAt: 0,
  raf: null,
};

const DWELL_THRESHOLD_MS = 700;

function findWindowIdAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const win = (el as HTMLElement).closest<HTMLElement>("[data-window-id]");
  return win?.dataset.windowId ?? null;
}

function onMouseMove(e: MouseEvent) {
  if (!state.running) return;
  state.lastX = e.clientX;
  state.lastY = e.clientY;
}

function tick() {
  if (!state.running) return;
  const winId = findWindowIdAt(state.lastX, state.lastY);
  const now = Date.now();
  if (winId !== state.lastWindowId) {
    state.lastWindowId = winId;
    state.dwellStartAt = now;
  }
  const dwellMs = now - state.dwellStartAt;
  if (winId && dwellMs > DWELL_THRESHOLD_MS) {
    const target: GazeTarget = { windowId: winId, x: state.lastX, y: state.lastY, dwellMs };
    state.listeners.forEach((l) => l(target));
    void logSpatialEvent("gaze_focus", { windowId: winId, dwellMs });
    // reset dwell so we don't fire every frame
    state.dwellStartAt = now;
  }
  state.raf = requestAnimationFrame(tick);
}

export function startGazeTracker(): boolean {
  if (state.running) return true;
  if (typeof window === "undefined") return false;
  state.running = true;
  state.dwellStartAt = Date.now();
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  state.raf = requestAnimationFrame(tick);
  return true;
}

export function stopGazeTracker(): void {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
  window.removeEventListener("mousemove", onMouseMove);
}

export function onGaze(listener: GazeListener): () => void {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function isGazeRunning(): boolean {
  return state.running;
}
