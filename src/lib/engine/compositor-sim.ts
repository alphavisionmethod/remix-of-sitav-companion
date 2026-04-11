/**
 * SITA OS — TypeScript Compositor Simulation
 *
 * Pure-computation port of the C++ compositor/rasterizer spec.
 * Zero DOM dependencies — runs in main thread, Web Worker, or Node.
 *
 * @see infra/docs/COMPOSITOR_RASTERIZER_SPEC.md
 */

// ── Types ──────────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Surface {
  buffer: Uint32Array;
  width: number;
  height: number;
  stride: number;
  x = 0;
  y = 0;
  opacity = 1;
  visible = true;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.stride = width;
    this.buffer = new Uint32Array(width * height);
  }
}

export class Framebuffer {
  pixels: Uint32Array;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint32Array(width * height);
  }
}

// ── Alpha Blending (source-over) ───────────────────────

/** Blend foreground over background. ARGB8888 layout: 0xAARRGGBB */
export function alphaBlend(fg: number, bg: number): number {
  const fa = (fg >>> 24) & 0xff;
  if (fa === 0) return bg;
  if (fa === 255) return fg;

  const fr = (fg >>> 16) & 0xff;
  const fgG = (fg >>> 8) & 0xff;
  const fb = fg & 0xff;

  const br = (bg >>> 16) & 0xff;
  const bgG = (bg >>> 8) & 0xff;
  const bb = bg & 0xff;

  const invA = 255 - fa;
  const r = (fr * fa + br * invA) / 255 | 0;
  const g = (fgG * fa + bgG * invA) / 255 | 0;
  const b = (fb * fa + bb * invA) / 255 | 0;

  return (0xff000000 | (r << 16) | (g << 8) | b) >>> 0;
}

// ── Compositing ────────────────────────────────────────

const BG_COLOR = 0xff202020; // desktop background

/** Composite surfaces (back→front order) onto framebuffer. */
export function composite(fb: Framebuffer, surfaces: Surface[]): void {
  const { pixels, width, height } = fb;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let color = BG_COLOR;

      for (const s of surfaces) {
        if (!s.visible) continue;
        const wx = x - s.x;
        const wy = y - s.y;
        if (wx < 0 || wy < 0 || wx >= s.width || wy >= s.height) continue;

        color = alphaBlend(s.buffer[wy * s.stride + wx], color);
      }

      pixels[y * width + x] = color;
    }
  }
}

/** Composite only within a damage region. */
export function compositeRegion(
  fb: Framebuffer,
  surfaces: Surface[],
  r: Rect
): void {
  const { pixels, width, height } = fb;
  const yEnd = Math.min(r.y + r.h, height);
  const xEnd = Math.min(r.x + r.w, width);

  for (let y = r.y; y < yEnd; y++) {
    for (let x = r.x; x < xEnd; x++) {
      let color = BG_COLOR;
      for (const s of surfaces) {
        if (!s.visible) continue;
        const wx = x - s.x;
        const wy = y - s.y;
        if (wx < 0 || wy < 0 || wx >= s.width || wy >= s.height) continue;
        color = alphaBlend(s.buffer[wy * s.stride + wx], color);
      }
      pixels[y * width + x] = color;
    }
  }
}

// ── Damage Tracker ─────────────────────────────────────

const COALESCE_GAP = 8; // px — merge rects within this gap

function rectsOverlapOrClose(a: Rect, b: Rect): boolean {
  return (
    a.x - COALESCE_GAP < b.x + b.w &&
    a.x + a.w + COALESCE_GAP > b.x &&
    a.y - COALESCE_GAP < b.y + b.h &&
    a.y + a.h + COALESCE_GAP > b.y
  );
}

function mergeRects(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

export class DamageTracker {
  private regions: Rect[] = [];

  mark(r: Rect): void {
    this.regions.push(r);
  }

  /** Coalesce overlapping/close rects and return merged list. Clears internal state. */
  flush(): Rect[] {
    const merged: Rect[] = [];
    for (const r of this.regions) {
      let didMerge = false;
      for (let i = 0; i < merged.length; i++) {
        if (rectsOverlapOrClose(merged[i], r)) {
          merged[i] = mergeRects(merged[i], r);
          didMerge = true;
          break;
        }
      }
      if (!didMerge) merged.push({ ...r });
    }
    this.regions = [];
    return merged;
  }

  get count(): number {
    return this.regions.length;
  }
}

// ── Rasterizer Primitives ──────────────────────────────

/** Scalar rectangle fill. */
export function fillRect(
  buffer: Uint32Array,
  stride: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  for (let j = 0; j < h; j++) {
    const offset = (y + j) * stride + x;
    for (let i = 0; i < w; i++) {
      buffer[offset + i] = color;
    }
  }
}

/** 3×3 box blur (single pass). Edges are left untouched. */
export function boxBlur3x3(
  src: Uint32Array,
  dst: Uint32Array,
  w: number,
  h: number
): void {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let rSum = 0, gSum = 0, bSum = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = src[(y + ky) * w + (x + kx)];
          rSum += (px >>> 16) & 0xff;
          gSum += (px >>> 8) & 0xff;
          bSum += px & 0xff;
        }
      }

      dst[y * w + x] =
        (0xff000000 |
          (((rSum / 9) | 0) << 16) |
          (((gSum / 9) | 0) << 8) |
          ((bSum / 9) | 0)) >>> 0;
    }
  }
}

/** Linear color interpolation. */
export function lerpColor(a: number, b: number, t: number): number {
  const ch = (shift: number) => {
    const ca = (a >>> shift) & 0xff;
    const cb = (b >>> shift) & 0xff;
    return (ca + (cb - ca) * t) | 0;
  };
  return ((ch(24) << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)) >>> 0;
}
