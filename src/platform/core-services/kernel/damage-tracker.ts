// ═══════════════════════════════════════════════════════════════
// SITA OS — Damage Tracker
// Dirty rectangle accumulation, coalescing, scroll optimization
// ═══════════════════════════════════════════════════════════════

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DamageSource = "widget" | "scroll" | "animation" | "resize" | "theme" | "cursor" | "external";

export interface DamageRegion {
  rect: Rect;
  source: DamageSource;
  timestamp: number;
  frameId: number;
}

export interface DamageStats {
  totalRegionsThisFrame: number;
  coalescedRegionsThisFrame: number;
  totalPixelsDirty: number;
  screenCoverage: number; // 0-1
  fullRedrawTriggered: boolean;
  lifetimeRegions: number;
  lifetimeCoalesces: number;
  lifetimeFullRedraws: number;
}

interface DamageFrame {
  frameId: number;
  regions: DamageRegion[];
  coalesced: Rect[];
  fullRedraw: boolean;
}

const COALESCE_GAP_THRESHOLD = 8; // pixels — merge rects if gap smaller than this
const FULL_REDRAW_COVERAGE = 0.6; // 60% dirty → full redraw cheaper

export class DamageTracker {
  private _screenWidth: number;
  private _screenHeight: number;
  private _currentFrame: DamageFrame;
  private _previousFrame: DamageFrame | null = null;
  private _frameCounter = 0;
  private _debugMode = false;
  private _lifetimeRegions = 0;
  private _lifetimeCoalesces = 0;
  private _lifetimeFullRedraws = 0;

  constructor(screenWidth = 1920, screenHeight = 1080) {
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._currentFrame = this._newFrame();
  }

  // ── Public API ──────────────────────────────────────────────

  /** Mark a rectangular region as dirty */
  invalidate(rect: Rect, source: DamageSource = "widget"): void {
    const clamped = this._clampToScreen(rect);
    if (clamped.width <= 0 || clamped.height <= 0) return;

    this._currentFrame.regions.push({
      rect: clamped,
      source,
      timestamp: Date.now(),
      frameId: this._currentFrame.frameId,
    });
    this._lifetimeRegions++;
  }

  /** Optimized scroll damage — only the newly exposed strip */
  scrollDamage(dx: number, dy: number): void {
    // Horizontal scroll — expose strip on leading edge
    if (dx !== 0) {
      const stripX = dx > 0 ? this._screenWidth - dx : 0;
      this.invalidate(
        { x: stripX, y: 0, width: Math.abs(dx), height: this._screenHeight },
        "scroll"
      );
    }
    // Vertical scroll — expose strip on leading edge
    if (dy !== 0) {
      const stripY = dy > 0 ? this._screenHeight - dy : 0;
      this.invalidate(
        { x: 0, y: stripY, width: this._screenWidth, height: Math.abs(dy) },
        "scroll"
      );
    }
  }

  /** Force full screen redraw (resize, theme change) */
  fullInvalidate(source: DamageSource = "resize"): void {
    this._currentFrame.fullRedraw = true;
    this._currentFrame.regions = [
      {
        rect: { x: 0, y: 0, width: this._screenWidth, height: this._screenHeight },
        source,
        timestamp: Date.now(),
        frameId: this._currentFrame.frameId,
      },
    ];
  }

  /** Finalize current frame — coalesce regions, prepare for tile assignment */
  commitFrame(): { dirtyRects: Rect[]; fullRedraw: boolean } {
    if (this._currentFrame.fullRedraw) {
      const fullRect: Rect = { x: 0, y: 0, width: this._screenWidth, height: this._screenHeight };
      this._currentFrame.coalesced = [fullRect];
      this._lifetimeFullRedraws++;
      this._advance();
      return { dirtyRects: [fullRect], fullRedraw: true };
    }

    if (this._currentFrame.regions.length === 0) {
      this._advance();
      return { dirtyRects: [], fullRedraw: false };
    }

    // Coalesce overlapping / nearby rects
    const coalesced = this._coalesce(this._currentFrame.regions.map((r) => r.rect));
    this._currentFrame.coalesced = coalesced;

    // Check coverage — if too much dirty, full redraw is cheaper
    const totalDirty = coalesced.reduce((a, r) => a + r.width * r.height, 0);
    const screenArea = this._screenWidth * this._screenHeight;
    const coverage = totalDirty / screenArea;

    if (coverage >= FULL_REDRAW_COVERAGE) {
      this._currentFrame.fullRedraw = true;
      const fullRect: Rect = { x: 0, y: 0, width: this._screenWidth, height: this._screenHeight };
      this._currentFrame.coalesced = [fullRect];
      this._lifetimeFullRedraws++;
      this._advance();
      return { dirtyRects: [fullRect], fullRedraw: true };
    }

    this._advance();
    return { dirtyRects: coalesced, fullRedraw: false };
  }

  /** Resize screen dimensions */
  resize(width: number, height: number): void {
    this._screenWidth = width;
    this._screenHeight = height;
    this.fullInvalidate("resize");
  }

  /** Toggle debug visualization mode */
  setDebugMode(enabled: boolean): void {
    this._debugMode = enabled;
  }

  get debugMode(): boolean {
    return this._debugMode;
  }

  get screenWidth(): number {
    return this._screenWidth;
  }

  get screenHeight(): number {
    return this._screenHeight;
  }

  /** Diff current vs previous frame damage for animation optimization */
  diffWithPrevious(): { added: Rect[]; removed: Rect[]; unchanged: Rect[] } {
    const prev = this._previousFrame?.coalesced ?? [];
    const curr = this._currentFrame.coalesced;
    // Simple: rects in curr not overlapping prev = added, etc.
    const added = curr.filter((c) => !prev.some((p) => this._rectsOverlap(c, p)));
    const removed = prev.filter((p) => !curr.some((c) => this._rectsOverlap(p, c)));
    const unchanged = curr.filter((c) => prev.some((p) => this._rectsOverlap(c, p)));
    return { added, removed, unchanged };
  }

  getStats(): DamageStats {
    const totalPixels = this._currentFrame.coalesced.reduce(
      (a, r) => a + r.width * r.height,
      0
    );
    return {
      totalRegionsThisFrame: this._currentFrame.regions.length,
      coalescedRegionsThisFrame: this._currentFrame.coalesced.length,
      totalPixelsDirty: totalPixels,
      screenCoverage: totalPixels / (this._screenWidth * this._screenHeight),
      fullRedrawTriggered: this._currentFrame.fullRedraw,
      lifetimeRegions: this._lifetimeRegions,
      lifetimeCoalesces: this._lifetimeCoalesces,
      lifetimeFullRedraws: this._lifetimeFullRedraws,
    };
  }

  // ── Internal ────────────────────────────────────────────────

  private _newFrame(): DamageFrame {
    return {
      frameId: this._frameCounter,
      regions: [],
      coalesced: [],
      fullRedraw: false,
    };
  }

  private _advance(): void {
    this._previousFrame = this._currentFrame;
    this._frameCounter++;
    this._currentFrame = this._newFrame();
  }

  private _clampToScreen(r: Rect): Rect {
    const x = Math.max(0, r.x);
    const y = Math.max(0, r.y);
    const right = Math.min(this._screenWidth, r.x + r.width);
    const bottom = Math.min(this._screenHeight, r.y + r.height);
    return { x, y, width: right - x, height: bottom - y };
  }

  private _rectsOverlap(a: Rect, b: Rect): boolean {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }

  private _mergeTwo(a: Rect, b: Rect): Rect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return {
      x,
      y,
      width: Math.max(a.x + a.width, b.x + b.width) - x,
      height: Math.max(a.y + a.height, b.y + b.height) - y,
    };
  }

  private _shouldMerge(a: Rect, b: Rect): boolean {
    // Merge if overlapping or gap is small enough that merging is cheaper
    const gapX = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width));
    const gapY = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height));
    return gapX <= COALESCE_GAP_THRESHOLD && gapY <= COALESCE_GAP_THRESHOLD;
  }

  private _coalesce(rects: Rect[]): Rect[] {
    if (rects.length <= 1) return [...rects];

    const merged: Rect[] = [...rects];
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < merged.length; i++) {
        for (let j = i + 1; j < merged.length; j++) {
          if (this._shouldMerge(merged[i], merged[j])) {
            merged[i] = this._mergeTwo(merged[i], merged[j]);
            merged.splice(j, 1);
            this._lifetimeCoalesces++;
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    return merged;
  }
}
