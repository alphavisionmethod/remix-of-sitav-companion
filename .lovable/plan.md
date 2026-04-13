

# Architectural Upgrade Phase 7: Functional OS Mechanics & Visual Polish

## Step 1: Remove Legacy Clutter

**ShellAccessoryLayer.tsx** — Remove these components entirely (return null or delete the JSX):
- `<SitaCompanionBar />` (line 89)
- `<CopilotBar />` (line 92)
- `<QuickAddFAB />` (line 82)
- `<DevicePresenceIndicator />` wrapper (lines 98-100)

**ShellLiveLayer.tsx** — Remove:
- `<EdgePanelsLazy />` (lines 94-97)

**DesktopSurface.tsx** — The center is already clean (no "SITA OS" logo/text div exists in the current code). No change needed here for Step 1.

## Step 2: Enhance Glassmorphism

Currently there is no `GlassControlCenter` component in `DesktopSurface.tsx` — the desktop uses the draggable widget system with `DesktopWidgetCard` wrappers. The glassmorphism upgrade will be applied to `DesktopWidgetCard.tsx` (the shared wrapper used by all desktop widgets) to give every widget the premium frosted glass treatment:

- Change background to `bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]`

Also update `ContinuityCard` in `DesktopSurface.tsx` to match.

## Step 3: Make Widgets Freely Draggable

Widgets are **already freely draggable** via the `DraggableWidget` wrapper using framer-motion `drag`. The current implementation uses absolute positioning with no constraints, which means they can already be dragged anywhere.

Enhancement: Add a visible grab handle that appears on hover (the subtle pill at top), and add the `whileDrag` scale effect for polish:

- Update `DraggableWidget.tsx` to include:
  - `whileDrag={{ scale: 1.02, zIndex: 50 }}` 
  - A hover-visible grab handle pill at the top
  - `cursor-grab` / `active:cursor-grabbing` (already present)

- Add `desktopRef` constraints in `DesktopSurface.tsx` and pass to `DraggableWidget` so widgets stay within screen bounds.

## Step 4: Wire App Launchers (Dock & App Grid)

The Dock already receives `onLaunchApp` via `ShellLiveLayer`. The missing piece is passing `doLaunchApp` into `DesktopSurface` so widgets and any embedded app grid can launch apps.

- **ShellLayout.tsx**: Pass `doLaunchApp` as `onLaunchApp` prop to the desktop route's children (DesktopSurface gets it via page props or context)
- **DesktopSurface.tsx**: Add `onLaunchApp` prop, add a core apps grid to the Quick Actions widget or as a standalone launcher widget
- **ShellWindowLayer.tsx**: Add fallback in `doLaunchApp` for unregistered app IDs (business, money, concierge, files, boardroom, settings) that opens a placeholder window with the app name

```text
Files to modify:
├── src/components/sita/shell/ShellAccessoryLayer.tsx  — Remove 4 legacy components
├── src/components/sita/shell/ShellLiveLayer.tsx       — Remove EdgePanels
├── src/components/sita/shell/desktop/DesktopWidgetCard.tsx — Glassmorphism upgrade
├── src/components/sita/shell/desktop/DraggableWidget.tsx   — Grab handle + whileDrag polish + constraints
├── src/components/sita/shell/DesktopSurface.tsx       — Add desktopRef, onLaunchApp prop, ContinuityCard glass
├── src/components/sita/ShellLayout.tsx                — Pass doLaunchApp to desktop children
├── src/components/sita/shell/ShellWindowLayer.tsx     — Fallback for unregistered apps
```

