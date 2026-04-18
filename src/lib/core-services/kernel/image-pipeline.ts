// ═══════════════════════════════════════════════════════════════
// SITA OS — Image Pipeline
// Bitmap operations: decode simulation, bilinear/nearest scaling,
// blit to tile buffer, image repeat/tile, nine-slice, sprite atlas
// ═══════════════════════════════════════════════════════════════

import type { TileBuffer, Color, BlendMode } from "./software-rasterizer";

// ── Types ────────────────────────────────────────────────────

export interface ImageSource {
  id: string;
  width: number;
  height: number;
  pixels: Uint8ClampedArray; // RGBA interleaved
  format: "RGBA8888" | "RGB565";
  premultiplied: boolean;
}

export type ScaleFilter = "nearest" | "bilinear";
export type ImageRepeat = "no-repeat" | "repeat" | "repeat-x" | "repeat-y";

export interface NineSliceInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpriteAtlas {
  id: string;
  source: ImageSource;
  sprites: Map<string, SpriteFrame>;
}

export interface SpriteFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pivot?: { x: number; y: number };
}

export interface ImagePipelineStats {
  imagesDecoded: number;
  blitOperations: number;
  scaleOperations: number;
  nineSliceOperations: number;
  repeatFills: number;
  pixelsCopied: number;
  atlasLookups: number;
  cacheHits: number;
  cacheMisses: number;
}

// ── Image Pipeline ───────────────────────────────────────────

export class ImagePipeline {
  private _imageCache = new Map<string, ImageSource>();
  private _atlases = new Map<string, SpriteAtlas>();
  private _stats: ImagePipelineStats = {
    imagesDecoded: 0,
    blitOperations: 0,
    scaleOperations: 0,
    nineSliceOperations: 0,
    repeatFills: 0,
    pixelsCopied: 0,
    atlasLookups: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  // ── Decode (simulated) ──────────────────────────────────

  /** Simulate image decode — accepts raw pixel data and wraps it */
  decode(
    id: string,
    width: number,
    height: number,
    pixels: Uint8ClampedArray,
    premultiplied = false
  ): ImageSource {
    const src: ImageSource = {
      id,
      width,
      height,
      pixels: new Uint8ClampedArray(pixels),
      format: "RGBA8888",
      premultiplied,
    };
    this._imageCache.set(id, src);
    this._stats.imagesDecoded++;
    return src;
  }

  /** Create a solid color image (useful for testing) */
  createSolid(id: string, width: number, height: number, color: Color): ImageSource {
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const off = i * 4;
      pixels[off] = color.r;
      pixels[off + 1] = color.g;
      pixels[off + 2] = color.b;
      pixels[off + 3] = color.a;
    }
    return this.decode(id, width, height, pixels);
  }

  /** Get a cached image */
  getImage(id: string): ImageSource | null {
    const img = this._imageCache.get(id);
    if (img) { this._stats.cacheHits++; return img; }
    this._stats.cacheMisses++;
    return null;
  }

  // ── Blit ────────────────────────────────────────────────────

  /** Blit source image directly onto a tile buffer (1:1, no scaling) */
  blit(
    dst: TileBuffer,
    src: ImageSource,
    srcX: number, srcY: number,
    srcW: number, srcH: number,
    dstX: number, dstY: number,
    blend: BlendMode = "source-over"
  ): void {
    for (let y = 0; y < srcH; y++) {
      const dy = dstY + y;
      if (dy < 0 || dy >= dst.height) continue;
      const sy = srcY + y;
      if (sy < 0 || sy >= src.height) continue;

      for (let x = 0; x < srcW; x++) {
        const dx = dstX + x;
        if (dx < 0 || dx >= dst.width) continue;
        const sx = srcX + x;
        if (sx < 0 || sx >= src.width) continue;

        const srcOff = (sy * src.width + sx) * 4;
        const dstOff = (dy * dst.width + dx) * 4;

        if (blend === "copy" || src.pixels[srcOff + 3] === 255) {
          dst.pixels[dstOff] = src.pixels[srcOff];
          dst.pixels[dstOff + 1] = src.pixels[srcOff + 1];
          dst.pixels[dstOff + 2] = src.pixels[srcOff + 2];
          dst.pixels[dstOff + 3] = src.pixels[srcOff + 3];
        } else {
          // Alpha composite
          const sa = src.pixels[srcOff + 3] / 255;
          const da = dst.pixels[dstOff + 3] / 255;
          const outA = sa + da * (1 - sa);
          if (outA > 0) {
            dst.pixels[dstOff] = Math.round((src.pixels[srcOff] * sa + dst.pixels[dstOff] * da * (1 - sa)) / outA);
            dst.pixels[dstOff + 1] = Math.round((src.pixels[srcOff + 1] * sa + dst.pixels[dstOff + 1] * da * (1 - sa)) / outA);
            dst.pixels[dstOff + 2] = Math.round((src.pixels[srcOff + 2] * sa + dst.pixels[dstOff + 2] * da * (1 - sa)) / outA);
            dst.pixels[dstOff + 3] = Math.round(outA * 255);
          }
        }
        this._stats.pixelsCopied++;
      }
    }
    this._stats.blitOperations++;
  }

  // ── Scaling ─────────────────────────────────────────────────

  /** Scale an image region and blit to destination */
  scaleBlit(
    dst: TileBuffer,
    src: ImageSource,
    srcX: number, srcY: number, srcW: number, srcH: number,
    dstX: number, dstY: number, dstW: number, dstH: number,
    filter: ScaleFilter = "bilinear"
  ): void {
    for (let dy = 0; dy < dstH; dy++) {
      const ty = dstY + dy;
      if (ty < 0 || ty >= dst.height) continue;

      for (let dx = 0; dx < dstW; dx++) {
        const tx = dstX + dx;
        if (tx < 0 || tx >= dst.width) continue;

        // Map destination pixel to source
        const sx = srcX + (dx / dstW) * srcW;
        const sy = srcY + (dy / dstH) * srcH;

        let pixel: Color;
        if (filter === "nearest") {
          pixel = this._sampleNearest(src, Math.floor(sx), Math.floor(sy));
        } else {
          pixel = this._sampleBilinear(src, sx, sy);
        }

        const off = (ty * dst.width + tx) * 4;
        dst.pixels[off] = pixel.r;
        dst.pixels[off + 1] = pixel.g;
        dst.pixels[off + 2] = pixel.b;
        dst.pixels[off + 3] = pixel.a;
        this._stats.pixelsCopied++;
      }
    }
    this._stats.scaleOperations++;
  }

  // ── Image Repeat / Tile Fill ────────────────────────────────

  /** Fill a rectangular area with a repeated image pattern */
  repeatFill(
    dst: TileBuffer,
    src: ImageSource,
    dstX: number, dstY: number,
    dstW: number, dstH: number,
    repeat: ImageRepeat = "repeat",
    offsetX = 0,
    offsetY = 0
  ): void {
    for (let y = 0; y < dstH; y++) {
      const ty = dstY + y;
      if (ty < 0 || ty >= dst.height) continue;

      for (let x = 0; x < dstW; x++) {
        const tx = dstX + x;
        if (tx < 0 || tx >= dst.width) continue;

        let sx = (x + offsetX) % src.width;
        let sy = (y + offsetY) % src.height;
        if (sx < 0) sx += src.width;
        if (sy < 0) sy += src.height;

        // Apply repeat mode
        if (repeat === "repeat-x" && (y + offsetY) >= src.height) continue;
        if (repeat === "repeat-y" && (x + offsetX) >= src.width) continue;
        if (repeat === "no-repeat" && ((x + offsetX) >= src.width || (y + offsetY) >= src.height)) continue;

        const srcOff = (sy * src.width + sx) * 4;
        const dstOff = (ty * dst.width + tx) * 4;
        dst.pixels[dstOff] = src.pixels[srcOff];
        dst.pixels[dstOff + 1] = src.pixels[srcOff + 1];
        dst.pixels[dstOff + 2] = src.pixels[srcOff + 2];
        dst.pixels[dstOff + 3] = src.pixels[srcOff + 3];
        this._stats.pixelsCopied++;
      }
    }
    this._stats.repeatFills++;
  }

  // ── Nine-Slice ─────────────────────────────────────────────

  /** Render a nine-slice scalable image (buttons, panels, frames) */
  nineSlice(
    dst: TileBuffer,
    src: ImageSource,
    insets: NineSliceInsets,
    dstX: number, dstY: number,
    dstW: number, dstH: number
  ): void {
    const { top, right, bottom, left } = insets;
    const centerW = src.width - left - right;
    const centerH = src.height - top - bottom;
    const dstCenterW = dstW - left - right;
    const dstCenterH = dstH - top - bottom;

    // 9 patches: TL, T, TR, L, C, R, BL, B, BR
    const patches: Array<{
      sx: number; sy: number; sw: number; sh: number;
      dx: number; dy: number; dw: number; dh: number;
    }> = [
      // Top row
      { sx: 0, sy: 0, sw: left, sh: top, dx: dstX, dy: dstY, dw: left, dh: top },
      { sx: left, sy: 0, sw: centerW, sh: top, dx: dstX + left, dy: dstY, dw: dstCenterW, dh: top },
      { sx: src.width - right, sy: 0, sw: right, sh: top, dx: dstX + dstW - right, dy: dstY, dw: right, dh: top },
      // Middle row
      { sx: 0, sy: top, sw: left, sh: centerH, dx: dstX, dy: dstY + top, dw: left, dh: dstCenterH },
      { sx: left, sy: top, sw: centerW, sh: centerH, dx: dstX + left, dy: dstY + top, dw: dstCenterW, dh: dstCenterH },
      { sx: src.width - right, sy: top, sw: right, sh: centerH, dx: dstX + dstW - right, dy: dstY + top, dw: right, dh: dstCenterH },
      // Bottom row
      { sx: 0, sy: src.height - bottom, sw: left, sh: bottom, dx: dstX, dy: dstY + dstH - bottom, dw: left, dh: bottom },
      { sx: left, sy: src.height - bottom, sw: centerW, sh: bottom, dx: dstX + left, dy: dstY + dstH - bottom, dw: dstCenterW, dh: bottom },
      { sx: src.width - right, sy: src.height - bottom, sw: right, sh: bottom, dx: dstX + dstW - right, dy: dstY + dstH - bottom, dw: right, dh: bottom },
    ];

    for (const p of patches) {
      if (p.sw <= 0 || p.sh <= 0 || p.dw <= 0 || p.dh <= 0) continue;
      // Corners: 1:1 blit; edges/center: scale
      if (p.sw === p.dw && p.sh === p.dh) {
        this.blit(dst, src, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy);
      } else {
        this.scaleBlit(dst, src, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh, "bilinear");
      }
    }
    this._stats.nineSliceOperations++;
  }

  // ── Sprite Atlas ───────────────────────────────────────────

  registerAtlas(id: string, source: ImageSource, sprites: SpriteFrame[]): SpriteAtlas {
    const atlas: SpriteAtlas = {
      id,
      source,
      sprites: new Map(sprites.map(s => [s.name, s])),
    };
    this._atlases.set(id, atlas);
    return atlas;
  }

  blitSprite(
    dst: TileBuffer,
    atlasId: string,
    spriteName: string,
    dstX: number, dstY: number,
    dstW?: number, dstH?: number
  ): boolean {
    const atlas = this._atlases.get(atlasId);
    if (!atlas) return false;
    const frame = atlas.sprites.get(spriteName);
    if (!frame) return false;
    this._stats.atlasLookups++;

    if (dstW && dstH && (dstW !== frame.width || dstH !== frame.height)) {
      this.scaleBlit(dst, atlas.source, frame.x, frame.y, frame.width, frame.height, dstX, dstY, dstW, dstH);
    } else {
      this.blit(dst, atlas.source, frame.x, frame.y, frame.width, frame.height, dstX, dstY);
    }
    return true;
  }

  // ── Pixel Format Conversion ────────────────────────────────

  /** Convert RGBA8888 to RGB565 (16-bit) */
  convertToRGB565(src: ImageSource): Uint16Array {
    const out = new Uint16Array(src.width * src.height);
    for (let i = 0; i < src.width * src.height; i++) {
      const off = i * 4;
      const r = (src.pixels[off] >> 3) & 0x1F;
      const g = (src.pixels[off + 1] >> 2) & 0x3F;
      const b = (src.pixels[off + 2] >> 3) & 0x1F;
      out[i] = (r << 11) | (g << 5) | b;
    }
    return out;
  }

  /** Premultiply alpha in-place */
  premultiplyAlpha(src: ImageSource): void {
    if (src.premultiplied) return;
    for (let i = 0; i < src.width * src.height; i++) {
      const off = i * 4;
      const a = src.pixels[off + 3] / 255;
      src.pixels[off] = Math.round(src.pixels[off] * a);
      src.pixels[off + 1] = Math.round(src.pixels[off + 1] * a);
      src.pixels[off + 2] = Math.round(src.pixels[off + 2] * a);
    }
    src.premultiplied = true;
  }

  getStats(): ImagePipelineStats {
    return { ...this._stats };
  }

  destroy(): void {
    this._imageCache.clear();
    this._atlases.clear();
  }

  // ── Internal Sampling ──────────────────────────────────────

  private _sampleNearest(src: ImageSource, x: number, y: number): Color {
    const cx = Math.max(0, Math.min(src.width - 1, x));
    const cy = Math.max(0, Math.min(src.height - 1, y));
    const off = (cy * src.width + cx) * 4;
    return {
      r: src.pixels[off],
      g: src.pixels[off + 1],
      b: src.pixels[off + 2],
      a: src.pixels[off + 3],
    };
  }

  private _sampleBilinear(src: ImageSource, x: number, y: number): Color {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;

    const c00 = this._sampleNearest(src, x0, y0);
    const c10 = this._sampleNearest(src, x0 + 1, y0);
    const c01 = this._sampleNearest(src, x0, y0 + 1);
    const c11 = this._sampleNearest(src, x0 + 1, y0 + 1);

    return {
      r: Math.round(c00.r * (1 - fx) * (1 - fy) + c10.r * fx * (1 - fy) + c01.r * (1 - fx) * fy + c11.r * fx * fy),
      g: Math.round(c00.g * (1 - fx) * (1 - fy) + c10.g * fx * (1 - fy) + c01.g * (1 - fx) * fy + c11.g * fx * fy),
      b: Math.round(c00.b * (1 - fx) * (1 - fy) + c10.b * fx * (1 - fy) + c01.b * (1 - fx) * fy + c11.b * fx * fy),
      a: Math.round(c00.a * (1 - fx) * (1 - fy) + c10.a * fx * (1 - fy) + c01.a * (1 - fx) * fy + c11.a * fx * fy),
    };
  }
}
