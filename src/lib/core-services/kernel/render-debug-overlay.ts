// ═══════════════════════════════════════════════════════════════
// SITA OS — Render Debug Overlay
// Damage region outlines, tile grid, dirty tile heatmap,
// frame time graph, per-stage breakdown, thread load bars,
// glyph cache utilization
// ═══════════════════════════════════════════════════════════════

import type { Rect, DamageStats } from "./damage-tracker";
import type { FrameStats, PipelineStats } from "./render-pipeline";
import type { ThreadPoolStats } from "./render-thread-pool";
import type { CompositorStats } from "./tile-compositor";
import type { VectorRendererStats } from "./vector-renderer";
import type { RasterizerStats } from "./software-rasterizer";

// ── Types ────────────────────────────────────────────────────

export interface DebugOverlayConfig {
  showDamageRegions: boolean;
  showTileGrid: boolean;
  showDirtyHeatmap: boolean;
  showFrameTimeGraph: boolean;
  showStageBreakdown: boolean;
  showThreadLoad: boolean;
  showGlyphCacheUtilization: boolean;
  showFpsCounter: boolean;
  showMemoryPressure: boolean;
  damageRegionColor: { r: number; g: number; b: number; a: number };
  dirtyTileColor: { r: number; g: number; b: number; a: number };
  cleanTileColor: { r: number; g: number; b: number; a: number };
  graphHeight: number;
  graphWidth: number;
}

export interface FrameTimeSample {
  frameId: number;
  totalMs: number;
  layoutMs: number;
  damageMs: number;
  tileAssignMs: number;
  rasterizeMs: number;
  compositeMs: number;
  presentMs: number;
  timestamp: number;
}

export interface TileHeatmapEntry {
  col: number;
  row: number;
  dirtyCount: number; // how many times dirtied in sample window
  heat: number;       // 0-1 normalized
}

export interface StageBreakdown {
  stage: string;
  avgMs: number;
  maxMs: number;
  percentage: number; // of total frame time
}

export interface ThreadLoadEntry {
  threadId: number;
  utilization: number; // 0-1
  tasksCompleted: number;
  steals: number;
}

export interface DebugSnapshot {
  fps: number;
  frameTimeMs: number;
  frameBudgetMs: number;
  budgetUtilization: number; // 0-1+
  damageRegions: Rect[];
  tileHeatmap: TileHeatmapEntry[];
  stageBreakdown: StageBreakdown[];
  threadLoads: ThreadLoadEntry[];
  glyphCacheUtilization: number;
  glyphCacheSize: number;
  glyphCacheMax: number;
  frameTimeHistory: FrameTimeSample[];
  warnings: string[];
}

const DEFAULT_CONFIG: DebugOverlayConfig = {
  showDamageRegions: true,
  showTileGrid: true,
  showDirtyHeatmap: true,
  showFrameTimeGraph: true,
  showStageBreakdown: true,
  showThreadLoad: true,
  showGlyphCacheUtilization: true,
  showFpsCounter: true,
  showMemoryPressure: false,
  damageRegionColor: { r: 255, g: 0, b: 0, a: 128 },
  dirtyTileColor: { r: 255, g: 165, b: 0, a: 100 },
  cleanTileColor: { r: 0, g: 255, b: 0, a: 30 },
  graphHeight: 100,
  graphWidth: 300,
};

const FRAME_HISTORY_SIZE = 120; // 2 seconds at 60fps
const HEATMAP_WINDOW = 60; // frames

// ── Render Debug Overlay ─────────────────────────────────────

export class RenderDebugOverlay {
  private _config: DebugOverlayConfig;
  private _enabled = false;
  private _frameHistory: FrameTimeSample[] = [];
  private _tileHeatmap = new Map<string, number>(); // "col,row" → dirty count
  private _heatmapFrameCounter = 0;
  private _lastDamageRegions: Rect[] = [];
  private _warnings: string[] = [];

  constructor(config?: Partial<DebugOverlayConfig>) {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Enable / Disable ─────────────────────────────────────

  enable(): void { this._enabled = true; }
  disable(): void { this._enabled = false; }
  toggle(): void { this._enabled = !this._enabled; }
  get enabled(): boolean { return this._enabled; }

  setConfig(config: Partial<DebugOverlayConfig>): void {
    Object.assign(this._config, config);
  }

  getConfig(): DebugOverlayConfig {
    return { ...this._config };
  }

  // ── Frame Recording ──────────────────────────────────────

  recordFrame(stats: FrameStats, damageRegions: Rect[], dirtyTileCells?: Array<{ col: number; row: number }>): void {
    if (!this._enabled) return;

    // Record frame time
    const sample: FrameTimeSample = {
      frameId: stats.frameId,
      totalMs: stats.totalMs,
      layoutMs: stats.layoutMs,
      damageMs: stats.damageMs,
      tileAssignMs: stats.tileAssignMs,
      rasterizeMs: stats.rasterizeMs,
      compositeMs: stats.compositeMs,
      presentMs: stats.presentMs,
      timestamp: performance.now(),
    };
    this._frameHistory.push(sample);
    if (this._frameHistory.length > FRAME_HISTORY_SIZE) {
      this._frameHistory.shift();
    }

    // Record damage regions
    this._lastDamageRegions = [...damageRegions];

    // Update tile heatmap
    if (dirtyTileCells) {
      for (const cell of dirtyTileCells) {
        const key = `${cell.col},${cell.row}`;
        this._tileHeatmap.set(key, (this._tileHeatmap.get(key) ?? 0) + 1);
      }
    }
    this._heatmapFrameCounter++;
    if (this._heatmapFrameCounter >= HEATMAP_WINDOW) {
      // Decay heatmap
      for (const [key, count] of this._tileHeatmap) {
        const newCount = Math.floor(count * 0.5);
        if (newCount <= 0) this._tileHeatmap.delete(key);
        else this._tileHeatmap.set(key, newCount);
      }
      this._heatmapFrameCounter = 0;
    }

    // Generate warnings
    this._warnings = [];
    if (!stats.withinBudget) {
      this._warnings.push(`Frame ${stats.frameId} exceeded budget: ${stats.totalMs.toFixed(1)}ms > ${16.6}ms`);
    }
    if (stats.fullRedraw) {
      this._warnings.push(`Frame ${stats.frameId}: full redraw triggered`);
    }
    if (stats.skippedTiles > 0) {
      this._warnings.push(`Frame ${stats.frameId}: ${stats.skippedTiles} tiles skipped (deadline)`);
    }
  }

  // ── Snapshot ───────────────────────────────────────────────

  snapshot(
    pipelineStats: PipelineStats,
    threadStats: ThreadPoolStats,
    compositorStats: CompositorStats,
    vectorStats: VectorRendererStats,
    _rasterizerStats: RasterizerStats,
    _damageStats: DamageStats
  ): DebugSnapshot {
    // FPS from frame history
    const recentFrames = this._frameHistory.filter(
      f => f.timestamp > performance.now() - 1000
    );
    const fps = recentFrames.length;
    const avgFrameMs = recentFrames.length > 0
      ? recentFrames.reduce((s, f) => s + f.totalMs, 0) / recentFrames.length
      : 0;

    // Stage breakdown
    const stageBreakdown = this._computeStageBreakdown();

    // Thread loads
    const totalProcessed = threadStats.threads.reduce((s, t) => s + t.completedCount, 0);
    const threadLoads: ThreadLoadEntry[] = threadStats.threads.map(t => ({
      threadId: t.index,
      utilization: t.completedCount / Math.max(1, totalProcessed / threadStats.threads.length),
      tasksCompleted: t.completedCount,
      steals: t.stolenCount,
    }));

    // Tile heatmap
    const maxHeat = Math.max(1, ...Array.from(this._tileHeatmap.values()));
    const tileHeatmap: TileHeatmapEntry[] = [];
    for (const [key, count] of this._tileHeatmap) {
      const [col, row] = key.split(",").map(Number);
      tileHeatmap.push({ col, row, dirtyCount: count, heat: count / maxHeat });
    }

    // Glyph cache
    const glyphCacheMax = 2048;
    const glyphCacheSize = vectorStats.glyphsCached;

    return {
      fps,
      frameTimeMs: avgFrameMs,
      frameBudgetMs: pipelineStats.frameBudgetMs,
      budgetUtilization: avgFrameMs / pipelineStats.frameBudgetMs,
      damageRegions: this._lastDamageRegions,
      tileHeatmap,
      stageBreakdown,
      threadLoads,
      glyphCacheUtilization: glyphCacheSize / glyphCacheMax,
      glyphCacheSize,
      glyphCacheMax,
      frameTimeHistory: [...this._frameHistory],
      warnings: [...this._warnings],
    };
  }

  // ── Render Debug Info as Text Lines ────────────────────────

  renderTextLines(
    pipelineStats: PipelineStats,
    threadStats: ThreadPoolStats,
    compositorStats: CompositorStats,
    vectorStats: VectorRendererStats,
    rasterizerStats: RasterizerStats,
    damageStats: DamageStats
  ): string[] {
    const snap = this.snapshot(pipelineStats, threadStats, compositorStats, vectorStats, rasterizerStats, damageStats);
    const lines: string[] = [];

    if (this._config.showFpsCounter) {
      lines.push(`FPS: ${snap.fps} | Frame: ${snap.frameTimeMs.toFixed(1)}ms / ${snap.frameBudgetMs.toFixed(1)}ms (${(snap.budgetUtilization * 100).toFixed(0)}%)`);
    }

    if (this._config.showStageBreakdown) {
      lines.push("── Stage Breakdown ──");
      for (const s of snap.stageBreakdown) {
        const bar = "█".repeat(Math.round(s.percentage / 5)) + "░".repeat(Math.max(0, 20 - Math.round(s.percentage / 5)));
        lines.push(`  ${s.stage.padEnd(12)} ${bar} ${s.avgMs.toFixed(2)}ms (${s.percentage.toFixed(0)}%)`);
      }
    }

    if (this._config.showThreadLoad) {
      lines.push("── Thread Load ──");
      for (const t of snap.threadLoads) {
        const bar = "█".repeat(Math.round(t.utilization * 20));
        lines.push(`  T${t.threadId}: ${bar.padEnd(20)} ${t.tasksCompleted} tasks, ${t.steals} steals`);
      }
    }

    if (this._config.showDamageRegions) {
      lines.push(`Damage regions: ${snap.damageRegions.length}`);
    }

    if (this._config.showGlyphCacheUtilization) {
      lines.push(`Glyph cache: ${snap.glyphCacheSize}/${snap.glyphCacheMax} (${(snap.glyphCacheUtilization * 100).toFixed(0)}%)`);
    }

    if (snap.warnings.length > 0) {
      lines.push("── Warnings ──");
      for (const w of snap.warnings) lines.push(`  ⚠ ${w}`);
    }

    return lines;
  }

  getStats() {
    return {
      enabled: this._enabled,
      frameHistorySize: this._frameHistory.length,
      heatmapEntries: this._tileHeatmap.size,
      warningCount: this._warnings.length,
    };
  }

  // ── Internal ────────────────────────────────────────────────

  private _computeStageBreakdown(): StageBreakdown[] {
    if (this._frameHistory.length === 0) return [];

    const stages = ["layout", "damage", "tileAssign", "rasterize", "composite", "present"] as const;
    const result: StageBreakdown[] = [];
    const totalAvg = this._frameHistory.reduce((s, f) => s + f.totalMs, 0) / this._frameHistory.length;

    for (const stage of stages) {
      const key = `${stage}Ms` as keyof FrameTimeSample;
      const values = this._frameHistory.map(f => f[key] as number);
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      const max = Math.max(...values);
      result.push({
        stage,
        avgMs: avg,
        maxMs: max,
        percentage: totalAvg > 0 ? (avg / totalAvg) * 100 : 0,
      });
    }

    return result;
  }
}
