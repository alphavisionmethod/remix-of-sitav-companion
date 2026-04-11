// ═══════════════════════════════════════════════════════════════
// SITA OS — Tile-Based Compositor
// 64x64 tiles, dirty-tile-only redraw, Z-order layer tree,
// retained display list diffing, opacity/clip/transform per layer
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { TileBuffer, Color } from "./software-rasterizer";

export type TileState = "clean" | "dirty" | "rendering" | "composited";

export interface Tile {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  state: TileState;
  buffer: TileBuffer | null;
  lastFrameId: number;
  hitCount: number; // for cache eviction priority
}

export interface CompositorLayer {
  id: string;
  zIndex: number;
  opacity: number; // 0-1
  visible: boolean;
  clip: Rect | null;
  transform: { translateX: number; translateY: number; scaleX: number; scaleY: number };
  dirtyTiles: Set<string>;
}

export interface DisplayListEntry {
  layerId: string;
  type: "rect" | "text" | "path" | "image";
  bounds: Rect;
  hash: string; // for diffing
}

export interface CompositorStats {
  tileSize: number;
  totalTiles: number;
  dirtyTiles: number;
  cleanTiles: number;
  renderingTiles: number;
  compositedTiles: number;
  layerCount: number;
  cacheHitRate: number;
  fullRedrawFallbacks: number;
  lifetimeComposites: number;
}

const DEFAULT_TILE_SIZE = 64;
const FULL_REDRAW_THRESHOLD = 0.6; // >60% dirty → full redraw

export class TileCompositor {
  private _tileSize: number;
  private _screenWidth: number;
  private _screenHeight: number;
  private _cols: number;
  private _rows: number;
  private _tiles: Map<string, Tile> = new Map();
  private _layers: Map<string, CompositorLayer> = new Map();
  private _displayList: DisplayListEntry[] = [];
  private _previousDisplayList: DisplayListEntry[] = [];
  private _frameId = 0;
  private _fullRedrawFallbacks = 0;
  private _lifetimeComposites = 0;

  constructor(screenWidth = 1920, screenHeight = 1080, tileSize = DEFAULT_TILE_SIZE) {
    this._tileSize = tileSize;
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._cols = Math.ceil(screenWidth / tileSize);
    this._rows = Math.ceil(screenHeight / tileSize);
    this._initTiles();
  }

  // ── Tile Management ────────────────────────────────────────

  /** Mark tiles as dirty based on damage rects from DamageTracker */
  markDirtyFromRects(rects: Rect[]): string[] {
    const dirtyIds: string[] = [];
    for (const rect of rects) {
      const colStart = Math.max(0, Math.floor(rect.x / this._tileSize));
      const colEnd = Math.min(this._cols - 1, Math.floor((rect.x + rect.width - 1) / this._tileSize));
      const rowStart = Math.max(0, Math.floor(rect.y / this._tileSize));
      const rowEnd = Math.min(this._rows - 1, Math.floor((rect.y + rect.height - 1) / this._tileSize));

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const id = `${c}_${r}`;
          const tile = this._tiles.get(id);
          if (tile && tile.state !== "dirty") {
            tile.state = "dirty";
            dirtyIds.push(id);
          }
        }
      }
    }
    return dirtyIds;
  }

  /** Get all dirty tiles for rasterization dispatch */
  getDirtyTiles(): Tile[] {
    const dirty: Tile[] = [];
    for (const tile of this._tiles.values()) {
      if (tile.state === "dirty") dirty.push(tile);
    }
    return dirty;
  }

  /** Check if too many tiles dirty — should fall back to full redraw */
  shouldFullRedraw(): boolean {
    const dirtyCount = this.getDirtyTiles().length;
    const total = this._tiles.size;
    if (dirtyCount / total > FULL_REDRAW_THRESHOLD) {
      this._fullRedrawFallbacks++;
      return true;
    }
    return false;
  }

  /** Mark a tile as currently being rendered */
  markRendering(tileId: string): void {
    const tile = this._tiles.get(tileId);
    if (tile) tile.state = "rendering";
  }

  /** Complete rasterization — attach buffer and mark composited */
  completeTile(tileId: string, buffer: TileBuffer): void {
    const tile = this._tiles.get(tileId);
    if (tile) {
      tile.buffer = buffer;
      tile.state = "composited";
      tile.lastFrameId = this._frameId;
      tile.hitCount++;
      this._lifetimeComposites++;
    }
  }

  /** Mark all tiles clean for next frame */
  resetFrame(): void {
    this._frameId++;
    for (const tile of this._tiles.values()) {
      if (tile.state === "composited") {
        tile.state = "clean";
      }
    }
  }

  // ── Layer Management ───────────────────────────────────────

  addLayer(id: string, zIndex: number, opts?: Partial<CompositorLayer>): void {
    this._layers.set(id, {
      id,
      zIndex,
      opacity: opts?.opacity ?? 1,
      visible: opts?.visible ?? true,
      clip: opts?.clip ?? null,
      transform: opts?.transform ?? { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 },
      dirtyTiles: new Set(),
    });
  }

  removeLayer(id: string): void {
    this._layers.delete(id);
  }

  setLayerOpacity(id: string, opacity: number): void {
    const layer = this._layers.get(id);
    if (layer) layer.opacity = Math.max(0, Math.min(1, opacity));
  }

  setLayerVisibility(id: string, visible: boolean): void {
    const layer = this._layers.get(id);
    if (layer) layer.visible = visible;
  }

  setLayerTransform(id: string, transform: Partial<CompositorLayer["transform"]>): void {
    const layer = this._layers.get(id);
    if (layer) Object.assign(layer.transform, transform);
  }

  /** Get layers sorted by Z-index for compositing */
  getLayersInOrder(): CompositorLayer[] {
    return [...this._layers.values()]
      .filter((l) => l.visible)
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  // ── Display List Diffing ───────────────────────────────────

  /** Submit new display list and diff against previous to find changed tiles */
  submitDisplayList(entries: DisplayListEntry[]): Rect[] {
    this._previousDisplayList = this._displayList;
    this._displayList = entries;

    // Find entries that changed (different hash or new/removed)
    const prevMap = new Map(this._previousDisplayList.map((e) => [`${e.layerId}:${e.type}:${e.bounds.x},${e.bounds.y}`, e]));
    const changedRects: Rect[] = [];

    for (const entry of entries) {
      const key = `${entry.layerId}:${entry.type}:${entry.bounds.x},${entry.bounds.y}`;
      const prev = prevMap.get(key);
      if (!prev || prev.hash !== entry.hash) {
        changedRects.push(entry.bounds);
      }
      prevMap.delete(key);
    }

    // Removed entries are also dirty
    for (const removed of prevMap.values()) {
      changedRects.push(removed.bounds);
    }

    return changedRects;
  }

  // ── Compositing ────────────────────────────────────────────

  /** Composite all layers into final framebuffer (simulated) */
  composite(): { compositedTiles: number; skippedTiles: number } {
    const layers = this.getLayersInOrder();
    let composited = 0;
    let skipped = 0;

    for (const tile of this._tiles.values()) {
      if (tile.state === "clean" && tile.buffer) {
        // Apply layer transforms and opacity in Z-order
        for (const layer of layers) {
          if (layer.clip) {
            const tileRect: Rect = { x: tile.x, y: tile.y, width: this._tileSize, height: this._tileSize };
            if (!this._rectsOverlap(tileRect, layer.clip)) continue;
          }
          // Simulated compositing — in real impl would blend tile buffers
        }
        skipped++;
      } else if (tile.state === "composited") {
        composited++;
      }
    }

    return { compositedTiles: composited, skippedTiles: skipped };
  }

  /** Evict cached tile buffers under memory pressure (LRU by hitCount) */
  evictCache(maxTiles: number): number {
    const tilesWithBuffers = [...this._tiles.values()]
      .filter((t) => t.buffer && t.state === "clean")
      .sort((a, b) => a.hitCount - b.hitCount);

    let evicted = 0;
    while (tilesWithBuffers.length > maxTiles && tilesWithBuffers.length > 0) {
      const victim = tilesWithBuffers.shift()!;
      victim.buffer = null;
      victim.hitCount = 0;
      evicted++;
    }
    return evicted;
  }

  /** Resize — rebuild tile grid */
  resize(width: number, height: number): void {
    this._screenWidth = width;
    this._screenHeight = height;
    this._cols = Math.ceil(width / this._tileSize);
    this._rows = Math.ceil(height / this._tileSize);
    this._tiles.clear();
    this._initTiles();
  }

  get tileSize(): number {
    return this._tileSize;
  }

  get cols(): number {
    return this._cols;
  }

  get rows(): number {
    return this._rows;
  }

  getTile(col: number, row: number): Tile | undefined {
    return this._tiles.get(`${col}_${row}`);
  }

  getStats(): CompositorStats {
    let dirty = 0, clean = 0, rendering = 0, composited = 0;
    let cached = 0;
    for (const t of this._tiles.values()) {
      if (t.state === "dirty") dirty++;
      else if (t.state === "clean") { clean++; if (t.buffer) cached++; }
      else if (t.state === "rendering") rendering++;
      else if (t.state === "composited") composited++;
    }
    const total = this._tiles.size;
    return {
      tileSize: this._tileSize,
      totalTiles: total,
      dirtyTiles: dirty,
      cleanTiles: clean,
      renderingTiles: rendering,
      compositedTiles: composited,
      layerCount: this._layers.size,
      cacheHitRate: total > 0 ? cached / total : 0,
      fullRedrawFallbacks: this._fullRedrawFallbacks,
      lifetimeComposites: this._lifetimeComposites,
    };
  }

  // ── Internal ────────────────────────────────────────────────

  private _initTiles(): void {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        const id = `${c}_${r}`;
        this._tiles.set(id, {
          id,
          col: c,
          row: r,
          x: c * this._tileSize,
          y: r * this._tileSize,
          state: "dirty", // all dirty on init
          buffer: null,
          lastFrameId: 0,
          hitCount: 0,
        });
      }
    }
  }

  private _rectsOverlap(a: Rect, b: Rect): boolean {
    return !(
      a.x + a.width <= b.x || b.x + b.width <= a.x ||
      a.y + a.height <= b.y || b.y + b.height <= a.y
    );
  }
}
