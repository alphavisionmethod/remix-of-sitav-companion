

# SITA OS — macOS-Grade Experience Upgrade

## Current Problems

1. **Sidebar has 60+ nav items** across 7 collapsible groups (Primary, Intelligence, Workspace, System, Control, Apps, AI Engineering). This is the opposite of intuitive — it's a wall of links that overwhelms newcomers.
2. **No persistent menu bar on desktop** — when on the home/desktop route, the top bar disappears entirely. macOS always has its menu bar visible with status icons, clock, and system controls.
3. **Spotlight/Command Palette exists but is hidden** — users need to know Cmd+K. No visual prompt or search icon on the desktop.
4. **Notification Center exists but isn't discoverable** — no bell icon or gesture on the desktop surface.
5. **No app-open animation** — clicking a dock icon or widget just navigates. No zoom/scale transition that feels like "opening an app."
6. **Widgets are static** — they show hardcoded data and aren't rearrangeable or customizable.

## What Changes

### 1. Desktop Menu Bar (always visible, even on desktop route)
A thin, translucent menu bar at the top of the desktop with:
- **Left**: SITA logo/icon, current app name (or "Desktop"), search icon (opens Spotlight)
- **Right**: Trust posture chip, notification bell with unread count, clock, user avatar
- Glass-morphism style matching the desktop aesthetic
- Clicking the bell slides open the Notification Center from the right
- Clicking search or pressing Cmd+K opens Spotlight

This replaces the current behavior of hiding the top bar entirely on desktop routes.

### 2. Radically Simplified Sidebar (when inside apps)
Reduce from 60+ items to a clean, scannable structure:
- **Primary** (6 items max): Desktop, Daily Pulse, Business, Money, Concierge, Files
- **Favorites** (user-pinnable, starts with 3-4): Revenue Office, Boardroom, Calendar, Tasks
- **Everything Else**: accessed via Spotlight search or "All Apps" link at bottom
- Remove Intelligence, Workspace, System, Control, Apps, AI Engineering groups from default view
- Add a single "More" or "All Apps" item that opens the full app grid

### 3. Enhanced Spotlight Search
Upgrade CommandPalette to be the primary navigation mechanism:
- Larger, more beautiful overlay (centered, 500px wide, glass-morphism)
- **Recent apps** section at top (no typing needed)
- **Smart suggestions** based on time of day and pending items
- Categories: Apps, Actions, People, Documents, Settings
- Keyboard-first but also accessible via menu bar search icon and desktop click

### 4. Notification Center Slide-Out
Already exists but wire it to the desktop menu bar:
- Bell icon in menu bar with unread badge
- Slides in from right edge (already built)
- Group by domain with dismiss/action buttons (already built)
- Just needs to be accessible from the desktop route

### 5. App Launch Animation
When navigating from desktop into an app:
- Scale-up + fade transition (app "zooms in" from the dock/widget position)
- Sidebar slides in from left simultaneously
- Creates the feeling of "opening" an app vs. just navigating

### 6. Cleaner Desktop Widgets
- Make widgets slightly larger with more breathing room
- Add a subtle "Edit Widgets" mode (long-press or button) for future customization
- Show real contextual data based on time: morning = today's agenda, evening = end-of-day summary

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/shell/DesktopSurface.tsx` | Add DesktopMenuBar component at top; refine widget layout and spacing |
| `src/components/sita/ShellLayout.tsx` | Remove the `!isDesktopRoute` guard on top bar — always show a menu bar (desktop version on home, full version elsewhere). Add app-launch scale transition. |
| `src/components/sita/AppSidebar.tsx` | Reduce to 6 primary + favorites + "All Apps". Remove Intelligence/Workspace/System/Control/AI Engineering groups from default. |
| `src/components/sita/CommandPalette.tsx` | Upgrade UI: larger overlay, recent apps section, smart suggestions, better visual hierarchy |
| `src/components/sita/SitaTopBar.tsx` | Minor: ensure it renders cleanly as "DesktopMenuBar" variant when on desktop route |

## Outcome
The experience becomes: beautiful desktop with translucent menu bar at top, dock at bottom, glass widgets in center. Click an app — it zooms in, sidebar appears, you're in a full workspace. Press Cmd+K or click search — Spotlight opens with smart suggestions. Click the bell — notifications slide in from the right. The sidebar has 6 items, not 60. Every interaction is fluid, discoverable, and intuitive — even for first-time users.

