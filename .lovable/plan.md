

# Full Desktop Interactivity Audit & Fix Plan

## Issues Found

### Critical: Watchdog Crash Loop Spamming Console
The kernel boot registers "compositor" and "wayland-server" as watchdog components, but their heartbeat interval (`setInterval` every 200ms) is getting cleared or not running. This creates an infinite crash-restart loop flooding the console with error logs every second. This noise makes debugging harder and may degrade performance.

**Fix**: In `src/lib/nova-sdk/kernel/boot.ts`, increase the heartbeat thresholds for these virtual components (they don't correspond to real processes), or simply stop the watchdog from auto-starting for decorative kernel components that have no real restart logic.

### Issue 2: Widget Click Events Swallowed by DraggableWidget Drag
`DraggableWidget` wraps every widget in a `motion.div` with `drag` enabled. When a user clicks a widget card (e.g., Business KPI to launch the Business app), the drag system can intercept the pointer event, especially on touch devices. The `dragListener={false}` setting helps, but the `onContextMenu` on the wrapper also removes widgets on right-click — easy to accidentally trigger.

**Fix**: Add `onPointerDown={(e) => e.stopPropagation()}` to the children wrapper inside `DraggableWidget` so widget internal clicks don't trigger drag. Ensure only the grip handle initiates drag.

### Issue 3: DesktopLeftRail Not Rendered Anywhere
`DesktopLeftRail` has a full app grid (Business, Finance, Concierge, Files, Boardroom, Trust) wired to `onLaunchApp`, but it's never mounted in `DesktopSurface` or `DesktopPage`. This is a wasted clickable surface.

**Fix**: Either render it in `DesktopSurface` as a persistent left sidebar (only on large screens), or remove the dead code. Rendering it adds another always-visible launch point.

### Issue 4: "Trust" App in LeftRail Has No Window Registration
`DesktopLeftRail` includes `{ id: "trust" }` but `APP_REGISTRY` in `ShellWindowLayer` has no entry for "trust". Clicking it would show a placeholder "trust Environment Loading..." window that never loads.

**Fix**: Map "trust" to the existing `SecurityCenterWindow` in the registry.

### Issue 5: Quick Actions Widget Click Propagation
The Quick Actions widget has `onPointerDown={(e) => e.stopPropagation()}` on each button, which is good. But the `DesktopWidgetCard` wrapper itself doesn't have an `onClick`, so the card-level click doesn't compete. This is fine — no fix needed.

### Issue 6: ContinuityCard "Continue" Button Uses `navigate()` Not `onLaunchApp`
The ContinuityCard in `DesktopSurface` navigates via React Router (`navigate("/business")`) instead of opening a windowed app via `onLaunchApp`. On desktop, this navigates away from the desktop OS entirely.

**Fix**: Pass `onLaunchApp` to `ContinuityCard` and use it instead of `navigate`.

---

## Plan

### Step 1: Silence Watchdog Crash Loop
In `src/lib/nova-sdk/kernel/boot.ts`, increase the heartbeat pump interval or make the watchdog `maxRestarts` higher with graceful silence after max. Better: just don't start the watchdog `check()` timer — it serves no functional purpose in this decorative kernel.

### Step 2: Fix Widget Click vs Drag Conflict
In `src/components/sita/shell/desktop/DraggableWidget.tsx`, wrap `{children}` in a `<div onPointerDown={e => e.stopPropagation()}>` so clicks within widgets don't get captured by the drag system.

### Step 3: Render DesktopLeftRail on Desktop
In `src/components/sita/shell/DesktopSurface.tsx`, add `<DesktopLeftRail onLaunchApp={onLaunchApp} />` as a persistent left sidebar on large screens, positioned so it doesn't overlap widgets.

### Step 4: Register "trust" App
In `src/components/sita/shell/ShellWindowLayer.tsx`, add `trust: { name: "Security Center", component: <SecurityCenterWindow />, ... }` to `APP_REGISTRY`.

### Step 5: Fix ContinuityCard to Use onLaunchApp
In `src/components/sita/shell/DesktopSurface.tsx`, pass `onLaunchApp` to `ContinuityCard` and use it for the "Continue" button instead of `navigate()`.

### Files to Modify
- `src/lib/nova-sdk/kernel/boot.ts` — silence watchdog
- `src/components/sita/shell/desktop/DraggableWidget.tsx` — fix click vs drag
- `src/components/sita/shell/DesktopSurface.tsx` — add LeftRail, fix ContinuityCard
- `src/components/sita/shell/ShellWindowLayer.tsx` — add "trust" alias

No database changes. No new dependencies.

