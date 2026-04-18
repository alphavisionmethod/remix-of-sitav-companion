// ═══════════════════════════════════════════════════════════════
// SITA OS — Cursor Manager
// Software cursor rendering, shape catalog, hotspot tracking,
// cursor damage emission, confinement, grab, and custom cursors.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";

// ── Types ────────────────────────────────────────────────────

export type SystemCursorShape =
  | "default" | "pointer" | "text" | "crosshair" | "move"
  | "n-resize" | "s-resize" | "e-resize" | "w-resize"
  | "ne-resize" | "nw-resize" | "se-resize" | "sw-resize"
  | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize"
  | "col-resize" | "row-resize"
  | "wait" | "progress" | "not-allowed" | "help"
  | "grab" | "grabbing" | "zoom-in" | "zoom-out"
  | "none" | "custom";

export interface CursorImage {
  id: string;
  width: number;
  height: number;
  hotspotX: number;
  hotspotY: number;
  /** RGBA pixel data, length = width * height * 4 */
  pixels: Uint8Array;
  /** Optional animation frames */
  frames?: { pixels: Uint8Array; durationMs: number }[];
}

export interface CursorState {
  x: number;
  y: number;
  shape: SystemCursorShape;
  visible: boolean;
  customImageId: string | null;
  confined: boolean;
  confinementRect: Rect | null;
  grabbed: boolean;
  grabWindowId: string | null;
  scale: number;
}

export interface CursorDamage {
  previous: Rect;
  current: Rect;
}

export interface CursorManagerStats {
  position: { x: number; y: number };
  shape: SystemCursorShape;
  visible: boolean;
  customCursorCount: number;
  confined: boolean;
  grabbed: boolean;
  animatedCursor: boolean;
  totalMoves: number;
}

// ── Cursor shape metadata ────────────────────────────────────

interface CursorShapeMeta {
  width: number;
  height: number;
  hotspotX: number;
  hotspotY: number;
}

const SHAPE_META: Record<SystemCursorShape, CursorShapeMeta> = {
  default:      { width: 12, height: 19, hotspotX: 0, hotspotY: 0 },
  pointer:      { width: 16, height: 24, hotspotX: 6, hotspotY: 0 },
  text:         { width: 8,  height: 20, hotspotX: 4, hotspotY: 10 },
  crosshair:    { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  move:         { width: 20, height: 20, hotspotX: 10, hotspotY: 10 },
  "n-resize":   { width: 12, height: 20, hotspotX: 6, hotspotY: 10 },
  "s-resize":   { width: 12, height: 20, hotspotX: 6, hotspotY: 10 },
  "e-resize":   { width: 20, height: 12, hotspotX: 10, hotspotY: 6 },
  "w-resize":   { width: 20, height: 12, hotspotX: 10, hotspotY: 6 },
  "ne-resize":  { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "nw-resize":  { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "se-resize":  { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "sw-resize":  { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "ew-resize":  { width: 20, height: 12, hotspotX: 10, hotspotY: 6 },
  "ns-resize":  { width: 12, height: 20, hotspotX: 6, hotspotY: 10 },
  "nesw-resize": { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "nwse-resize": { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  "col-resize": { width: 16, height: 20, hotspotX: 8, hotspotY: 10 },
  "row-resize": { width: 20, height: 16, hotspotX: 10, hotspotY: 8 },
  wait:         { width: 16, height: 16, hotspotX: 8, hotspotY: 8 },
  progress:     { width: 16, height: 20, hotspotX: 0, hotspotY: 0 },
  "not-allowed": { width: 20, height: 20, hotspotX: 10, hotspotY: 10 },
  help:         { width: 16, height: 20, hotspotX: 0, hotspotY: 0 },
  grab:         { width: 20, height: 20, hotspotX: 10, hotspotY: 10 },
  grabbing:     { width: 20, height: 20, hotspotX: 10, hotspotY: 10 },
  "zoom-in":    { width: 20, height: 20, hotspotX: 9, hotspotY: 9 },
  "zoom-out":   { width: 20, height: 20, hotspotX: 9, hotspotY: 9 },
  none:         { width: 0, height: 0, hotspotX: 0, hotspotY: 0 },
  custom:       { width: 32, height: 32, hotspotX: 0, hotspotY: 0 },
};

// ═════════════════════════════════════════════════════════════

export class CursorManager {
  private _x = 0;
  private _y = 0;
  private _shape: SystemCursorShape = "default";
  private _visible = true;
  private _scale = 1;

  private _customImages = new Map<string, CursorImage>();
  private _customImageId: string | null = null;

  private _confined = false;
  private _confinementRect: Rect | null = null;
  private _grabbed = false;
  private _grabWindowId: string | null = null;

  // Animation
  private _animFrame = 0;
  private _animTimer: ReturnType<typeof setInterval> | null = null;

  // Tracking
  private _totalMoves = 0;
  private _prevBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

  // ── Position ───────────────────────────────────────────────

  moveTo(x: number, y: number): CursorDamage {
    const previous = this._getCurrentBounds();

    if (this._confined && this._confinementRect) {
      const r = this._confinementRect;
      x = Math.max(r.x, Math.min(r.x + r.width, x));
      y = Math.max(r.y, Math.min(r.y + r.height, y));
    }

    this._x = x;
    this._y = y;
    this._totalMoves++;

    const current = this._getCurrentBounds();
    this._prevBounds = current;

    return { previous, current };
  }

  getPosition(): { x: number; y: number } {
    return { x: this._x, y: this._y };
  }

  // ── Shape ──────────────────────────────────────────────────

  setShape(shape: SystemCursorShape): void {
    if (shape === this._shape) return;
    this._shape = shape;
    this._customImageId = null;
    this._stopAnimation();
  }

  getShape(): SystemCursorShape {
    return this._shape;
  }

  setCustomCursor(imageId: string): boolean {
    if (!this._customImages.has(imageId)) return false;
    this._shape = "custom";
    this._customImageId = imageId;

    const img = this._customImages.get(imageId)!;
    if (img.frames && img.frames.length > 1) {
      this._startAnimation(img);
    }
    return true;
  }

  // ── Custom cursor images ───────────────────────────────────

  registerCursor(image: CursorImage): void {
    this._customImages.set(image.id, image);
  }

  unregisterCursor(id: string): void {
    this._customImages.delete(id);
    if (this._customImageId === id) {
      this._shape = "default";
      this._customImageId = null;
      this._stopAnimation();
    }
  }

  getCursorImage(): CursorImage | null {
    if (this._customImageId) return this._customImages.get(this._customImageId) ?? null;
    return null;
  }

  // ── Visibility ─────────────────────────────────────────────

  setVisible(visible: boolean): void { this._visible = visible; }
  isVisible(): boolean { return this._visible; }

  setScale(scale: number): void { this._scale = Math.max(0.5, Math.min(4, scale)); }
  getScale(): number { return this._scale; }

  // ── Confinement & grab ─────────────────────────────────────

  confine(rect: Rect): void {
    this._confined = true;
    this._confinementRect = { ...rect };
  }

  unconfine(): void {
    this._confined = false;
    this._confinementRect = null;
  }

  grab(windowId: string): void {
    this._grabbed = true;
    this._grabWindowId = windowId;
  }

  ungrab(): void {
    this._grabbed = false;
    this._grabWindowId = null;
  }

  isGrabbed(): boolean { return this._grabbed; }
  getGrabWindowId(): string | null { return this._grabWindowId; }

  // ── Rendering info ─────────────────────────────────────────

  /** Get pixel bounds for damage tracking */
  getCurrentBounds(): Rect {
    return this._getCurrentBounds();
  }

  /** Get hotspot offset for current cursor */
  getHotspot(): { x: number; y: number } {
    if (this._customImageId) {
      const img = this._customImages.get(this._customImageId);
      if (img) return { x: img.hotspotX, y: img.hotspotY };
    }
    const meta = SHAPE_META[this._shape];
    return { x: meta.hotspotX, y: meta.hotspotY };
  }

  /** Get cursor state snapshot */
  getState(): CursorState {
    return {
      x: this._x, y: this._y,
      shape: this._shape,
      visible: this._visible,
      customImageId: this._customImageId,
      confined: this._confined,
      confinementRect: this._confinementRect ? { ...this._confinementRect } : null,
      grabbed: this._grabbed,
      grabWindowId: this._grabWindowId,
      scale: this._scale,
    };
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): CursorManagerStats {
    return {
      position: { x: this._x, y: this._y },
      shape: this._shape,
      visible: this._visible,
      customCursorCount: this._customImages.size,
      confined: this._confined,
      grabbed: this._grabbed,
      animatedCursor: this._animTimer !== null,
      totalMoves: this._totalMoves,
    };
  }

  destroy(): void {
    this._stopAnimation();
  }

  // ── Internal ───────────────────────────────────────────────

  private _getCurrentBounds(): Rect {
    let w: number, h: number, hx: number, hy: number;

    if (this._customImageId) {
      const img = this._customImages.get(this._customImageId);
      if (img) {
        w = img.width; h = img.height; hx = img.hotspotX; hy = img.hotspotY;
      } else {
        const meta = SHAPE_META[this._shape];
        w = meta.width; h = meta.height; hx = meta.hotspotX; hy = meta.hotspotY;
      }
    } else {
      const meta = SHAPE_META[this._shape];
      w = meta.width; h = meta.height; hx = meta.hotspotX; hy = meta.hotspotY;
    }

    w = Math.ceil(w * this._scale);
    h = Math.ceil(h * this._scale);
    hx = Math.ceil(hx * this._scale);
    hy = Math.ceil(hy * this._scale);

    return { x: this._x - hx, y: this._y - hy, width: w, height: h };
  }

  private _startAnimation(img: CursorImage): void {
    this._stopAnimation();
    if (!img.frames || img.frames.length <= 1) return;
    this._animFrame = 0;
    const advance = () => {
      this._animFrame = (this._animFrame + 1) % (img.frames?.length ?? 1);
    };
    const dur = img.frames[0]?.durationMs ?? 100;
    this._animTimer = setInterval(advance, dur);
  }

  private _stopAnimation(): void {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
    this._animFrame = 0;
  }
}
