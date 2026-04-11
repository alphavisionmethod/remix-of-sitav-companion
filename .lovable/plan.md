

# Performance Rendering — Missing Pieces & Enhancements

## What's Already Solid (no changes needed)
- 6-stage pipeline with frame budget tracking (p95/p99)
- Scanline rasterizer with analytical AA, gamma-correct blending, all blend modes
- SIMD-modeled batch ops, cache-line aligned tile buffers
- Damage tracker with coalescing, scroll optimization
- Tile compositor with LRU eviction, display list diffing, layer Z-order
- Vector engine with bezier flattening, gradients, glyph cache, DPI scaling
- Thread pool with work-stealing, tile affinity, priority lanes, deadline yielding

## Gaps Found

### 1. No Animation System
Damage tracker lists `"animation"` as a source but there's no animation framework. Need: easing functions, property interpolation, timeline management, per-frame dirty rect emission from animated properties.

### 2. No Image/Bitmap Pipeline
Only vector primitives and solid colors exist. Need: bitmap blitting, image decode simulation, image scaling (nearest/bilinear), image tiling/repeat, sprite sheet support.

### 3. No Text Layout Engine
Glyph cache exists but no text shaping or layout. Need: line breaking, word wrapping, text alignment, paragraph layout, bidirectional text support, font fallback chain.

### 4. No Clip Path Support
Only axis-aligned clip rects. Need: arbitrary path clipping (intersect scanlines with clip path), nested clip stack.

### 5. Stroke Dash Array Not Implemented
`StrokeStyle` declares `dashArray` and `dashOffset` but `expandStroke()` ignores them.

### 6. No Pattern Fills
Mentioned in vector-renderer description but not implemented.

### 7. No Debug Overlay / Performance Profiler
Manifest declares `debugVisualization: true` but no debug overlay for damage regions, tile grid, or frame timing exists.

### 8. No Frame Pacing / Jitter Smoothing
VSync loop uses raw `setInterval` — no compensation for frame jitter or adaptive frame skipping.

## Plan — 4 New Files + 4 Edits

### New Files

| File | What |
|------|------|
| `src/lib/core-services/kernel/animation-engine.ts` | Animation system: timeline, keyframes, easing library (ease-in/out/cubic-bezier), property interpolation, springs, automatic damage emission per animated property per frame |
| `src/lib/core-services/kernel/text-layout-engine.ts` | Text shaping & layout: line breaking (greedy + optimal), word wrap, alignment (left/center/right/justify), paragraph metrics, font metrics simulation, fallback chain, bidi stub |
| `src/lib/core-services/kernel/image-pipeline.ts` | Bitmap operations: image decode simulation, bilinear/nearest scaling, blit to tile buffer, image repeat/tile, nine-slice, sprite atlas, pixel format conversion |
| `src/lib/core-services/kernel/render-debug-overlay.ts` | Debug visualization: damage region outlines, tile grid, dirty tile heatmap, frame time graph, per-stage breakdown bars, thread load bars, glyph cache utilization |

### Edits to Existing Files

| File | Change |
|------|--------|
| `vector-renderer.ts` | Implement dash array in `expandStroke()`, add pattern fill sampling, add clip path stack with scanline intersection |
| `render-pipeline.ts` | Replace `setInterval` with adaptive frame pacer (timestamp delta compensation, frame skip with partial rendering), integrate animation tick before layout pass |
| `software-rasterizer.ts` | Add `blitImage()` method for bitmap compositing into tile buffers |
| `src/lib/core-services/kernel/index.ts` | Export 4 new services, wire into `KernelSubsystem` facade |

## Technical Details

### Animation Engine
- Keyframe tracks with named properties (x, y, opacity, color, scale, rotation)
- Easing: linear, ease-in, ease-out, ease-in-out, cubic-bezier(a,b,c,d), spring(stiffness, damping, mass)
- Timeline: play/pause/reverse/seek, playback rate, auto-repeat, finish callbacks
- Each tick emits dirty rects for changed property bounds → feeds into DamageTracker

### Text Layout
- Font metrics: ascent, descent, line gap, advance widths (simulated lookup table)
- Line breaking: greedy algorithm + Knuth-Plass optimal for justified text
- Layout box: max width, max lines, overflow (clip/ellipsis), vertical alignment
- Output: positioned glyph runs → fed to VectorRenderer glyph cache

### Image Pipeline
- Simulated decode: accepts width/height/pixel data, outputs TileBuffer-compatible format
- Scaling: nearest-neighbor (fast) and bilinear (quality) with configurable threshold
- Nine-slice: define insets for resizable UI elements (buttons, panels)

### Frame Pacer
- Track actual frame timestamps via `performance.now()` delta
- If frame arrives early: defer to next VSync boundary
- If frame arrives late: skip damage collection and present last good frame
- Adaptive: reduce target FPS temporarily under sustained budget overruns

## Total: 4 new files + 4 edits

