

# Integrate C++ Compositor & SIMD Rasterizer Specs into SITA OS

## What We're Building

Two additions based on the user's detailed C++ code:

1. **Compositor & Rasterizer Reference Spec** — a new architecture doc (`infra/docs/COMPOSITOR_RASTERIZER_SPEC.md`) containing the exact C++ data structures, alpha blending, SIMD fill, box blur, gradient, and damage region code the user provided, organized as a buildable reference for the native engine phase.

2. **TypeScript Compositor Simulation** — a new module (`src/lib/engine/compositor-sim.ts`) that models the compositor concepts in TypeScript within the React prototype. This lets the prototype *simulate* the real pipeline: Surface objects, z-ordered window list, per-pixel alpha blending (on an OffscreenCanvas), damage rect tracking, and box blur approximation. This bridges the React UI to the native engine spec.

## Plan

### 1. New doc: Compositor & Rasterizer Implementation Spec
**New file**: `infra/docs/COMPOSITOR_RASTERIZER_SPEC.md`

Contains (verbatim from user, organized into sections):
- **Part 1 — Compositor**: `Color`, `Surface`, `Rect`, `Framebuffer` structs; alpha blend function; compositing loop; damage region optimization
- **Part 2 — CPU Rasterizer**: scalar `fill_rect`, AVX2 SIMD `fill_rect_simd`, gradient `lerp`, box blur approximation
- **Build notes**: which headers needed (`<immintrin.h>`), compile flags (`-mavx2`), integration with the tile system from `PERFORMANCE_RENDERING.md`

### 2. TypeScript compositor simulation module
**New file**: `src/lib/engine/compositor-sim.ts`

Exports:
- `Surface` class (buffer as `Uint32Array`, position, opacity, visible)
- `Framebuffer` class (pixel buffer, width, height)
- `alphaBlend(fg, bg)` — exact port of the C++ blend function
- `composite(fb, surfaces)` — z-order compositing loop
- `DamageTracker` class — tracks dirty `Rect[]`, coalesces overlaps
- `fillRect(buffer, stride, x, y, w, h, color)` — scalar fill
- `boxBlur3x3(src, dst, w, h)` — 3x3 box blur approximation

This module is pure computation (no DOM), usable for testing or future Canvas-based rendering.

### 3. Link new spec from existing architecture docs
**Edit**: `infra/docs/NOVA_OS_ARCHITECTURE.md`
- Add cross-reference to `COMPOSITOR_RASTERIZER_SPEC.md` in the CPU Rendering Pipeline section
- Note that the C++ implementation spec is the target for Phase 2 (Native Engine)

### 4. Update rendering pipeline manifest
**Edit**: `generated/rendering-pipeline-manifest.json`
- Add `compositor` section with blend mode formula reference and surface struct schema
- Add `simd` section documenting AVX2/NEON acceleration targets

## Files
- 2 new files (spec doc + TS simulation module)
- 2 edits (architecture doc cross-ref + manifest update)

## Technical Notes
- The TS simulation is a pure-logic module with zero React/DOM dependencies — it can run in a Web Worker or Node for testing
- The C++ spec doc preserves the user's exact code with added context for compilation and integration
- All specs reference the existing tile system (64x64) and damage tracker from `PERFORMANCE_RENDERING.md`

