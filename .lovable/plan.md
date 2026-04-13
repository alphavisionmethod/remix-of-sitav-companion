

# Integrate Provided Desktop Shell as Foundation

## Summary
Take the provided `SitaDesktopShell` monolithic component and decompose it into ~8 clean components, then wire them into `DesktopSurface.tsx` as the new desktop content layer. The existing shell infrastructure (SystemMenuBar, DesktopDock, ShellLiveLayer, WindowCompositor, ambient background) stays untouched — the new code replaces only the center content area of the desktop.

## What Changes

### 1. Create Widget Components (`src/components/sita/shell/desktop/`)

| File | Purpose |
|------|---------|
| `DesktopWidgetCard.tsx` | Reusable glassmorphic card wrapper (the `WidgetCard` from provided code) — 24px radius, `bg-white/8`, `backdrop-blur-2xl`, gradient accent overlay, radial highlight |
| `DesktopContinuityPanel.tsx` | Hero "Resume Business Collections" card — shows last workspace, pending actions, trust posture summary, "Continue" + "Ask advisors" buttons. Reads from `ContinuityContext` + shell state |
| `DesktopClockWidget.tsx` | Large time display + calendar events list. Uses existing `useClock` pattern |
| `DesktopNotificationsWidget.tsx` | Top 3 notifications with priority badges. Wires to existing notification model (`useUnreadCount`) |
| `DesktopWhatMattersWidget.tsx` | Per-domain summary cards (Business, Finance, Concierge) with status text |
| `DesktopQuickActionsWidget.tsx` | 2×2 grid of action buttons (Open Boardroom, Review approvals, Search files, System settings). Buttons trigger real navigation/commands |
| `DesktopSystemWidget.tsx` | Calm mode status + open apps list. Reads from `useDisplayMode` and window manager |
| `DesktopLeftRail.tsx` | Vertical app switcher rail (visible on `lg+`) — 6 app icons with active state glow. Bridges to existing `onLaunchApp` |
| `DesktopNotificationCenter.tsx` | Right-side slide-out notification drawer (visible on `xl+`), toggled from top bar bell icon |

### 2. Rewrite `DesktopSurface.tsx` (~200 lines)

Replace the current minimal clock-only layout with the provided design's full composition:

```text
┌──────────────────────────────────────────────┐
│ SystemMenuBar (existing, untouched)          │
├────┬─────────────────────────────┬───────────┤
│Left│  Desktop Content Grid       │ Notif     │
│Rail│  ┌─────────┬───────┬──────┐ │ Center    │
│    │  │Continue │Clock  │Notifs│ │ (xl only) │
│    │  ├─────────┼───────┼──────┤ │           │
│    │  │Matters  │Quick  │System│ │           │
│    │  └─────────┴───────┴──────┘ │           │
├────┴─────────────────────────────┴───────────┤
│ DesktopDock (existing, untouched)            │
│ WindowCompositor (existing, untouched)       │
└──────────────────────────────────────────────┘
```

- Layer 1: `ShellAmbientBackground` (existing) — plus the provided code's dot-grid overlay and edge gradient for extra depth
- Layer 2: Desktop content (greeting header, widget grid, left rail, notification center) — fades/blurs when windows are open
- Layer 3: Legacy `FloatingWindow` compositor (existing)
- Layer 4: OS `WindowCompositor` (existing)

The greeting header shows time-aware greeting ("Good morning.") + context summary + "Open Boardroom" / "What Matters Now" buttons.

### 3. Wire Real Data

- **Continuity panel**: Read `continuity` prop (already passed from `DesktopPage`)
- **Clock widget**: Real `Date` with 1s interval (already exists)
- **Notifications widget**: Wire to `useUnreadCount` from existing `NotificationPanel`
- **Quick actions**: "Open Boardroom" → `navigate('/boardroom')`, "Review approvals" → `navigate('/approvals')`, "Search files" → trigger `onOpenCommand`, "System settings" → `navigate('/settings')`
- **Left rail**: Call `onLaunchApp` prop (bridges to existing `handleLaunchApp` in ShellLayout)
- **System widget**: Read `useDisplayMode().isCalm` and `openWindows` from `useOSWindowContext()`

### 4. Preserve Premium Feel

All provided visual qualities are preserved:
- `backdrop-blur-2xl` on all widget cards
- `shadow-[0_20px_80px_rgba(0,0,0,0.28)]` depth shadows
- `bg-white/8` semi-transparent materials
- `border-white/10` subtle borders
- `rounded-[24px]` large radii
- Gradient accent overlays with `opacity-60`
- Radial highlight: `radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)`
- Dot-grid texture overlay at `opacity-[0.06]`
- `tracking-[0.22em]` uppercase labels

### 5. No Existing Shell Breakage

Files NOT modified:
- `ShellLayout.tsx` — no changes
- `DesktopDock.tsx` — no changes  
- `SystemMenuBar.tsx` — no changes
- `ShellLiveLayer.tsx` — no changes
- `WindowCompositor.tsx` — no changes
- `DesktopPage.tsx` — minor: pass `onLaunchApp` if needed

### 6. Minor `DesktopPage.tsx` Update

Pass any additional props `DesktopSurface` needs (e.g. `onLaunchApp` callback if the left rail needs it).

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/shell/desktop/DesktopWidgetCard.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopContinuityPanel.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopClockWidget.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopNotificationsWidget.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopWhatMattersWidget.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopQuickActionsWidget.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopSystemWidget.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopLeftRail.tsx` | Create |
| `src/components/sita/shell/desktop/DesktopNotificationCenter.tsx` | Create |
| `src/components/sita/shell/desktop/index.ts` | Create (barrel export) |
| `src/components/sita/shell/DesktopSurface.tsx` | Rewrite (~200 lines) |
| `src/pages/DesktopPage.tsx` | Minor update |

## Build Verification
`tsc --noEmit` after all changes.

