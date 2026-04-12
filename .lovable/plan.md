

# Spec Compliance Audit — What's Done, What's Missing, What Would Add "Wow"

## FULLY IMPLEMENTED (21/27 items)

| # | Requirement | Status | Where |
|---|-------------|--------|-------|
| 1.1 | App layout: Title Bar + Sidebar + Content | Done | FloatingWindow.tsx, FinderWindow, SettingsWindow |
| 2.1 | Background: translucent material ~0.72 | Done | FloatingWindow line ~240: `hsl(0_0%_100%/0.72)` |
| 2.2 | Borders: white 0.35 | Done | FloatingWindow: `hsl(0_0%_100%/0.35)` |
| 2.3 | Corners: 16px | Done | `APP_CHROME.cornerRadius = 16` |
| 3.1 | Dual shadows | Done | `APP_SHADOWS.focused` = 2px/6px + 20px/40px |
| 3.2 | Layer opacity system | Done | `useLayerOpacity.ts` + CalmEngine |
| 4.1 | Strict spacing scale 4/8/16/24/32 | Done | `SPACE` in `app-window-system.ts` |
| 5.1 | Typography: 11/13/16/18 | Done | `APP_TYPE` in `app-window-system.ts` |
| 6.1 | Shared Button/Input/List/Card components | Done | `APP_COMPONENTS` with base/primary/secondary/ghost |
| 6.2 | Active scale(0.98) | Done | `active:scale-[0.98]` in button.base |
| 7.1 | Opening animation scale+opacity | Done | FloatingWindow morph with spring physics |
| 7.2 | Progressive content loading | Done | FloatingWindow shows Skeleton for 150ms then fades in |
| 8.1 | App states: empty/loading/error | Done | `AppStateWrapper.tsx` with ShimmerSkeleton, EmptyState, ErrorState |
| 9.1 | App accent colors + icons | Done | `APP_ACCENTS`, `appIcon` prop on FloatingWindow |
| 10.1 | Permission model with declarations | Done | `AppPermission` type in app-platform/types |
| 10.2 | Permission gate UI (Allow/Deny modal) | Done | `AppPermissionGate.tsx` — glassmorphic, centered, risk-colored |
| 10.3 | Trust levels | Done | AppDefinition has `trustLevel: trusted/limited/blocked` |
| 10.4 | App Store / Library | Done | Full pages: AppStorePage, AppLibraryPage, AppManagePage, AppComparePage |
| 11.1 | Desktop: System Bar + Desktop + Dock | Done | SystemMenuBar + DesktopSurface + DesktopDock |
| 11.2 | Dock: centered, floating, translucent, hover=scale, click=bounce, running=indicator | Done | DesktopDock with magnification, bounce animation, glowing bar |
| 11.3 | Focus system: active brightens, others dim | Done | `useWindowAttention.ts` + FloatingWindow opacity/saturation |
| 11.4 | FlowSpace (app switching) | Done | FlowSpace.tsx with physics grid + keyboard trigger |
| 11.5 | Context menu with keyboard shortcuts | Done | DesktopContextMenu with right-aligned shortcut hints |

## NOT YET WIRED (6 gaps)

| # | Gap | Detail |
|---|-----|--------|
| G1 | **Permission gate not wired into launch flow** | `AppPermissionGate` exists but is never rendered. No component calls `isPermissionGranted()` before launching an app. The gate is dead code. |
| G2 | **Origin morph not wired (icon-to-window)** | FloatingWindow accepts `originRect` but the dock never passes icon bounding rects. Windows appear with generic scale, not from the dock icon position. |
| G3 | **File-to-app drag/drop** | Spec says "drag file → app = open." No drag-to-dock or drag-to-window-to-open behavior exists. |
| G4 | **Dock auto-hide** | Plan mentioned dock auto-hide when windows are maximized. Not implemented. |
| G5 | **Notification toasts missing app icon + accent edge** | Toasts render but lack per-app icon or colored left edge. |
| G6 | **Widget inner glow pulse on hover** | Widgets have `hover:scale-[1.02]` but no inner glow pulse animation. |

## PLAN: Wire the 6 gaps + 5 "wow" additions

### Fix G1: Wire permission gate into app launch
- In `DesktopSurface.tsx` (or the window-opening logic in `useWindowManager`), before opening a window, check `isPermissionGranted(appId)`. If not granted, render `<AppPermissionGate>` with the app's permissions. On Allow → open window. On Deny → cancel.

### Fix G2: Pass originRect from dock to window
- In `DesktopDock.tsx`, the `iconRefs` map already exists. On launch, read `iconRefs.current.get(appId)?.getBoundingClientRect()` and pass it through `onLaunchApp` callback. Update `useWindowManager` to store `originRect` on the window object. FloatingWindow already handles the rest.

### Fix G3: File-to-app drag support on dock
- Add `onDragOver`/`onDrop` to dock icon buttons. When a file is dragged over a dock icon, show a highlight ring. On drop, trigger the app launch with a file reference payload.

### Fix G4: Dock auto-hide
- In `DesktopDock`, accept a `hasMaximizedWindow` prop. When true, dock slides down off-screen and only reappears on mouse hover near the bottom edge.

### Fix G5: Toast app icon + accent edge
- Update `DesktopToasts` to accept app metadata and render a 2px left accent bar + mini icon.

### Fix G6: Widget inner glow pulse
- Add a CSS keyframe `glow-pulse` (inner box-shadow oscillation) and apply on widget hover.

### WOW additions (5 enhancements)

**W1: Live window previews in dock** — When hovering a running app's dock icon for 400ms, show a miniature live preview tooltip of the window content (CSS `transform: scale(0.2)` snapshot).

**W2: Spatial sound feedback** — Add subtle Web Audio API click/hover tones (40ms sine wave pops) for dock interactions and window snap. Muted by default, togglable in Settings.

**W3: Desktop widget clock second-hand sweep** — The clock widget gets a smooth CSS-animated second hand with a subtle glow trail.

**W4: Window minimize genie effect** — When minimizing, window scales down and curves toward the dock icon position (CSS perspective transform), like the macOS genie effect.

**W5: Ambient wallpaper parallax on mouse** — Desktop wallpaper shifts 2-3px based on mouse position, creating subtle depth perception without GPU cost.

### Files to modify
1. `DesktopSurface.tsx` — wire permission gate, toast accents
2. `DesktopDock.tsx` — pass originRect, file drag/drop, auto-hide, live preview tooltip
3. `useWindowManager.ts` — store originRect on window objects
4. `FloatingWindow.tsx` — genie minimize animation
5. `index.css` — glow-pulse keyframe, parallax helpers

### Files to create
1. `src/hooks/useSpatialAudio.ts` — optional audio feedback hook
2. `src/components/sita/shell/DockWindowPreview.tsx` — live miniature preview

### Implementation order
1. Wire permission gate (G1)
2. Wire originRect morph (G2)
3. Dock auto-hide (G4)
4. Toast + widget polish (G5, G6)
5. File drag/drop (G3)
6. Wow additions (W1-W5)

