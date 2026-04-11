# NovaOS Architecture Specification

## React Prototype → Real OS Mapping

| React Component | OS Subsystem | Role |
|---|---|---|
| `DesktopSurface` | Desktop / Wallpaper Daemon | Root compositing surface, background rendering |
| `FloatingWindow` | Window Manager (WM) | Compositor surface with drag, snap, z-order |
| `SystemMenuBar` | System Menu Bar daemon | Global app menus, status area, clock |
| `DesktopDock` | Dock / Taskbar | App launcher, running indicator, magnification |
| `CommandPalette` | Spotlight / App Search daemon | Indexed search across apps, files, actions |
| `MissionControl` | Exposé / Window Overview | Zoomed-out window grid with focus-switch |
| `ShellAmbientBackground` | Compositor FX layer | Ambient orbs, blur layers, mood rendering |
| `useWindowManager` | Window Manager state | Open/close/focus/minimize/z-order tracking |
| `snap-zones.ts` | Tiling WM / Snap engine | Edge detection, half/full-screen tiling |

---

## CPU Rendering Pipeline

```
App Logic (React state)
    ↓
UI Tree (Component hierarchy)
    ↓
Layout Engine (CSS Flexbox/Grid → custom constraint solver)
    ↓
CPU Rasterizer (scanline rendering)
    ↓
Compositor (window blending, z-order, transparency)
    ↓
Framebuffer (RAM)
    ↓
Display Controller → Screen
```

### Rasterizer Primitives

```c
void draw_rect(int x, int y, int w, int h, Color fill);
void draw_rounded_rect(int x, int y, int w, int h, int radius, Color fill);
void draw_text(Font* font, const char* text, int x, int y, Color color);
void draw_gradient(Rect bounds, Color from, Color to, GradientDir dir);
void draw_blur(Rect region, int radius);  // box blur approximation
void draw_shadow(Rect bounds, int spread, int blur, Color shadow);
```

### Damage Tracking

The compositor tracks dirty rectangles per frame:
1. Window moved → old rect + new rect marked dirty
2. Content changed → window content rect marked dirty  
3. Only dirty regions are re-rasterized (tile-based, 64×64 tiles)
4. Clean tiles are skipped entirely

### Blur Approximation (CPU-friendly)

Real Gaussian blur is O(n²) per pixel — too expensive for CPU.
NovaOS uses **3-pass box blur** (O(n) per pass) which approximates Gaussian:

```
Pass 1: Horizontal box blur (radius R)
Pass 2: Vertical box blur (radius R)
Pass 3: Horizontal box blur (radius R)
```

For `backdrop-blur`, the compositor:
1. Copies pixels behind the window into a scratch buffer
2. Applies 3-pass box blur
3. Alpha-blends the window surface on top

---

## Event System

```
Hardware Input (mouse/keyboard)
    ↓
Input Driver
    ↓
Display Server (routes to correct window)
    ↓
Hit Test (point-in-rect, z-order aware)
    ↓
Target View
    ↓
Event Bubble (child → parent)
    ↓
Handler Execution
```

### Focus Management
- Click on window → `focusWindow(id)` → z-index promotion
- Tab key → focus ring cycles within active window
- ⌘Tab → app switcher overlay

---

## Module Breakdown

### 1. Display Server
- Owns the screen framebuffer
- Manages window surface buffers
- Tracks damage regions per frame
- Sends completed frames to display controller

### 2. Compositor
- Blends all window surfaces in z-order
- Applies transparency and backdrop effects
- Handles Mission Control zoom transitions
- Renders snap zone preview overlays

### 3. CPU Rasterizer
- Scanline rectangle fills
- Subpixel text rendering (FreeType)
- Gradient interpolation (linear, radial)
- Box blur for glass effects
- Shadow rendering (offset + blur)

### 4. UI Toolkit
Replaces React/DOM with native views:

```rust
struct View {
    bounds: Rect,
    children: Vec<Box<dyn View>>,
    fn layout(&mut self, constraints: Constraints);
    fn draw(&self, canvas: &mut Canvas);
    fn hit_test(&self, point: Point) -> bool;
}
```

### 5. Window Manager
- Drag/move (pointer capture + transform)
- Snap zones (edge detection + tiling)
- Minimize/restore (hide surface, keep state)
- Mission Control (scale all surfaces to thumbnails)

### 6. Layout Engine
Constraint-based layout replacing CSS:
- Flexbox equivalent: `HStack`, `VStack`, `ZStack`
- Grid: `GridLayout(cols, rows, gap)`
- Absolute positioning for windows on desktop

---

## Migration Path

### Phase 1: React Prototype (Current)
- Validate UX, animations, layout
- All rendering via browser DOM + CSS
- Performance target: 60fps with `transform`/`opacity` only

### Phase 2: Native Engine (C++ or Rust)
- Replace React with custom view tree
- Replace CSS with constraint layout engine
- Replace DOM rendering with CPU rasterizer
- Keep same visual output as React prototype

### Phase 3: Framebuffer Output
- Linux: `/dev/fb0` or DRM/KMS
- Bare metal: memory-mapped framebuffer
- Direct scanout, no X11/Wayland dependency

### Phase 4: Optimization
- SIMD (AVX2/NEON) for blur, gradient, fill
- Tile-based rendering (64×64 tiles)
- Glyph cache (pre-rasterized font atlas)
- Dirty rectangle tracking (skip clean regions)
- Double buffering (render to back buffer, swap on vsync)
