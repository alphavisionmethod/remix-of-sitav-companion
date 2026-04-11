

# Display Server Sections 5.2–5.5 — Missing Pieces

## What's Already Implemented
- Surface model with `SurfaceBuffer` (buffer, bounds, dirty flag) ✅
- CPU Compositor with framebuffer, double buffering, Z-order compositing, damage-aware blitting ✅
- Alpha blending (source-over, multiply, screen, add, copy) with gamma-correct LUTs ✅
- Tile-based multi-threaded rendering pipeline ✅
- Scanline rasterizer with polygon fill, rect fill, anti-aliasing ✅
- Vector renderer with paths, gradients, patterns, glyph cache ✅
- Damage tracker with rect coalescing ✅

## What's Missing

### 1. Command Buffer / Software Pipeline API (Section 5.5 — "CPU Vulkan")
The spec calls for a low-level rendering API with **command buffers** and **software pipelines** — a structured way to record draw calls and replay them. Currently, all drawing is direct/immediate with no command abstraction.

### 2. Triangle Rasterization with Edge Functions + Fixed-Point Math (Section 5.5)
`fillPolygon` uses scanline intersection, not the spec's **edge function** approach with **fixed-point math** (no floats). The spec explicitly calls for edge-function triangle rasterization optimized with fixed-point arithmetic.

### 3. High-Level UI Drawing API (Section 5.5)
No API that lets you set `background`, `borderRadius`, `shadow` on a view and have it compile down to rect fills, gradients, and blurs. This is the "declarative UI rendering" layer.

### 4. CPU Box Blur / Gaussian Blur (Section 5.5)
The spec says shadows and blurs are "CPU optimized" but there's no blur implementation anywhere.

### 5. Region System with Smart Merging (Section 5.3)
Damage tracker does simple rect coalescing, but the spec describes a `Region` struct with an array of rects and explicit smart merging (small updates → merged large region). This is mostly present but should be formalized.

## Plan — 2 New Files + 1 Edit

### New Files

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/command-buffer.ts` | **Command Buffer + Software Pipeline** — record/replay draw commands (drawTriangle, drawRect, drawPath, setBlendMode, setPipeline), command buffer pooling, software pipeline state (blend mode, clip rect, transform), triangle rasterization via edge functions with fixed-point math (16.16 format), 8-pixel-wide SIMD-modeled scanline fill |
| `src/lib/core-services/kernel/ui-renderer.ts` | **High-Level UI Drawing API** — declarative view properties (background color/gradient, borderRadius with rounded-rect path generation, boxShadow with CPU blur, border, opacity), compiles to command buffer draw calls; includes CPU box blur (separable horizontal+vertical pass, O(1) sliding window) and rounded-rect clipping |

### Edits

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/index.ts` | Export `CommandBuffer`, `SoftwarePipeline`, `UIRenderer` and wire into `KernelSubsystem` facade |

## Technical Details

### Command Buffer
- `begin()` / `end()` lifecycle
- Commands: `drawTriangle(v0,v1,v2,color)`, `drawRect(x,y,w,h,color)`, `drawPath(path,fill)`, `setClipRect(rect)`, `setTransform(matrix)`, `setBlendMode(mode)`, `clear(color)`
- `execute(target: TileBuffer)` replays all recorded commands
- Reusable: `reset()` clears commands without reallocation

### Edge-Function Triangle Rasterizer
- Edge function: `E(x,y) = (v1.y - v0.y) * x - (v1.x - v0.x) * y + v1.x * v0.y - v0.x * v1.y`
- All math in 16.16 fixed-point (shift left 16, integer arithmetic only)
- Point inside triangle when all three edge functions ≥ 0
- Incremental evaluation: step by 1 in X adds `(v1.y - v0.y)` to edge value — no multiply per pixel
- SIMD-modeled: evaluate 8 pixels per loop iteration

### UI Renderer (High-Level API)
```typescript
uiRenderer.drawView(tile, {
  x: 10, y: 10, width: 200, height: 40,
  background: { type: "solid", r: 255, g: 255, b: 255, a: 255 },
  borderRadius: 12,
  shadow: { offsetX: 0, offsetY: 4, blur: 8, color: { r: 0, g: 0, b: 0, a: 80 } },
  border: { width: 1, color: { r: 200, g: 200, b: 200, a: 255 } }
});
```
Compiles to: shadow blur pass → rounded-rect clip → background fill → border stroke

### CPU Blur
- Separable box blur (horizontal pass, then vertical pass)
- O(1) per pixel using sliding window sum
- Multi-pass box blur (3 passes ≈ Gaussian approximation)
- Operates on `TileBuffer` in-place or into a scratch buffer

## Total: 2 new files + 1 edit

