

# Desktop Shell Audit + Wow Upgrades

## Audit Result: Implementation Status

All 10 components are correctly implemented and wired:
- **DesktopWidgetCard** — glassmorphic container with accent gradients, radial highlight
- **DesktopContinuityPanel** — hero card with resume, pending items, trust posture
- **DesktopClockWidget** — live clock + calendar events
- **DesktopNotificationsWidget** — 3 notifications with priority badges
- **DesktopWhatMattersWidget** — per-domain summaries
- **DesktopQuickActionsWidget** — 4 action buttons wired to real navigation
- **DesktopSystemWidget** — calm mode + open apps (static data)
- **DesktopLeftRail** — 6-app vertical switcher
- **DesktopNotificationCenter** — slide-out drawer
- **DesktopSurface** — 4-layer composition with dual compositor

**Issues Found:**
1. `DesktopSystemWidget` uses hardcoded `openApps` array instead of reading from `useOSWindowContext`
2. `DesktopLeftRail` has local-only `activeApp` state — not connected to navigation or app launcher
3. No entrance animations on widget cards (they just appear)
4. No hover micro-interactions on widget cards (only buttons have hover)
5. `ContinuitySurface.tsx` exists but is NOT used — it was superseded by `DesktopContinuityPanel` but never deleted
6. Top bar duplicates the existing `SystemMenuBar` — potential double-bar issue

## Wow Upgrade Plan

### 1. Animated Widget Entrances (staggered fade-up)
Wrap each widget in `motion.div` with stagger delay so the desktop "breathes in" on load — cards cascade up one by one over 600ms total.

### 2. Widget Card Hover Glow Effect
Add a subtle border-glow and slight lift (`translateY(-2px)`) on hover to every `DesktopWidgetCard`. The glow color matches the card's accent gradient.

### 3. Live System Widget
Wire `DesktopSystemWidget` to read actual open windows from `useOSWindowContext()` instead of a hardcoded array.

### 4. Left Rail → Real Navigation
Connect `DesktopLeftRail` clicks to `useNavigate()` so tapping Business goes to `/business`, Finance to `/finance`, etc. Remove the local `activeApp` state.

### 5. Ambient Pulse on Continuity Panel
Add a slow breathing glow animation behind the Continuity hero card — a radial gradient that pulses opacity between 0.15 and 0.25 every 4 seconds, creating a "living" feel.

### 6. Clock Colon Blink
Make the colon in the large clock blink (opacity toggle every second) — a classic OS touch that signals the system is alive.

### 7. Notification Priority Dot Animation
High-priority notifications get a slow pulse animation on their badge, drawing subtle attention without being aggressive.

### 8. Remove Unused ContinuitySurface.tsx
Delete the superseded file to keep the codebase clean.

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/shell/desktop/DesktopWidgetCard.tsx` | Add hover glow + lift transition |
| `src/components/sita/shell/desktop/DesktopClockWidget.tsx` | Add colon blink animation |
| `src/components/sita/shell/desktop/DesktopSystemWidget.tsx` | Wire to useOSWindowContext |
| `src/components/sita/shell/desktop/DesktopLeftRail.tsx` | Wire to useNavigate |
| `src/components/sita/shell/desktop/DesktopNotificationsWidget.tsx` | Add pulse on high-priority badge |
| `src/components/sita/shell/desktop/DesktopContinuityPanel.tsx` | Add ambient pulse glow |
| `src/components/sita/shell/DesktopSurface.tsx` | Add staggered entrance animations to widget grid |
| `src/components/sita/shell/ContinuitySurface.tsx` | Delete (superseded) |

