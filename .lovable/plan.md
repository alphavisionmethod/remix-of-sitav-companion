

# Fix Desktop Widget Interactions & System Toggle Panels

## What's Already Built (no need to recreate)
- `DesktopSystemWidget.tsx` with WiFi/Bluetooth/Battery/Shield/Calm toggles
- `SystemWifiPanel.tsx`, `SystemBluetoothPanel.tsx`, `SystemBatteryPanel.tsx` popup panels
- `SecurityCenterWindow.tsx` with 6 tabs (Threats, VPN, Sandbox, Signing, Perms, FS)
- `DraggableWidget.tsx` with drag handle and close button

## Bugs Found

1. **Click handler conflates toggle and panel open**: `handleClick` toggles the button OFF first, then opens the panel. Clicking WiFi when ON turns it OFF and opens a WiFi panel — contradictory. Fix: separate toggle (left-click) from panel open (click when already ON, or dedicated expand gesture).

2. **Stale localStorage positions**: Users who had widgets before the position update still see old overlapping positions. Need a migration version bump to force re-layout.

3. **DraggableWidget drag handle visibility**: The handle is `opacity-40` by default and only shows fully on hover, plus it's positioned at `-top-3.5` which may be clipped by parent overflow. Close button also only shows on hover — users don't know it's there.

4. **Panel positioning**: Panels use `absolute bottom-full` which can go off-screen if the widget is near the top of the viewport.

## Plan — 2 Batches

### Batch 1: Fix Widget Drag/Close & Separation
**Files**: `DraggableWidget.tsx`, `useDesktopWidgets.ts`

- Add a **version key** to localStorage (`sita-desktop-widgets-v2`) so old positions are discarded and defaults apply
- Increase vertical gap between quick-actions (y:40) and system (y:320) defaults
- Make drag handle always visible (opacity-60 → opacity-100 on hover) with a clearer visual
- Make close button always visible (small, subtle) instead of hover-only
- Ensure no parent `overflow-hidden` clips the handle/close

### Batch 2: Fix System Toggle Click Logic & Panel Wiring
**Files**: `DesktopSystemWidget.tsx`, `SystemWifiPanel.tsx`, `SystemBluetoothPanel.tsx`, `SystemBatteryPanel.tsx`

- **Separate toggle from panel**: Single click toggles on/off. When toggle is ON, a second click opens the panel. When OFF, click turns ON only.
- **Shield**: Click when ON launches Security Center window (already wired via `onLaunchApp("security-center")`)
- **Calm**: Click toggles Focus Mode with toast (already works)
- **WiFi/Bluetooth/Battery panels**: Add a small chevron indicator when panel is expandable, improve panel positioning to avoid viewport overflow
- Ensure all panels have `onPointerDown={stopPropagation}` so they don't trigger widget drag

## Technical Details
- ~80 lines changed across 4 files
- 0 new files or dependencies
- localStorage version bump forces fresh layout for all users

