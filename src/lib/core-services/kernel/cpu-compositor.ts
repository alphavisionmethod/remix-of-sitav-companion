// ═══════════════════════════════════════════════════════════════
// SITA OS — CPU Compositor Core
// Central compositing engine: owns framebuffers, composites all
// window surfaces via damage-aware Z-order blitting, double-buffered
// page flip, KMS/DRM scanout abstraction, multi-monitor support.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";

// ── Framebuffer ──────────────────────────────────────────────

export interface Framebuffer {
  pixels: Uint8ClampedArray; // RGBA interleaved
  width: number;
  height: number;
  stride: number; // bytes per row (cache-line aligned to 64)
}

export function createFramebuffer(width: number, height: number): Framebuffer {
  // Align stride to 64-byte cache line
  const rawStride = width * 4;
  const stride = Math.ceil(rawStride / 64) * 64;
  const pixels = new Uint8ClampedArray(stride * height);
  return { pixels, width, height, stride };
}

export function clearFramebuffer(fb: Framebuffer, r = 0, g = 0, b = 0, a = 255): void {
  const { pixels, width, height, stride } = fb;
  for (let row = 0; row < height; row++) {
    const rowOff = row * stride;
    for (let col = 0; col < width; col++) {
      const off = rowOff + col * 4;
      pixels[off] = r;
      pixels[off + 1] = g;
      pixels[off + 2] = b;
      pixels[off + 3] = a;
    }
  }
}

export function clearRegion(fb: Framebuffer, rect: Rect, r = 0, g = 0, b = 0, a = 255): void {
  const x0 = Math.max(0, rect.x);
  const y0 = Math.max(0, rect.y);
  const x1 = Math.min(fb.width, rect.x + rect.width);
  const y1 = Math.min(fb.height, rect.y + rect.height);
  for (let row = y0; row < y1; row++) {
    const rowOff = row * fb.stride;
    for (let col = x0; col < x1; col++) {
      const off = rowOff + col * 4;
      fb.pixels[off] = r;
      fb.pixels[off + 1] = g;
      fb.pixels[off + 2] = b;
      fb.pixels[off + 3] = a;
    }
  }
}

// ── Surface Buffer ───────────────────────────────────────────

export interface SurfaceBuffer {
  windowId: string;
  buffer: Framebuffer;
  dirtyRegions: Rect[];
  committed: boolean; // client signals "ready to present"
  subsurfaceOf: string | null;
}

// ── Display Output (KMS/DRM abstraction) ─────────────────────

export interface DisplayMode {
  width: number;
  height: number;
  refreshHz: number;
  interlaced: boolean;
}

export type ConnectorType = "HDMI" | "DP" | "eDP" | "VGA" | "Virtual";

export interface DisplayOutput {
  id: string;
  crtcId: number;
  connectorType: ConnectorType;
  connected: boolean;
  enabled: boolean;
  currentMode: DisplayMode;
  availableModes: DisplayMode[];
  framebufferFront: Framebuffer;
  framebufferBack: Framebuffer;
  vblankCount: number;
  gamma: { r: Uint16Array; g: Uint16Array; b: Uint16Array } | null;
  physicalWidthMm: number;
  physicalHeightMm: number;
}

// ── Compositor Stats ─────────────────────────────────────────

export interface CpuCompositorStats {
  outputCount: number;
  surfaceCount: number;
  totalPageFlips: number;
  lastCompositeTimeUs: number;
  avgCompositeTimeUs: number;
  totalBlitCount: number;
  surfaceMemoryBytes: number;
  framebufferMemoryBytes: number;
  backgroundSet: boolean;
}

// ── Overlay Layer ────────────────────────────────────────────

export interface OverlayLayer {
  id: string;
  buffer: Framebuffer;
  position: { x: number; y: number };
  visible: boolean;
  zIndex: number; // relative among overlays
}

// ═════════════════════════════════════════════════════════════

export class CpuCompositor {
  private _outputs = new Map<string, DisplayOutput>();
  private _surfaces = new Map<string, SurfaceBuffer>();
  private _overlays = new Map<string, OverlayLayer>();
  private _background: Framebuffer | null = null;
  private _backgroundColor = { r: 30, g: 30, b: 40, a: 255 };

  // Stats
  private _totalPageFlips = 0;
  private _totalBlits = 0;
  private _lastCompositeUs = 0;
  private _compositeTimeSum = 0;
  private _compositeCount = 0;

  // ── Output management (KMS/DRM) ───────────────────────────

  addOutput(
    id: string,
    connectorType: ConnectorType,
    mode: DisplayMode,
    opts?: { physicalWidthMm?: number; physicalHeightMm?: number; availableModes?: DisplayMode[] }
  ): DisplayOutput {
    const output: DisplayOutput = {
      id,
      crtcId: this._outputs.size,
      connectorType,
      connected: true,
      enabled: true,
      currentMode: { ...mode },
      availableModes: opts?.availableModes ? opts.availableModes.map((m) => ({ ...m })) : [{ ...mode }],
      framebufferFront: createFramebuffer(mode.width, mode.height),
      framebufferBack: createFramebuffer(mode.width, mode.height),
      vblankCount: 0,
      gamma: null,
      physicalWidthMm: opts?.physicalWidthMm ?? 530,
      physicalHeightMm: opts?.physicalHeightMm ?? 300,
    };
    clearFramebuffer(output.framebufferFront, this._backgroundColor.r, this._backgroundColor.g, this._backgroundColor.b, this._backgroundColor.a);
    clearFramebuffer(output.framebufferBack, this._backgroundColor.r, this._backgroundColor.g, this._backgroundColor.b, this._backgroundColor.a);
    this._outputs.set(id, output);
    return output;
  }

  removeOutput(id: string): boolean {
    return this._outputs.delete(id);
  }

  getOutput(id: string): DisplayOutput | undefined {
    return this._outputs.get(id);
  }

  getAllOutputs(): DisplayOutput[] {
    return Array.from(this._outputs.values());
  }

  setMode(outputId: string, mode: DisplayMode): boolean {
    const out = this._outputs.get(outputId);
    if (!out) return false;
    out.currentMode = { ...mode };
    out.framebufferFront = createFramebuffer(mode.width, mode.height);
    out.framebufferBack = createFramebuffer(mode.width, mode.height);
    return true;
  }

  setGammaRamp(outputId: string, r: Uint16Array, g: Uint16Array, b: Uint16Array): boolean {
    const out = this._outputs.get(outputId);
    if (!out) return false;
    out.gamma = { r: new Uint16Array(r), g: new Uint16Array(g), b: new Uint16Array(b) };
    return true;
  }

  // ── Surface management ────────────────────────────────────

  allocateSurface(windowId: string, width: number, height: number): SurfaceBuffer {
    const existing = this._surfaces.get(windowId);
    if (existing && existing.buffer.width === width && existing.buffer.height === height) {
      return existing;
    }
    const surface: SurfaceBuffer = {
      windowId,
      buffer: createFramebuffer(width, height),
      dirtyRegions: [],
      committed: false,
      subsurfaceOf: null,
    };
    this._surfaces.set(windowId, surface);
    return surface;
  }

  freeSurface(windowId: string): boolean {
    return this._surfaces.delete(windowId);
  }

  getSurface(windowId: string): SurfaceBuffer | undefined {
    return this._surfaces.get(windowId);
  }

  /**
   * Client draws into the surface buffer directly, then calls commitSurface
   * with the list of regions that were modified.
   */
  commitSurface(windowId: string, dirtyRegions?: Rect[]): boolean {
    const surface = this._surfaces.get(windowId);
    if (!surface) return false;
    if (dirtyRegions) {
      surface.dirtyRegions.push(...dirtyRegions);
    } else {
      // Full surface dirty
      surface.dirtyRegions.push({ x: 0, y: 0, width: surface.buffer.width, height: surface.buffer.height });
    }
    surface.committed = true;
    return true;
  }

  // ── Background / wallpaper ────────────────────────────────

  setBackgroundColor(r: number, g: number, b: number): void {
    this._backgroundColor = { r, g, b, a: 255 };
    this._background = null;
  }

  setBackgroundImage(fb: Framebuffer): void {
    this._background = fb;
  }

  // ── Overlay management ────────────────────────────────────

  addOverlay(id: string, buffer: Framebuffer, x: number, y: number, zIndex = 0): void {
    this._overlays.set(id, { id, buffer, position: { x, y }, visible: true, zIndex });
  }

  removeOverlay(id: string): boolean {
    return this._overlays.delete(id);
  }

  setOverlayPosition(id: string, x: number, y: number): void {
    const ov = this._overlays.get(id);
    if (ov) ov.position = { x, y };
  }

  setOverlayVisible(id: string, visible: boolean): void {
    const ov = this._overlays.get(id);
    if (ov) ov.visible = visible;
  }

  // ── Core compositing ──────────────────────────────────────

  /**
   * Composite all visible windows into the back framebuffer of each output.
   * @param zOrderedWindows - windows ordered bottom to top
   * @param windowBounds - map of windowId → screen-space bounds
   * @param windowOpacities - map of windowId → opacity (0-1)
   * @param damageRegions - dirty screen-space regions to re-composite (empty = full)
   */
  composite(
    zOrderedWindows: { id: string; bounds: Rect; opacity: number; visible: boolean }[],
    damageRegions: Rect[]
  ): void {
    const t0 = performance.now();

    for (const output of this._outputs.values()) {
      if (!output.enabled) continue;

      const back = output.framebufferBack;
      const regions = damageRegions.length > 0 ? damageRegions : [{ x: 0, y: 0, width: back.width, height: back.height }];

      for (const damage of regions) {
        // 1. Clear damage region with background
        this._blitBackground(back, damage);

        // 2. Walk Z-ordered windows bottom to top
        for (const winInfo of zOrderedWindows) {
          if (!winInfo.visible) continue;

          const surface = this._surfaces.get(winInfo.id);
          if (!surface || !surface.committed) continue;

          // Compute intersection of window bounds and damage region
          const intersection = this._intersectRects(winInfo.bounds, damage);
          if (!intersection) continue;

          // Blit surface into back framebuffer
          this._blitSurface(
            surface.buffer,
            winInfo.bounds,
            back,
            intersection,
            winInfo.opacity
          );
          this._totalBlits++;
        }

        // 3. Render overlays (top-most)
        const sortedOverlays = Array.from(this._overlays.values())
          .filter((o) => o.visible)
          .sort((a, b) => a.zIndex - b.zIndex);

        for (const overlay of sortedOverlays) {
          const overlayBounds: Rect = {
            x: overlay.position.x,
            y: overlay.position.y,
            width: overlay.buffer.width,
            height: overlay.buffer.height,
          };
          const intersection = this._intersectRects(overlayBounds, damage);
          if (!intersection) continue;
          this._blitSurface(overlay.buffer, overlayBounds, back, intersection, 1.0);
        }
      }
    }

    // Clear committed flags & dirty regions
    for (const surface of this._surfaces.values()) {
      surface.committed = false;
      surface.dirtyRegions = [];
    }

    const elapsed = (performance.now() - t0) * 1000; // microseconds
    this._lastCompositeUs = elapsed;
    this._compositeTimeSum += elapsed;
    this._compositeCount++;
  }

  // ── Page flip (double buffering) ──────────────────────────

  /**
   * Swap front and back buffers on all enabled outputs.
   * Simulates VSync page flip with tearing prevention.
   * Returns the set of output IDs that were flipped.
   */
  pageFlip(): string[] {
    const flipped: string[] = [];
    for (const output of this._outputs.values()) {
      if (!output.enabled) continue;

      // Swap references (zero-copy page flip)
      const tmp = output.framebufferFront;
      output.framebufferFront = output.framebufferBack;
      output.framebufferBack = tmp;

      output.vblankCount++;
      this._totalPageFlips++;
      flipped.push(output.id);
    }
    return flipped;
  }

  /**
   * Full present cycle: composite + page flip.
   */
  present(
    zOrderedWindows: { id: string; bounds: Rect; opacity: number; visible: boolean }[],
    damageRegions: Rect[]
  ): string[] {
    this.composite(zOrderedWindows, damageRegions);
    return this.pageFlip();
  }

  // ── Scanout (read front buffer) ───────────────────────────

  /**
   * Get the current front (scanout) framebuffer for a display output.
   * In a real system this would be DMA'd to the display controller.
   */
  getScanoutBuffer(outputId: string): Framebuffer | null {
    const out = this._outputs.get(outputId);
    return out?.framebufferFront ?? null;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): CpuCompositorStats {
    let surfaceMem = 0;
    for (const s of this._surfaces.values()) {
      surfaceMem += s.buffer.pixels.byteLength;
    }
    let fbMem = 0;
    for (const o of this._outputs.values()) {
      fbMem += o.framebufferFront.pixels.byteLength + o.framebufferBack.pixels.byteLength;
    }
    return {
      outputCount: this._outputs.size,
      surfaceCount: this._surfaces.size,
      totalPageFlips: this._totalPageFlips,
      lastCompositeTimeUs: Math.round(this._lastCompositeUs),
      avgCompositeTimeUs: this._compositeCount > 0 ? Math.round(this._compositeTimeSum / this._compositeCount) : 0,
      totalBlitCount: this._totalBlits,
      surfaceMemoryBytes: surfaceMem,
      framebufferMemoryBytes: fbMem,
      backgroundSet: this._background !== null,
    };
  }

  // ── Internal blitting ─────────────────────────────────────

  private _blitBackground(dest: Framebuffer, region: Rect): void {
    if (this._background) {
      // Tile/stretch background image into region
      this._blitSurface(
        this._background,
        { x: 0, y: 0, width: dest.width, height: dest.height },
        dest,
        region,
        1.0
      );
    } else {
      clearRegion(dest, region, this._backgroundColor.r, this._backgroundColor.g, this._backgroundColor.b, this._backgroundColor.a);
    }
  }

  /**
   * Blit source framebuffer into dest framebuffer.
   * sourceBounds = screen-space position/size of the source surface.
   * clipRect = the screen-space region to actually draw (intersection of damage & window).
   * opacity = window-level opacity multiplier.
   */
  private _blitSurface(
    src: Framebuffer,
    sourceBounds: Rect,
    dest: Framebuffer,
    clipRect: Rect,
    opacity: number
  ): void {
    const dx0 = Math.max(0, clipRect.x);
    const dy0 = Math.max(0, clipRect.y);
    const dx1 = Math.min(dest.width, clipRect.x + clipRect.width);
    const dy1 = Math.min(dest.height, clipRect.y + clipRect.height);

    // Scale factors if source surface differs from screen bounds
    const scaleX = src.width / sourceBounds.width;
    const scaleY = src.height / sourceBounds.height;

    const fullOpacity = opacity >= 0.999;

    for (let dy = dy0; dy < dy1; dy++) {
      const sy = Math.floor((dy - sourceBounds.y) * scaleY);
      if (sy < 0 || sy >= src.height) continue;

      const destRowOff = dy * dest.stride;
      const srcRowOff = sy * src.stride;

      for (let dx = dx0; dx < dx1; dx++) {
        const sx = Math.floor((dx - sourceBounds.x) * scaleX);
        if (sx < 0 || sx >= src.width) continue;

        const si = srcRowOff + sx * 4;
        const di = destRowOff + dx * 4;

        const sa = src.pixels[si + 3];
        if (sa === 0) continue; // fully transparent, skip

        // Pre-multiplied alpha source-over compositing
        const srcAlpha = fullOpacity ? sa : Math.round((sa * opacity * 255) / 255);

        if (srcAlpha >= 255) {
          // Opaque fast path — direct copy
          dest.pixels[di] = src.pixels[si];
          dest.pixels[di + 1] = src.pixels[si + 1];
          dest.pixels[di + 2] = src.pixels[si + 2];
          dest.pixels[di + 3] = 255;
        } else {
          // Source-over: Cs·αs + Cd·(1 − αs)
          const invAlpha = 255 - srcAlpha;
          dest.pixels[di] = (src.pixels[si] * srcAlpha + dest.pixels[di] * invAlpha + 127) / 255 | 0;
          dest.pixels[di + 1] = (src.pixels[si + 1] * srcAlpha + dest.pixels[di + 1] * invAlpha + 127) / 255 | 0;
          dest.pixels[di + 2] = (src.pixels[si + 2] * srcAlpha + dest.pixels[di + 2] * invAlpha + 127) / 255 | 0;
          dest.pixels[di + 3] = Math.min(255, srcAlpha + (dest.pixels[di + 3] * invAlpha + 127) / 255 | 0);
        }
      }
    }
  }

  /** Compute intersection of two rects, or null if no overlap */
  private _intersectRects(a: Rect, b: Rect): Rect | null {
    const x0 = Math.max(a.x, b.x);
    const y0 = Math.max(a.y, b.y);
    const x1 = Math.min(a.x + a.width, b.x + b.width);
    const y1 = Math.min(a.y + a.height, b.y + b.height);
    if (x1 <= x0 || y1 <= y0) return null;
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  }
}
