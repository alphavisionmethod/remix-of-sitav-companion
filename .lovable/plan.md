

# UI Toolkit (Section 5.6) + Animation System (Section 5.7) — Implementation Plan

## What Exists
- **Scene graph** (`scene-graph.ts`): Retained node tree with transforms, opacity, hit testing, display list generation — but nodes are raw primitives (rect, path, text, image), not UI widgets
- **UI renderer** (`ui-renderer.ts`): Draws individual views with background/borderRadius/shadow — but no view tree, no layout engine, no parent-child composition
- **Animation engine** (`animation-engine.ts`): Timeline + spring animations on numeric properties, damage emission — but not wired to a view tree, and doesn't distinguish transform/opacity/position-only animations from full re-rasterization

## What's Missing

### Section 5.6 — UI Toolkit (Vector-First)
1. **View tree** — No `Widget`/`View` base class, no `Column`, `Row`, `Text`, `Button`, `Image` widget types. The spec requires a composable view hierarchy: `Window → Column → [Text, Button, Image]`
2. **Layout engine** — No flex layout (`Column(spacing: 10)`) or constraint layout (`button.centerX = parent.centerX`). No measure/layout pass that resolves sizes and positions
3. **Widget draw protocol** — No `draw(ctx)` method on each view. Currently, rendering is done externally via `UIRenderer.drawView()` rather than views drawing themselves

### Section 5.7 — Animation System (CPU-Optimized)
4. **Transform-only animation optimization** — The spec says "only animate transforms, opacity, position" to avoid re-rasterizing. The engine animates arbitrary properties but doesn't distinguish between "cheap" animations (compositor-level) and "expensive" ones (require re-rasterization)
5. **View-animation binding** — No way to bind an animation to a view node and have it automatically update transforms/opacity without re-layout

## Plan — 2 New Files + 2 Edits

### New Files

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/view-tree.ts` | **View Tree + Widget System** — Base `ViewNode` class with `draw(ctx)`, measure/layout lifecycle. Built-in widgets: `Column`, `Row`, `Stack`, `TextWidget`, `ButtonWidget`, `ImageWidget`, `Spacer`. Each is vector-first (draws via command buffer). Supports flex layout (main axis alignment, cross axis alignment, spacing, padding) and constraint layout (centerX/Y, edges, aspect ratio). Tree diffing for efficient dirty propagation. |
| `src/lib/core-services/kernel/layout-engine.ts` | **Hybrid Layout Engine** — Two-pass measure+layout. Flex solver: intrinsic sizing → distribute remaining space by flex weight. Constraint solver: simple linear constraint resolution (anchors: left/right/top/bottom/centerX/centerY relative to parent or sibling). Outputs resolved `Rect` per node. Emits damage for nodes whose bounds changed. |

### Edits

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/animation-engine.ts` | Add `AnimationLayer` concept: `compositor` (transform/opacity/position — skip re-raster) vs `raster` (color/size changes — triggers re-rasterization). Add `bindToView(animId, viewNodeId)` for auto-applying computed values to view node transforms. |
| `src/lib/core-services/kernel/index.ts` | Export `ViewTree`, `LayoutEngine`, new widget types. Wire layout engine into frame cycle (layout pass runs before rasterization). |

### Technical Details

**View Node interface:**
```text
ViewNode {
  id, type, parent, children[]
  style: { width, height, flex, padding, margin, background, borderRadius, opacity, ... }
  constraints?: { centerX?, left?, right?, ... }
  draw(ctx: DrawContext): void  // each widget implements
  measure(maxW, maxH): { width, height }
  layout(x, y, w, h): void
  dirty: boolean
  resolvedBounds: Rect
}
```

**Flex layout algorithm:**
1. Measure children with intrinsic sizing
2. Sum fixed sizes + spacing
3. Distribute remaining space to flex children by weight
4. Position children along main axis
5. Cross-axis alignment (start/center/end/stretch)

**Compositor-layer animation:**
When animation targets only `tx`, `ty`, `sx`, `sy`, `rotation`, `opacity` — compositor applies these as overlay transforms during compositing without re-rasterizing the tile. The view's cached rasterization is reused.

## Total: 2 new files + 2 edits

