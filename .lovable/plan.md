

# Performance Rendering — Final Missing Pieces

## What's Complete
All 8 gaps from the previous plan are resolved: animation engine, text layout, image pipeline, debug overlay, dash arrays, pattern fills, clip paths, frame pacing, and blitImage. The core pipeline (6 stages), rasterizer, compositor, damage tracker, vector engine, and thread pool are solid.

## What's Still Missing for "Fully Advanced"

### 1. No Display Server / Window Manager
The rendering pipeline can rasterize tiles but has no concept of **windows**. No window creation, move, resize, minimize, maximize, focus, stacking order, or input dispatch to windows.

### 2. No Input System
No keyboard, mouse, touch, or gesture event pipeline. The render pipeline responds to layout changes but cannot originate events from user input.

### 3. No Scene Graph / Retained-Mode Tree
The doc says "immediate + retained hybrid" but there's no retained scene graph. `LayoutNode` is a flat structure passed per-frame — no persistent scene tree with dirty propagation, transform inheritance, or hit testing.

### 4. No Color Management
No ICC profile support, no wide-gamut handling, no color space conversion beyond sRGB gamma LUTs. Modern rendering needs Display P3 / HDR awareness.

### 5. No Render Cache / Display List Cache
Tile cache exists but there's no **display list caching** — the vector engine re-flattens paths every frame. Complex UIs need cached rasterized layers for static content.

### 6. No Accessibility Rendering Support
No high-contrast mode, no focus ring rendering, no screen reader tree generation from the scene graph.

### 7. No Cursor Rendering
Damage tracker lists `"cursor"` as a source but there's no cursor subsystem (cursor shapes, hardware/software cursor, hotspot tracking).

## Plan — 5 New Files + 2 Edits

### New Files

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/display-server.ts` | **Window Manager + Display Server** — window lifecycle (create/destroy/move/resize/minimize/maximize/fullscreen), focus management, stacking order (Z-order with always-on-top), window decorations model, multi-monitor layout, input routing to focused window |
| `src/lib/core-services/kernel/input-system.ts` | **Input Event Pipeline** — keyboard (keydown/keyup/keypress with modifiers), mouse (move/click/scroll/drag), touch (start/move/end/cancel with multi-touch), gesture recognition (pinch/rotate/swipe), input focus chain, event bubbling, global hotkeys |
| `src/lib/core-services/kernel/scene-graph.ts` | **Retained Scene Graph** — persistent node tree with transform inheritance (translate/rotate/scale matrix), dirty flag propagation up/down, hit testing (point-in-path), bounding box computation, opacity inheritance, visibility culling, display list generation |
| `src/lib/core-services/kernel/color-management.ts` | **Color Management** — ICC profile simulation, color space conversion (sRGB, Display P3, linear RGB, HSL, Lab), wide-gamut awareness, tone mapping for HDR content, color blindness simulation filters |
| `src/lib/core-services/kernel/cursor-manager.ts` | **Cursor Subsystem** — cursor shape catalog (arrow, pointer, text, crosshair, resize handles, wait, custom), hotspot tracking, software cursor rendering into tile buffer, cursor damage emission, cursor confinement/grab |

### Edits

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/render-pipeline.ts` | Integrate scene graph as optional retained-mode input (scene graph diffing produces damage instead of flat LayoutNode list), add display list caching for unchanged subtrees |
| `src/lib/core-services/kernel/index.ts` | Export 5 new services, wire into `KernelSubsystem` facade |

### Design Notes
- **Display server** follows X11/Wayland hybrid model: server-side decorations optional, client can draw its own
- **Scene graph** produces a display list that feeds into the existing tile rasterization pipeline — no architectural changes needed downstream
- **Input system** dispatches to display server which routes to focused window's scene graph for hit testing
- **Color management** integrates with the rasterizer's gamma LUTs, extending them to arbitrary ICC profiles
- **Cursor manager** emits damage rects to `DamageTracker` on every cursor move, enabling efficient cursor redraw

## Total: 5 new files + 2 edits

