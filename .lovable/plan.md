

# NovaOS Visual & Integration Polish — 100% Completion Pass

## Current State Assessment

After reviewing all files, the NovaOS design system is **structurally complete** but has these gaps preventing a "100% visually perfect" experience:

### Issues Found

1. **Two competing menu bars**: `DesktopMenuBar.tsx` (old, used on desktop route) and `SystemMenuBar.tsx` (new NovaOS, with File/Edit/View menus) — the old one is what actually renders on desktop. The new `SystemMenuBar` is never mounted.

2. **Dock not connected to window manager**: `DesktopDock.tsx` navigates via routes only — clicking Finder/Settings in the dock doesn't open FloatingWindows. The `handleLaunchApp` in `DesktopSurface` exists but the dock has no way to call it.

3. **Window manager duplicated**: Both `ShellLayout` and `DesktopSurface` instantiate separate `useWindowManager()` hooks — they're two independent state machines, so Mission Control (in ShellLayout) can't see windows opened from DesktopSurface.

4. **Rendering pipeline manifest not linked**: `generated/rendering-pipeline-manifest.json` exists but isn't referenced anywhere in the architecture docs or design system.

## Plan

### 1. Replace DesktopMenuBar with SystemMenuBar on desktop route
**Edit**: `src/components/sita/ShellLayout.tsx`
- Replace `DesktopMenuBarLazy` import/usage with `SystemMenuBar` on desktop routes
- Pass `onSearchOpen`, `onNotifOpen`, and `activeApp` props

### 2. Unify window manager state
**Edit**: `src/components/sita/ShellLayout.tsx` + `src/components/sita/shell/DesktopSurface.tsx`
- Remove `useWindowManager()` from DesktopSurface
- Pass window manager methods (`openWindow`, `closeWindow`, `focusWindow`, `minimizeWindow`, `visibleWindows`) from ShellLayout down to DesktopSurface as props
- This ensures Mission Control (F3) sees the same windows as the desktop

### 3. Connect Dock to window manager
**Edit**: `src/components/sita/DesktopDock.tsx`
- Accept an optional `onLaunchApp?: (appId: string) => void` prop
- For known OS apps (finder, settings), call `onLaunchApp` instead of navigating
- Other apps continue using route navigation

**Edit**: `src/components/sita/ShellLayout.tsx`
- Pass a `handleLaunchApp` callback to DesktopDock that opens FloatingWindows via the unified window manager

### 4. Add window resize handle to FloatingWindow
**Edit**: `src/components/sita/shell/FloatingWindow.tsx`
- Add a bottom-right corner resize grip (diagonal lines icon)
- Pointer-based resize with min/max constraints
- Consistent with the OS architecture spec

### 5. Polish visual details
**Edit**: `src/components/sita/shell/DesktopSurface.tsx`
- Increase desktop content `pt` to clear menu bar (currently `pt-10`, needs `pt-12` for the 28px bar)
- Add a subtle inner shadow on the vignette for more depth

**Edit**: `src/components/sita/shell/windows/FinderWindow.tsx`
- Add sidebar navigation (Favorites: Desktop, Documents, Downloads) like real Finder
- Add breadcrumb path bar below title

**Edit**: `src/components/sita/shell/windows/SettingsWindow.tsx`
- Add toggle switches, sliders for Display brightness, proper form controls instead of text-only

### 6. Link rendering pipeline manifest to architecture docs
**Edit**: `infra/docs/NOVA_OS_ARCHITECTURE.md`
- Add reference to `generated/rendering-pipeline-manifest.json`
- Include manifest schema explanation in the spec

## Files Changed
- 5 edits (ShellLayout, DesktopSurface, DesktopDock, FloatingWindow, FinderWindow, SettingsWindow)
- 1 edit (NOVA_OS_ARCHITECTURE.md)
- 0 new files

## Technical Notes
- Single window manager instance in ShellLayout guarantees Mission Control, dock, and desktop surface all share state
- SystemMenuBar replaces DesktopMenuBar — no duplicate top bar code
- All visual changes stay within transform/opacity animation budget
- Resize handle uses pointer capture (same pattern as drag)

