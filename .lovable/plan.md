

# Fix Window Drag, Traffic Lights, and Desktop Widget Wiring

## Problems Identified

1. **Drag not fluid on Business OS window**: The `DomainAppShell` renders its own title bar with traffic lights INSIDE the FloatingWindow. The FloatingWindow already has a draggable title bar with traffic lights. The internal app title bar creates a competing non-draggable surface, making drag feel broken — you grab the app's internal title bar instead of the FloatingWindow's draggable one.

2. **Traffic light buttons broken in app shells**: `DomainAppShell.tsx` (line 45-53) has TrafficLights that:
   - Close button calls `navigate("/")` — navigates away instead of closing the window
   - Minimize button does nothing
   - Maximize button does nothing
   - Same issue in `MoneyAppShell.tsx`, `ConciergeAppShell.tsx`

3. **Desktop widgets**: Already wired correctly via `onLaunchApp` prop chain. But the `DesktopWhatMattersWidget` inner items need `stopPropagation` on `onPointerDown` to prevent widget drag from swallowing clicks.

## Solution

### A. Remove duplicate traffic lights from DomainAppShell

Since apps are rendered INSIDE `FloatingWindow` which already provides:
- Draggable title bar
- Traffic light buttons (close/minimize/maximize)
- Accent strip
- Window chrome

The `DomainAppShell` should NOT render its own competing title bar with traffic lights. Remove the internal traffic lights and title bar drag zone. Keep only the app icon, title label, and mobile nav as a non-draggable info bar.

**Files to modify:**
- `src/components/sita/shell/DomainAppShell.tsx` — Remove `TrafficLights` component. Convert title bar from a drag surface to a simple info strip. Remove the accent strip (FloatingWindow already has one via `appAccent`).

### B. Fix standalone app shells (Money, Concierge)

Same issue in:
- `src/components/money/MoneyAppShell.tsx` — Remove internal TrafficLights
- `src/components/concierge/ConciergeAppShell.tsx` — Remove internal TrafficLights

### C. Improve widget click reliability

- `src/components/sita/shell/desktop/DesktopWhatMattersWidget.tsx` — Add `onPointerDown` stopPropagation on clickable items so they don't get swallowed by the `DraggableWidget` drag handler.
- Apply same fix to any widget with inner interactive items (calendar, CRM pipeline, etc.)

### D. Verify FloatingWindow drag path

The `FloatingWindow` drag already works well with lerp smoothing, inertia, and magnetic snapping. The fix is removing the competing internal title bar, which will let the FloatingWindow's title bar handle all drag interactions cleanly.

## Technical Details

- `DomainAppShell` title bar height (38px) currently sits below FloatingWindow's title bar, creating a double-header. Removing it will give the app ~38px more content space.
- The FloatingWindow already passes `appAccent` to render the correct gradient accent strip per app.
- The `windowId` prop on FloatingWindow is set to the app ID (e.g., "business"), which maps to `APP_ACCENTS[windowId]` for correct branding.

## Scope
- 3-4 files modified
- ~50 lines removed, ~10 lines added
- No new files or dependencies

