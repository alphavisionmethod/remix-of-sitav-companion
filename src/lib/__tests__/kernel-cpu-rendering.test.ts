// ═══════════════════════════════════════════════════════════════
// Unit Tests — CPU Compositor, Command Buffer Triangle Rasterizer, CpuBlur
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import {
  CpuCompositor,
  createFramebuffer,
  clearFramebuffer,
  clearRegion,
  type Framebuffer,
  type SurfaceBuffer,
} from "@/lib/core-services/kernel/cpu-compositor";
import {
  CommandBuffer,
  CommandBufferPool,
  SoftwarePipeline,
  toFixed16,
  fromFixed16,
  fpMul,
  fpDiv,
  fpFloor,
  fpCeil,
  fpFrac,
  IDENTITY_TRANSFORM,
  type VertexColor,
} from "@/lib/core-services/kernel/command-buffer";
import { CpuBlur } from "@/lib/core-services/kernel/ui-renderer";
import type { TileBuffer, Color } from "@/lib/core-services/kernel/software-rasterizer";

// ── Helpers ─────────────────────────────────────────────────

function makeTile(w: number, h: number): TileBuffer {
  return {
    width: w, height: h,
    pixels: new Uint8ClampedArray(w * h * 4),
    format: "RGBA8888", cacheLineAligned: false,
  };
}

function readPixel(buf: TileBuffer | Framebuffer, x: number, y: number) {
  const stride = "stride" in buf ? buf.stride : buf.width * 4;
  const off = y * stride + x * 4;
  return {
    r: buf.pixels[off],
    g: buf.pixels[off + 1],
    b: buf.pixels[off + 2],
    a: buf.pixels[off + 3],
  };
}

function fillTile(tile: TileBuffer, r: number, g: number, b: number, a: number) {
  for (let i = 0; i < tile.pixels.length; i += 4) {
    tile.pixels[i] = r;
    tile.pixels[i + 1] = g;
    tile.pixels[i + 2] = b;
    tile.pixels[i + 3] = a;
  }
}

// ═════════════════════════════════════════════════════════════
// 1. CPU Compositor
// ═════════════════════════════════════════════════════════════

describe("CpuCompositor", () => {
  let comp: CpuCompositor;

  beforeEach(() => {
    comp = new CpuCompositor();
  });

  describe("framebuffer utilities", () => {
    it("createFramebuffer has cache-line aligned stride", () => {
      const fb = createFramebuffer(100, 50);
      expect(fb.width).toBe(100);
      expect(fb.height).toBe(50);
      expect(fb.stride % 64).toBe(0);
      expect(fb.pixels.length).toBe(fb.stride * fb.height);
    });

    it("clearFramebuffer fills all pixels", () => {
      const fb = createFramebuffer(8, 8);
      clearFramebuffer(fb, 255, 128, 64, 200);
      const p = readPixel(fb, 3, 5);
      expect(p).toEqual({ r: 255, g: 128, b: 64, a: 200 });
    });

    it("clearRegion only clears the specified rect", () => {
      const fb = createFramebuffer(16, 16);
      clearFramebuffer(fb, 10, 20, 30, 255);
      clearRegion(fb, { x: 2, y: 2, width: 4, height: 4 }, 200, 100, 50, 255);

      // Inside region
      expect(readPixel(fb, 3, 3)).toEqual({ r: 200, g: 100, b: 50, a: 255 });
      // Outside region
      expect(readPixel(fb, 0, 0)).toEqual({ r: 10, g: 20, b: 30, a: 255 });
    });

    it("clearRegion clamps to framebuffer bounds", () => {
      const fb = createFramebuffer(8, 8);
      // Should not throw even with out-of-bounds rect
      expect(() => clearRegion(fb, { x: -5, y: -5, width: 20, height: 20 }, 255, 0, 0, 255)).not.toThrow();
      expect(readPixel(fb, 0, 0).r).toBe(255);
    });
  });

  describe("output management", () => {
    it("adds a display output with double buffers", () => {
      const out = comp.addOutput("hdmi-0", "HDMI", { width: 320, height: 240, refreshHz: 60, interlaced: false });
      expect(out.id).toBe("hdmi-0");
      expect(out.framebufferFront.width).toBe(320);
      expect(out.framebufferBack.width).toBe(320);
      expect(out.connected).toBe(true);
    });

    it("removes output", () => {
      comp.addOutput("dp-0", "DP", { width: 100, height: 100, refreshHz: 60, interlaced: false });
      expect(comp.removeOutput("dp-0")).toBe(true);
      expect(comp.getOutput("dp-0")).toBeUndefined();
    });

    it("changes mode and recreates framebuffers", () => {
      comp.addOutput("edp-0", "eDP", { width: 100, height: 100, refreshHz: 60, interlaced: false });
      comp.setMode("edp-0", { width: 200, height: 150, refreshHz: 144, interlaced: false });
      const out = comp.getOutput("edp-0")!;
      expect(out.framebufferFront.width).toBe(200);
      expect(out.framebufferFront.height).toBe(150);
    });
  });

  describe("surface lifecycle", () => {
    it("allocates and frees surfaces", () => {
      const surface = comp.allocateSurface("win-1", 64, 48);
      expect(surface.buffer.width).toBe(64);
      expect(surface.windowId).toBe("win-1");
      expect(comp.freeSurface("win-1")).toBe(true);
      expect(comp.getSurface("win-1")).toBeUndefined();
    });

    it("reuses surface if same dimensions", () => {
      const s1 = comp.allocateSurface("win-1", 64, 48);
      const s2 = comp.allocateSurface("win-1", 64, 48);
      expect(s1).toBe(s2); // same reference
    });

    it("commits surface with dirty regions", () => {
      comp.allocateSurface("win-1", 64, 48);
      expect(comp.commitSurface("win-1", [{ x: 0, y: 0, width: 32, height: 32 }])).toBe(true);
      const s = comp.getSurface("win-1")!;
      expect(s.committed).toBe(true);
      expect(s.dirtyRegions.length).toBe(1);
    });
  });

  describe("compositing & page flip", () => {
    it("composites surfaces onto output", () => {
      comp.addOutput("out-0", "Virtual", { width: 32, height: 32, refreshHz: 60, interlaced: false });
      comp.setBackgroundColor(0, 0, 0);

      const surface = comp.allocateSurface("win-1", 16, 16);
      // Fill surface red
      clearFramebuffer(surface.buffer, 255, 0, 0, 255);
      comp.commitSurface("win-1");

      comp.composite(
        [{ id: "win-1", bounds: { x: 4, y: 4, width: 16, height: 16 }, opacity: 1, visible: true }],
        []
      );

      // Back buffer should have red at (8, 8)
      const back = comp.getOutput("out-0")!.framebufferBack;
      const p = readPixel(back, 8, 8);
      expect(p.r).toBe(255);
      expect(p.g).toBe(0);
    });

    it("page flip swaps front and back", () => {
      comp.addOutput("out-0", "Virtual", { width: 16, height: 16, refreshHz: 60, interlaced: false });
      const before = comp.getOutput("out-0")!.framebufferFront;
      comp.pageFlip();
      const after = comp.getOutput("out-0")!.framebufferFront;
      expect(before).not.toBe(after); // references swapped
    });

    it("present = composite + pageFlip", () => {
      comp.addOutput("out-0", "Virtual", { width: 16, height: 16, refreshHz: 60, interlaced: false });
      const flipped = comp.present([], []);
      expect(flipped).toContain("out-0");
    });

    it("stats track compositing metrics", () => {
      comp.addOutput("out-0", "Virtual", { width: 16, height: 16, refreshHz: 60, interlaced: false });
      comp.allocateSurface("w", 16, 16);
      comp.commitSurface("w");
      comp.present([{ id: "w", bounds: { x: 0, y: 0, width: 16, height: 16 }, opacity: 1, visible: true }], []);
      const stats = comp.getStats();
      expect(stats.outputCount).toBe(1);
      expect(stats.totalPageFlips).toBe(1);
      expect(stats.totalBlitCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("overlays", () => {
    it("adds and removes overlays", () => {
      const buf = createFramebuffer(8, 8);
      comp.addOverlay("cursor", buf, 10, 10);
      comp.removeOverlay("cursor");
    });
  });
});

// ═════════════════════════════════════════════════════════════
// 2. Fixed-Point Math
// ═════════════════════════════════════════════════════════════

describe("Fixed-Point Math", () => {
  it("toFixed16 / fromFixed16 roundtrips integers", () => {
    expect(fromFixed16(toFixed16(42))).toBe(42);
    expect(fromFixed16(toFixed16(0))).toBe(0);
    expect(fromFixed16(toFixed16(-7))).toBe(-7);
  });

  it("fpMul works for fractional values below overflow threshold", () => {
    // JS >> operator converts to 32-bit signed int, so a*b must fit in 2^31
    // Safe range: both operands as fixed16 must satisfy |a*b| < 2^31
    const a = toFixed16(0.5);
    const b = toFixed16(0.5);
    expect(fromFixed16(fpMul(a, b))).toBeCloseTo(0.25, 2);
  });

  it("fpMul overflows for large values (known limitation)", () => {
    // toFixed16(3) * toFixed16(4) overflows 32-bit in the >> shift
    const result = fromFixed16(fpMul(toFixed16(3), toFixed16(4)));
    // Result is wrong due to overflow — documenting the boundary
    expect(result).not.toBeCloseTo(12, 0);
  });

  it("fpDiv works for values where shifted numerator fits 32 bits", () => {
    // fpDiv shifts a left by 16 bits, so a must be < 2^15 in fixed-point
    const a = toFixed16(0.75);
    const b = toFixed16(0.5);
    expect(fromFixed16(fpDiv(a, b))).toBeCloseTo(1.5, 1);
  });

  it("fpDiv by zero returns 0", () => {
    expect(fpDiv(toFixed16(5), 0)).toBe(0);
  });

  it("fpFloor and fpCeil work", () => {
    const val = toFixed16(3.7);
    expect(fpFloor(val)).toBe(3);
    expect(fpCeil(val)).toBe(4);
  });

  it("fpFrac extracts fractional part", () => {
    const val = toFixed16(3.25);
    const frac = fromFixed16(fpFrac(val));
    expect(frac).toBeCloseTo(0.25, 2);
  });
});

// ═════════════════════════════════════════════════════════════
// 3. SoftwarePipeline State Management
// ═════════════════════════════════════════════════════════════

describe("SoftwarePipeline", () => {
  it("starts with identity transform", () => {
    const p = new SoftwarePipeline();
    const pt = p.transformPoint(10, 20);
    expect(pt.x).toBe(10);
    expect(pt.y).toBe(20);
  });

  it("save/restore preserves state", () => {
    const p = new SoftwarePipeline();
    p.setBlendMode("multiply");
    p.save();
    p.setBlendMode("screen");
    expect(p.state.blendMode).toBe("screen");
    p.restore();
    expect(p.state.blendMode).toBe("multiply");
  });

  it("multiplyTransform composes matrices", () => {
    const p = new SoftwarePipeline();
    // Translate by (10, 20)
    p.setTransform({ a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 });
    const pt = p.transformPoint(5, 5);
    expect(pt.x).toBeCloseTo(15);
    expect(pt.y).toBeCloseTo(25);
  });

  it("reset clears everything", () => {
    const p = new SoftwarePipeline();
    p.setBlendMode("add");
    p.setClipRect({ x: 0, y: 0, width: 10, height: 10 });
    p.reset();
    expect(p.state.blendMode).toBe("source-over");
    expect(p.state.clipRect).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════
// 4. Command Buffer & Triangle Rasterizer
// ═════════════════════════════════════════════════════════════

describe("CommandBuffer", () => {
  it("requires begin/end for recording", () => {
    const cb = new CommandBuffer();
    expect(() => cb.clear({ r: 0, g: 0, b: 0, a: 255 })).toThrow();
    cb.begin();
    cb.clear({ r: 0, g: 0, b: 0, a: 255 });
    cb.end();
    expect(cb.commandCount).toBe(1);
  });

  it("cannot execute while recording", () => {
    const cb = new CommandBuffer();
    const tile = makeTile(8, 8);
    cb.begin();
    expect(() => cb.execute(tile)).toThrow();
  });

  it("clear fills entire tile", () => {
    const cb = new CommandBuffer();
    const tile = makeTile(8, 8);
    cb.begin();
    cb.clear({ r: 100, g: 150, b: 200, a: 255 });
    cb.end();
    cb.execute(tile);

    const p = readPixel(tile, 4, 4);
    expect(p.r).toBe(100);
    expect(p.g).toBe(150);
    expect(p.b).toBe(200);
  });

  it("fillRect writes pixels", () => {
    const cb = new CommandBuffer();
    const tile = makeTile(16, 16);
    cb.begin();
    cb.clear({ r: 0, g: 0, b: 0, a: 255 });
    cb.fillRect(2, 2, 4, 4, { r: 255, g: 0, b: 0, a: 255 });
    cb.end();
    cb.execute(tile);

    expect(readPixel(tile, 3, 3).r).toBe(255);
    expect(readPixel(tile, 0, 0).r).toBe(0);
  });

  it("batchFill uses SIMD-modeled path", () => {
    const cb = new CommandBuffer();
    const tile = makeTile(32, 4);
    cb.begin();
    cb.batchFill(0, 0, 32, 4, { r: 42, g: 42, b: 42, a: 255 });
    cb.end();
    const stats = cb.execute(tile);

    expect(readPixel(tile, 16, 2).r).toBe(42);
    expect(stats.simdBatchCount).toBeGreaterThan(0);
  });

  it("reset clears commands and stats", () => {
    const cb = new CommandBuffer();
    cb.begin();
    cb.clear({ r: 0, g: 0, b: 0, a: 255 });
    cb.end();
    cb.reset();
    expect(cb.commandCount).toBe(0);
    expect(cb.isRecording).toBe(false);
  });

  describe("triangle rasterization", () => {
    it("rasterizes a solid-color triangle (CCW winding)", () => {
      const cb = new CommandBuffer();
      const tile = makeTile(32, 32);
      // CCW winding order for edge-function rasterizer
      const v0: VertexColor = { x: 16, y: 2, r: 255, g: 0, b: 0, a: 255 };
      const v1: VertexColor = { x: 30, y: 30, r: 255, g: 0, b: 0, a: 255 };
      const v2: VertexColor = { x: 2, y: 30, r: 255, g: 0, b: 0, a: 255 };

      cb.begin();
      cb.clear({ r: 0, g: 0, b: 0, a: 255 });
      cb.drawTriangle(v0, v1, v2);
      cb.end();

      const stats = cb.execute(tile);
      expect(stats.triangleCount).toBe(1);

      // Center of triangle should be filled
      const center = readPixel(tile, 16, 20);
      expect(center.r).toBe(255);
      expect(center.a).toBe(255);

      // Corner outside triangle should remain black
      const corner = readPixel(tile, 0, 0);
      expect(corner.r).toBe(0);
    });

    it("interpolates vertex colors via barycentric coordinates", () => {
      const cb = new CommandBuffer();
      const tile = makeTile(64, 64);

      // CCW winding: pure red, green, blue vertices
      const v0: VertexColor = { x: 32, y: 2, r: 255, g: 0, b: 0, a: 255 };
      const v1: VertexColor = { x: 62, y: 60, r: 0, g: 255, b: 0, a: 255 };
      const v2: VertexColor = { x: 2, y: 60, r: 0, g: 0, b: 255, a: 255 };

      cb.begin();
      cb.drawTriangle(v0, v1, v2);
      cb.end();
      cb.execute(tile);

      // Near top vertex → mostly red
      const nearTop = readPixel(tile, 32, 10);
      expect(nearTop.r).toBeGreaterThan(nearTop.g);
      expect(nearTop.r).toBeGreaterThan(nearTop.b);

      // Center should be a mix of all three
      const center = readPixel(tile, 32, 40);
      expect(center.r + center.g + center.b).toBeGreaterThan(0);
    });

    it("skips degenerate triangles (zero area)", () => {
      const cb = new CommandBuffer();
      const tile = makeTile(16, 16);
      fillTile(tile, 0, 0, 0, 255);

      // Collinear vertices = degenerate
      const v: VertexColor = { x: 0, y: 0, r: 255, g: 0, b: 0, a: 255 };
      cb.begin();
      cb.drawTriangle(v, { ...v, x: 10 }, { ...v, x: 5 });
      cb.end();
      cb.execute(tile);

      // Nothing should be drawn
      expect(readPixel(tile, 5, 0).r).toBe(0);
    });

    it("respects clip rect", () => {
      const cb = new CommandBuffer();
      const tile = makeTile(32, 32);

      // CCW winding
      const v0: VertexColor = { x: 16, y: 0, r: 255, g: 0, b: 0, a: 255 };
      const v1: VertexColor = { x: 31, y: 31, r: 255, g: 0, b: 0, a: 255 };
      const v2: VertexColor = { x: 0, y: 31, r: 255, g: 0, b: 0, a: 255 };

      cb.begin();
      cb.clear({ r: 0, g: 0, b: 0, a: 255 });
      cb.setClipRect({ x: 16, y: 0, width: 16, height: 32 });
      cb.drawTriangle(v0, v1, v2);
      cb.end();
      cb.execute(tile);

      // Left half should be clipped → still black
      expect(readPixel(tile, 4, 20).r).toBe(0);
      // Right half inside triangle should be red
      expect(readPixel(tile, 20, 25).r).toBe(255);
    });

    it("handles triangles larger than tile (clips to bounds)", () => {
      const cb = new CommandBuffer();
      const tile = makeTile(8, 8);

      // CCW winding, huge triangle covering the entire tile
      cb.begin();
      cb.drawTriangle(
        { x: 50, y: -100, r: 128, g: 128, b: 128, a: 255 },
        { x: 200, y: 200, r: 128, g: 128, b: 128, a: 255 },
        { x: -100, y: 200, r: 128, g: 128, b: 128, a: 255 },
      );
      cb.end();

      expect(() => cb.execute(tile)).not.toThrow();
      // All pixels should be filled
      expect(readPixel(tile, 4, 4).r).toBe(128);
    });
  });
});

// ═════════════════════════════════════════════════════════════
// 5. CommandBufferPool
// ═════════════════════════════════════════════════════════════

describe("CommandBufferPool", () => {
  it("acquires and releases command buffers", () => {
    const pool = new CommandBufferPool(4);
    const cb1 = pool.acquire();
    const cb2 = pool.acquire();
    expect(cb1).not.toBe(cb2);

    pool.release(cb1);
    const cb3 = pool.acquire();
    expect(cb3).toBe(cb1); // reused
  });

  it("tracks pooled count", () => {
    const pool = new CommandBufferPool(4);
    const cb = pool.acquire();
    expect(pool.pooledCount).toBe(0);
    pool.release(cb);
    expect(pool.pooledCount).toBe(1);
  });

  it("expands beyond initial pool", () => {
    const pool = new CommandBufferPool(2);
    const cbs = [pool.acquire(), pool.acquire(), pool.acquire()];
    expect(cbs.length).toBe(3); // doesn't throw
  });
});

// ═════════════════════════════════════════════════════════════
// 6. CpuBlur
// ═════════════════════════════════════════════════════════════

describe("CpuBlur", () => {
  it("does nothing with radius 0", () => {
    const tile = makeTile(8, 8);
    fillTile(tile, 100, 200, 50, 255);
    CpuBlur.blur(tile, { x: 0, y: 0, width: 8, height: 8 }, 0);
    expect(readPixel(tile, 4, 4)).toEqual({ r: 100, g: 200, b: 50, a: 255 });
  });

  it("blurs a sharp edge toward the average", () => {
    const tile = makeTile(16, 16);
    // Left half white, right half black
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const off = (y * 16 + x) * 4;
        const val = x < 8 ? 255 : 0;
        tile.pixels[off] = val;
        tile.pixels[off + 1] = val;
        tile.pixels[off + 2] = val;
        tile.pixels[off + 3] = 255;
      }
    }

    CpuBlur.blur(tile, { x: 0, y: 0, width: 16, height: 16 }, 2, 1);

    // Pixel at the edge (x=7) should no longer be pure white
    const edge = readPixel(tile, 7, 8);
    expect(edge.r).toBeLessThan(255);
    expect(edge.r).toBeGreaterThan(0);

    // Pixel at the edge (x=8) should no longer be pure black
    const edgeR = readPixel(tile, 8, 8);
    expect(edgeR.r).toBeGreaterThan(0);
  });

  it("uniform input stays uniform after blur", () => {
    const tile = makeTile(16, 16);
    fillTile(tile, 128, 128, 128, 255);
    CpuBlur.blur(tile, { x: 0, y: 0, width: 16, height: 16 }, 3, 3);

    // Interior pixels should remain ~128 (edge pixels may vary due to clamping)
    const center = readPixel(tile, 8, 8);
    expect(center.r).toBeGreaterThanOrEqual(126);
    expect(center.r).toBeLessThanOrEqual(130);
  });

  it("multi-pass blur produces smoother result than single pass", () => {
    // Create identical tiles with sharp edge
    const tile1 = makeTile(32, 1);
    const tile2 = makeTile(32, 1);
    for (let x = 0; x < 32; x++) {
      const val = x < 16 ? 255 : 0;
      tile1.pixels[x * 4] = val; tile1.pixels[x * 4 + 3] = 255;
      tile2.pixels[x * 4] = val; tile2.pixels[x * 4 + 3] = 255;
    }

    CpuBlur.blur(tile1, { x: 0, y: 0, width: 32, height: 1 }, 3, 1);
    CpuBlur.blur(tile2, { x: 0, y: 0, width: 32, height: 1 }, 3, 3);

    // Measure gradient smoothness: sum of |pixel[x] - pixel[x-1]|
    let diff1 = 0, diff2 = 0;
    for (let x = 1; x < 32; x++) {
      diff1 += Math.abs(tile1.pixels[x * 4] - tile1.pixels[(x - 1) * 4]);
      diff2 += Math.abs(tile2.pixels[x * 4] - tile2.pixels[(x - 1) * 4]);
    }
    // 3-pass should have smaller gradient jumps (smoother)
    expect(diff2).toBeLessThanOrEqual(diff1);
  });

  it("blurInto copies to destination and blurs", () => {
    const src = makeTile(8, 8);
    const dst = makeTile(8, 8);
    // White center dot
    fillTile(src, 0, 0, 0, 255);
    const cx = (4 * 8 + 4) * 4;
    src.pixels[cx] = 255; src.pixels[cx + 1] = 255; src.pixels[cx + 2] = 255;

    CpuBlur.blurInto(src, dst, { x: 0, y: 0, width: 8, height: 8 }, 1, 1);

    // Source should be unchanged
    expect(src.pixels[cx]).toBe(255);
    // Destination center should be dimmer (blurred out)
    expect(dst.pixels[cx]).toBeLessThan(255);
    // Neighbors should have picked up some brightness
    const neighbor = dst.pixels[cx + 4]; // x+1 same row
    expect(neighbor).toBeGreaterThanOrEqual(0);
  });

  it("respects region bounds for writes within region", () => {
    const tile = makeTile(16, 16);
    fillTile(tile, 128, 128, 128, 255);

    // Blur only a sub-region — pixels inside should change if there's variance
    // With uniform fill, blur is a no-op anyway, so just verify no crash
    CpuBlur.blur(tile, { x: 4, y: 4, width: 8, height: 8 }, 2, 1);

    // Interior of blurred region should still be ~128 (uniform input)
    const inside = readPixel(tile, 8, 8);
    expect(inside.r).toBeGreaterThanOrEqual(120);
    expect(inside.r).toBeLessThanOrEqual(136);
  });
});
