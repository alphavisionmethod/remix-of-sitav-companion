

# Audit & Fix: Business, Finance, Concierge as True OS Apps

## Issues Found

1. **Maximize button broken**: The green traffic-light button in `FloatingWindow` calls `onMaximize` prop, but `DesktopSurface.tsx` never passes it. The window has internal double-click-to-maximize (snap to full screen), but the button does nothing.

2. **No `maximizeWindow` in `useWindowManager`**: The hook only has `minimizeWindow` and `restoreWindow`. There's no maximize state tracked, so even if we wire the button, there's no state to toggle.

3. **Minimize works but restore is indirect**: Minimized windows disappear, and the dock shows a running indicator, but clicking the dock icon calls `launchApp` which re-focuses (correct). This works.

4. **Close works**: `closeWindow` removes the window from state. Confirmed working.

5. **App shells have internal sidebars**: The 3 app shells (Business, Finance, Concierge) each have their own internal sidebar for module navigation — this is correct per the user's request ("no side menu" from the OS, only the app's own sidebar).

6. **Height not stored**: `WindowConfig` has no explicit `height` — windows auto-size. When maximized, we need explicit full-viewport dimensions.

## Plan

### Step 1: Add maximize state to `useWindowManager.ts`

- Add `maximized: boolean` to `WindowState`
- Add `maximizeWindow(id)` function that toggles `maximized`
- Track pre-maximize position/size for restore
- Export `maximizeWindow` from the hook

### Step 2: Wire maximize in `FloatingWindow.tsx`

- Add `isMaximized` and `onMaximize` props handling
- When `isMaximized` is true: position at `(0, 0)`, full viewport width/height, disable drag, hide snap zones
- The green button toggles maximize on/off
- Merge the existing double-click maximize logic with the prop-driven maximize

### Step 3: Wire maximize in `DesktopSurface.tsx`

- Pass `onMaximize={() => windowManager?.maximizeWindow(w.id)}` and `isMaximized={w.maximized}` to each `FloatingWindow`

### Step 4: Dock restore behavior

- When clicking a dock icon for a maximized app, it should focus it (already works)
- When clicking for a minimized app, it restores (already works via `openWindow` re-focus path)

### Step 5: Verify all 3 app shells render correctly

- Confirm `FinanceAppShell`, `BusinessAppShell`, `ConciergeAppShell` are registered in `APP_REGISTRY` with correct IDs (already confirmed — `finance`, `money`, `business`, `concierge`)
- Confirm dock `OS_WINDOW_APPS` set includes all IDs (already confirmed)

## Files

| File | Change |
|------|--------|
| `src/hooks/useWindowManager.ts` | Add `maximized` state, `maximizeWindow` function, pre-maximize memory |
| `src/components/sita/shell/FloatingWindow.tsx` | Handle `isMaximized` prop — full-screen positioning, disable drag, toggle via green button |
| `src/components/sita/shell/DesktopSurface.tsx` | Pass `onMaximize` and `isMaximized` to FloatingWindow |

