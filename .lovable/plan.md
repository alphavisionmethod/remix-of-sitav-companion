

# Control Center — Advanced Overhaul

## Current State
The Control Center pull-down (`ControlCenter.tsx`) is a 182-line panel with:
- 8 toggle tiles: WiFi, Bluetooth, Dark/Light Mode, DND, AirPlay, Focus, Night Shift, Reduce Motion
- 2 sliders: Volume, Brightness
- No live data, no connection to real system state, no expandable sections

This is extremely basic compared to what iOS/macOS Control Center offers. It needs to be a true command surface.

## What Will Be Built

A premium, expandable Control Center with multiple sections, live system data, and deep integration with Settings (each tile links to its Settings section on long-press/click-through).

```text
┌──────────────────────────────────┐
│ Control Center              [×]  │
├──────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐ │
│ │WiFi │ │ BT  │ │ VPN │ │Air │ │  ← Connectivity cluster
│ │ ● ON│ │ OFF│ │ OFF│ │Drop│ │    (expandable: show network
│ └─────┘ └─────┘ └─────┘ └────┘ │     name, BT device, etc.)
├──────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐ │
│ │Focus│ │ DND │ │Dark │ │Lock│ │  ← Mode cluster
│ │ OFF │ │ OFF │ │ ON  │ │Scrn│ │
│ └─────┘ └─────┘ └─────┘ └────┘ │
├──────────────────────────────────┤
│ 🔊 Volume ──────────●── 72%     │  ← Sliders
│ ☀️ Brightness ────●────── 80%    │
├──────────────────────────────────┤
│ ♬ Now Playing                    │  ← Media widget
│ "Morning Jazz" — Spotify  ▶ ▐▐  │
├──────────────────────────────────┤
│ 🔋 Battery 87% · 4h 12m left    │  ← System status
│ 💾 Storage 42GB / 128GB used     │
│ 📡 Network ↑ 2.1 MB/s ↓ 12 MB/s│
├──────────────────────────────────┤
│ 🌙 Night Shift  ⬚ Screen Mirror │  ← Quick extras
│ 📱 Reduce Motion ⬚ Stage Mgr    │
├──────────────────────────────────┤
│ 🛡 System Health: 94 ● healthy   │  ← Live pulse
│ ⚡ 2 active workflows · 0 alerts │
├──────────────────────────────────┤
│ [Open Settings]                  │
└──────────────────────────────────┘
```

## Detailed Sections

### 1. Connectivity Cluster (expandable)
- **WiFi** — shows connected network name, signal strength; tap to toggle, long-press opens Settings > WiFi
- **Bluetooth** — shows connected device name; tap toggle, long-press opens Settings > Bluetooth
- **VPN** — toggle with status indicator (Connected/Disconnected)
- **AirDrop/Screen Mirror** — toggle with discovery mode

### 2. Mode Cluster
- **Focus Mode** — with active focus profile name (Work, Personal, Sleep)
- **Do Not Disturb** — with scheduled time display
- **Dark/Light Mode** — theme toggle with smooth transition
- **Lock Screen** — instant lock action
- **Stage Manager** — toggle window tiling mode

### 3. Sliders (enhanced)
- **Volume** — with output device selector (Speakers, Headphones)
- **Brightness** — with auto-brightness toggle
- Both show exact percentage, smooth haptic-style interaction

### 4. Now Playing Widget
- Shows current media (if any) or "Nothing Playing"
- Album art thumbnail, track name, artist
- Play/Pause, Previous, Next, AirPlay output buttons
- Progress bar

### 5. System Status Strip
- **Battery** — percentage, estimated time remaining, charging status
- **Storage** — used/total with color bar
- **Network** — live upload/download speed indicators
- **Memory** — RAM usage percentage

### 6. Quick Extras Grid
- Night Shift, Reduce Motion, Screen Recording, Screenshot, Calculator, Timer
- Each is a small tap-to-activate tile

### 7. Live System Pulse (unique to SITA OS)
- System health score from Mission Control data
- Active workflow count
- Open incident count (with red dot if > 0)
- Tapping opens Mission Control

### 8. Settings Integration
- Every tile has a "chevron" indicator — tapping opens that tile's detail, long-pressing opens the corresponding Settings section
- Bottom "Open Settings" button launches the Settings window app
- Consistent behavior: Control Center = quick toggle, Settings = deep configuration

## Settings Integration (NOT merging into Settings)
The Control Center remains a separate overlay. It does NOT become part of Settings. Instead:
- Each Control Center tile links to its matching Settings section via `openWindow("settings", { section: "wifi" })`
- Settings sections remain the deep-dive; Control Center is the quick-access surface

## Implementation

### File: `src/components/sita/shell/ControlCenter.tsx` (full rewrite)
- Expand from 182 lines to ~450 lines
- Import `useOSRuntime` for live system data
- Import `useMissionControlSummary` for health score
- Use `useSettingsValue` for all persisted toggles
- Add `useWindowManager` for opening Settings sections
- Structured as composable sub-components: `ConnectivityCluster`, `ModeCluster`, `SliderSection`, `NowPlayingWidget`, `SystemStatusStrip`, `QuickExtrasGrid`, `SystemPulseBar`
- Premium glassmorphic styling matching existing panel aesthetic
- Smooth spring animations for tile state changes
- Expandable tile detail views (tap WiFi tile to see available networks)

### No other files need modification
The Control Center is self-contained. It already has proper integration points in `ShellLayout.tsx` and `ShellLiveLayer.tsx`.

### Files Modified

| File | Action |
|---|---|
| `src/components/sita/shell/ControlCenter.tsx` | Full rewrite — 8 sections, live data, settings links |

