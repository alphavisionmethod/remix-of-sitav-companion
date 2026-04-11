

# Display Server (CPU Compositor) — Missing Wiring & Features

## What's Solid
- CpuCompositor: framebuffer model, double buffering, page flip, surface management, Z-order compositing, overlays, KMS/DRM abstraction, multi-monitor, damage-aware blitting, background/wallpaper
- DisplayServer: window lifecycle, focus, Z-stacking, modal stack, decorations, multi-monitor, surface allocation wired to compositor, `present()` orchestrates full frame cycle
- InputSystem, SceneGraph, CursorManager, ColorManagement all exist

## What's Missing

### 1. No wiring between subsystems
The services are instantiated side-by-side in `KernelSubsystem` but **never connected**:
- **Input → DisplayServer**: mouse clicks should hit-test windows and route focus; keyboard events should dispatch to focused window
- **DisplayServer → CursorManager**: cursor movement should emit damage and render the cursor overlay via compositor
- **InputSystem → SceneGraph**: after display server routes to a window, the event should hit-test the scene graph for that window's node tree
- **ColorManagement → Rasterizer**: ICC profiles and color space conversions never feed into the compositing blit loop
- **AnimationEngine → DamageTracker**: animation ticks should emit damage rects (the engine produces them but nothing consumes them)

### 2. No clipboard / selection transfer
No cut/copy/paste protocol between windows. Essential for any display server.

### 3. No drag-and-drop between windows
InputSystem detects drag gestures but there's no cross-window DnD protocol (offer/accept/drop).

### 4. No window snapping / tiling
No snap-to-edge, quarter-tiling, or keyboard-driven tiling layout manager.

### 5. No screen lock / power management
No screensaver, screen blank, DPMS states, or session lock.

### 6. No accessibility rendering hooks
No focus ring rendering, high-contrast mode toggle, or screen reader tree generation from scene graph.

## Plan — 3 New Files + 3 Edits

### New Files

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/clipboard-manager.ts` | **Clipboard & Selection Transfer** — MIME-typed clipboard with primary/clipboard selections, copy/paste/cut protocol, data offer/accept model, history ring (last N entries), inter-window transfer |
| `src/lib/core-services/kernel/window-effects.ts` | **Window Snap/Tile + Power Management** — snap zones (half/quarter screen, edge magnetism), keyboard tiling shortcuts, DPMS power states (on/standby/suspend/off), screen lock, idle timeout, screensaver hook |
| `src/lib/core-services/kernel/accessibility-renderer.ts` | **Accessibility Rendering** — focus ring overlay, high-contrast mode (recolor pipeline), reduced-motion flag, screen reader tree extraction from SceneGraph, ARIA-like role/label annotations on SceneNodes |

### Edits

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/index.ts` | Export 3 new services, add to facade, **wire all subsystems together** in constructor: input→display server routing, cursor→compositor overlay, animation→damage, color→rasterizer |
| `src/lib/core-services/kernel/display-server.ts` | Add `routeInputEvent(event)` method that hit-tests windows, updates focus, dispatches to scene graph; add `renderCursorOverlay()` that syncs cursor manager to compositor overlay; add snap/tile helpers |
| `src/lib/core-services/kernel/scene-graph.ts` | Add `dispatchEvent(nodeId, event)` for input event bubbling through the scene tree after display server routes to a window |

## Technical Details

### Subsystem Wiring (in KernelSubsystem constructor)
```text
InputSystem.onEvent → DisplayServer.routeInputEvent
  → hit-test windows (windowAtPoint)
  → focus window
  → SceneGraph.dispatchEvent (hit-test nodes)

CursorManager.onMove → DisplayServer.compositor.setOverlayPosition("cursor", ...)
                      → DamageTracker.addDamage("cursor", oldRect ∪ newRect)

AnimationEngine.onTick → DamageTracker.addDamage("animation", dirtyRects)

ColorManagement.activeProfile → CpuCompositor.setGammaRamp (per-output)
```

### Clipboard Protocol
- `ClipboardManager.copy(mimeType, data)` — app writes to clipboard
- `ClipboardManager.paste(mimeType)` — app reads from clipboard
- MIME types: text/plain, text/html, image/png, application/json
- History: ring buffer of last 25 entries
- Primary selection (X11-style): auto-copy on text select, middle-click paste

### Window Snapping
- Snap zones: left-half, right-half, top-left quarter, top-right quarter, bottom-left quarter, bottom-right quarter
- Edge magnetism: windows within 16px of screen edge snap to it
- Keyboard: Meta+Arrow for half-snap, Meta+Shift+Arrow for quarter

### Power/DPMS States
- On → Standby (dim, 5min idle) → Suspend (blank, 15min) → Off (DPMS off, 30min)
- Screen lock: requires re-authentication, compositor shows lock surface on top of all windows
- Wake: any input event transitions back to On

### Accessibility
- Focus ring: 3px colored outline rendered as compositor overlay on focused element
- High-contrast: swap color palette in rasterizer gamma LUTs
- Reduced motion: flag checked by AnimationEngine to skip/shorten animations
- Screen reader tree: walk SceneGraph, extract role+label+value → flat accessible tree

## Total: 3 new files + 3 edits

