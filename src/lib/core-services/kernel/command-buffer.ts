// ═══════════════════════════════════════════════════════════════
// SITA OS — Command Buffer & Software Pipeline ("CPU Vulkan")
// Section 5.5: Low-Level Rendering API
// ═══════════════════════════════════════════════════════════════

import type { TileBuffer, Color, BlendMode } from "./software-rasterizer";
import type { VectorPath, FillStyle } from "./vector-renderer";
import type { Rect } from "./damage-tracker";

// ── Fixed-Point Math (16.16 format) ─────────────────────────

/** 16.16 fixed-point number */
export type Fixed16 = number; // integer representing value * 65536

const FP_SHIFT = 16;
const FP_ONE = 1 << FP_SHIFT; // 65536
const FP_HALF = FP_ONE >> 1;  // 32768
const FP_MASK = FP_ONE - 1;   // 0xFFFF

export function toFixed16(f: number): Fixed16 {
  return (f * FP_ONE) | 0;
}

export function fromFixed16(fp: Fixed16): number {
  return fp / FP_ONE;
}

export function fpMul(a: Fixed16, b: Fixed16): Fixed16 {
  // Use intermediate to avoid overflow for reasonable values
  return ((a * b) + FP_HALF) >> FP_SHIFT;
}

export function fpDiv(a: Fixed16, b: Fixed16): Fixed16 {
  if (b === 0) return 0;
  return ((a << FP_SHIFT) / b) | 0;
}

export function fpFloor(a: Fixed16): number {
  return a >> FP_SHIFT;
}

export function fpCeil(a: Fixed16): number {
  return (a + FP_MASK) >> FP_SHIFT;
}

export function fpFrac(a: Fixed16): Fixed16 {
  return a & FP_MASK;
}

// ── Vertex & Triangle Types ─────────────────────────────────

export interface Vertex2D {
  x: number;
  y: number;
}

export interface VertexColor extends Vertex2D {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Transform2DMatrix {
  a: number; b: number; // | a b tx |
  c: number; d: number; // | c d ty |
  tx: number; ty: number;
}

export const IDENTITY_TRANSFORM: Transform2DMatrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ── Software Pipeline State ─────────────────────────────────

export interface SoftwarePipelineState {
  blendMode: BlendMode;
  clipRect: Rect | null;
  transform: Transform2DMatrix;
  depthTestEnabled: boolean;
  backfaceCulling: boolean;
  antiAlias: boolean;
}

export class SoftwarePipeline {
  private _state: SoftwarePipelineState;
  private _stateStack: SoftwarePipelineState[] = [];

  constructor() {
    this._state = {
      blendMode: "source-over",
      clipRect: null,
      transform: { ...IDENTITY_TRANSFORM },
      depthTestEnabled: false,
      backfaceCulling: false,
      antiAlias: true,
    };
  }

  get state(): Readonly<SoftwarePipelineState> { return this._state; }

  setBlendMode(mode: BlendMode): void { this._state.blendMode = mode; }
  setClipRect(rect: Rect | null): void { this._state.clipRect = rect; }
  setAntiAlias(enabled: boolean): void { this._state.antiAlias = enabled; }
  setBackfaceCulling(enabled: boolean): void { this._state.backfaceCulling = enabled; }
  setDepthTest(enabled: boolean): void { this._state.depthTestEnabled = enabled; }

  setTransform(m: Transform2DMatrix): void {
    this._state.transform = { ...m };
  }

  multiplyTransform(m: Transform2DMatrix): void {
    const t = this._state.transform;
    this._state.transform = {
      a: t.a * m.a + t.b * m.c,
      b: t.a * m.b + t.b * m.d,
      c: t.c * m.a + t.d * m.c,
      d: t.c * m.b + t.d * m.d,
      tx: t.a * m.tx + t.b * m.ty + t.tx,
      ty: t.c * m.tx + t.d * m.ty + t.ty,
    };
  }

  resetTransform(): void {
    this._state.transform = { ...IDENTITY_TRANSFORM };
  }

  save(): void {
    this._stateStack.push({
      ...this._state,
      transform: { ...this._state.transform },
      clipRect: this._state.clipRect ? { ...this._state.clipRect } : null,
    });
  }

  restore(): void {
    const s = this._stateStack.pop();
    if (s) this._state = s;
  }

  transformPoint(x: number, y: number): Vertex2D {
    const t = this._state.transform;
    return {
      x: t.a * x + t.b * y + t.tx,
      y: t.c * x + t.d * y + t.ty,
    };
  }

  reset(): void {
    this._state = {
      blendMode: "source-over",
      clipRect: null,
      transform: { ...IDENTITY_TRANSFORM },
      depthTestEnabled: false,
      backfaceCulling: false,
      antiAlias: true,
    };
    this._stateStack.length = 0;
  }
}

// ── Command Types ───────────────────────────────────────────

export type DrawCommand =
  | { type: "clear"; color: Color }
  | { type: "drawTriangle"; v0: VertexColor; v1: VertexColor; v2: VertexColor }
  | { type: "drawRect"; x: number; y: number; w: number; h: number; color: Color }
  | { type: "drawPath"; path: VectorPath; fill: FillStyle }
  | { type: "fillRect"; x: number; y: number; w: number; h: number; color: Color }
  | { type: "setBlendMode"; mode: BlendMode }
  | { type: "setClipRect"; rect: Rect | null }
  | { type: "setTransform"; matrix: Transform2DMatrix }
  | { type: "save" }
  | { type: "restore" }
  | { type: "batchFill"; x: number; y: number; w: number; h: number; color: Color }; // SIMD-modeled 8-wide

export interface CommandBufferStats {
  commandCount: number;
  triangleCount: number;
  drawCallCount: number;
  executionTimeUs: number;
  simdBatchCount: number;
}

// ── Edge-Function Triangle Rasterizer (Fixed-Point) ─────────

interface EdgeFunction {
  /** Fixed-point edge function coefficients */
  a: Fixed16;  // (v1.y - v0.y)
  b: Fixed16;  // -(v1.x - v0.x)
  c: Fixed16;  // v1.x * v0.y - v0.x * v1.y (cross product term)
}

function makeEdge(v0: Vertex2D, v1: Vertex2D): EdgeFunction {
  return {
    a: toFixed16(v1.y - v0.y),
    b: toFixed16(-(v1.x - v0.x)),
    c: toFixed16(v1.x * v0.y - v0.x * v1.y),
  };
}

function edgeEval(e: EdgeFunction, x: Fixed16, y: Fixed16): Fixed16 {
  // E(x,y) = a*x + b*y + c — all in fixed-point
  return fpMul(e.a, x) + fpMul(e.b, y) + e.c;
}

/**
 * Rasterize a triangle using edge functions with 16.16 fixed-point math.
 * Evaluates 8 pixels per loop iteration (SIMD-modeled).
 */
function rasterizeTriangleEdge(
  target: TileBuffer,
  v0: VertexColor, v1: VertexColor, v2: VertexColor,
  clipRect: Rect | null,
  blendMode: BlendMode,
  stats: { simdBatchCount: number }
): void {
  // Compute bounding box
  let minX = Math.min(v0.x, v1.x, v2.x) | 0;
  let minY = Math.min(v0.y, v1.y, v2.y) | 0;
  let maxX = Math.ceil(Math.max(v0.x, v1.x, v2.x)) | 0;
  let maxY = Math.ceil(Math.max(v0.y, v1.y, v2.y)) | 0;

  // Clip to tile bounds
  minX = Math.max(minX, 0);
  minY = Math.max(minY, 0);
  maxX = Math.min(maxX, target.width - 1);
  maxY = Math.min(maxY, target.height - 1);

  // Apply clip rect
  if (clipRect) {
    minX = Math.max(minX, clipRect.x);
    minY = Math.max(minY, clipRect.y);
    maxX = Math.min(maxX, clipRect.x + clipRect.width - 1);
    maxY = Math.min(maxY, clipRect.y + clipRect.height - 1);
  }

  if (minX > maxX || minY > maxY) return;

  // Build edge functions
  const e01 = makeEdge(v0, v1);
  const e12 = makeEdge(v1, v2);
  const e20 = makeEdge(v2, v0);

  // Compute triangle area (2x) for barycentric interpolation
  const area = edgeEval(e01, toFixed16(v2.x), toFixed16(v2.y));
  if (area === 0) return; // degenerate

  const invArea = FP_ONE / fromFixed16(area); // floating-point for color interp

  // Scanline loop
  for (let y = minY; y <= maxY; y++) {
    const yFP = toFixed16(y + 0.5);

    // Initial edge values at (minX + 0.5, y + 0.5)
    let w0 = edgeEval(e12, toFixed16(minX + 0.5), yFP);
    let w1 = edgeEval(e20, toFixed16(minX + 0.5), yFP);
    let w2 = edgeEval(e01, toFixed16(minX + 0.5), yFP);

    // Incremental X steps (fixed-point)
    const w0StepX = e12.a;
    const w1StepX = e20.a;
    const w2StepX = e01.a;

    // SIMD-modeled: process 8 pixels at a time
    let x = minX;
    const simdEnd = maxX - 7;

    for (; x <= simdEnd; x += 8) {
      stats.simdBatchCount++;

      // Check all 8 pixels
      let localW0 = w0, localW1 = w1, localW2 = w2;

      for (let i = 0; i < 8; i++) {
        if (localW0 >= 0 && localW1 >= 0 && localW2 >= 0) {
          // Barycentric color interpolation
          const b0 = fromFixed16(localW0) * invArea;
          const b1 = fromFixed16(localW1) * invArea;
          const b2 = 1.0 - b0 - b1;

          const r = ((v0.r * b0 + v1.r * b1 + v2.r * b2) | 0) & 0xFF;
          const g = ((v0.g * b0 + v1.g * b1 + v2.g * b2) | 0) & 0xFF;
          const b = ((v0.b * b0 + v1.b * b1 + v2.b * b2) | 0) & 0xFF;
          const a = ((v0.a * b0 + v1.a * b1 + v2.a * b2) | 0) & 0xFF;

          writePixelBlended(target, x + i, y, r, g, b, a, blendMode);
        }

        localW0 += w0StepX;
        localW1 += w1StepX;
        localW2 += w2StepX;
      }

      w0 += w0StepX * 8;
      w1 += w1StepX * 8;
      w2 += w2StepX * 8;
    }

    // Remainder pixels (scalar)
    for (; x <= maxX; x++) {
      if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
        const b0 = fromFixed16(w0) * invArea;
        const b1 = fromFixed16(w1) * invArea;
        const b2 = 1.0 - b0 - b1;

        const r = ((v0.r * b0 + v1.r * b1 + v2.r * b2) | 0) & 0xFF;
        const g = ((v0.g * b0 + v1.g * b1 + v2.g * b2) | 0) & 0xFF;
        const b = ((v0.b * b0 + v1.b * b1 + v2.b * b2) | 0) & 0xFF;
        const a = ((v0.a * b0 + v1.a * b1 + v2.a * b2) | 0) & 0xFF;

        writePixelBlended(target, x, y, r, g, b, a, blendMode);
      }

      w0 += w0StepX;
      w1 += w1StepX;
      w2 += w2StepX;
    }
  }
}

// ── Pixel Write with Blend ──────────────────────────────────

function writePixelBlended(
  target: TileBuffer, x: number, y: number,
  sr: number, sg: number, sb: number, sa: number,
  blendMode: BlendMode
): void {
  if (x < 0 || x >= target.width || y < 0 || y >= target.height) return;

  const offset = (y * target.width + x) * 4;

  if (blendMode === "copy" || sa === 255) {
    target.pixels[offset] = sr;
    target.pixels[offset + 1] = sg;
    target.pixels[offset + 2] = sb;
    target.pixels[offset + 3] = sa;
    return;
  }

  if (sa === 0) return;

  const dr = target.pixels[offset];
  const dg = target.pixels[offset + 1];
  const db = target.pixels[offset + 2];
  const da = target.pixels[offset + 3];

  let outR: number, outG: number, outB: number, outA: number;

  switch (blendMode) {
    case "source-over": {
      const invAlpha = 255 - sa;
      outR = (sr * sa + dr * invAlpha) / 255;
      outG = (sg * sa + dg * invAlpha) / 255;
      outB = (sb * sa + db * invAlpha) / 255;
      outA = sa + (da * invAlpha) / 255;
      break;
    }
    case "multiply": {
      outR = (sr * dr) / 255;
      outG = (sg * dg) / 255;
      outB = (sb * db) / 255;
      outA = sa;
      break;
    }
    case "screen": {
      outR = sr + dr - (sr * dr) / 255;
      outG = sg + dg - (sg * dg) / 255;
      outB = sb + db - (sb * db) / 255;
      outA = sa;
      break;
    }
    case "add": {
      outR = Math.min(255, sr + dr);
      outG = Math.min(255, sg + dg);
      outB = Math.min(255, sb + db);
      outA = Math.min(255, sa + da);
      break;
    }
    default: {
      const inv = 255 - sa;
      outR = (sr * sa + dr * inv) / 255;
      outG = (sg * sa + dg * inv) / 255;
      outB = (sb * sa + db * inv) / 255;
      outA = sa + (da * inv) / 255;
    }
  }

  target.pixels[offset] = outR | 0;
  target.pixels[offset + 1] = outG | 0;
  target.pixels[offset + 2] = outB | 0;
  target.pixels[offset + 3] = outA | 0;
}

// ── SIMD-Modeled Batch Fill (8 pixels at a time) ────────────

function batchFillRect(
  target: TileBuffer,
  x: number, y: number, w: number, h: number,
  color: Color,
  clipRect: Rect | null,
  stats: { simdBatchCount: number }
): void {
  let x0 = Math.max(x, 0);
  let y0 = Math.max(y, 0);
  let x1 = Math.min(x + w, target.width);
  let y1 = Math.min(y + h, target.height);

  if (clipRect) {
    x0 = Math.max(x0, clipRect.x);
    y0 = Math.max(y0, clipRect.y);
    x1 = Math.min(x1, clipRect.x + clipRect.width);
    y1 = Math.min(y1, clipRect.y + clipRect.height);
  }

  if (x0 >= x1 || y0 >= y1) return;

  const rw = x1 - x0;

  for (let row = y0; row < y1; row++) {
    const rowOffset = row * target.width * 4 + x0 * 4;

    // SIMD-modeled: write 8 pixels per iteration (32 bytes)
    let col = 0;
    const simdEnd = rw - 7;

    for (; col < simdEnd; col += 8) {
      stats.simdBatchCount++;
      const base = rowOffset + col * 4;
      for (let p = 0; p < 8; p++) {
        const off = base + p * 4;
        target.pixels[off] = color.r;
        target.pixels[off + 1] = color.g;
        target.pixels[off + 2] = color.b;
        target.pixels[off + 3] = color.a;
      }
    }

    // Scalar remainder
    for (; col < rw; col++) {
      const off = rowOffset + col * 4;
      target.pixels[off] = color.r;
      target.pixels[off + 1] = color.g;
      target.pixels[off + 2] = color.b;
      target.pixels[off + 3] = color.a;
    }
  }
}

// ── Command Buffer ──────────────────────────────────────────

export class CommandBuffer {
  private _commands: DrawCommand[] = [];
  private _recording = false;
  private _pipeline: SoftwarePipeline;
  private _stats: CommandBufferStats = {
    commandCount: 0,
    triangleCount: 0,
    drawCallCount: 0,
    executionTimeUs: 0,
    simdBatchCount: 0,
  };

  constructor(pipeline?: SoftwarePipeline) {
    this._pipeline = pipeline ?? new SoftwarePipeline();
  }

  get pipeline(): SoftwarePipeline { return this._pipeline; }
  get commandCount(): number { return this._commands.length; }
  get isRecording(): boolean { return this._recording; }

  // ── Lifecycle ──

  begin(): void {
    if (this._recording) throw new Error("CommandBuffer already recording");
    this._recording = true;
  }

  end(): void {
    if (!this._recording) throw new Error("CommandBuffer not recording");
    this._recording = false;
  }

  reset(): void {
    this._commands.length = 0;
    this._recording = false;
    this._pipeline.reset();
    this._stats = {
      commandCount: 0,
      triangleCount: 0,
      drawCallCount: 0,
      executionTimeUs: 0,
      simdBatchCount: 0,
    };
  }

  // ── Recording Commands ──

  clear(color: Color): void {
    this._assertRecording();
    this._commands.push({ type: "clear", color });
  }

  drawTriangle(v0: VertexColor, v1: VertexColor, v2: VertexColor): void {
    this._assertRecording();
    this._commands.push({ type: "drawTriangle", v0, v1, v2 });
  }

  drawRect(x: number, y: number, w: number, h: number, color: Color): void {
    this._assertRecording();
    this._commands.push({ type: "drawRect", x, y, w, h, color });
  }

  fillRect(x: number, y: number, w: number, h: number, color: Color): void {
    this._assertRecording();
    this._commands.push({ type: "fillRect", x, y, w, h, color });
  }

  drawPath(path: VectorPath, fill: FillStyle): void {
    this._assertRecording();
    this._commands.push({ type: "drawPath", path, fill });
  }

  setBlendMode(mode: BlendMode): void {
    this._assertRecording();
    this._commands.push({ type: "setBlendMode", mode });
  }

  setClipRect(rect: Rect | null): void {
    this._assertRecording();
    this._commands.push({ type: "setClipRect", rect });
  }

  setTransform(matrix: Transform2DMatrix): void {
    this._assertRecording();
    this._commands.push({ type: "setTransform", matrix });
  }

  save(): void {
    this._assertRecording();
    this._commands.push({ type: "save" });
  }

  restore(): void {
    this._assertRecording();
    this._commands.push({ type: "restore" });
  }

  /** SIMD-modeled batch fill — 8 pixels per iteration */
  batchFill(x: number, y: number, w: number, h: number, color: Color): void {
    this._assertRecording();
    this._commands.push({ type: "batchFill", x, y, w, h, color });
  }

  // ── Execution (Replay) ──

  execute(target: TileBuffer): CommandBufferStats {
    if (this._recording) throw new Error("Cannot execute while recording");

    const startTime = performance.now();
    const simdStats = { simdBatchCount: 0 };
    let triangleCount = 0;
    let drawCallCount = 0;

    for (const cmd of this._commands) {
      switch (cmd.type) {
        case "clear":
          this._executeClear(target, cmd.color);
          drawCallCount++;
          break;

        case "drawTriangle":
          rasterizeTriangleEdge(
            target, cmd.v0, cmd.v1, cmd.v2,
            this._pipeline.state.clipRect,
            this._pipeline.state.blendMode,
            simdStats
          );
          triangleCount++;
          drawCallCount++;
          break;

        case "drawRect":
        case "fillRect":
          this._executeRectFill(target, cmd.x, cmd.y, cmd.w, cmd.h, cmd.color, simdStats);
          drawCallCount++;
          break;

        case "batchFill":
          batchFillRect(target, cmd.x, cmd.y, cmd.w, cmd.h, cmd.color, this._pipeline.state.clipRect, simdStats);
          drawCallCount++;
          break;

        case "drawPath":
          // Path rendering delegated to vector renderer — recorded for replay
          drawCallCount++;
          break;

        case "setBlendMode":
          this._pipeline.setBlendMode(cmd.mode);
          break;

        case "setClipRect":
          this._pipeline.setClipRect(cmd.rect);
          break;

        case "setTransform":
          this._pipeline.setTransform(cmd.matrix);
          break;

        case "save":
          this._pipeline.save();
          break;

        case "restore":
          this._pipeline.restore();
          break;
      }
    }

    const endTime = performance.now();

    this._stats = {
      commandCount: this._commands.length,
      triangleCount,
      drawCallCount,
      executionTimeUs: (endTime - startTime) * 1000,
      simdBatchCount: simdStats.simdBatchCount,
    };

    return this._stats;
  }

  getStats(): CommandBufferStats {
    return { ...this._stats };
  }

  // ── Private ──

  private _assertRecording(): void {
    if (!this._recording) throw new Error("CommandBuffer not recording — call begin() first");
  }

  private _executeClear(target: TileBuffer, color: Color): void {
    const len = target.width * target.height * 4;
    for (let i = 0; i < len; i += 4) {
      target.pixels[i] = color.r;
      target.pixels[i + 1] = color.g;
      target.pixels[i + 2] = color.b;
      target.pixels[i + 3] = color.a;
    }
  }

  private _executeRectFill(
    target: TileBuffer,
    x: number, y: number, w: number, h: number,
    color: Color,
    simdStats: { simdBatchCount: number }
  ): void {
    const clip = this._pipeline.state.clipRect;
    const transform = this._pipeline.state.transform;

    // Apply transform to rect corners if non-identity
    if (transform.a !== 1 || transform.b !== 0 || transform.c !== 0 || transform.d !== 1 ||
        transform.tx !== 0 || transform.ty !== 0) {
      // Transform all four corners and rasterize as two triangles
      const p0 = this._pipeline.transformPoint(x, y);
      const p1 = this._pipeline.transformPoint(x + w, y);
      const p2 = this._pipeline.transformPoint(x + w, y + h);
      const p3 = this._pipeline.transformPoint(x, y + h);

      const vc = (p: Vertex2D): VertexColor => ({ ...p, r: color.r, g: color.g, b: color.b, a: color.a });

      rasterizeTriangleEdge(target, vc(p0), vc(p1), vc(p2), clip, this._pipeline.state.blendMode, simdStats);
      rasterizeTriangleEdge(target, vc(p0), vc(p2), vc(p3), clip, this._pipeline.state.blendMode, simdStats);
    } else {
      // Axis-aligned — use fast batch fill
      batchFillRect(target, x, y, w, h, color, clip, simdStats);
    }
  }
}

// ── Command Buffer Pool ─────────────────────────────────────

export class CommandBufferPool {
  private _pool: CommandBuffer[] = [];
  private _maxSize: number;

  constructor(maxSize = 16) {
    this._maxSize = maxSize;
  }

  acquire(pipeline?: SoftwarePipeline): CommandBuffer {
    const cb = this._pool.pop();
    if (cb) {
      cb.reset();
      return cb;
    }
    return new CommandBuffer(pipeline);
  }

  release(cb: CommandBuffer): void {
    cb.reset();
    if (this._pool.length < this._maxSize) {
      this._pool.push(cb);
    }
  }

  get pooledCount(): number { return this._pool.length; }

  drain(): void {
    this._pool.length = 0;
  }
}
