// ═══════════════════════════════════════════════════════════════
// SITA OS — Vector Renderer
// Resolution-independent path engine with SVG-like commands,
// fill rules, strokes, gradients, glyph cache, DPI scaling
// ═══════════════════════════════════════════════════════════════

import type { TileBuffer } from "./software-rasterizer";

export type PathCommand =
  | { type: "moveTo"; x: number; y: number }
  | { type: "lineTo"; x: number; y: number }
  | { type: "quadTo"; cx: number; cy: number; x: number; y: number }
  | { type: "cubicTo"; c1x: number; c1y: number; c2x: number; c2y: number; x: number; y: number }
  | { type: "arcTo"; rx: number; ry: number; rotation: number; largeArc: boolean; sweep: boolean; x: number; y: number }
  | { type: "close" };

export type FillRule = "even-odd" | "winding";
export type LineCap = "butt" | "round" | "square";
export type LineJoin = "miter" | "round" | "bevel";

export interface StrokeStyle {
  width: number;
  cap: LineCap;
  join: LineJoin;
  miterLimit: number;
  dashArray?: number[];
  dashOffset?: number;
}

export type GradientType = "linear" | "radial" | "conic";

export interface GradientStop {
  offset: number; // 0-1
  r: number; g: number; b: number; a: number;
}

export interface GradientDef {
  type: GradientType;
  stops: GradientStop[];
  x0?: number; y0?: number; x1?: number; y1?: number;
  cx?: number; cy?: number; r?: number;
  angle?: number;
}

export interface PatternDef {
  image: TileBuffer;
  repeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
  offsetX?: number;
  offsetY?: number;
}

export type FillStyle = { type: "solid"; r: number; g: number; b: number; a: number }
  | { type: "gradient"; gradient: GradientDef }
  | { type: "pattern"; pattern: PatternDef };

export interface GlyphCacheEntry {
  key: string;
  coverage: Uint8Array; // sub-pixel coverage (w*3 × h)
  width: number;
  height: number;
  bearingX: number;
  bearingY: number;
  advance: number;
  lastUsedFrame: number;
}

export interface VectorPath {
  commands: PathCommand[];
  fillRule: FillRule;
}

export interface VectorRendererStats {
  pathsRasterized: number;
  glyphsCached: number;
  glyphCacheHits: number;
  glyphCacheMisses: number;
  glyphCacheEvictions: number;
  gradientsFilled: number;
  patternsFilled: number;
  bezierSegments: number;
  totalVertices: number;
  dpiScale: number;
  clipPathsPushed: number;
  dashExpansions: number;
}

const MAX_GLYPH_CACHE = 2048;
const BEZIER_FLATNESS = 0.25; // subdivision tolerance in pixels

export class VectorRenderer {
  private _dpiScale: number;
  private _glyphCache: Map<string, GlyphCacheEntry> = new Map();
  private _clipStack: VectorPath[] = [];
  private _frameCounter = 0;
  private _stats: VectorRendererStats = {
    pathsRasterized: 0,
    glyphsCached: 0,
    glyphCacheHits: 0,
    glyphCacheMisses: 0,
    glyphCacheEvictions: 0,
    gradientsFilled: 0,
    patternsFilled: 0,
    bezierSegments: 0,
    totalVertices: 0,
    dpiScale: 1,
    clipPathsPushed: 0,
    dashExpansions: 0,
  };

  constructor(dpiScale = 1) {
    this._dpiScale = dpiScale;
    this._stats.dpiScale = dpiScale;
  }

  // ── Clip Path Stack ────────────────────────────────────────

  pushClipPath(path: VectorPath): void {
    this._clipStack.push(path);
    this._stats.clipPathsPushed++;
  }

  popClipPath(): VectorPath | undefined {
    return this._clipStack.pop();
  }

  getClipStack(): ReadonlyArray<VectorPath> {
    return this._clipStack;
  }

  clearClipStack(): void {
    this._clipStack = [];
  }

  /** Test if a point is inside all active clip paths */
  isPointInClip(x: number, y: number): boolean {
    if (this._clipStack.length === 0) return true;
    for (const clip of this._clipStack) {
      if (!this._pointInPath(clip, x, y)) return false;
    }
    return true;
  }

  // ── Pattern Sampling ───────────────────────────────────────

  samplePattern(pattern: PatternDef, px: number, py: number): { r: number; g: number; b: number; a: number } {
    const img = pattern.image;
    let sx = Math.floor(px - (pattern.offsetX ?? 0));
    let sy = Math.floor(py - (pattern.offsetY ?? 0));

    if (pattern.repeat === "no-repeat") {
      if (sx < 0 || sx >= img.width || sy < 0 || sy >= img.height) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
    } else {
      if (pattern.repeat === "repeat" || pattern.repeat === "repeat-x") {
        sx = ((sx % img.width) + img.width) % img.width;
      } else if (sx < 0 || sx >= img.width) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
      if (pattern.repeat === "repeat" || pattern.repeat === "repeat-y") {
        sy = ((sy % img.height) + img.height) % img.height;
      } else if (sy < 0 || sy >= img.height) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
    }

    const off = (sy * img.width + sx) * 4;
    this._stats.patternsFilled++;
    return {
      r: img.pixels[off],
      g: img.pixels[off + 1],
      b: img.pixels[off + 2],
      a: img.pixels[off + 3],
    };
  }

  // ── Path Building ──────────────────────────────────────────

  createPath(): VectorPath {
    return { commands: [], fillRule: "winding" };
  }

  moveTo(path: VectorPath, x: number, y: number): void {
    path.commands.push({ type: "moveTo", x: x * this._dpiScale, y: y * this._dpiScale });
  }

  lineTo(path: VectorPath, x: number, y: number): void {
    path.commands.push({ type: "lineTo", x: x * this._dpiScale, y: y * this._dpiScale });
    this._stats.totalVertices++;
  }

  quadTo(path: VectorPath, cx: number, cy: number, x: number, y: number): void {
    path.commands.push({
      type: "quadTo",
      cx: cx * this._dpiScale, cy: cy * this._dpiScale,
      x: x * this._dpiScale, y: y * this._dpiScale,
    });
    this._stats.bezierSegments++;
  }

  cubicTo(path: VectorPath, c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void {
    path.commands.push({
      type: "cubicTo",
      c1x: c1x * this._dpiScale, c1y: c1y * this._dpiScale,
      c2x: c2x * this._dpiScale, c2y: c2y * this._dpiScale,
      x: x * this._dpiScale, y: y * this._dpiScale,
    });
    this._stats.bezierSegments++;
  }

  arcTo(path: VectorPath, rx: number, ry: number, rotation: number, largeArc: boolean, sweep: boolean, x: number, y: number): void {
    path.commands.push({
      type: "arcTo",
      rx: rx * this._dpiScale, ry: ry * this._dpiScale,
      rotation, largeArc, sweep,
      x: x * this._dpiScale, y: y * this._dpiScale,
    });
    this._stats.bezierSegments++;
  }

  closePath(path: VectorPath): void {
    path.commands.push({ type: "close" });
  }

  // ── Path Flattening (Bezier → line segments) ───────────────

  /** Flatten a path into line segments for scanline rasterization */
  flattenPath(path: VectorPath): Array<{ x: number; y: number }[]> {
    const contours: Array<{ x: number; y: number }[]> = [];
    let current: Array<{ x: number; y: number }> = [];
    let cx = 0, cy = 0;
    let startX = 0, startY = 0;

    for (const cmd of path.commands) {
      switch (cmd.type) {
        case "moveTo":
          if (current.length > 0) contours.push(current);
          current = [{ x: cmd.x, y: cmd.y }];
          cx = startX = cmd.x;
          cy = startY = cmd.y;
          break;

        case "lineTo":
          current.push({ x: cmd.x, y: cmd.y });
          cx = cmd.x;
          cy = cmd.y;
          break;

        case "quadTo": {
          const pts = this._flattenQuadratic(cx, cy, cmd.cx, cmd.cy, cmd.x, cmd.y);
          current.push(...pts);
          cx = cmd.x;
          cy = cmd.y;
          break;
        }

        case "cubicTo": {
          const pts = this._flattenCubic(cx, cy, cmd.c1x, cmd.c1y, cmd.c2x, cmd.c2y, cmd.x, cmd.y);
          current.push(...pts);
          cx = cmd.x;
          cy = cmd.y;
          break;
        }

        case "arcTo": {
          // Approximate arc with cubic beziers
          const pts = this._flattenArc(cx, cy, cmd);
          current.push(...pts);
          cx = cmd.x;
          cy = cmd.y;
          break;
        }

        case "close":
          current.push({ x: startX, y: startY });
          contours.push(current);
          current = [];
          cx = startX;
          cy = startY;
          break;
      }
    }

    if (current.length > 0) contours.push(current);
    this._stats.pathsRasterized++;
    return contours;
  }

  // ── Gradient Sampling ──────────────────────────────────────

  /** Sample a gradient at position t (0-1) */
  sampleGradient(grad: GradientDef, t: number): { r: number; g: number; b: number; a: number } {
    t = Math.max(0, Math.min(1, t));
    const stops = grad.stops;
    if (stops.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
    if (stops.length === 1 || t <= stops[0].offset) return stops[0];
    if (t >= stops[stops.length - 1].offset) return stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].offset && t <= stops[i + 1].offset) {
        const range = stops[i + 1].offset - stops[i].offset;
        const local = range > 0 ? (t - stops[i].offset) / range : 0;
        return {
          r: Math.round(stops[i].r + (stops[i + 1].r - stops[i].r) * local),
          g: Math.round(stops[i].g + (stops[i + 1].g - stops[i].g) * local),
          b: Math.round(stops[i].b + (stops[i + 1].b - stops[i].b) * local),
          a: Math.round(stops[i].a + (stops[i + 1].a - stops[i].a) * local),
        };
      }
    }
    this._stats.gradientsFilled++;
    return stops[stops.length - 1];
  }

  /** Compute gradient parameter t for a pixel position */
  gradientT(grad: GradientDef, px: number, py: number): number {
    switch (grad.type) {
      case "linear": {
        const dx = (grad.x1 ?? 1) - (grad.x0 ?? 0);
        const dy = (grad.y1 ?? 0) - (grad.y0 ?? 0);
        const len2 = dx * dx + dy * dy;
        if (len2 === 0) return 0;
        return ((px - (grad.x0 ?? 0)) * dx + (py - (grad.y0 ?? 0)) * dy) / len2;
      }
      case "radial": {
        const cx = grad.cx ?? 0;
        const cy = grad.cy ?? 0;
        const r = grad.r ?? 1;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        return dist / r;
      }
      case "conic": {
        const cx = grad.cx ?? 0;
        const cy = grad.cy ?? 0;
        const angle = Math.atan2(py - cy, px - cx) + Math.PI;
        const startAngle = grad.angle ?? 0;
        return ((angle - startAngle + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI);
      }
      default:
        return 0;
    }
  }

  // ── Glyph Cache ────────────────────────────────────────────

  /** Look up a cached glyph */
  getGlyph(charCode: number, fontSize: number, fontFamily: string): GlyphCacheEntry | null {
    const key = `${fontFamily}:${fontSize}:${charCode}:${this._dpiScale}`;
    const entry = this._glyphCache.get(key);
    if (entry) {
      entry.lastUsedFrame = this._frameCounter;
      this._stats.glyphCacheHits++;
      return entry;
    }
    this._stats.glyphCacheMisses++;
    return null;
  }

  /** Cache a rendered glyph */
  putGlyph(
    charCode: number,
    fontSize: number,
    fontFamily: string,
    coverage: Uint8Array,
    width: number,
    height: number,
    bearingX: number,
    bearingY: number,
    advance: number
  ): void {
    const key = `${fontFamily}:${fontSize}:${charCode}:${this._dpiScale}`;

    // Evict if cache full
    if (this._glyphCache.size >= MAX_GLYPH_CACHE) {
      this._evictOldestGlyph();
    }

    this._glyphCache.set(key, {
      key,
      coverage,
      width,
      height,
      bearingX,
      bearingY,
      advance,
      lastUsedFrame: this._frameCounter,
    });
    this._stats.glyphsCached = this._glyphCache.size;
  }

  /** Advance frame counter for LRU tracking */
  advanceFrame(): void {
    this._frameCounter++;
  }

  // ── Stroke Expansion ───────────────────────────────────────

  /** Expand a stroke into a filled path, supporting dash arrays */
  expandStroke(path: VectorPath, style: StrokeStyle): VectorPath {
    const contours = this.flattenPath(path);
    const result = this.createPath();
    const hw = (style.width * this._dpiScale) / 2;

    for (let contour of contours) {
      if (contour.length < 2) continue;

      // Apply dash array if specified
      if (style.dashArray && style.dashArray.length > 0) {
        contour = this._applyDashArray(contour, style.dashArray, style.dashOffset ?? 0);
        this._stats.dashExpansions++;
      }

      // Offset contour outward and inward
      const outer = this._offsetPolyline(contour, hw, style);
      const inner = this._offsetPolyline(contour, -hw, style);

      // Build closed outline: outer forward + inner reverse
      if (outer.length > 0) {
        result.commands.push({ type: "moveTo", x: outer[0].x, y: outer[0].y });
        for (let i = 1; i < outer.length; i++) {
          result.commands.push({ type: "lineTo", x: outer[i].x, y: outer[i].y });
        }
        for (let i = inner.length - 1; i >= 0; i--) {
          result.commands.push({ type: "lineTo", x: inner[i].x, y: inner[i].y });
        }
        result.commands.push({ type: "close" });
      }
    }

    return result;
  }

  // ── DPI ────────────────────────────────────────────────────

  setDpiScale(scale: number): void {
    this._dpiScale = Math.max(0.5, Math.min(4, scale));
    this._stats.dpiScale = this._dpiScale;
    // Clear glyph cache on DPI change
    this._glyphCache.clear();
    this._stats.glyphsCached = 0;
  }

  get dpiScale(): number {
    return this._dpiScale;
  }

  getStats(): VectorRendererStats {
    return { ...this._stats };
  }

  // ── Internal ────────────────────────────────────────────────

  private _flattenQuadratic(
    x0: number, y0: number,
    cx: number, cy: number,
    x1: number, y1: number
  ): Array<{ x: number; y: number }> {
    const pts: Array<{ x: number; y: number }> = [];
    const steps = this._estimateQuadSteps(x0, y0, cx, cy, x1, y1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      pts.push({
        x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
        y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
      });
    }
    return pts;
  }

  private _flattenCubic(
    x0: number, y0: number,
    c1x: number, c1y: number,
    c2x: number, c2y: number,
    x1: number, y1: number
  ): Array<{ x: number; y: number }> {
    const pts: Array<{ x: number; y: number }> = [];
    const steps = this._estimateCubicSteps(x0, y0, c1x, c1y, c2x, c2y, x1, y1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      pts.push({
        x: mt ** 3 * x0 + 3 * mt ** 2 * t * c1x + 3 * mt * t ** 2 * c2x + t ** 3 * x1,
        y: mt ** 3 * y0 + 3 * mt ** 2 * t * c1y + 3 * mt * t ** 2 * c2y + t ** 3 * y1,
      });
    }
    return pts;
  }

  private _flattenArc(
    cx: number, cy: number,
    cmd: Extract<PathCommand, { type: "arcTo" }>
  ): Array<{ x: number; y: number }> {
    // Simple arc approximation with line segments
    const pts: Array<{ x: number; y: number }> = [];
    const steps = Math.max(8, Math.ceil((cmd.rx + cmd.ry) * this._dpiScale / 4));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      pts.push({
        x: cx + (cmd.x - cx) * t,
        y: cy + (cmd.y - cy) * t,
      });
    }
    return pts;
  }

  private _estimateQuadSteps(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number): number {
    const dx = x0 - 2 * cx + x1;
    const dy = y0 - 2 * cy + y1;
    const dd = Math.sqrt(dx * dx + dy * dy);
    return Math.max(2, Math.ceil(Math.sqrt(dd / BEZIER_FLATNESS)));
  }

  private _estimateCubicSteps(
    x0: number, y0: number,
    c1x: number, c1y: number,
    c2x: number, c2y: number,
    x1: number, y1: number
  ): number {
    const dx1 = x0 - 2 * c1x + c2x;
    const dy1 = y0 - 2 * c1y + c2y;
    const dx2 = c1x - 2 * c2x + x1;
    const dy2 = c1y - 2 * c2y + y1;
    const dd = Math.max(Math.sqrt(dx1 * dx1 + dy1 * dy1), Math.sqrt(dx2 * dx2 + dy2 * dy2));
    return Math.max(2, Math.ceil(Math.sqrt(dd / BEZIER_FLATNESS)));
  }

  private _offsetPolyline(
    pts: Array<{ x: number; y: number }>,
    offset: number,
    _style: StrokeStyle
  ): Array<{ x: number; y: number }> {
    if (pts.length < 2) return [];
    const result: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      const nx = -dy / len * offset;
      const ny = dx / len * offset;
      result.push({ x: pts[i].x + nx, y: pts[i].y + ny });
      if (i === pts.length - 2) {
        result.push({ x: pts[i + 1].x + nx, y: pts[i + 1].y + ny });
      }
    }
    return result;
  }

  private _evictOldestGlyph(): void {
    let oldest: string | null = null;
    let oldestFrame = Infinity;
    for (const [key, entry] of this._glyphCache) {
      if (entry.lastUsedFrame < oldestFrame) {
        oldestFrame = entry.lastUsedFrame;
        oldest = key;
      }
    }
    if (oldest) {
      this._glyphCache.delete(oldest);
      this._stats.glyphCacheEvictions++;
    }
  }

  // ── Dash Array ─────────────────────────────────────────────

  private _applyDashArray(
    pts: Array<{ x: number; y: number }>,
    dashArray: number[],
    dashOffset: number
  ): Array<{ x: number; y: number }> {
    if (dashArray.length === 0) return pts;

    // Normalize dash array (ensure even length)
    const dashes = dashArray.length % 2 === 0 ? dashArray : [...dashArray, ...dashArray];
    const result: Array<{ x: number; y: number }> = [];

    let dashIndex = 0;
    let dashRemaining = dashes[0];
    let drawing = true;
    let offset = dashOffset;

    // Skip offset
    while (offset > 0 && offset >= dashRemaining) {
      offset -= dashRemaining;
      dashIndex = (dashIndex + 1) % dashes.length;
      dashRemaining = dashes[dashIndex];
      drawing = !drawing;
    }
    if (offset > 0) {
      dashRemaining -= offset;
    }

    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (segLen === 0) continue;

      let consumed = 0;
      while (consumed < segLen) {
        const available = segLen - consumed;
        const take = Math.min(available, dashRemaining);
        const t0 = consumed / segLen;
        const t1 = (consumed + take) / segLen;

        if (drawing) {
          result.push({
            x: pts[i].x + dx * t0,
            y: pts[i].y + dy * t0,
          });
          result.push({
            x: pts[i].x + dx * t1,
            y: pts[i].y + dy * t1,
          });
        }

        consumed += take;
        dashRemaining -= take;
        if (dashRemaining <= 0) {
          dashIndex = (dashIndex + 1) % dashes.length;
          dashRemaining = dashes[dashIndex];
          drawing = !drawing;
        }
      }
    }

    return result;
  }

  // ── Point-in-Path (for clip testing) ───────────────────────

  private _pointInPath(path: VectorPath, px: number, py: number): boolean {
    const contours = this.flattenPath(path);
    let totalCrossings = 0;

    for (const contour of contours) {
      if (contour.length < 3) continue;
      for (let i = 0; i < contour.length - 1; i++) {
        const v0 = contour[i];
        const v1 = contour[i + 1];
        if ((v0.y <= py && v1.y > py) || (v1.y <= py && v0.y > py)) {
          const t = (py - v0.y) / (v1.y - v0.y);
          if (px < v0.x + t * (v1.x - v0.x)) {
            totalCrossings++;
          }
        }
      }
    }

    if (path.fillRule === "even-odd") return (totalCrossings % 2) !== 0;
    return totalCrossings > 0; // winding (simplified)
  }
}
