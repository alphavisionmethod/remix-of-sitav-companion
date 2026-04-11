# SITA OS — CPU-Only Performance Rendering Architecture

## Design Philosophy

Zero GPU dependency. All rendering on CPU with:
- Cache-efficient SIMD-modeled operations
- Deterministic performance for embedded/low-power systems
- Visual quality comparable to GPU through clever rasterization

### Core Principles

1. **Immediate + retained hybrid rendering** — retained display lists with immediate-mode dirty updates
2. **Damage-based redraw only** — never redraw the whole screen unless >60% dirty
3. **Tile-based rasterization** — 64×64 pixel tiles, only dirty tiles re-rendered
4. **Multi-threaded pipeline** — work-stealing thread pool for parallel tile rasterization
5. **Vector-first UI** — resolution independent, DPI-aware coordinate system

## Pipeline Architecture

### Frame Lifecycle

```
Input Event / State Change
        │
        ▼
  ┌─ Layout Pass ──────────────────┐
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
  └────────────┬──────────────────┘
               ▼
  ┌─ Parallel Rasterization ──────┐
  │  Thread pool picks tiles      │
  │  Vector → scanline → pixels   │
  │  SIMD batch fill/blend        │
  └────────────┬──────────────────┘
               ▼
  ┌─ Compositing ─────────────────┐
  │  Layer tree Z-order merge     │
  │  Opacity / clip application   │
  └────────────┬──────────────────┘
               ▼
         Present (VSync)
```

### Frame Budget: 16.6ms (60 FPS)

## Software Rasterizer

### Scanline Algorithm
- Edge table built from polygon vertices
- Active edge list sorted by X intersection
- Analytical coverage computation for anti-aliasing (4× equivalent)

### Pixel Operations
- **SIMD-modeled**: 4-wide RGBA batch fill/blend
- **Gamma-correct**: sRGB ↔ linear LUTs for proper blending
- **Pre-multiplied alpha**: gradient interpolation
- **Cache-line aligned**: 64-byte aligned tile buffers

### Blend Modes
| Mode | Formula |
|------|---------|
| source-over | `Cs·αs + Cd·αd·(1−αs)` |
| multiply | `Cs·Cd` |
| screen | `Cs + Cd − Cs·Cd` |
| add | `min(1, Cs + Cd)` |
| copy | `Cs` (direct write) |

### Sub-pixel Text Rendering
- LCD RGB stripe filter
- Per-channel alpha blending
- Glyph cache with LRU eviction (max 2048 entries)

## Tile Compositor

### Tile Grid
- Screen partitioned into 64×64 pixel tiles
- States: `clean` → `dirty` → `rendering` → `composited` → `clean`
- Clean tiles cached and reused across frames

### Layer System
- Z-ordered layer tree
- Per-layer: opacity, visibility, clip rect, 2D transform
- Display list diffing: hash-based change detection

### Cache Eviction
- LRU by hit count under memory pressure
- Full redraw fallback when >60% tiles dirty

## Damage Tracker

### Strategies
| Trigger | Strategy |
|---------|----------|
| Widget mutation | Emit dirty rect for affected bounds |
| Scroll | Translate tiles + rasterize exposed strip |
| Animation | Per-frame damage from animated properties |
| Resize/theme | Full screen invalidation |

### Coalescing
- Overlapping rects merged
- Small gaps (<8px) filled when merge is cheaper than separate rasterization

## Vector Engine

### Path Model (SVG-like)
- Commands: moveTo, lineTo, quadTo, cubicTo, arcTo, close
- Fill rules: even-odd, winding
- Stroke: caps (butt/round/square), joins (miter/round/bevel), dash arrays

### Bezier Flattening
- Adaptive subdivision based on curvature (flatness threshold: 0.25px)
- Quadratic and cubic bezier support

### Gradients
- Linear, radial, conic
- Multi-stop with interpolation
- Pre-multiplied alpha for correct blending

### DPI Scaling
- All coordinates in logical pixels
- Rasterization at device pixel density
- Glyph cache keyed by (font, size, charCode, dpiScale)

## Thread Pool

### Architecture
- Default 4 threads (adapts to detected core count)
- Work-stealing deque per thread
- Tile affinity for cache warmth

### Priority Lanes
| Lane | Use Case |
|------|----------|
| ui-critical | User-facing interactive elements |
| normal | Standard widget rendering |
| background | Pre-rendering, speculative work |

### Frame Deadline
- Threads yield incomplete work when 95% of frame budget consumed
- Skipped tiles rendered in next frame

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame budget | 16.6ms (60 FPS) |
| Tile rasterize | <200μs per 64×64 tile |
| Damage coalesce | <50μs |
| Layout pass | <2ms typical |
| Composite | <1ms |
| Thread load balance | >0.85 (1.0 = perfect) |

## Governance

- This document is canonical for rendering architecture
- Changes require proof-chain recorded approval
- Manifest `generated/rendering-pipeline-manifest.json` must stay in sync
