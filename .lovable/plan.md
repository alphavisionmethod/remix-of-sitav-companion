

# Display Server — CPU Compositor Core (Fully Advanced)

## Gap Analysis

The current `display-server.ts` manages window lifecycle, focus, and Z-stacking but has **no actual framebuffer, no window surface buffers, no pixel-level compositing, no double buffering, and no KMS/DRM scanout abstraction**. It's a window manager without a display backend. The user's spec demands a central compositor that owns the framebuffer and composites window surfaces into it.

## Plan — 1 New File + 2 Edits

### New File

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/cpu-compositor.ts` | **CPU Compositor Core** — the missing heart of the display server |

Contents:
- **Framebuffer model**: `Framebuffer` struct with `Uint8ClampedArray` pixels (RGBA), width, height, stride, double-buffered (front/back), page flip
- **Window Surface Buffers**: each window gets a `SurfaceBuffer` (shared-memory model) — apps draw into their own buffer, compositor reads from it
- **Surface allocation/deallocation** tied to window create/destroy lifecycle
- **Compositing engine**: iterates Z-ordered windows, blits each window's surface buffer into the back framebuffer with opacity, clipping to window bounds, and damage-aware partial blit (only dirty regions per window)
- **KMS/DRM abstraction**: `DisplayOutput` model with CRTC, connector, encoder, mode setting (resolution/refresh), scanout from front buffer
- **Page flip / VSync**: double-buffer swap on present, tearing prevention, flip-complete callback
- **Multi-monitor compositing**: per-monitor framebuffer, surfaces assigned to monitor regions
- **Damage-driven compositing**: only re-composite regions marked dirty by `DisplayServer.collectDamage()`
- **Background/wallpaper layer**: bottom-most surface for desktop background
- **Overlay layer**: top-most for cursor, notifications, OSD
- **Performance stats**: composite time, blit count, page flips, surface memory usage

### Edits

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/display-server.ts` | Integrate `CpuCompositor` — window create/destroy allocates/frees surface buffers; add `getSurface(windowId)` for apps to draw into; `present()` method triggers compositor; connect damage flow |
| `src/lib/core-services/kernel/index.ts` | Export `CpuCompositor` and add to `KernelSubsystem` facade, wire to display server |

## Technical Design

```text
+----------------------+
| Applications         |
| (draw into buffers)  |
+----------+-----------+
           |
           | SurfaceBuffer (shared memory)
           v
+----------+-----------+
| Display Server       |
| + CpuCompositor      |
|   - Z-order walk     |
|   - Per-window blit  |
|   - Opacity blend    |
|   - Clip to bounds   |
|   - Damage-aware     |
+----------+-----------+
           |
           | Page flip (double buffer)
           v
+----------+-----------+
| Framebuffer (RAM)    |
| front / back buffer  |
+----------+-----------+
           |
           | KMS scanout
           v
+----------------------+
| DisplayOutput (CRTC) |
| → Monitor            |
+----------------------+
```

### Key Types

```typescript
interface Framebuffer {
  pixels: Uint8ClampedArray;  // RGBA
  width: number;
  height: number;
  stride: number;             // bytes per row (cache-line aligned)
}

interface SurfaceBuffer {
  windowId: string;
  buffer: Framebuffer;
  dirtyRegions: Rect[];
  committed: boolean;         // client signals "ready to present"
}

interface DisplayOutput {
  id: string;
  crtcId: number;
  connectorType: "HDMI" | "DP" | "eDP" | "VGA" | "Virtual";
  currentMode: DisplayMode;
  availableModes: DisplayMode[];
  framebufferFront: Framebuffer;
  framebufferBack: Framebuffer;
  vblankCount: number;
}

interface DisplayMode {
  width: number;
  height: number;
  refreshHz: number;
  interlaced: boolean;
}
```

### Compositing Algorithm
1. For each dirty region from damage tracker
2. Walk Z-ordered windows bottom to top
3. For each window intersecting the dirty region:
   - Read from window's `SurfaceBuffer`
   - Apply window opacity
   - Clip to window bounds and dirty region intersection
   - Blit into back framebuffer using rasterizer's blend function
4. Render cursor overlay on top
5. Page flip: swap front ↔ back

## Total: 1 new file + 2 edits

