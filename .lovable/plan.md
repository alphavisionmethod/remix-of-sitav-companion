

## Plan: Native-style right-click context menus per surface

### Problem
`DesktopSurface.tsx` line 228 — `handleContextMenu` calls `setPickerOpen(true)` and is bound on the root `<div className="fixed inset-0">`. Because right-clicks bubble up from everywhere (app windows, widgets, dock), **every right-click anywhere opens the Widget Gallery**. There are no app-window or widget context menus at all.

### Solution: surface-aware context menus
Build a small dispatcher that picks the right menu based on what was right-clicked. Three menus initially (mirrors the user's reference images):

**1. Desktop menu** (right-click empty desktop — Mac/Windows reference image #2, #3)
- View ▸ Icon size (S/M/L), Show widget grid
- Sort by ▸ Name, Type, Recently added
- Refresh desktop
- ─
- New Folder
- New File ▸ Document, Spreadsheet, Note
- ─
- Add Widget… (opens WidgetPicker — replaces current behavior)
- Change Wallpaper…
- ─
- Open in Terminal
- Common Apps ▸ (dynamic submenu from installed apps — Calculator, Notes, Files, Mail, Browser, etc., per image #1)
- ─
- Display Settings
- Personalize

**2. App Window menu** (right-click on a window's titlebar or chrome — Windows reference image #1 spirit)
- Restore  *(disabled if not maximized)*
- Move  *(enters keyboard-move mode)*
- Size  *(enters keyboard-resize mode)*
- Minimize  ⌘M
- Maximize / Zoom  *(toggles)*
- ─
- Always on Top  ☑ *(checkbox)*
- Snap ▸ Left half, Right half, Top half, Bottom half, Center, Full
- ─
- Reload App
- App Info…
- ─
- Close  ⌘W

**3. Widget menu** (right-click a desktop widget — already partially exists via the X button, formalize it)
- Refresh
- Resize ▸ S / M / L
- Pin to position  ☑
- ─
- Widget Settings…
- Remove Widget

### Architecture
```
src/lib/context-menu/
  menu-registry.ts        — surface → menu spec map
  desktop-menu.tsx        — Desktop menu spec
  app-window-menu.tsx     — App window menu spec
  widget-menu.tsx         — Widget menu spec
  common-apps-submenu.tsx — Dynamic installed-apps submenu
src/components/sita/shell/SurfaceContextMenu.tsx
  — Wraps Radix `<ContextMenu>` (already in repo at src/components/ui/context-menu.tsx)
  — Renders the spec; consumers pass surface="desktop"|"app-window"|"widget" + context data
```

### Wiring changes
1. **`DesktopSurface.tsx`** — replace the bare `onContextMenu={() => setPickerOpen(true)}` with `<SurfaceContextMenu surface="desktop">…</SurfaceContextMenu>` wrapping the desktop layer **only** (not app windows). Right-click on empty desktop → Desktop menu. "Add Widget…" item still opens the picker.
2. **`AppWindow.tsx`** — wrap the titlebar + chrome border with `<SurfaceContextMenu surface="app-window" window={win}>` so right-click on the title bar shows the window menu. Body content stops propagation so apps can have their own (e.g., Files explorer) menus inside.
3. **`DraggableWidget.tsx`** — wrap children with `<SurfaceContextMenu surface="widget" widgetId={id}>`; right-click a widget shows the Widget menu.
4. **Stop bubbling** — every menu calls `e.stopPropagation()` so a right-click on a window doesn't also fire the desktop menu.

### Behavior notes
- All three menus use the same Radix `ContextMenu` primitive → consistent glassmorphic styling (already themed in `context-menu.tsx`).
- Snap submenu uses existing `useOSWindowContext()` actions (`maximizeWindow` exists; we'll add lightweight `snapWindow(id, "left"|"right"|...)` to `WindowContext.tsx`).
- "Common Apps" submenu queries `useInstalledApps()` and dispatches `sita-open-app` with the app id.
- "Always on Top" stored on the OSWindow as `isPinned: boolean`; if true, gets a fixed high z-index.
- Disabled states are real (e.g., Restore is disabled unless `isMaximized`).

### Files

**New (5)**
- `src/lib/context-menu/desktop-menu.tsx`
- `src/lib/context-menu/app-window-menu.tsx`
- `src/lib/context-menu/widget-menu.tsx`
- `src/lib/context-menu/common-apps-submenu.tsx`
- `src/components/sita/shell/SurfaceContextMenu.tsx`

**Edited (4)**
- `src/components/sita/shell/DesktopSurface.tsx` — swap raw handler for `SurfaceContextMenu`
- `src/components/sita/os/AppWindow.tsx` — wrap titlebar in window menu, stop ctx propagation on body
- `src/components/sita/shell/desktop/DraggableWidget.tsx` — wrap with widget menu, stop propagation
- `src/components/sita/os/WindowContext.tsx` — add `snapWindow()` + `isPinned` (Always on Top)

### Acceptance
- Right-click on empty desktop → Desktop menu (with Add Widget, wallpaper, Common Apps, etc.)
- Right-click on an app window's titlebar → App-window menu (Min/Max/Close/Snap/Always-on-top all functional)
- Right-click on a desktop widget → Widget menu (Resize/Remove/Settings)
- Right-click inside an app's body → does **not** open desktop or window menu (apps free to add their own)
- Snap-Left / Snap-Right resize to half-screen instantly
- "Always on Top" keeps that window above siblings even when others are focused
- 0 TS errors

