

# Sections 5.6–5.12 — Remaining Gaps

## Already Implemented
- **5.6 View tree** (Column, Row, Stack, Text, Button, Image, Spacer) ✅
- **5.6 Layout engine** (flex + constraints) ✅
- **5.6 draw(ctx)** protocol on every widget ✅
- **5.7 Animation engine** with compositor vs raster layer classification ✅
- **5.7 bindToView()** for transform/opacity/position animations ✅
- **5.8 Glyph cache** with LRU (2048 max), sub-pixel coverage ✅
- **5.8 Sub-pixel LCD rendering** (RGB stripe per-channel alpha) ✅
- **5.8 Text layout** (greedy + Knuth-Plass line breaking, alignment, truncation, ellipsis, font fallback, RTL stub, bidi stub) ✅
- **5.9 CPU blur** (3-pass separable box blur ≈ Gaussian, O(1) sliding window) ✅
- **5.9 Shadows** (render mask → blur → offset + blend) ✅
- **5.9 Gradients** (linear, radial, conic with lerp interpolation) ✅
- **5.10 Dirty rectangles** (damage tracker with coalescing) ✅
- **5.10 Tile rendering** (64×64 parallel tiles, thread pool) ✅
- **5.10 Fixed-point math** (16.16 in triangle rasterizer) ✅
- **5.10 Glyph caching + layout caching** ✅
- **5.11 Frame lifecycle** (Input → Layout → Raster → Composite → Present) ✅
- **5.11 Double buffering** (front/back with pageFlip) ✅
- **5.11 Frame budget** (16.6ms, adaptive FPS, deadline-aware threads) ✅

## What's Missing

### 1. Glyph Atlas (Section 5.8)
The spec shows glyphs stored in a **bitmap atlas** grid (`[A][B][C][D] / [E][F][G][H]`). Currently glyphs are cached individually in a `Map<string, GlyphCacheEntry>`. No packed atlas texture for cache-efficient sequential blitting.

### 2. Kerning (Section 5.8)
The spec lists "kerning + layout" as a feature. The text layout engine has letter/word spacing but no **kerning pairs** (e.g., "AV", "To" get tighter spacing).

### 3. Animation Layer Caching (Section 5.7)
The spec's optimization trick: `[Static UI] → cached bitmap / [Animated layer] → re-rendered`. No layer caching exists — every frame re-draws all visible content. Need per-ViewNode rasterization cache that persists across frames when only compositor-layer animations are active.

### 4. Branch Minimization (Section 5.10)
The spec calls for branchless pixel operations using mask operations instead of `if` statements. Current blend/fill code uses standard conditionals.

## Plan — 2 Edits + 1 New Section in Existing File

### Edit 1: `vector-renderer.ts` — Glyph Atlas + Kerning
- Add `GlyphAtlas` class: packs glyphs into a single `Uint8Array` grid (e.g., 512×512), row-based bin packing, returns atlas coordinates per glyph
- Add kerning table: `Map<string, number>` keyed by char-pair (e.g., `"AV"` → `-2`), applied during glyph positioning
- Existing `getGlyph`/`cacheGlyph` methods delegate to atlas for storage

### Edit 2: `view-tree.ts` — Layer Bitmap Caching
- Add `cachedRaster: TileBuffer | null` on `ViewNode`
- On `draw()`: if node is not dirty and `cachedRaster` exists, blit cache instead of re-drawing
- On dirty: invalidate `cachedRaster`, re-draw into fresh buffer, store as new cache
- Compositor-layer animations skip cache invalidation (reuse cached raster, apply transform overlay)

### Edit 3: `software-rasterizer.ts` — Branchless Blend
- Add branchless alpha blend helper using arithmetic masks: `mask = -(alpha > 0)` pattern
- Replace key blend inner loops with branchless variants
- Add branchless `min`/`max`/`clamp` helpers using bitwise operations

### Edit 4: `index.ts` — Export new types

## Total: 4 edits

