// ═══════════════════════════════════════════════════════════════
// SITA OS — Render Pipeline Orchestrator
// Master frame lifecycle: layout → damage → tile → raster →
// composite → present. Frame budget, VSync, skip policy.
// ═══════════════════════════════════════════════════════════════

import { DamageTracker, type Rect } from "./damage-tracker";
import { TileCompositor } from "./tile-compositor";
import { SoftwareRasterizer, type Color } from "./software-rasterizer";
import { VectorRenderer } from "./vector-renderer";
import { RenderThreadPool, type WorkItem } from "./render-thread-pool";
import { AnimationEngine } from "./animation-engine";

export type PipelineStage = "idle" | "layout" | "damage" | "tile-assign" | "rasterize" | "composite" | "present";
export type FrameSkipPolicy = "drop" | "partial" | "force";

export interface FrameStats {
  frameId: number;
  totalMs: number;
  layoutMs: number;
  damageMs: number;
  tileAssignMs: number;
  rasterizeMs: number;
  compositeMs: number;
  presentMs: number;
  dirtyTileCount: number;
  skippedTiles: number;
  fullRedraw: boolean;
  withinBudget: boolean;
}

export interface PipelineStats {
  currentStage: PipelineStage;
  frameBudgetMs: number;
  targetFps: number;
  framesRendered: number;
  framesSkipped: number;
  avgFrameMs: number;
  p95FrameMs: number;
  p99FrameMs: number;
  budgetOverruns: number;
  lastFrame: FrameStats | null;
  vsyncEnabled: boolean;
}

export interface LayoutNode {
  id: string;
  bounds: Rect;
  children: LayoutNode[];
  dirty: boolean;
  color?: Color;
}

const DEFAULT_FPS = 60;
const FRAME_HISTORY_SIZE = 120; // 2 seconds at 60fps

export class RenderPipeline {
  private _damageTracker: DamageTracker;
  private _compositor: TileCompositor;
  private _rasterizer: SoftwareRasterizer;
  private _vectorEngine: VectorRenderer;
  private _threadPool: RenderThreadPool;
  private _animationEngine: AnimationEngine;

  private _stage: PipelineStage = "idle";
  private _targetFps: number;
  private _frameBudgetMs: number;
  private _vsyncEnabled = true;
  private _skipPolicy: FrameSkipPolicy = "drop";

  private _frameCounter = 0;
  private _framesSkipped = 0;
  private _budgetOverruns = 0;
  private _consecutiveOverruns = 0;
  private _adaptiveFps: number;
  private _frameHistory: number[] = [];
  private _lastFrameStats: FrameStats | null = null;
  private _lastFrameTimestamp = 0;

  private _vsyncTimer: ReturnType<typeof setInterval> | null = null;
  private _rafId: number | null = null;
  private _running = false;
  private _onFrame: ((stats: FrameStats) => void) | null = null;

  constructor(opts?: {
    screenWidth?: number;
    screenHeight?: number;
    tileSize?: number;
    threadCount?: number;
    targetFps?: number;
    dpiScale?: number;
  }) {
    const w = opts?.screenWidth ?? 1920;
    const h = opts?.screenHeight ?? 1080;
    this._targetFps = opts?.targetFps ?? DEFAULT_FPS;
    this._adaptiveFps = this._targetFps;
    this._frameBudgetMs = 1000 / this._targetFps;

    this._damageTracker = new DamageTracker(w, h);
    this._compositor = new TileCompositor(w, h, opts?.tileSize ?? 64);
    this._rasterizer = new SoftwareRasterizer();
    this._vectorEngine = new VectorRenderer(opts?.dpiScale ?? 1);
    this._threadPool = new RenderThreadPool(opts?.threadCount ?? 4, this._frameBudgetMs * 1000);
    this._animationEngine = new AnimationEngine();
  }

  // ── Accessors to sub-systems ───────────────────────────────

  get damageTracker(): DamageTracker { return this._damageTracker; }
  get compositor(): TileCompositor { return this._compositor; }
  get rasterizer(): SoftwareRasterizer { return this._rasterizer; }
  get vectorEngine(): VectorRenderer { return this._vectorEngine; }
  get threadPool(): RenderThreadPool { return this._threadPool; }
  get animationEngine(): AnimationEngine { return this._animationEngine; }

  // ── Frame Rendering ────────────────────────────────────────

  /** Render a single frame synchronously */
  renderFrame(layoutRoot?: LayoutNode): FrameStats {
    const frameStart = performance.now();
    const dtMs = this._lastFrameTimestamp > 0 ? frameStart - this._lastFrameTimestamp : this._frameBudgetMs;
    this._lastFrameTimestamp = frameStart;
    this._frameCounter++;
    const frameId = this._frameCounter;

    // 0. Animation tick (before layout)
    const animDamage = this._animationEngine.tick(frameStart, dtMs);
    for (const rect of animDamage) {
      this._damageTracker.invalidate(rect, "animation");
    }

    // 1. Layout pass
    this._stage = "layout";
    const layoutStart = performance.now();
    const dirtyNodes = layoutRoot ? this._collectDirtyNodes(layoutRoot) : [];
    const layoutMs = performance.now() - layoutStart;

    // 2. Damage collection
    this._stage = "damage";
    const damageStart = performance.now();
    for (const node of dirtyNodes) {
      this._damageTracker.invalidate(node.bounds, "widget");
    }
    const { dirtyRects, fullRedraw } = this._damageTracker.commitFrame();
    const damageMs = performance.now() - damageStart;

    // 3. Tile assignment
    this._stage = "tile-assign";
    const tileStart = performance.now();
    const dirtyTileIds = this._compositor.markDirtyFromRects(dirtyRects);
    const tileAssignMs = performance.now() - tileStart;

    // 4. Parallel rasterization
    this._stage = "rasterize";
    const rasterStart = performance.now();
    const dirtyTiles = this._compositor.getDirtyTiles();

    // Create work items for thread pool
    const workItems: WorkItem[] = dirtyTiles.map((tile) => {
      const affinity = this._threadPool.getAffinityForTile(tile.col, tile.row);
      return {
        id: `tile-${tile.id}-f${frameId}`,
        tileId: tile.id,
        priority: "normal" as const,
        estimatedCostUs: 200, // ~200μs per tile
        affinity,
        execute: () => {
          // Create and fill tile buffer
          const buf = this._rasterizer.createTileBuffer(
            this._compositor.tileSize,
            this._compositor.tileSize
          );
          // Rasterize nodes that intersect this tile
          for (const node of dirtyNodes) {
            if (this._tileIntersects(tile, node.bounds)) {
              const localX = node.bounds.x - tile.x;
              const localY = node.bounds.y - tile.y;
              this._rasterizer.fillRect(
                buf, localX, localY,
                node.bounds.width, node.bounds.height,
                node.color ?? { r: 200, g: 200, b: 200, a: 255 },
                "source-over"
              );
            }
          }
          this._compositor.completeTile(tile.id, buf);
        },
      };
    });

    this._threadPool.beginFrame();
    this._threadPool.submitBatch(workItems);
    const { completed, skipped } = this._threadPool.executeFrame();
    const rasterizeMs = performance.now() - rasterStart;

    // 5. Compositing
    this._stage = "composite";
    const compositeStart = performance.now();
    this._compositor.composite();
    const compositeMs = performance.now() - compositeStart;

    // 6. Present
    this._stage = "present";
    const presentStart = performance.now();
    this._compositor.resetFrame();
    this._vectorEngine.advanceFrame();
    this._rasterizer.resetFrameStats();
    const presentMs = performance.now() - presentStart;

    this._stage = "idle";
    const totalMs = performance.now() - frameStart;

    // Track stats
    const withinBudget = totalMs <= this._frameBudgetMs;
    if (!withinBudget) {
      this._budgetOverruns++;
      this._consecutiveOverruns++;
      // Adaptive frame pacing: reduce FPS under sustained overruns
      if (this._consecutiveOverruns >= 5 && this._adaptiveFps > 30) {
        this._adaptiveFps = Math.max(30, this._adaptiveFps - 5);
      }
    } else {
      this._consecutiveOverruns = 0;
      // Recover FPS gradually
      if (this._adaptiveFps < this._targetFps) {
        this._adaptiveFps = Math.min(this._targetFps, this._adaptiveFps + 1);
      }
    }

    const stats: FrameStats = {
      frameId,
      totalMs,
      layoutMs,
      damageMs,
      tileAssignMs,
      rasterizeMs,
      compositeMs,
      presentMs,
      dirtyTileCount: dirtyTileIds.length,
      skippedTiles: skipped,
      fullRedraw,
      withinBudget,
    };

    this._lastFrameStats = stats;
    this._onFrame?.(stats);
    return stats;
  }

  // ── VSync Loop ─────────────────────────────────────────────

  start(onFrame?: (stats: FrameStats) => void): void {
    if (this._running) return;
    this._running = true;
    this._onFrame = onFrame ?? null;
    this._lastFrameTimestamp = performance.now();

    // Adaptive frame pacing using requestAnimationFrame when available
    if (this._vsyncEnabled && typeof requestAnimationFrame !== "undefined") {
      const tick = () => {
        if (!this._running) return;
        const now = performance.now();
        const elapsed = now - this._lastFrameTimestamp;
        const adaptiveBudget = 1000 / this._adaptiveFps;

        if (elapsed >= adaptiveBudget * 0.95) {
          this.renderFrame();
        } else {
          this._framesSkipped++;
        }
        this._rafId = requestAnimationFrame(tick);
      };
      this._rafId = requestAnimationFrame(tick);
    } else {
      // Fallback to setInterval
      this._vsyncTimer = setInterval(() => {
        if (!this._running) return;
        this.renderFrame();
      }, this._frameBudgetMs);
    }
  }

  stop(): void {
    this._running = false;
    if (this._vsyncTimer) {
      clearInterval(this._vsyncTimer);
      this._vsyncTimer = null;
    }
    if (this._rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  get running(): boolean {
    return this._running;
  }

  // ── Configuration ──────────────────────────────────────────

  setTargetFps(fps: number): void {
    this._targetFps = Math.max(1, Math.min(240, fps));
    this._frameBudgetMs = 1000 / this._targetFps;
    this._threadPool.setFrameBudget(this._frameBudgetMs * 1000);
    // Restart vsync if running
    if (this._running) {
      this.stop();
      this.start(this._onFrame ?? undefined);
    }
  }

  setVsync(enabled: boolean): void {
    this._vsyncEnabled = enabled;
  }

  setSkipPolicy(policy: FrameSkipPolicy): void {
    this._skipPolicy = policy;
  }

  resize(width: number, height: number): void {
    this._damageTracker.resize(width, height);
    this._compositor.resize(width, height);
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): PipelineStats {
    const sorted = [...this._frameHistory].sort((a, b) => a - b);
    const avg = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;

    return {
      currentStage: this._stage,
      frameBudgetMs: this._frameBudgetMs,
      targetFps: this._targetFps,
      framesRendered: this._frameCounter,
      framesSkipped: this._framesSkipped,
      avgFrameMs: avg,
      p95FrameMs: p95,
      p99FrameMs: p99,
      budgetOverruns: this._budgetOverruns,
      lastFrame: this._lastFrameStats,
      vsyncEnabled: this._vsyncEnabled,
    };
  }

  destroy(): void {
    this.stop();
  }

  // ── Internal ────────────────────────────────────────────────

  private _collectDirtyNodes(node: LayoutNode): LayoutNode[] {
    const result: LayoutNode[] = [];
    if (node.dirty) result.push(node);
    for (const child of node.children) {
      result.push(...this._collectDirtyNodes(child));
    }
    return result;
  }

  private _tileIntersects(tile: { x: number; y: number }, bounds: Rect): boolean {
    const ts = this._compositor.tileSize;
    return !(
      tile.x + ts <= bounds.x || bounds.x + bounds.width <= tile.x ||
      tile.y + ts <= bounds.y || bounds.y + bounds.height <= tile.y
    );
  }
}
