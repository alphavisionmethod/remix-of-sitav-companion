

# NovaOS Design System Integration into SITA OS

## What We're Building

Upgrade SITA OS's desktop shell to adopt the NovaOS macOS-inspired design language: glassmorphism materials, a proper system menu bar, floating composited windows, dock magnification polish, depth layering, and gradient-rich iconography — all CPU-rendering friendly.

## Current State

SITA OS already has many of these pieces partially built:
- **DesktopSurface**: Clock, glass widgets, ambient background — but no top menu bar, no floating windows
- **DesktopDock**: Magnification + badges — already macOS-like, needs material polish
- **ShellAmbientBackground**: Mood-based orbs — good foundation for depth layers
- **Design tokens**: Exist but don't encode the NovaOS material/depth system

## Plan

### 1. Create NovaOS Design System tokens file
**New file**: `src/lib/design-system/nova-os.ts`
- Material definitions: `glass`, `frostedGlass`, `solidSurface` with opacity/blur/border values
- Depth layer enum: Desktop (0), Windows (1), Floating UI (2), Dock + MenuBar (3)
- Gradient palette: icon gradients (blue→indigo, purple→pink, etc.), surface gradients
- Shape constants: window radius (`rounded-2xl`), icon radius (`rounded-xl`), pill radius (`rounded-full`)
- Motion philosophy constants: duration caps (150–300ms), transform-only preference

### 2. Add System Menu Bar (Top Bar)
**New file**: `src/components/sita/shell/SystemMenuBar.tsx`
- Fixed top bar with `backdrop-blur-md bg-white/40` (light) / `bg-black/40` (dark)
- Left: "SITA" brand + menu items (File, Edit, View — contextual per active app)
- Right: status indicators (WiFi/connectivity, trust posture, battery/time)
- Integrates existing `ShellStatusBar` indicators into the macOS-style layout
- Height: 40px, z-index above windows but below overlays

### 3. Floating Window Component
**New file**: `src/components/sita/shell/FloatingWindow.tsx`
- Reusable composited window surface with traffic-light controls (red/yellow/green dots)
- Glass material: `bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl`
- Draggable via pointer events (no heavy library needed)
- Props: `title`, `children`, `initialPosition`, `onClose`, `onMinimize`, `onMaximize`
- Dark mode variant: `bg-black/60 border-white/10`

### 4. Polish DesktopDock with NovaOS materials
**Edit**: `src/components/sita/DesktopDock.tsx`
- Update dock container material to match NovaOS: `bg-white/40 backdrop-blur-xl border-white/30 rounded-2xl shadow-lg`
- Replace flat icon backgrounds with gradient icons: `bg-gradient-to-br from-purple-400 to-pink-500`
- Add subtle dock reflection/glow effect beneath

### 5. Update DesktopSurface to compose new pieces
**Edit**: `src/components/sita/shell/DesktopSurface.tsx`
- Remove the `fixed inset-0` layout — delegate to `ShellLayout`
- Add `SystemMenuBar` at top
- Update `GlassWidget` material to use NovaOS glass tokens
- Adjust depth layering: background (z-0), orbs (z-1), content (z-10), menu bar (z-30)

### 6. Update design tokens index
**Edit**: `src/packages/design-tokens/index.ts`
- Add `MATERIALS`, `DEPTH_LAYERS`, `ICON_GRADIENTS` exports that reference the nova-os tokens

## Files Changed
- 3 new files (nova-os tokens, SystemMenuBar, FloatingWindow)
- 3 edited files (DesktopDock, DesktopSurface, design-tokens index)

## Performance Note
All effects use CSS `backdrop-filter` and `box-shadow` only — no canvas re-rasterization. Animations are transform/opacity only, staying within the 16ms frame budget. The floating window uses pointer-event drag (translate transform) with no layout recalculation.

