

# NovaOS Advanced Features — Mission Control, Window Snapping, and OS Architecture Docs

## What We're Building

Three layers of advancement based on the user's roadmap:

1. **Mission Control** — zoomed-out window overview triggered by a gesture/shortcut
2. **Window Snapping Engine** — drag-to-edge snapping (left half, right half, maximize)
3. **OS Architecture Documentation** — formal specs mapping the React prototype to the real CPU rendering pipeline

## Current State

Already built and working:
- SystemMenuBar (top bar with menus, clock, status)
- FloatingWindow (draggable, traffic lights, glass material)
- FinderWindow + SettingsWindow (demo content)
- useWindowManager hook (open/close/focus/z-order)
- CommandPalette (Spotlight-style ⌘K search)
- DesktopDock (magnification, badges, gradients)
- NovaOS design tokens (materials, depth layers, motion)
- ShellAmbientBackground (mood orbs, depth layering)

## Plan

### 1. Mission Control View
**New file**: `src/components/sita/shell/MissionControl.tsx`
- Full-screen overlay (z-index: `DEPTH_LAYERS.overlay`) with dark scrim
- All open FloatingWindows shrink to thumbnail previews in a grid layout
- Click a thumbnail to focus that window and exit Mission Control
- Triggered via a keyboard shortcut (F3 or Ctrl+Up) registered in ShellLayout
- Smooth `framer-motion` layoutId transitions for windows scaling down/up
- Shows "No windows open" empty state

### 2. Window Snapping Engine
**Edit**: `src/components/sita/shell/FloatingWindow.tsx`
- Add snap zone detection during drag: when pointer enters left/right 60px edge or top 40px edge, show a translucent blue preview rectangle
- On drop in a snap zone: animate window to fill left-half, right-half, or full-screen
- Add `isSnapped` state and a "restore" action (double-click title bar or drag away)
- Snap preview overlay rendered as a sibling div with `DEPTH_LAYERS.windows - 1` z-index

**New file**: `src/lib/design-system/snap-zones.ts`
- Constants for snap zone geometry (edge thresholds, preview opacity, animation duration)
- Helper function `detectSnapZone(pointerX, pointerY, viewportW, viewportH)` returning `"left" | "right" | "top" | null`

### 3. Enhanced useWindowManager
**Edit**: `src/hooks/useWindowManager.ts`
- Add `minimizeWindow(id)` — removes from visible list but keeps in state (for Mission Control)
- Add `getMinimized()` — returns minimized windows
- Add `restoreWindow(id)` — un-minimize
- Track window dimensions/position for snap state persistence

### 4. Wire Mission Control into ShellLayout
**Edit**: `src/components/sita/ShellLayout.tsx`
- Add keyboard listener for Mission Control trigger (F3)
- Render `MissionControl` overlay when active
- Pass window manager state through

### 5. OS Architecture Spec Document
**New file**: `infra/docs/NOVA_OS_ARCHITECTURE.md`
- Formal mapping: React component → OS subsystem (Window → compositor surface, CommandPalette → Spotlight daemon, etc.)
- CPU rendering pipeline spec (scanline rasterizer, tile system, damage tracking)
- Event system architecture (hit testing, event bubbling, focus management)
- Module breakdown: Display Server, Compositor, Rasterizer, UI Toolkit, Event System, Window Manager
- Migration path: React prototype → native C++/Rust engine → framebuffer output

## Files
- 2 new files (MissionControl component, snap-zones constants)
- 1 new doc (NOVA_OS_ARCHITECTURE.md)
- 3 edits (FloatingWindow, useWindowManager, ShellLayout)

## Performance Notes
- Mission Control uses CSS `transform: scale()` for thumbnails — no re-rasterization
- Snap zone detection runs only during active drag (pointer move with capture)
- All animations stay under 300ms, transform+opacity only

