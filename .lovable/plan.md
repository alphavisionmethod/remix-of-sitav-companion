

# NovaOS Premium Desktop — Production Implementation

## Gap Analysis

Comparing the 14-section spec against current code:

| Feature | Status | Action |
|---------|--------|--------|
| Boot ceremony (staggered entrance) | Missing | Build sequenced fade-in |
| Desktop icon grid | Missing | New component |
| Desktop context menu | Missing | New component |
| Soft Focus Mode (dim bg on window focus) | Missing | Edit DesktopSurface |
| Window focus differentiation | Missing | Edit FloatingWindow |
| Adaptive dock tint | Missing | Edit DesktopDock |
| Zero-clutter auto-hide icons | Missing | Part of icon grid |
| Calm notifications (fade vs slide) | Partial — toasts slide from right | Soften to fade |

Everything else (wallpaper gradients, vignette, menu bar, dock magnification, window drag/snap/resize, search, motion tokens) is already implemented.

## Plan (6 deliverables)

### 1. Desktop Boot Ceremony
**Edit**: `DesktopSurface.tsx`

Add a `bootPhase` state (0-4) that increments via `setTimeout` chain on mount:
- Phase 0 (0ms): everything hidden, black overlay at opacity 1
- Phase 1 (300ms): wallpaper fades in (overlay opacity 0)
- Phase 2 (600ms): clock + widgets fade in
- Phase 3 (900ms): desktop icons appear (see step 2)
- Phase 4 (1200ms): fully settled

Each element reads `bootPhase` and applies conditional opacity/transform classes. All CSS transitions, no JS animation loops.

### 2. Desktop Icon Grid
**New file**: `src/components/sita/shell/DesktopIconGrid.tsx`

Right-aligned column of desktop icons (Documents, Downloads, Projects, Notes, Trash):
- 48px icons with 12px radius, gradient backgrounds from `ICON_GRADIENTS`
- 80px cell spacing, CSS Grid with `grid-auto-flow: column`
- Single click = select (blue glow ring), double click = open Finder via window manager
- 11px labels, truncated with ellipsis
- Staggered fade-in tied to boot phase
- **Zero-clutter**: after 8s of no mouse movement, icons fade to `opacity: 0`. Mouse movement restores them.

### 3. Desktop Context Menu
**New file**: `src/components/sita/shell/DesktopContextMenu.tsx`

Right-click on empty desktop opens a glassmorphic menu:
- Items: New Folder, Sort By, Change Wallpaper, Show Desktop, Mission Control
- Glass material (`bg-white/60 dark:bg-black/60 backdrop-blur-2xl`), rounded-xl, soft shadow
- Scale 0.95 -> 1.0 + opacity entrance, 150ms ease-out
- Wired into DesktopSurface via `onContextMenu` on the root div

### 4. Soft Focus Mode
**Edit**: `DesktopSurface.tsx`

When any FloatingWindow is visible (from window manager context):
- Desktop content (clock, widgets, icon grid) dims to `opacity: 0.4` via CSS transition (300ms)
- Only the active window stays at full brightness
- When all windows close, content returns to full opacity

### 5. Window Focus Differentiation
**Edit**: `FloatingWindow.tsx`

Accept an `isFocused` prop (derived from comparing window zIndex to max zIndex in parent):
- Focused: full opacity, `shadow-2xl`, brighter border `border-white/35`
- Unfocused: `opacity-[0.85]`, `shadow-lg`, dimmer border `border-white/15`

### 6. Adaptive Dock Tint + Calm Notifications
**Edit**: `DesktopDock.tsx`
- Accept optional `mood` prop from DesktopSurface
- Shift dock glass background hue: warm = amber tint, night = indigo tint, serene = neutral

**Edit**: `DesktopSurface.tsx` (DesktopToasts)
- Change notification entrance from `x: 100 -> 0` slide to `opacity: 0 -> 1, scale: 0.96 -> 1` fade — calmer

## Files
- 2 new: `DesktopIconGrid.tsx`, `DesktopContextMenu.tsx`
- 3 edits: `DesktopSurface.tsx`, `FloatingWindow.tsx`, `DesktopDock.tsx`

## Technical Notes
- Boot ceremony uses `setTimeout` chain + CSS `transition` classes — no RAF needed
- Zero-clutter idle timer: single `mousemove` listener with 8s debounce
- All animations stay within 150-300ms, transform+opacity only
- No new dependencies

