

# Plan: 5 "Wow" Features That Leverage Your Full Stack

## What We'll Build

### 1. Notification Center as a Slide-Down Panel (macOS-grade)
Replace the current notification center with a translucent slide-down panel from the menu bar — grouped by app, with inline actions (approve/dismiss/snooze), rich previews, and a "Clear All" with satisfying cascade animation. Wired to the NotificationService so notifications flow from the real service layer.

### 2. Spotlight-Grade App Switcher (Alt+Tab)
A floating horizontal strip with live window thumbnails, glass blur background, keyboard navigation (arrow keys + Enter), and the window title/icon below each preview. Pressing Alt+Tab cycles through open windows ordered by recency. Releases on key-up to switch.

### 3. Picture-in-Picture Mini Player
Any window can be collapsed into a small always-on-top floating mini-view (like macOS PiP). Starts with the Music Player — shows album art, track name, play/pause. Draggable to any corner, snaps to edges. Other apps (Maps, Weather) can also PiP. Wired through the WindowServer service.

### 4. Boot Splash with Kernel Log Waterfall
A cinematic boot sequence: SITA logo fades in, then a translucent terminal waterfall scrolls real boot log entries from `ServiceManager.getBootLog()` — each service lighting up green as it comes online. Progress bar fills as services complete. Ends with a desktop fade-in. Plays once per session.

### 5. Control Center Pull-Down (macOS/iOS style)
Click the toggles icon in the menu bar → a rounded glass panel drops with quick-access tiles: Wi-Fi, Bluetooth, Dark Mode, Do Not Disturb, Volume slider, Brightness slider, AirDrop, Screen Mirroring, Focus Mode. Each tile is a toggle with an icon and label. Volume and Brightness are inline sliders. All wired to SettingsService for persistence.

## Files

| Action | File |
|--------|------|
| Create | `src/components/sita/shell/NotificationDropdown.tsx` |
| Create | `src/components/sita/shell/AppSwitcher.tsx` |
| Create | `src/components/sita/shell/PictureInPicture.tsx` |
| Create | `src/components/sita/shell/BootSplash.tsx` |
| Create | `src/components/sita/shell/ControlCenter.tsx` |
| Modify | `src/components/sita/ShellLayout.tsx` — mount all 5 new components, add keyboard listeners for Alt+Tab |
| Modify | `src/components/sita/shell/SystemMenuBar.tsx` — add Control Center + Notification dropdown triggers |
| Modify | `src/components/sita/shell/FloatingWindow.tsx` — add PiP minimize button in title bar |
| Modify | `src/components/sita/shell/index.ts` — barrel exports |

## Technical Details
- NotificationDropdown subscribes to `NotificationService` events via NovaEvents for live updates
- AppSwitcher uses `useWindowManagerContext()` to get open windows and their thumbnails (compositor surfaces)
- BootSplash reads `ServiceManager.getBootLog()` and animates entries with staggered `framer-motion` transitions
- ControlCenter uses `useSettingsValue` hook for all toggles (dark mode, DND, volume, brightness)
- PiP windows render as a portal with `position: fixed`, `z-index` above all other windows, drag via pointer events
- All animations use `framer-motion` with spring physics matching existing OS feel
- Keyboard listener for Alt+Tab uses `keydown`/`keyup` on `window` with `event.altKey` detection
- Estimated ~1800 lines across 5 new files + ~150 lines of modifications

