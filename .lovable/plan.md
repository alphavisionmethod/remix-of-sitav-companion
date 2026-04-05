

# SITA OS — "Wow Factor" Enhancement Plan

## What's Already Strong
The system has 100+ routes, 6 apps, AI advisors, admin dashboard, onboarding, lock screen, command palette, and a dock. The foundation is solid.

## What's Missing to Make It Truly "Wow"

### 1. Live Notification Center with Toast System
No real-time notification feed exists. Users can't see advisor alerts, approval requests, or system events as they happen.

**Build**: A slide-out notification panel (triggered from top bar bell icon) with grouped notifications (Advisors, Approvals, System), read/unread state, and toast popups for high-priority items using Sonner.

### 2. Spotlight Search with AI Natural Language
The command palette is keyword-only. A truly advanced OS lets you type "show me last week's revenue" or "what bills are due tomorrow" and get instant answers.

**Build**: Upgrade CommandPalette with an AI mode — when input starts with "?" or plain English is detected, route to personal-brain for instant answers inline, with a "thinking" shimmer.

### 3. Desktop Widget Grid (Drag-and-Drop)
Daily Pulse is a fixed layout. Users should be able to pin widgets (clock, weather, quick stats, advisor chat, calendar) to a customizable home screen — like actual OS widgets.

**Build**: A `WidgetGrid` component on Daily Pulse with draggable cards (using native drag or a lightweight lib). Persist layout to `user_memory`. Starter widgets: Clock, Weather, Quick Stats, Advisor Mini-Chat, Calendar Preview.

### 4. Ambient Sound & Haptic Feedback Cues
Premium OS feel: subtle audio cues on key actions (approval granted, boot complete, error). Optional, togglable.

**Build**: A `SoundEngine` utility that plays short Web Audio API tones (no files needed — synthesized) for: unlock, approval, error, notification. Respect a "Sound Effects" toggle in Settings.

### 5. Multi-Window / Split-View Mode
Currently everything is single-pane. An OS should let you split the screen — e.g., Brain chat on the left, Money dashboard on the right.

**Build**: A `SplitView` wrapper that renders two routes side-by-side. Triggered from command palette: "Split: Brain + Money". Stores split state in context.

### 6. Activity Heatmap & Usage Analytics (User-Facing)
Users have no insight into their own usage patterns. A personal analytics page showing "You used Brain 47 times this week" with a GitHub-style contribution heatmap is a differentiator.

**Build**: A `MyActivity` page with a heatmap grid (SVG), most-used features list, and weekly usage trends. Data from `audit_logs`.

### 7. Contextual AI Copilot Bar (Persistent Bottom Strip)
Instead of navigating to Brain, a persistent thin bar at the bottom lets users ask quick questions from any page. Like Spotlight but always visible.

**Build**: A `CopilotBar` component — 40px strip above the dock with a text input. On submit, calls personal-brain and shows a compact response inline. Expandable to full Brain page.

## Implementation Priority

| # | Feature | Files | Impact |
|---|---------|-------|--------|
| 1 | Notification Center + Toasts | 2 new, 2 edits | High — fills a critical UX gap |
| 2 | AI-powered Spotlight Search | 1 edit (CommandPalette) | High — "wow" moment |
| 3 | Desktop Widget Grid | 2 new, 1 edit (DailyPulse) | High — OS feel |
| 4 | Copilot Bar | 1 new, 1 edit (ShellLayout) | Medium — always-on AI |
| 5 | Sound Engine | 1 new, 1 edit (Settings) | Medium — premium polish |
| 6 | Split-View Mode | 2 new, 1 edit | Medium — power user feature |
| 7 | Activity Heatmap | 1 new, 1 route | Lower — nice-to-have |

**Total: ~10 new files, ~7 edits. No migrations needed.**

## Technical Notes

- Sound engine uses Web Audio API oscillators — zero asset files, ~50 lines
- Widget grid persists to `user_memory` table (already exists)
- Notification center reads from `notifications_queue` table (already exists)
- Copilot bar reuses `personal-brain` edge function
- Split view uses React portals + CSS grid, no third-party lib

