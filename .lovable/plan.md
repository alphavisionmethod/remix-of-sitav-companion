

# Redesign Update Notification — Gentle OS-Style Toast

## Problem
The current `UpdateBanner` is a full-width top banner that takes over the entire viewport header — aggressive, non-dismissable for critical updates, and not how real operating systems handle update notifications. Real OS update notifications (macOS, Windows, ChromeOS) appear as small, unobtrusive toast/popup cards in the corner, with dismiss, schedule, and install actions.

## Design
Replace the banner with a compact floating notification card that appears in the **bottom-right corner** (consistent with OS notification conventions):

- **Small card** (~320px wide): Glassmorphic dark card matching SITA OS design language (`bg-white/[0.04]`, `backdrop-blur-xl`, subtle border)
- **Icon + title + one-line description** — e.g. shield icon, "Security Update Available", version number
- **Three actions**:
  - **Install Now** — navigates to Update Center
  - **Schedule** — dropdown/picker for Tonight / Tomorrow / This Weekend, then auto-dismisses with a "Scheduled" confirmation
  - **Dismiss (X)** — closes notification, remembers dismissal for this session; re-shows after 24h or next check
- **Auto-dismiss** after 15 seconds if user doesn't interact (slides away gently)
- **Critical vs normal** differentiated subtly: critical gets a small amber dot/badge on the icon, not a screaming red background
- Appears with a gentle slide-up + fade animation, exits with slide-down + fade

## Changes

### 1. Rewrite `src/components/sita/UpdateBanner.tsx`
- Rename conceptually to a floating notification toast (keep filename for import compatibility)
- Position: `fixed bottom-6 right-6 z-50`, max-width 340px
- Layout: icon left, text center, actions bottom row
- Schedule state stored in local state with options: "Tonight", "Tomorrow", "This Weekend"
- Auto-dismiss timer (15s) with pause on hover
- Session-based dismissal tracking (dismissed update IDs in state)
- Critical updates: amber accent dot, slightly longer auto-dismiss (30s), but still dismissable
- Stacks if multiple: only show the most important one at a time

### 2. No other files need changes
The `ShellAccessoryLayer` already lazy-loads `UpdateBanner` — the component swap is seamless.

## Visual Reference
```text
┌─────────────────────────────┐
│ 🛡  Security Update v2.1.4  │
│  Includes critical patches  │
│                             │
│  [Install]  [Tonight ▾]  ✕ │
└─────────────────────────────┘
          ↑ bottom-right corner, glassmorphic
```

