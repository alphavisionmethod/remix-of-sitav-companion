

# SITA OS — CPU-Only Performance Rendering Subsystem

## What Gets Built

A complete software rendering pipeline designed for zero GPU dependency, implementing all five core principles: hybrid immediate+retained rendering, damage-based redraw, tile-based rasterization, multi-threaded pipeline, and vector-first resolution independence.

## New Files (6 services + 2 docs + 1 manifest)

### Rendering Pipeline Services

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/render-pipeline.ts` | **Master rendering pipeline orchestrator** — frame lifecycle (layout → paint → composite → present), frame budget management (16.6ms target), pipeline statistics, VSync simulation, frame skip policy |
| `src/lib/core-services/kernel/software-rasterizer.ts` | **CPU rasterizer engine** — scanline rasterization, anti-aliasing (4x MSAA equivalent via analytical coverage), sub-pixel rendering for text, SIMD-modeled batch operations, pixel format handling (RGBA8888, RGB565), blend modes (source-over, multiply, screen), gamma-correct blending |
| `src/lib/core-services/kernel/tile-compositor.ts` | **Tile-based compositor** — screen divided into 64x64 tiles, per-tile damage tracking, dirty-tile-only redraw, tile merge for large updates, compositing order (z-index layer tree), opacity/clip/transform per layer, retained display list diffing |
| `src/lib/core-services/kernel/damage-tracker.ts` | **Damage region system** — dirty rectangle accumulation, region coalescing (merge overlapping rects), partial invalidation API, scroll damage optimization, frame-to-frame diffing, damage visualization debug mode |
| `src/lib/core-services/kernel/vector-renderer.ts` | **Resolution-independent vector engine** — path commands (moveTo, lineTo, cubicTo, arcTo, close), fill rules (even-odd, winding), stroke with caps/joins/miter, gradient fills (linear, radial, conic), pattern fills, text layout with glyph cache, DPI-aware coordinate transforms |
| `src/lib/core-services/kernel/render-thread-pool.ts` | **Multi-threaded work distribution** — thread pool simulation (Web Worker model), tile-parallel rasterization, work stealing between threads, thread affinity for cache locality, priority lanes (UI-critical vs background), frame deadline awareness, load balancing metrics |

### Documentation & Manifests

| File | Purpose |
|------|---------|
| `infra/docs/PERFORMANCE_RENDERING.md` | Full specification: pipeline architecture, rasterization algorithms, tile system, damage tracking, threading model, benchmarks |
| `infra/docs/RENDERING_PIPELINE.md` | Visual diagrams: frame lifecycle, tile grid, damage flow, thread pool topology |
| `generated/rendering-pipeline-manifest.json` | Machine-readable config: tile size, thread count, frame budget, rasterizer capabilities, blend modes |

### Wiring

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/index.ts` | Export all 6 rendering services, add to `KernelSubsystem` facade as `renderPipeline`, `rasterizer`, `compositor`, `damageTracker`, `vectorEngine`, `renderThreads` |

## Technical Design

### Frame Lifecycle
```text
Input Event / State Change
        │
        ▼
  ┌─ Layout Pass ──────────────────┐
  │  Flex/grid resolution          │
  │  Constraint solving            │
  │  Position computation          │
  └────────────┬───────────────────┘
               ▼
  ┌─ Damage Collection ───────────┐
  │  Compare old vs new layout    │
  │  Mark dirty regions           │
  │  Coalesce overlapping rects   │
  └────────────┬──────────────────┘
               ▼
  ┌─ Tile Assignment ─────────────┐
  │  Map dirty rects → tile IDs   │
  │  Skip clean tiles entirely    │
  │  Enqueue dirty tiles          │
  └────────────┬──────────────────┘
               ▼
  ┌─ Parallel Rasterization ──────┐
  │  Thread pool picks tiles      │
  │  Vector → scanline → pixels   │
  │  SIMD batch fill/blend        │
  │  Glyph cache hit/render       │
  └────────────┬──────────────────┘
               ▼
  ┌─ Compositing ─────────────────┐
  │  Layer tree Z-order merge     │
  │  Opacity / clip application   │
  │  Final framebuffer assembly   │
  └────────────┬──────────────────┘
               ▼
         Present (VSync)
```

### Damage Tracking Strategy
- Every widget mutation emits a dirty rect
- Rects coalesced: overlapping rects merged, small gaps filled if merge is cheaper
- Scroll: translate existing tiles + rasterize only newly exposed strip
- Animation: per-frame damage from animated properties only
- Full redraw only on resize or theme change

### Tile System
- Screen partitioned into 64x64 pixel tiles (configurable)
- Each tile has state: `clean`, `dirty`, `rendering`, `composited`
- Tile cache: clean tiles retained across frames, evicted on memory pressure
- Large updates (>60% dirty): fall back to full-frame rasterization

### SIMD-Modeled Operations
- Batch pixel fill (4-wide RGBA operations)
- Blend mode kernels (source-over as default, optimized fast paths)
- Gradient interpolation (pre-multiplied alpha)
- Cache-line-aligned tile buffers for spatial locality

### Vector Engine Capabilities
- Full SVG-like path model with cubic/quadratic beziers
- Analytical anti-aliasing (coverage computation per scanline)
- Sub-pixel text rendering with LCD filter
- Glyph cache: LRU with size/font/DPI key
- DPI scaling: all coordinates in logical pixels, rasterize at device pixels

### Thread Pool Model
- Default 4 render threads (adapts to core count)
- Work-stealing deque per thread
- Tile affinity: prefer same thread for same screen region (cache warmth)
- Priority lanes: UI-interactive tiles get priority over background pre-render
- Frame deadline: threads yield incomplete work if frame budget (<16.6ms) nearly exhausted

## Total: 9 new files + 1 edit

