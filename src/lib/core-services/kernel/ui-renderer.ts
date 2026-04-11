// ═══════════════════════════════════════════════════════════════
// SITA OS — High-Level UI Drawing API
// Section 5.5: Declarative view rendering compiled to draw calls
// ═══════════════════════════════════════════════════════════════

import type { TileBuffer, Color } from "./software-rasterizer";
import type { Rect } from "./damage-tracker";
import { CommandBuffer, CommandBufferPool, type SoftwarePipeline } from "./command-buffer";

// ── Color Types ─────────────────────────────────────────────

export interface UIColor {
  r: number; g: number; b: number; a: number;
}

export interface UIGradientStop {
  offset: number; // 0.0 – 1.0
  color: UIColor;
}

export type UIBackground =
  | { type: "solid"; r: number; g: number; b: number; a: number }
  | { type: "linearGradient"; angle: number; stops: UIGradientStop[] }
  | { type: "radialGradient"; cx: number; cy: number; radius: number; stops: UIGradientStop[] };

export interface UIBoxShadow {
  offsetX: number;
  offsetY: number;
  blur: number;        // blur radius in pixels
  spread: number;      // spread distance
  color: UIColor;
  inset?: boolean;
}

export interface UIBorder {
  width: number;
  color: UIColor;
  style?: "solid" | "dashed" | "dotted";
}

export interface UIBorderRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

// ── View Properties ─────────────────────────────────────────

export interface UIViewProps {
  x: number;
  y: number;
  width: number;
  height: number;
  background?: UIBackground;
  borderRadius?: number | UIBorderRadii;
  shadow?: UIBoxShadow | UIBoxShadow[];
  border?: UIBorder;
  opacity?: number;       // 0.0 – 1.0
  clipChildren?: boolean;
  overflow?: "visible" | "hidden";
}

export interface UITextProps {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: UIColor;
  fontWeight?: "normal" | "bold";
  maxWidth?: number;
}

// ── CPU Box Blur ────────────────────────────────────────────

export interface BlurConfig {
  radius: number;
  passes: number; // 3 passes ≈ Gaussian
}

/**
 * Separable box blur — O(1) per pixel using sliding window sum.
 * Horizontal pass then vertical pass, repeated for multi-pass Gaussian approximation.
 */
export class CpuBlur {
  /**
   * Apply box blur to a tile buffer region.
   * Uses separable horizontal + vertical passes with O(1) sliding window.
   * 3 passes approximates Gaussian blur.
   */
  static blur(
    target: TileBuffer,
    region: Rect,
    radius: number,
    passes = 3
  ): void {
    if (radius <= 0) return;

    const r = Math.ceil(radius);
    const scratch = new Uint8ClampedArray(target.pixels.length);

    for (let pass = 0; pass < passes; pass++) {
      // Horizontal pass: target → scratch
      CpuBlur._horizontalPass(target, scratch, region, r);

      // Copy scratch back
      scratch.forEach((v, i) => { target.pixels[i] = v; });

      // Vertical pass: target → scratch
      CpuBlur._verticalPass(target, scratch, region, r);

      // Copy scratch back
      scratch.forEach((v, i) => { target.pixels[i] = v; });
    }
  }

  /**
   * Blur into a separate output buffer (for shadow generation).
   */
  static blurInto(
    src: TileBuffer,
    dst: TileBuffer,
    region: Rect,
    radius: number,
    passes = 3
  ): void {
    // Copy src region into dst
    const srcLen = src.pixels.length;
    for (let i = 0; i < srcLen; i++) {
      dst.pixels[i] = src.pixels[i];
    }
    CpuBlur.blur(dst, region, radius, passes);
  }

  /** O(1) horizontal sliding window blur */
  private static _horizontalPass(
    src: TileBuffer,
    dst: Uint8ClampedArray,
    region: Rect,
    radius: number
  ): void {
    const w = src.width;
    const x0 = Math.max(region.x, 0);
    const x1 = Math.min(region.x + region.width, w);
    const y0 = Math.max(region.y, 0);
    const y1 = Math.min(region.y + region.height, src.height);
    const diameter = radius * 2 + 1;

    for (let y = y0; y < y1; y++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;

      // Initialize window for first pixel
      for (let kx = -radius; kx <= radius; kx++) {
        const sx = Math.max(x0, Math.min(x1 - 1, x0 + kx));
        const off = (y * w + sx) * 4;
        sumR += src.pixels[off];
        sumG += src.pixels[off + 1];
        sumB += src.pixels[off + 2];
        sumA += src.pixels[off + 3];
      }

      for (let x = x0; x < x1; x++) {
        const dstOff = (y * w + x) * 4;
        dst[dstOff] = (sumR / diameter) | 0;
        dst[dstOff + 1] = (sumG / diameter) | 0;
        dst[dstOff + 2] = (sumB / diameter) | 0;
        dst[dstOff + 3] = (sumA / diameter) | 0;

        // Slide window: remove left, add right
        const removeX = Math.max(x0, Math.min(x1 - 1, x - radius));
        const addX = Math.max(x0, Math.min(x1 - 1, x + radius + 1));

        const removeOff = (y * w + removeX) * 4;
        const addOff = (y * w + addX) * 4;

        sumR += src.pixels[addOff] - src.pixels[removeOff];
        sumG += src.pixels[addOff + 1] - src.pixels[removeOff + 1];
        sumB += src.pixels[addOff + 2] - src.pixels[removeOff + 2];
        sumA += src.pixels[addOff + 3] - src.pixels[removeOff + 3];
      }
    }
  }

  /** O(1) vertical sliding window blur */
  private static _verticalPass(
    src: TileBuffer,
    dst: Uint8ClampedArray,
    region: Rect,
    radius: number
  ): void {
    const w = src.width;
    const h = src.height;
    const x0 = Math.max(region.x, 0);
    const x1 = Math.min(region.x + region.width, w);
    const y0 = Math.max(region.y, 0);
    const y1 = Math.min(region.y + region.height, h);
    const diameter = radius * 2 + 1;

    for (let x = x0; x < x1; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;

      // Initialize window
      for (let ky = -radius; ky <= radius; ky++) {
        const sy = Math.max(y0, Math.min(y1 - 1, y0 + ky));
        const off = (sy * w + x) * 4;
        sumR += src.pixels[off];
        sumG += src.pixels[off + 1];
        sumB += src.pixels[off + 2];
        sumA += src.pixels[off + 3];
      }

      for (let y = y0; y < y1; y++) {
        const dstOff = (y * w + x) * 4;
        dst[dstOff] = (sumR / diameter) | 0;
        dst[dstOff + 1] = (sumG / diameter) | 0;
        dst[dstOff + 2] = (sumB / diameter) | 0;
        dst[dstOff + 3] = (sumA / diameter) | 0;

        const removeY = Math.max(y0, Math.min(y1 - 1, y - radius));
        const addY = Math.max(y0, Math.min(y1 - 1, y + radius + 1));

        const removeOff = (removeY * w + x) * 4;
        const addOff = (addY * w + x) * 4;

        sumR += src.pixels[addOff] - src.pixels[removeOff];
        sumG += src.pixels[addOff + 1] - src.pixels[removeOff + 1];
        sumB += src.pixels[addOff + 2] - src.pixels[removeOff + 2];
        sumA += src.pixels[addOff + 3] - src.pixels[removeOff + 3];
      }
    }
  }
}

// ── Rounded Rect Path Generation ────────────────────────────

function resolveRadii(r: number | UIBorderRadii | undefined): UIBorderRadii {
  if (!r) return { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
  if (typeof r === "number") return { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
  return r;
}

/**
 * Generate scanline coverage for a rounded rectangle.
 * Returns per-row [xStart, xEnd] pairs for filled region.
 */
function roundedRectScanlines(
  x: number, y: number, w: number, h: number,
  radii: UIBorderRadii
): Array<{ row: number; x0: number; x1: number }> {
  const lines: Array<{ row: number; x0: number; x1: number }> = [];

  const tl = Math.min(radii.topLeft, w / 2, h / 2);
  const tr = Math.min(radii.topRight, w / 2, h / 2);
  const br = Math.min(radii.bottomRight, w / 2, h / 2);
  const bl = Math.min(radii.bottomLeft, w / 2, h / 2);

  for (let row = 0; row < h; row++) {
    let x0 = 0;
    let x1 = w;

    // Top-left corner
    if (row < tl) {
      const dy = tl - row - 0.5;
      const dx = tl - Math.sqrt(Math.max(0, tl * tl - dy * dy));
      x0 = Math.max(x0, dx);
    }

    // Top-right corner
    if (row < tr) {
      const dy = tr - row - 0.5;
      const dx = tr - Math.sqrt(Math.max(0, tr * tr - dy * dy));
      x1 = Math.min(x1, w - dx);
    }

    // Bottom-left corner
    if (row >= h - bl) {
      const dy = row - (h - bl) + 0.5;
      const dx = bl - Math.sqrt(Math.max(0, bl * bl - dy * dy));
      x0 = Math.max(x0, dx);
    }

    // Bottom-right corner
    if (row >= h - br) {
      const dy = row - (h - br) + 0.5;
      const dx = br - Math.sqrt(Math.max(0, br * br - dy * dy));
      x1 = Math.min(x1, w - dx);
    }

    if (x0 < x1) {
      lines.push({ row: y + row, x0: x + Math.ceil(x0), x1: x + Math.floor(x1) });
    }
  }

  return lines;
}

// ── Gradient Interpolation ──────────────────────────────────

function interpolateGradientColor(stops: UIGradientStop[], t: number): UIColor {
  if (stops.length === 0) return { r: 0, g: 0, b: 0, a: 255 };
  if (stops.length === 1) return stops[0].color;

  const clamped = Math.max(0, Math.min(1, t));

  // Find surrounding stops
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].offset && clamped <= stops[i + 1].offset) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.offset - lower.offset;
  const f = range > 0 ? (clamped - lower.offset) / range : 0;

  return {
    r: (lower.color.r + (upper.color.r - lower.color.r) * f) | 0,
    g: (lower.color.g + (upper.color.g - lower.color.g) * f) | 0,
    b: (lower.color.b + (upper.color.b - lower.color.b) * f) | 0,
    a: (lower.color.a + (upper.color.a - lower.color.a) * f) | 0,
  };
}

// ── UI Renderer ─────────────────────────────────────────────

export interface UIRendererStats {
  viewsDrawn: number;
  shadowPassCount: number;
  blurPassCount: number;
  gradientFillCount: number;
  roundedRectCount: number;
  commandBufferStats: {
    commandCount: number;
    drawCallCount: number;
    simdBatchCount: number;
  };
}

export class UIRenderer {
  private _cmdPool: CommandBufferPool;
  private _pipeline: SoftwarePipeline | null = null;
  private _scratchBuffer: TileBuffer | null = null;
  private _stats: UIRendererStats = {
    viewsDrawn: 0,
    shadowPassCount: 0,
    blurPassCount: 0,
    gradientFillCount: 0,
    roundedRectCount: 0,
    commandBufferStats: { commandCount: 0, drawCallCount: 0, simdBatchCount: 0 },
  };

  constructor(pipeline?: SoftwarePipeline) {
    this._cmdPool = new CommandBufferPool(8);
    this._pipeline = pipeline ?? null;
  }

  /**
   * Draw a declarative view into a tile buffer.
   * Compiles to: shadow blur pass → rounded-rect clip → background fill → border stroke
   */
  drawView(target: TileBuffer, props: UIViewProps): void {
    this._stats.viewsDrawn++;

    const radii = resolveRadii(props.borderRadius);
    const hasRadius = radii.topLeft > 0 || radii.topRight > 0 || radii.bottomRight > 0 || radii.bottomLeft > 0;
    const opacity = props.opacity ?? 1.0;

    if (opacity <= 0) return;

    // 1. Shadow pass(es)
    const shadows = props.shadow
      ? (Array.isArray(props.shadow) ? props.shadow : [props.shadow])
      : [];

    for (const shadow of shadows) {
      if (!shadow.inset) {
        this._drawOuterShadow(target, props, shadow, radii);
      }
    }

    // 2. Background fill (with rounded-rect clipping)
    if (props.background) {
      if (hasRadius) {
        this._stats.roundedRectCount++;
        this._fillRoundedRect(target, props.x, props.y, props.width, props.height, radii, props.background, opacity);
      } else {
        this._fillBackground(target, props.x, props.y, props.width, props.height, props.background, opacity);
      }
    }

    // 3. Inset shadows (after background, clipped to shape)
    for (const shadow of shadows) {
      if (shadow.inset) {
        this._drawInsetShadow(target, props, shadow, radii);
      }
    }

    // 4. Border stroke
    if (props.border && props.border.width > 0) {
      this._drawBorder(target, props, radii);
    }
  }

  /**
   * Draw text (simplified — emits filled rects per character as placeholder glyph rendering).
   */
  drawText(target: TileBuffer, props: UITextProps): void {
    // Placeholder: real text rendering uses TextLayoutEngine + glyph cache
    const charWidth = props.fontSize * 0.6;
    const color: Color = { r: props.color.r, g: props.color.g, b: props.color.b, a: props.color.a };

    let x = props.x;
    for (let i = 0; i < props.text.length; i++) {
      if (props.maxWidth && x - props.x + charWidth > props.maxWidth) break;
      if (props.text[i] !== " ") {
        this._fillSolidRect(target, x | 0, props.y | 0, Math.ceil(charWidth * 0.8), props.fontSize, color, 1.0);
      }
      x += charWidth;
    }
  }

  /**
   * Apply blur to a region of the tile buffer.
   */
  blurRegion(target: TileBuffer, region: Rect, radius: number, passes = 3): void {
    this._stats.blurPassCount += passes;
    CpuBlur.blur(target, region, radius, passes);
  }

  getStats(): UIRendererStats {
    return { ...this._stats };
  }

  resetStats(): void {
    this._stats = {
      viewsDrawn: 0,
      shadowPassCount: 0,
      blurPassCount: 0,
      gradientFillCount: 0,
      roundedRectCount: 0,
      commandBufferStats: { commandCount: 0, drawCallCount: 0, simdBatchCount: 0 },
    };
  }

  // ── Private: Shadow ──

  private _drawOuterShadow(
    target: TileBuffer, props: UIViewProps, shadow: UIBoxShadow, radii: UIBorderRadii
  ): void {
    this._stats.shadowPassCount++;

    const spread = shadow.spread || 0;
    const sx = props.x + shadow.offsetX - spread;
    const sy = props.y + shadow.offsetY - spread;
    const sw = props.width + spread * 2;
    const sh = props.height + spread * 2;

    if (shadow.blur > 0) {
      // Ensure scratch buffer exists and matches
      this._ensureScratchBuffer(target.width, target.height);
      const scratch = this._scratchBuffer!;

      // Clear scratch
      scratch.pixels.fill(0);

      // Draw shadow shape into scratch buffer
      const shadowColor: Color = {
        r: shadow.color.r, g: shadow.color.g,
        b: shadow.color.b, a: shadow.color.a,
      };

      if (radii.topLeft > 0 || radii.topRight > 0 || radii.bottomRight > 0 || radii.bottomLeft > 0) {
        const lines = roundedRectScanlines(sx, sy, sw, sh, radii);
        for (const line of lines) {
          this._fillSolidRect(scratch, line.x0, line.row, line.x1 - line.x0, 1, shadowColor, 1.0);
        }
      } else {
        this._fillSolidRect(scratch, sx, sy, sw, sh, shadowColor, 1.0);
      }

      // Blur the scratch buffer
      CpuBlur.blur(scratch, {
        x: Math.max(0, sx - shadow.blur),
        y: Math.max(0, sy - shadow.blur),
        width: sw + shadow.blur * 2,
        height: sh + shadow.blur * 2,
      }, shadow.blur, 3);
      this._stats.blurPassCount += 3;

      // Composite scratch onto target (source-over)
      this._compositeBuffers(scratch, target);
    } else {
      // No blur — direct shadow rect
      const c: Color = { r: shadow.color.r, g: shadow.color.g, b: shadow.color.b, a: shadow.color.a };
      this._fillSolidRect(target, sx, sy, sw, sh, c, 1.0);
    }
  }

  private _drawInsetShadow(
    target: TileBuffer, props: UIViewProps, shadow: UIBoxShadow, _radii: UIBorderRadii
  ): void {
    this._stats.shadowPassCount++;
    // Simplified inset shadow: darken edges
    const c: Color = { r: shadow.color.r, g: shadow.color.g, b: shadow.color.b, a: (shadow.color.a * 0.5) | 0 };
    const blur = shadow.blur || 2;
    // Top edge
    this._fillSolidRect(target, props.x, props.y + shadow.offsetY, props.width, blur, c, 0.5);
    // Left edge
    this._fillSolidRect(target, props.x + shadow.offsetX, props.y, blur, props.height, c, 0.5);
  }

  // ── Private: Background Fill ──

  private _fillBackground(
    target: TileBuffer, x: number, y: number, w: number, h: number,
    bg: UIBackground, opacity: number
  ): void {
    switch (bg.type) {
      case "solid":
        this._fillSolidRect(target, x, y, w, h, { r: bg.r, g: bg.g, b: bg.b, a: (bg.a * opacity) | 0 }, 1.0);
        break;
      case "linearGradient":
        this._fillLinearGradient(target, x, y, w, h, bg.angle, bg.stops, opacity);
        break;
      case "radialGradient":
        this._fillRadialGradient(target, x, y, w, h, bg.cx, bg.cy, bg.radius, bg.stops, opacity);
        break;
    }
  }

  private _fillRoundedRect(
    target: TileBuffer, x: number, y: number, w: number, h: number,
    radii: UIBorderRadii, bg: UIBackground, opacity: number
  ): void {
    const lines = roundedRectScanlines(x, y, w, h, radii);

    if (bg.type === "solid") {
      const color: Color = { r: bg.r, g: bg.g, b: bg.b, a: (bg.a * opacity) | 0 };
      for (const line of lines) {
        this._fillSolidRect(target, line.x0, line.row, line.x1 - line.x0, 1, color, 1.0);
      }
    } else if (bg.type === "linearGradient") {
      this._stats.gradientFillCount++;
      const angleRad = (bg.angle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const diag = Math.abs(w * cos) + Math.abs(h * sin);

      for (const line of lines) {
        for (let px = line.x0; px < line.x1; px++) {
          const lx = px - x;
          const ly = line.row - y;
          const t = diag > 0 ? (lx * cos + ly * sin) / diag + 0.5 : 0;
          const c = interpolateGradientColor(bg.stops, t);
          const a = (c.a * opacity) | 0;
          this._writePixel(target, px, line.row, c.r, c.g, c.b, a);
        }
      }
    } else if (bg.type === "radialGradient") {
      this._stats.gradientFillCount++;
      for (const line of lines) {
        for (let px = line.x0; px < line.x1; px++) {
          const dx = (px - x) / w - bg.cx;
          const dy = (line.row - y) / h - bg.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = bg.radius > 0 ? dist / bg.radius : 0;
          const c = interpolateGradientColor(bg.stops, t);
          const a = (c.a * opacity) | 0;
          this._writePixel(target, px, line.row, c.r, c.g, c.b, a);
        }
      }
    }
  }

  private _fillLinearGradient(
    target: TileBuffer, x: number, y: number, w: number, h: number,
    angle: number, stops: UIGradientStop[], opacity: number
  ): void {
    this._stats.gradientFillCount++;
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const diag = Math.abs(w * cos) + Math.abs(h * sin);

    const x0 = Math.max(x, 0);
    const y0 = Math.max(y, 0);
    const x1 = Math.min(x + w, target.width);
    const y1 = Math.min(y + h, target.height);

    for (let row = y0; row < y1; row++) {
      for (let col = x0; col < x1; col++) {
        const lx = col - x;
        const ly = row - y;
        const t = diag > 0 ? (lx * cos + ly * sin) / diag + 0.5 : 0;
        const c = interpolateGradientColor(stops, t);
        const a = (c.a * opacity) | 0;
        this._writePixel(target, col, row, c.r, c.g, c.b, a);
      }
    }
  }

  private _fillRadialGradient(
    target: TileBuffer, x: number, y: number, w: number, h: number,
    cx: number, cy: number, radius: number, stops: UIGradientStop[], opacity: number
  ): void {
    this._stats.gradientFillCount++;
    const x0 = Math.max(x, 0);
    const y0 = Math.max(y, 0);
    const x1 = Math.min(x + w, target.width);
    const y1 = Math.min(y + h, target.height);

    for (let row = y0; row < y1; row++) {
      for (let col = x0; col < x1; col++) {
        const dx = (col - x) / w - cx;
        const dy = (row - y) / h - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = radius > 0 ? dist / radius : 0;
        const c = interpolateGradientColor(stops, t);
        const a = (c.a * opacity) | 0;
        this._writePixel(target, col, row, c.r, c.g, c.b, a);
      }
    }
  }

  // ── Private: Border ──

  private _drawBorder(target: TileBuffer, props: UIViewProps, radii: UIBorderRadii): void {
    const b = props.border!;
    const bw = b.width;
    const color: Color = { r: b.color.r, g: b.color.g, b: b.color.b, a: b.color.a };
    const hasRadius = radii.topLeft > 0 || radii.topRight > 0 || radii.bottomRight > 0 || radii.bottomLeft > 0;

    if (hasRadius) {
      // Render border as difference of outer and inner rounded rects
      const outerLines = roundedRectScanlines(props.x, props.y, props.width, props.height, radii);
      const innerRadii: UIBorderRadii = {
        topLeft: Math.max(0, radii.topLeft - bw),
        topRight: Math.max(0, radii.topRight - bw),
        bottomRight: Math.max(0, radii.bottomRight - bw),
        bottomLeft: Math.max(0, radii.bottomLeft - bw),
      };
      const innerLines = roundedRectScanlines(
        props.x + bw, props.y + bw, props.width - bw * 2, props.height - bw * 2, innerRadii
      );

      // Create lookup for inner lines
      const innerMap = new Map<number, { x0: number; x1: number }>();
      for (const il of innerLines) {
        innerMap.set(il.row, { x0: il.x0, x1: il.x1 });
      }

      for (const ol of outerLines) {
        const inner = innerMap.get(ol.row);
        if (!inner) {
          // Entire row is border
          this._fillSolidRect(target, ol.x0, ol.row, ol.x1 - ol.x0, 1, color, 1.0);
        } else {
          // Left border segment
          if (ol.x0 < inner.x0) {
            this._fillSolidRect(target, ol.x0, ol.row, inner.x0 - ol.x0, 1, color, 1.0);
          }
          // Right border segment
          if (inner.x1 < ol.x1) {
            this._fillSolidRect(target, inner.x1, ol.row, ol.x1 - inner.x1, 1, color, 1.0);
          }
        }
      }
    } else {
      // Simple rect border — 4 edges
      // Top
      this._fillSolidRect(target, props.x, props.y, props.width, bw, color, 1.0);
      // Bottom
      this._fillSolidRect(target, props.x, props.y + props.height - bw, props.width, bw, color, 1.0);
      // Left
      this._fillSolidRect(target, props.x, props.y + bw, bw, props.height - bw * 2, color, 1.0);
      // Right
      this._fillSolidRect(target, props.x + props.width - bw, props.y + bw, bw, props.height - bw * 2, color, 1.0);
    }
  }

  // ── Private: Pixel Operations ──

  private _fillSolidRect(
    target: TileBuffer, x: number, y: number, w: number, h: number,
    color: Color, opacity: number
  ): void {
    const x0 = Math.max(x | 0, 0);
    const y0 = Math.max(y | 0, 0);
    const x1 = Math.min((x + w) | 0, target.width);
    const y1 = Math.min((y + h) | 0, target.height);
    const a = (color.a * opacity) | 0;

    if (a === 255) {
      // Opaque fast path
      for (let row = y0; row < y1; row++) {
        const rowOff = row * target.width * 4;
        for (let col = x0; col < x1; col++) {
          const off = rowOff + col * 4;
          target.pixels[off] = color.r;
          target.pixels[off + 1] = color.g;
          target.pixels[off + 2] = color.b;
          target.pixels[off + 3] = 255;
        }
      }
    } else if (a > 0) {
      // Alpha blend
      const invA = 255 - a;
      for (let row = y0; row < y1; row++) {
        const rowOff = row * target.width * 4;
        for (let col = x0; col < x1; col++) {
          const off = rowOff + col * 4;
          target.pixels[off] = ((color.r * a + target.pixels[off] * invA) / 255) | 0;
          target.pixels[off + 1] = ((color.g * a + target.pixels[off + 1] * invA) / 255) | 0;
          target.pixels[off + 2] = ((color.b * a + target.pixels[off + 2] * invA) / 255) | 0;
          target.pixels[off + 3] = Math.min(255, a + ((target.pixels[off + 3] * invA) / 255) | 0);
        }
      }
    }
  }

  private _writePixel(target: TileBuffer, x: number, y: number, r: number, g: number, b: number, a: number): void {
    if (x < 0 || x >= target.width || y < 0 || y >= target.height) return;
    const off = (y * target.width + x) * 4;

    if (a >= 255) {
      target.pixels[off] = r;
      target.pixels[off + 1] = g;
      target.pixels[off + 2] = b;
      target.pixels[off + 3] = 255;
    } else if (a > 0) {
      const invA = 255 - a;
      target.pixels[off] = ((r * a + target.pixels[off] * invA) / 255) | 0;
      target.pixels[off + 1] = ((g * a + target.pixels[off + 1] * invA) / 255) | 0;
      target.pixels[off + 2] = ((b * a + target.pixels[off + 2] * invA) / 255) | 0;
      target.pixels[off + 3] = Math.min(255, a + ((target.pixels[off + 3] * invA) / 255) | 0);
    }
  }

  private _ensureScratchBuffer(w: number, h: number): void {
    if (!this._scratchBuffer || this._scratchBuffer.width !== w || this._scratchBuffer.height !== h) {
      this._scratchBuffer = {
        pixels: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
        format: "rgba8888",
        cacheLineAligned: false,
      };
    }
  }

  private _compositeBuffers(src: TileBuffer, dst: TileBuffer): void {
    const len = Math.min(src.pixels.length, dst.pixels.length);
    for (let i = 0; i < len; i += 4) {
      const sa = src.pixels[i + 3];
      if (sa === 0) continue;

      if (sa === 255) {
        dst.pixels[i] = src.pixels[i];
        dst.pixels[i + 1] = src.pixels[i + 1];
        dst.pixels[i + 2] = src.pixels[i + 2];
        dst.pixels[i + 3] = 255;
      } else {
        const invA = 255 - sa;
        dst.pixels[i] = ((src.pixels[i] * sa + dst.pixels[i] * invA) / 255) | 0;
        dst.pixels[i + 1] = ((src.pixels[i + 1] * sa + dst.pixels[i + 1] * invA) / 255) | 0;
        dst.pixels[i + 2] = ((src.pixels[i + 2] * sa + dst.pixels[i + 2] * invA) / 255) | 0;
        dst.pixels[i + 3] = Math.min(255, sa + ((dst.pixels[i + 3] * invA) / 255) | 0);
      }
    }
  }
}
