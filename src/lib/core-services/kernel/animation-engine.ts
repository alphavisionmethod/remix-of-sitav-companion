// ═══════════════════════════════════════════════════════════════
// SITA OS — Animation Engine
// Timeline-based property animation with easing, springs,
// keyframes, and automatic damage emission per animated property
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";

// ── Easing Functions ─────────────────────────────────────────

export type EasingName = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export interface CubicBezierEasing {
  type: "cubic-bezier";
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface SpringEasing {
  type: "spring";
  stiffness: number;  // N/m
  damping: number;    // Ns/m
  mass: number;       // kg
}

export type EasingDef = EasingName | CubicBezierEasing | SpringEasing;

// ── Keyframe Track ───────────────────────────────────────────

export interface Keyframe {
  offset: number; // 0-1 normalized time
  value: number;
  easing?: EasingDef;
}

export interface KeyframeTrack {
  property: string; // e.g. "x", "y", "opacity", "scaleX", "rotation"
  keyframes: Keyframe[];
}

export type AnimationDirection = "normal" | "reverse" | "alternate" | "alternate-reverse";
export type AnimationFillMode = "none" | "forwards" | "backwards" | "both";
export type AnimationState = "idle" | "running" | "paused" | "finished";

/**
 * AnimationLayer determines optimization strategy:
 * - "compositor": only transforms/opacity/position — skip re-rasterization, reuse cached tiles
 * - "raster": color/size/content changes — triggers full re-rasterization of affected region
 */
export type AnimationLayer = "compositor" | "raster";

/** Properties that can be animated at compositor level without re-rasterization */
const COMPOSITOR_PROPERTIES = new Set([
  "x", "y", "tx", "ty", "translateX", "translateY",
  "sx", "sy", "scaleX", "scaleY",
  "rotation", "opacity",
]);

export function classifyAnimationLayer(tracks: KeyframeTrack[]): AnimationLayer {
  for (const track of tracks) {
    if (!COMPOSITOR_PROPERTIES.has(track.property)) return "raster";
  }
  return "compositor";
}

export interface AnimationDef {
  id: string;
  tracks: KeyframeTrack[];
  durationMs: number;
  delay?: number;
  iterations?: number; // Infinity for infinite
  direction?: AnimationDirection;
  fillMode?: AnimationFillMode;
  playbackRate?: number;
  /** Bounds of the animated element — used for damage emission */
  bounds?: Rect;
  /** Override layer classification (auto-detected if omitted) */
  layer?: AnimationLayer;
}

export interface AnimationInstance {
  def: AnimationDef;
  state: AnimationState;
  currentTime: number; // ms elapsed (excluding delay)
  startTime: number;   // wall clock when started
  currentIteration: number;
  computedValues: Map<string, number>; // property → current value
  layer: AnimationLayer; // resolved optimization layer
  boundViewId?: string;  // linked ViewNode id for auto-apply
  onFinish?: () => void;
  onFrame?: (values: Map<string, number>) => void;
}

export interface AnimationEngineStats {
  activeAnimations: number;
  totalAnimationsCreated: number;
  totalFramesTicked: number;
  totalDamageRectsEmitted: number;
  springSimulations: number;
}

// ── Easing Implementation ────────────────────────────────────

function easingLinear(t: number): number { return t; }

function easingIn(t: number): number { return t * t * t; }

function easingOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

function easingInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  // Newton-Raphson to solve for t given x, then evaluate y
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x; // initial guess
    for (let i = 0; i < 8; i++) {
      const cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
      const dx = 3 * x1 * (1 - t) * (1 - t) - 6 * x1 * t * (1 - t) + 6 * x2 * t * (1 - t) - 3 * x2 * t * t + 3 * t * t;
      if (Math.abs(dx) < 1e-8) break;
      t -= (cx - x) / dx;
      t = Math.max(0, Math.min(1, t));
    }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}

function resolveEasing(easing: EasingDef): (t: number) => number {
  if (typeof easing === "string") {
    switch (easing) {
      case "linear": return easingLinear;
      case "ease-in": return easingIn;
      case "ease-out": return easingOut;
      case "ease-in-out": return easingInOut;
    }
  }
  if (easing.type === "cubic-bezier") {
    return cubicBezier(easing.x1, easing.y1, easing.x2, easing.y2);
  }
  // Spring handled separately in tick
  return easingLinear;
}

// ── Spring Solver ────────────────────────────────────────────

interface SpringState {
  position: number;
  velocity: number;
}

function springStep(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  mass: number,
  dtSec: number
): SpringState {
  const displacement = state.position - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = (springForce + dampingForce) / mass;

  const velocity = state.velocity + acceleration * dtSec;
  const position = state.position + velocity * dtSec;

  return { position, velocity };
}

function isSpringSettled(state: SpringState, target: number): boolean {
  return Math.abs(state.position - target) < 0.001 && Math.abs(state.velocity) < 0.001;
}

// ── Animation Engine ─────────────────────────────────────────

export class AnimationEngine {
  private _animations = new Map<string, AnimationInstance>();
  private _springs = new Map<string, Map<string, SpringState>>(); // animId → property → state
  private _damageQueue: Rect[] = [];
  private _stats: AnimationEngineStats = {
    activeAnimations: 0,
    totalAnimationsCreated: 0,
    totalFramesTicked: 0,
    totalDamageRectsEmitted: 0,
    springSimulations: 0,
  };

  // ── Create & Control ─────────────────────────────────────

  create(def: AnimationDef): AnimationInstance {
    const instance: AnimationInstance = {
      def,
      state: "idle",
      currentTime: 0,
      startTime: 0,
      currentIteration: 0,
      computedValues: new Map(),
    };
    this._animations.set(def.id, instance);
    this._stats.totalAnimationsCreated++;
    return instance;
  }

  play(id: string): void {
    const inst = this._animations.get(id);
    if (!inst) return;
    inst.state = "running";
    inst.startTime = performance.now();
    inst.currentTime = 0;
    inst.currentIteration = 0;

    // Initialize spring states
    for (const track of inst.def.tracks) {
      const lastKf = track.keyframes[track.keyframes.length - 1];
      if (lastKf?.easing && typeof lastKf.easing !== "string" && lastKf.easing.type === "spring") {
        if (!this._springs.has(id)) this._springs.set(id, new Map());
        this._springs.get(id)!.set(track.property, {
          position: track.keyframes[0].value,
          velocity: 0,
        });
      }
    }
  }

  pause(id: string): void {
    const inst = this._animations.get(id);
    if (inst?.state === "running") inst.state = "paused";
  }

  resume(id: string): void {
    const inst = this._animations.get(id);
    if (inst?.state === "paused") inst.state = "running";
  }

  cancel(id: string): void {
    this._animations.delete(id);
    this._springs.delete(id);
  }

  seek(id: string, timeMs: number): void {
    const inst = this._animations.get(id);
    if (!inst) return;
    inst.currentTime = Math.max(0, Math.min(timeMs, inst.def.durationMs));
  }

  setPlaybackRate(id: string, rate: number): void {
    const inst = this._animations.get(id);
    if (inst) inst.def.playbackRate = rate;
  }

  setOnFinish(id: string, cb: () => void): void {
    const inst = this._animations.get(id);
    if (inst) inst.onFinish = cb;
  }

  setOnFrame(id: string, cb: (values: Map<string, number>) => void): void {
    const inst = this._animations.get(id);
    if (inst) inst.onFrame = cb;
  }

  // ── Tick (called once per frame before layout) ───────────

  tick(nowMs: number, dtMs: number): Rect[] {
    this._damageQueue = [];
    let activeCount = 0;

    for (const [id, inst] of this._animations) {
      if (inst.state !== "running") continue;
      activeCount++;

      const rate = inst.def.playbackRate ?? 1;
      inst.currentTime += dtMs * rate;

      const delay = inst.def.delay ?? 0;
      if (inst.currentTime < delay) continue;

      const effectiveTime = inst.currentTime - delay;
      const duration = inst.def.durationMs;
      const iterations = inst.def.iterations ?? 1;
      const direction = inst.def.direction ?? "normal";

      // Check completion
      if (effectiveTime >= duration * iterations && iterations !== Infinity) {
        inst.state = "finished";
        this._applyFillMode(inst);
        inst.onFinish?.();
        inst.onFrame?.(inst.computedValues);
        this._emitDamage(inst);
        continue;
      }

      // Current iteration and local t
      const iteration = Math.floor(effectiveTime / duration);
      inst.currentIteration = iteration;
      let localT = (effectiveTime % duration) / duration;

      // Direction
      const isReverse =
        direction === "reverse" ||
        (direction === "alternate" && iteration % 2 === 1) ||
        (direction === "alternate-reverse" && iteration % 2 === 0);
      if (isReverse) localT = 1 - localT;

      // Evaluate each track
      for (const track of inst.def.tracks) {
        const value = this._evaluateTrack(track, localT, id, dtMs);
        inst.computedValues.set(track.property, value);
      }

      inst.onFrame?.(inst.computedValues);
      this._emitDamage(inst);
    }

    this._stats.activeAnimations = activeCount;
    this._stats.totalFramesTicked++;

    return this._damageQueue;
  }

  /** Drain accumulated damage rects (for DamageTracker integration) */
  drainDamage(): Rect[] {
    const rects = [...this._damageQueue];
    this._damageQueue = [];
    return rects;
  }

  // ── Query ──────────────────────────────────────────────────

  get(id: string): AnimationInstance | undefined {
    return this._animations.get(id);
  }

  getActive(): string[] {
    const result: string[] = [];
    for (const [id, inst] of this._animations) {
      if (inst.state === "running") result.push(id);
    }
    return result;
  }

  getStats(): AnimationEngineStats {
    return { ...this._stats };
  }

  destroy(): void {
    this._animations.clear();
    this._springs.clear();
    this._damageQueue = [];
  }

  // ── Internal ────────────────────────────────────────────────

  private _evaluateTrack(track: KeyframeTrack, t: number, animId: string, dtMs: number): number {
    const kfs = track.keyframes;
    if (kfs.length === 0) return 0;
    if (kfs.length === 1) return kfs[0].value;

    // Find surrounding keyframes
    let from = kfs[0];
    let to = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (t >= kfs[i].offset && t <= kfs[i + 1].offset) {
        from = kfs[i];
        to = kfs[i + 1];
        break;
      }
    }

    const range = to.offset - from.offset;
    const localT = range > 0 ? (t - from.offset) / range : 1;

    // Spring physics
    const easing = to.easing ?? from.easing ?? "linear";
    if (typeof easing !== "string" && easing.type === "spring") {
      const springStates = this._springs.get(animId);
      if (springStates) {
        const state = springStates.get(track.property);
        if (state) {
          const newState = springStep(state, to.value, easing.stiffness, easing.damping, easing.mass, dtMs / 1000);
          springStates.set(track.property, newState);
          this._stats.springSimulations++;
          return newState.position;
        }
      }
    }

    // Standard easing interpolation
    const easeFn = resolveEasing(easing);
    const easedT = easeFn(localT);
    return from.value + (to.value - from.value) * easedT;
  }

  private _applyFillMode(inst: AnimationInstance): void {
    const fill = inst.def.fillMode ?? "none";
    if (fill === "none") {
      inst.computedValues.clear();
      return;
    }
    // "forwards" / "both" — keep last computed values (already set)
    // "backwards" — snap to first keyframe values
    if (fill === "backwards") {
      for (const track of inst.def.tracks) {
        if (track.keyframes.length > 0) {
          inst.computedValues.set(track.property, track.keyframes[0].value);
        }
      }
    }
  }

  private _emitDamage(inst: AnimationInstance): void {
    if (inst.def.bounds) {
      this._damageQueue.push({ ...inst.def.bounds });
      this._stats.totalDamageRectsEmitted++;
    }
  }
}
