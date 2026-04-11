// ═══════════════════════════════════════════════════════════════
// SITA OS — Software Rasterizer
// CPU-only scanline rasterizer with analytical anti-aliasing,
// SIMD-modeled batch ops, blend modes, gamma-correct blending
// ═══════════════════════════════════════════════════════════════

export type PixelFormat = "RGBA8888" | "RGB565" | "A8";
export type BlendMode = "source-over" | "multiply" | "screen" | "add" | "copy";

export interface Color {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-255
}

export interface TileBuffer {
  width: number;
  height: number;
  pixels: Uint8ClampedArray; // RGBA interleaved
  format: PixelFormat;
  cacheLineAligned: boolean;
}

export interface RasterizerStats {
  pixelsFilled: number;
  pixelsBlended: number;
  pixelsCopied: number;
  scanlinesProcesed: number;
  simdBatchOps: number;
  antiAliasedEdges: number;
  subPixelTextRuns: number;
  cacheHits: number;
  cacheMisses: number;
  lifetimeFrames: number;
}

interface ScanlineSpan {
  xStart: number;
  xEnd: number;
  coverage: number; // 0-1 for anti-aliasing
}

const SUBPIXEL_BITS = 4; // 16 subpixel positions
const SUBPIXEL_SCALE = 1 << SUBPIXEL_BITS;
const AA_SAMPLES = 4; // 4x analytical AA

export class SoftwareRasterizer {
  private _stats: RasterizerStats = {
    pixelsFilled: 0,
    pixelsBlended: 0,
    pixelsCopied: 0,
    scanlinesProcesed: 0,
    simdBatchOps: 0,
    antiAliasedEdges: 0,
    subPixelTextRuns: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lifetimeFrames: 0,
  };

  private _gammaLUT: Uint8Array; // sRGB → linear
  private _invGammaLUT: Uint8Array; // linear → sRGB

  constructor() {
    this._gammaLUT = this._buildGammaLUT();
    this._invGammaLUT = this._buildInvGammaLUT();
  }

  // ── Tile Buffer Management ─────────────────────────────────

  createTileBuffer(width: number, height: number, format: PixelFormat = "RGBA8888"): TileBuffer {
    // Align to 64 bytes (cache line) for spatial locality
    const stride = width * 4;
    const alignedStride = Math.ceil(stride / 64) * 64;
    const pixels = new Uint8ClampedArray(alignedStride * height);
    return { width, height, pixels, format, cacheLineAligned: true };
  }

  clearTile(tile: TileBuffer, color: Color = { r: 0, g: 0, b: 0, a: 0 }): void {
    // SIMD-modeled: fill 4 pixels at a time
    const len = tile.width * tile.height;
    for (let i = 0; i < len; i++) {
      const off = i * 4;
      tile.pixels[off] = color.r;
      tile.pixels[off + 1] = color.g;
      tile.pixels[off + 2] = color.b;
      tile.pixels[off + 3] = color.a;
    }
    this._stats.simdBatchOps += Math.ceil(len / 4);
  }

  // ── Scanline Rasterization ─────────────────────────────────

  /** Fill a convex polygon (triangle/quad) using scanline rasterization */
  fillPolygon(
    tile: TileBuffer,
    vertices: Array<{ x: number; y: number }>,
    color: Color,
    blend: BlendMode = "source-over"
  ): void {
    if (vertices.length < 3) return;

    // Find Y bounds
    let yMin = Infinity, yMax = -Infinity;
    for (const v of vertices) {
      yMin = Math.min(yMin, v.y);
      yMax = Math.max(yMax, v.y);
    }
    yMin = Math.max(0, Math.floor(yMin));
    yMax = Math.min(tile.height - 1, Math.ceil(yMax));

    for (let y = yMin; y <= yMax; y++) {
      const spans = this._computeScanlineSpans(vertices, y);
      for (const span of spans) {
        this._fillSpan(tile, y, span.xStart, span.xEnd, color, span.coverage, blend);
      }
      this._stats.scanlinesProcesed++;
    }
  }

  /** Fill an axis-aligned rectangle — fast path */
  fillRect(
    tile: TileBuffer,
    x: number, y: number, w: number, h: number,
    color: Color,
    blend: BlendMode = "source-over"
  ): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(tile.width, Math.ceil(x + w));
    const y1 = Math.min(tile.height, Math.ceil(y + h));

    for (let row = y0; row < y1; row++) {
      // Edge coverage for anti-aliasing
      const topCoverage = row === y0 ? Math.min(1, (row + 1) - y) : 1;
      const bottomCoverage = row === y1 - 1 ? Math.min(1, (y + h) - row) : 1;
      const rowCoverage = Math.min(topCoverage, bottomCoverage);

      this._fillSpan(tile, row, x0, x1, color, rowCoverage, blend);
      this._stats.scanlinesProcesed++;
      if (rowCoverage < 1) this._stats.antiAliasedEdges++;
    }
  }

  /** Horizontal line with analytical coverage for anti-aliased edges */
  fillAntiAliasedEdge(
    tile: TileBuffer,
    y: number,
    x0: number, x1: number,
    color: Color,
    coverage: number
  ): void {
    this._fillSpan(tile, Math.floor(y), Math.floor(x0), Math.ceil(x1), color, coverage, "source-over");
    this._stats.antiAliasedEdges++;
  }

  // ── Blend Modes ────────────────────────────────────────────

  private _blend(dst: Color, src: Color, mode: BlendMode, coverage: number): Color {
    const sa = (src.a / 255) * coverage;
    if (mode === "copy" || sa >= 1) {
      return { r: src.r, g: src.g, b: src.b, a: Math.round(sa * 255) };
    }

    const da = dst.a / 255;

    // Gamma-correct: convert to linear
    const sr = this._gammaLUT[src.r] / 255;
    const sg = this._gammaLUT[src.g] / 255;
    const sb = this._gammaLUT[src.b] / 255;
    const dr = this._gammaLUT[dst.r] / 255;
    const dg = this._gammaLUT[dst.g] / 255;
    const db = this._gammaLUT[dst.b] / 255;

    let outR: number, outG: number, outB: number, outA: number;

    switch (mode) {
      case "source-over": {
        outA = sa + da * (1 - sa);
        if (outA === 0) return { r: 0, g: 0, b: 0, a: 0 };
        outR = (sr * sa + dr * da * (1 - sa)) / outA;
        outG = (sg * sa + dg * da * (1 - sa)) / outA;
        outB = (sb * sa + db * da * (1 - sa)) / outA;
        break;
      }
      case "multiply": {
        outR = sr * dr;
        outG = sg * dg;
        outB = sb * db;
        outA = sa + da * (1 - sa);
        break;
      }
      case "screen": {
        outR = sr + dr - sr * dr;
        outG = sg + dg - sg * dg;
        outB = sb + db - sb * db;
        outA = sa + da * (1 - sa);
        break;
      }
      case "add": {
        outR = Math.min(1, sr + dr);
        outG = Math.min(1, sg + dg);
        outB = Math.min(1, sb + db);
        outA = Math.min(1, sa + da);
        break;
      }
      default:
        return dst;
    }

    return {
      r: this._invGammaLUT[Math.round(outR * 255)],
      g: this._invGammaLUT[Math.round(outG * 255)],
      b: this._invGammaLUT[Math.round(outB * 255)],
      a: Math.round(outA * 255),
    };
  }

  // ── Sub-pixel Text Rendering ───────────────────────────────

  /** Render a glyph with LCD sub-pixel filtering (RGB stripe) */
  renderSubPixelGlyph(
    tile: TileBuffer,
    glyphCoverage: Uint8Array, // per-subpixel coverage (width*3 × height)
    glyphWidth: number,
    glyphHeight: number,
    destX: number,
    destY: number,
    color: Color
  ): void {
    for (let gy = 0; gy < glyphHeight; gy++) {
      const ty = destY + gy;
      if (ty < 0 || ty >= tile.height) continue;
      for (let gx = 0; gx < glyphWidth; gx++) {
        const tx = destX + gx;
        if (tx < 0 || tx >= tile.width) continue;

        const subIdx = (gy * glyphWidth + gx) * 3;
        const coverR = glyphCoverage[subIdx] / 255;
        const coverG = glyphCoverage[subIdx + 1] / 255;
        const coverB = glyphCoverage[subIdx + 2] / 255;

        const off = (ty * tile.width + tx) * 4;
        const dstR = tile.pixels[off];
        const dstG = tile.pixels[off + 1];
        const dstB = tile.pixels[off + 2];
        const dstA = tile.pixels[off + 3];

        // Per-channel alpha blending for LCD rendering
        tile.pixels[off] = Math.round(color.r * coverR + dstR * (1 - coverR));
        tile.pixels[off + 1] = Math.round(color.g * coverG + dstG * (1 - coverG));
        tile.pixels[off + 2] = Math.round(color.b * coverB + dstB * (1 - coverB));
        tile.pixels[off + 3] = Math.max(dstA, Math.round(Math.max(coverR, coverG, coverB) * 255));
      }
    }
    this._stats.subPixelTextRuns++;
    this._stats.pixelsFilled += glyphWidth * glyphHeight;
  }

  // ── SIMD-modeled batch operations ──────────────────────────

  /** Batch fill 4 pixels at a time (SIMD lane simulation) */
  batchFill(tile: TileBuffer, startOffset: number, count: number, color: Color): void {
    const batches = Math.floor(count / 4);
    const remainder = count % 4;

    for (let b = 0; b < batches; b++) {
      const base = (startOffset + b * 4) * 4;
      // 4-wide RGBA fill
      for (let lane = 0; lane < 4; lane++) {
        const off = base + lane * 4;
        tile.pixels[off] = color.r;
        tile.pixels[off + 1] = color.g;
        tile.pixels[off + 2] = color.b;
        tile.pixels[off + 3] = color.a;
      }
      this._stats.simdBatchOps++;
    }

    // Scalar remainder
    for (let i = 0; i < remainder; i++) {
      const off = (startOffset + batches * 4 + i) * 4;
      tile.pixels[off] = color.r;
      tile.pixels[off + 1] = color.g;
      tile.pixels[off + 2] = color.b;
      tile.pixels[off + 3] = color.a;
    }

    this._stats.pixelsFilled += count;
  }

  /** Pre-multiplied alpha gradient interpolation (SIMD-modeled) */
  batchGradient(
    tile: TileBuffer,
    y: number,
    x0: number, x1: number,
    colorStart: Color, colorEnd: Color
  ): void {
    const len = x1 - x0;
    if (len <= 0) return;

    for (let i = 0; i < len; i++) {
      const t = i / (len - 1 || 1);
      const off = (y * tile.width + x0 + i) * 4;
      // Pre-multiplied alpha interpolation
      const a = colorStart.a + (colorEnd.a - colorStart.a) * t;
      tile.pixels[off] = Math.round(colorStart.r + (colorEnd.r - colorStart.r) * t);
      tile.pixels[off + 1] = Math.round(colorStart.g + (colorEnd.g - colorStart.g) * t);
      tile.pixels[off + 2] = Math.round(colorStart.b + (colorEnd.b - colorStart.b) * t);
      tile.pixels[off + 3] = Math.round(a);
    }

    this._stats.simdBatchOps += Math.ceil(len / 4);
    this._stats.pixelsFilled += len;
  }

  /** Blit image data into a tile buffer region */
  blitImage(
    tile: TileBuffer,
    srcPixels: Uint8ClampedArray,
    srcWidth: number,
    srcX: number, srcY: number,
    srcW: number, srcH: number,
    dstX: number, dstY: number,
    blend: BlendMode = "source-over"
  ): void {
    for (let y = 0; y < srcH; y++) {
      const dy = dstY + y;
      if (dy < 0 || dy >= tile.height) continue;
      const sy = srcY + y;

      for (let x = 0; x < srcW; x++) {
        const dx = dstX + x;
        if (dx < 0 || dx >= tile.width) continue;
        const sx = srcX + x;

        const srcOff = (sy * srcWidth + sx) * 4;
        const dstOff = (dy * tile.width + dx) * 4;

        if (blend === "copy") {
          tile.pixels[dstOff] = srcPixels[srcOff];
          tile.pixels[dstOff + 1] = srcPixels[srcOff + 1];
          tile.pixels[dstOff + 2] = srcPixels[srcOff + 2];
          tile.pixels[dstOff + 3] = srcPixels[srcOff + 3];
        } else {
          const dst: Color = {
            r: tile.pixels[dstOff], g: tile.pixels[dstOff + 1],
            b: tile.pixels[dstOff + 2], a: tile.pixels[dstOff + 3],
          };
          const src: Color = {
            r: srcPixels[srcOff], g: srcPixels[srcOff + 1],
            b: srcPixels[srcOff + 2], a: srcPixels[srcOff + 3],
          };
          const result = this._blend(dst, src, blend, 1);
          tile.pixels[dstOff] = result.r;
          tile.pixels[dstOff + 1] = result.g;
          tile.pixels[dstOff + 2] = result.b;
          tile.pixels[dstOff + 3] = result.a;
          this._stats.pixelsBlended++;
        }
        this._stats.pixelsCopied++;
      }
    }
  }

  resetFrameStats(): void {
    this._stats.lifetimeFrames++;
  }

  getStats(): RasterizerStats {
    return { ...this._stats };
  }

  // ── Internal ────────────────────────────────────────────────

  private _fillSpan(
    tile: TileBuffer,
    y: number,
    x0: number, x1: number,
    color: Color,
    coverage: number,
    blend: BlendMode
  ): void {
    if (y < 0 || y >= tile.height) return;
    const startX = Math.max(0, x0);
    const endX = Math.min(tile.width, x1);

    if (blend === "copy" && coverage >= 1) {
      // Fast path — direct write, SIMD batch
      this.batchFill(tile, y * tile.width + startX, endX - startX, color);
      return;
    }

    for (let x = startX; x < endX; x++) {
      const off = (y * tile.width + x) * 4;
      const dst: Color = {
        r: tile.pixels[off],
        g: tile.pixels[off + 1],
        b: tile.pixels[off + 2],
        a: tile.pixels[off + 3],
      };
      const result = this._blend(dst, color, blend, coverage);
      tile.pixels[off] = result.r;
      tile.pixels[off + 1] = result.g;
      tile.pixels[off + 2] = result.b;
      tile.pixels[off + 3] = result.a;
      this._stats.pixelsBlended++;
    }
  }

  private _computeScanlineSpans(
    vertices: Array<{ x: number; y: number }>,
    y: number
  ): ScanlineSpan[] {
    const intersections: number[] = [];
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const v0 = vertices[i];
      const v1 = vertices[(i + 1) % n];

      if ((v0.y <= y && v1.y > y) || (v1.y <= y && v0.y > y)) {
        const t = (y - v0.y) / (v1.y - v0.y);
        intersections.push(v0.x + t * (v1.x - v0.x));
      }
    }

    intersections.sort((a, b) => a - b);

    const spans: ScanlineSpan[] = [];
    for (let i = 0; i < intersections.length - 1; i += 2) {
      const xStart = intersections[i];
      const xEnd = intersections[i + 1];
      // Analytical coverage for edges at subpixel level
      const leftCoverage = 1 - (xStart - Math.floor(xStart));
      const rightCoverage = xEnd - Math.floor(xEnd);
      const coverage = (leftCoverage + rightCoverage) / 2;
      spans.push({
        xStart: Math.floor(xStart),
        xEnd: Math.ceil(xEnd),
        coverage: Math.min(1, coverage || 1),
      });
    }
    return spans;
  }

  private _buildGammaLUT(): Uint8Array {
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      const s = i / 255;
      // sRGB to linear
      const linear = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      lut[i] = Math.round(linear * 255);
    }
    return lut;
  }

  private _buildInvGammaLUT(): Uint8Array {
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      const l = i / 255;
      // linear to sRGB
      const srgb = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
      lut[i] = Math.round(srgb * 255);
    }
    return lut;
  }
}
