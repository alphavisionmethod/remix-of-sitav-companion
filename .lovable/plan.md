

# Plan: Clean Desktop Surface + Shell Cleanup

## Step 1 — Replace DesktopSurface.tsx with Clean macOS Desktop

The current file is 1,109 lines with dashboard widgets, sparklines, drag-drop widget grids, advisor insights, icon grids, widget pickers, and boot ceremonies. Replace it entirely with a minimal ~90-line component that has:

- **ShellAmbientBackground** as the living wallpaper
- **DesktopClock** showing time + date (centered, large, elegant)
- **Blur-fade logic**: desktop elements (clock) fade to `opacity-30` and `blur-sm` when floating windows are open
- **Window compositor layer** rendering `FloatingWindow` for each visible window with cascading spawn offsets
- **Double-click to open command palette** on the background
- No widgets, no sparklines, no drag-drop, no boot ceremony, no toasts, no icon grid, no advisor insight, no widget picker

Key imports kept: `FloatingWindow`, `ShellAmbientBackground`, `useWindowManagerContext`, `framer-motion`, `cn`.

The component signature stays `export function DesktopSurface({ onOpenCommand })` — simplified props (removed `userName`, `trustPosture`, `notifications`, `continuity`, `onLaunchApp`).

## Step 2 — Remove Clutter from ShellLiveLayer

The components the user wants removed live in `ShellLiveLayer.tsx`, not ShellLayout directly. ShellLayout.tsx is already clean. Changes to **ShellLiveLayer.tsx**:

**Remove these rendered components:**
- `AmbientSuggestionsBarLazy` (floating search/suggestions bar)
- `IntentSuggestionsWidgetLazy` (bottom intent suggestions)
- `CommandLayer` (duplicate floating command trigger)
- `ClickRipple` (visual effect clutter)
- `ContextualCursorLazy` (custom cursor overlay)
- `AppRecentsStripLazy` (imported but unused — clean import)

**Keep these (essential shell infrastructure):**
- `DesktopDock` (the dock — user explicitly wants this)
- `UniversalCommandSurface` + `UniversalCommandLazy` (Cmd+K palette)
- `FlowSpaceLazy` (Mission Control / F3)
- `SpatialDesktopLazy` (spatial view)
- `AppLauncherPanelLazy` (launcher from dock + button)
- `BootSplashLazy` (one-time boot)
- `AppSwitcherLazy` (Alt+Tab)
- `ControlCenterLazy` (system control center)
- `NotificationDropdownLazy` (notification dropdown)
- `PictureInPictureLazy` (PiP windows)
- `HoldKeyOverlayLazy` (keyboard shortcuts overlay)
- `LiveActivityBarLazy` (live activity tracking)
- `EdgePanelsLazy` (edge panel triggers)

Also remove from **ShellLayout.tsx**:
- `DemoGovernanceBanner` 
- `DemoStateBanner`
- `NetworkStatusBar`

These add visual clutter banners on the desktop.

## Step 3 — Output Dock & Sidebar Code

No file changes. Include the full current code of both files in the response for the architect:
- `src/components/sita/DesktopDock.tsx` (584 lines) — already read in full
- `src/components/sita/AppSidebar.tsx` (506 lines) — already read in full

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/shell/DesktopSurface.tsx` | Complete rewrite (~90 lines) |
| `src/components/sita/shell/ShellLiveLayer.tsx` | Remove 5 clutter components |
| `src/components/sita/ShellLayout.tsx` | Remove 3 banner components |

## Build Verification
Run `tsc --noEmit` after changes to confirm clean build.

