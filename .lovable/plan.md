

# Integrate NovaOS Reference UI into SITA OS Desktop

## What's New

The reference adds three things the current desktop is missing:

1. **Desktop notification toasts** — animated cards sliding in from the top-right of the desktop surface
2. **Demo floating windows** — a Finder-style file manager and a Settings window with sidebar layout, rendered on the desktop to showcase the FloatingWindow component
3. **Window manager state** — ability to open/close windows from the dock, tracking which windows are visible

## Plan

### 1. Add desktop notification toasts to DesktopSurface
**Edit**: `src/components/sita/shell/DesktopSurface.tsx`
- Add a `DesktopToast` component that renders notification cards in the top-right corner
- Use `motion.div` with `initial={{ x: 100, opacity: 0 }}` / `animate={{ x: 0, opacity: 1 }}` slide-in
- Style with NovaOS glass material: `bg-white/60 backdrop-blur-lg rounded-xl shadow`
- Auto-dismiss after 5 seconds with exit animation
- Show recent notifications from the `notifications` prop (approvals, urgent items)

### 2. Add a simple window manager hook
**New file**: `src/hooks/useWindowManager.ts`
- Tracks open windows as `Map<string, { title, component, position, width }>`
- Methods: `openWindow(id, config)`, `closeWindow(id)`, `focusWindow(id)`
- Provides z-order management (focused window gets highest z-index within the windows layer)

### 3. Create demo window content components
**New file**: `src/components/sita/shell/windows/FinderWindow.tsx`
- Grid of folder icons (Docs, Images, Music, Apps, Projects, Notes) using NovaOS `ICON_GRADIENTS`
- Clicking folders is a no-op for now (visual demo)

**New file**: `src/components/sita/shell/windows/SettingsWindow.tsx`
- Left sidebar with General, Display, Sound, Network items
- Right content area showing the selected section
- Uses NovaOS glass materials for sidebar

### 4. Wire windows into DesktopSurface
**Edit**: `src/components/sita/shell/DesktopSurface.tsx`
- Import `useWindowManager` and render open `FloatingWindow` instances on the desktop
- Add a "double-click desktop to open Finder" interaction (or keep it dock-driven)

### 5. Connect dock to window manager
**Edit**: `src/components/sita/DesktopDock.tsx` (minor)
- Pass an `onLaunchApp` callback that can open a FloatingWindow for known apps (Finder, Settings)
- Other apps continue navigating to routes as they do now

## Files
- 1 new hook (`useWindowManager.ts`)
- 2 new window content components (FinderWindow, SettingsWindow)
- 2 edits (DesktopSurface, DesktopDock)

## Technical Notes
- All window animations use `NOVA_MOTION.window.enter/exit` tokens
- Notification toasts use transform-only animations (no layout triggers)
- Window z-ordering stays within `DEPTH_LAYERS.windows` range (20–29)
- Demo windows are visual showcases; they don't replace existing route-based app navigation

