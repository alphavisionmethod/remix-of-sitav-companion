

# SITA OS — True Desktop Experience Redesign

## Problem

The current "desktop" is a dashboard with cards (Boardroom, Today, Quick Actions, etc.) rendered inside the shell layout with sidebar visible. It looks like a web app, not an operating system. A real OS desktop should have:

1. A beautiful wallpaper background visible as the primary surface
2. Floating notification toasts that appear and dismiss
3. A clean, empty desktop where apps are the focus — you open them to see dashboards
4. Each app (Business, Money, Concierge) opens as its own full experience with its own brain/advisor

## What Changes

### 1. Desktop Page — Clean OS Desktop with Wallpaper

Replace the current card-heavy DesktopSurface with a clean desktop that shows:
- **Full-screen wallpaper background** — beautiful gradient mesh wallpaper with time-of-day shifts (morning gold, afternoon serene, evening deep purple, night dark). Uses CSS gradients + ambient orbs, no image files needed.
- **Clock + date widget** — centered, large, elegant (like macOS/iPadOS lock screen but as desktop widget)
- **Floating notification toasts** — slide in from top-right, auto-dismiss after 5s, show domain icon + message + action button. Stack up to 3 visible.
- **Desktop widgets** (small, transparent glass cards) — a compact "At a Glance" strip showing: 3 approvals waiting, $42K cash, 6 tasks today. Clicking any widget opens the relevant app.
- **No sidebar on desktop** — hide sidebar when on `/home` route, show it when inside any app
- **The Dock remains** at bottom as the primary app launcher

### 2. Floating Notification Toasts

New `DesktopNotifications` component:
- Renders in top-right corner, fixed position
- Each toast: glass card with domain color accent, icon, title, message, time ago, dismiss button
- Auto-dismiss after 5s with progress bar
- Max 3 visible, older ones queue
- Demo data: "Business Advisor: 3 leads cooling", "Money: Insurance renewal in 12 days", "Concierge: Grocery list ready"

### 3. App-as-Full-Experience Model

Each app already has its own page — this is about making the transition feel like "opening an app":
- When navigating from desktop to an app, sidebar appears with smooth slide-in
- Each app page already has `AppWelcomeHeader` + `InAppAdvisorStrip` — these become the app's "brain"
- The desktop is the launcher; each app is the full workspace

### 4. Desktop Widgets (At-a-Glance)

Small transparent glass cards floating on the desktop:
- **Approvals**: "3 waiting" with checkmark icon
- **Cash Position**: "$42K liquid" with dollar icon  
- **Today**: "6 tasks · 2 meetings" with calendar icon
- **Advisor**: Latest insight preview
- Clicking any widget navigates to the relevant app

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/shell/DesktopSurface.tsx` | Major rewrite: replace card dashboard with clean wallpaper desktop + clock widget + at-a-glance widgets |
| `src/components/sita/DesktopNotifications.tsx` | **New** — floating notification toasts with auto-dismiss, domain colors, action buttons |
| `src/pages/DesktopPage.tsx` | Mount DesktopNotifications |
| `src/components/sita/ShellLayout.tsx` | Conditionally hide sidebar on `/home` route for clean desktop feel |

## Outcome

The home screen transforms from a dashboard into a true OS desktop — beautiful wallpaper, floating clock, subtle glass widgets, notification toasts sliding in, and the Dock at the bottom to launch apps. Opening an app transitions you into a full workspace with sidebar, advisor, and domain intelligence. It feels like macOS meets a sovereign AI system.

