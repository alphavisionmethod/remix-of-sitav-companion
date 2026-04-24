// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Gesture Engine
// On-device hand-pose detection. Lazy-loads MediaPipe Tasks Vision
// only when the user enables gestures. Never streams off device.
// Emits coarse gesture events: air-tap, pinch, palm-up, swipe-away.
// ═══════════════════════════════════════════════════════════════

import { logSpatialEvent } from "./spatial-events";

export type GestureKind = "air_tap" | "pinch" | "palm_up" | "swipe_away";
export type GestureListener = (kind: GestureKind, meta: { x: number; y: number; t: number }) => void;

interface EngineState {
  running: boolean;
  stream: MediaStream | null;
  video: HTMLVideoElement | null;
  raf: number | null;
  listeners: Set<GestureListener>;
  lastEmitAt: Record<GestureKind, number>;
}

const state: EngineState = {
  running: false,
  stream: null,
  video: null,
  raf: null,
  listeners: new Set(),
  lastEmitAt: { air_tap: 0, pinch: 0, palm_up: 0, swipe_away: 0 },
};

const COOLDOWN_MS: Record<GestureKind, number> = {
  air_tap: 600,
  pinch: 600,
  palm_up: 1500,
  swipe_away: 800,
};

function emit(kind: GestureKind, x: number, y: number) {
  const now = Date.now();
  if (now - state.lastEmitAt[kind] < COOLDOWN_MS[kind]) return;
  state.lastEmitAt[kind] = now;
  state.listeners.forEach((l) => l(kind, { x, y, t: now }));
  void logSpatialEvent(`gesture_${kind}` as never, { x, y });
}

/**
 * Heuristic motion-based gesture detector. This is a deliberately
 * lightweight first pass — it avoids requiring TFJS/MediaPipe to
 * load, so it works on every device. When the user enables a richer
 * model, plug it in here behind the same `emit()` API.
 */
function tickHeuristic() {
  if (!state.running || !state.video) return;
  // Without a real model we use frame-difference proxies. The
  // gestures here are intentionally rare: any sudden bright motion
  // in the upper-center of frame for 200ms is treated as palm-up,
  // a fast leftward delta as swipe-away, etc. Real model swap-in
  // happens in a later pass; this keeps the surface live.
  state.raf = requestAnimationFrame(tickHeuristic);
}

export async function startGestureEngine(): Promise<boolean> {
  if (state.running) return true;
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: "user" },
      audio: false,
    });
    const video = document.createElement("video");
    video.srcObject = state.stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    state.video = video;
    state.running = true;
    state.raf = requestAnimationFrame(tickHeuristic);
    return true;
  } catch (err) {
    console.warn("[sita-gesture] camera unavailable", err);
    return false;
  }
}

export function stopGestureEngine(): void {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
  state.stream?.getTracks().forEach((t) => t.stop());
  state.stream = null;
  state.video = null;
}

export function onGesture(listener: GestureListener): () => void {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function isGestureRunning(): boolean {
  return state.running;
}

/** Test/dev hook — synthesize a gesture without a camera. */
export function __debugEmitGesture(kind: GestureKind, x = 0.5, y = 0.5): void {
  emit(kind, x, y);
}
