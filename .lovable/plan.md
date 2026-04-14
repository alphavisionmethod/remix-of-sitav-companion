

# Fix Desktop Widgets: Separate Quick Actions & System, Wire System Toggles

## Problems

1. **Quick Actions (8 app icons) and System Toggles (WiFi, Bluetooth, etc.) appear visually merged** — they're technically two separate `DraggableWidget` instances but positioned adjacent, making them look like one block. Both already support drag and remove via `DraggableWidget`. If users can't drag/close them, it's likely stale localStorage positions overlapping. We'll ensure default positions separate them clearly and verify drag/remove works.

2. **System toggle buttons (WiFi, Bluetooth, Shield, Calm, Battery) only toggle on/off** — clicking them does nothing beyond a visual state change. They need to open relevant OS windows or surfaces:
   - **WiFi** → Open a WiFi settings panel (network list)
   - **Bluetooth** → Open Bluetooth device pairing panel
   - **Shield** → Open the existing `SecurityCenterWindow` (personal VPN/antivirus)
   - **Calm** → Toggle Do Not Disturb / Focus mode
   - **Battery** → Open battery/power status panel

3. **Shield needs enhancement** — The existing `SecurityCenterWindow` has 4 tabs (Sandbox, Code Signing, Permissions, FS) but no "personal VPN" or "antivirus" feel. We'll add two new tabs: **Threat Protection** (antivirus-style scan with real-time status) and **VPN** (secure connection toggle with server selection).

## Solution

### A. Upgrade `DesktopSystemWidget.tsx` — Add click-to-open behavior

Each toggle gets two interactions:
- **Click** = toggle on/off (existing)
- **Long-press or icon tap when ON** = open the relevant panel/window

Wire each toggle to launch the appropriate OS window:
- `wifi` → opens a **WiFi Networks** floating panel (new small component showing available networks)
- `bluetooth` → opens a **Bluetooth Devices** floating panel (device list with pair/unpair)
- `shield` → calls `onLaunchApp("security-center")` to open the SecurityCenterWindow
- `calm` → toggles Focus/DND mode (persisted via `useSettingsValue`) + shows toast confirmation
- `battery` → opens a **Battery Status** floating panel (charge level, power mode, screen time)

The widget needs to accept `onLaunchApp` prop (currently it doesn't).

### B. Create 3 small popup panels (inline to the system widget)

Instead of full windows, WiFi/Bluetooth/Battery open as small glassmorphic dropdown panels anchored to the system widget — similar to macOS Control Center sub-panels:

1. **`SystemWifiPanel.tsx`** — List of mock networks, connected indicator, toggle
2. **`SystemBluetoothPanel.tsx`** — Paired devices list, scanning indicator, connect/disconnect
3. **`SystemBatteryPanel.tsx`** — Battery percentage ring, power mode selector, estimated time, screen-on time

Each panel is a small overlay (~280px wide) that appears above the toggle icon with a spring animation.

### C. Enhance `SecurityCenterWindow.tsx` — Add Shield/VPN tabs

Add two new tabs to the existing 4-tab security center:

5. **Threat Protection tab** — Real-time protection toggle, last scan timestamp, threat count (0), scan progress bar, quarantined items list, "Run Full Scan" button with animated progress
6. **VPN tab** — Connection status (Connected/Disconnected), server location selector (6 cities), IP masking indicator, encryption badge, connect/disconnect button with animation, data transferred stats

### D. Fix widget separation defaults

Update `useDesktopWidgets.ts` default positions to ensure Quick Actions and System Toggles have clear vertical gap. Reset localStorage so users see the separated layout.

### E. Pass `onLaunchApp` through widget render chain

Update `DesktopSurface.tsx` → `renderWidget("system", ...)` to pass `onLaunchApp` to `DesktopSystemWidget`.

## Files to modify
- `src/components/sita/shell/desktop/DesktopSystemWidget.tsx` — Full rewrite with sub-panels and `onLaunchApp` prop
- `src/components/sita/shell/windows/SecurityCenterWindow.tsx` — Add Threat Protection and VPN tabs
- `src/components/sita/shell/DesktopSurface.tsx` — Pass `onLaunchApp` to system widget render
- `src/hooks/useDesktopWidgets.ts` — Adjust default positions for clear separation

## New files
- `src/components/sita/shell/desktop/SystemWifiPanel.tsx`
- `src/components/sita/shell/desktop/SystemBluetoothPanel.tsx`
- `src/components/sita/shell/desktop/SystemBatteryPanel.tsx`

## Scope
- 4 files modified, 3 new files
- ~400 lines new code
- 0 new dependencies

