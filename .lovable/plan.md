

# SITA OS — Fix Errors, Clean Desktop & Improve Navigation

## Problems Found

1. **Route mismatch**: `/home` renders `DailyPulse` (the old dense dashboard) instead of `DesktopPage`. The new OS desktop only works on `/desktop`. Meanwhile `isDesktopRoute` in ShellLayout checks for `/home` but doesn't check `/desktop`.
2. **Sidebar/topbar still visible on `/desktop`**: The `isDesktopRoute` check misses `/desktop`.
3. **DailyPulse is 870 lines of dense, overwhelming content**: KPIs, approvals, cross-domain intelligence, advisors, opportunities, proof cards, AI spend — all crammed into one scrollable page. User says "too much info packed in one place."
4. **Floating notifications overlap with other UI elements** (bottom-right cash runway warning clashes with notification toasts).
5. **Console warnings**: Toaster/TooltipProvider ref warnings (minor, non-breaking).

## Plan

### 1. Fix Routing — Make `/home` the OS Desktop
- **`src/App.tsx`**: Change `/home` route from `DailyPulse` to `DesktopPage`. Move DailyPulse to `/daily-pulse` or `/pulse`.
- **`src/components/sita/ShellLayout.tsx`**: Update `isDesktopRoute` to also match `/desktop`.

### 2. Simplify the Daily Pulse into a Clean Summary
- **`src/pages/DailyPulse.tsx`**: Dramatically simplify — remove the dense 870-line layout. Keep it as a focused "Daily Briefing" page with:
  - A clean greeting + summary strip (3-4 key metrics only)
  - Advisor card (one actionable insight)
  - Quick actions row (3-4 buttons max)
  - Pending approvals (if any, collapsed by default)
  - Remove: cross-domain intelligence section, opportunity cards, proof cards, AI spend tracker, widget grid, activity timeline, boardroom card — these belong in their dedicated apps

### 3. Fix Notification Overlap
- **`src/components/sita/DesktopNotifications.tsx`**: Only render on the desktop route (pass a prop or check route). Ensure they don't clash with bottom-right system alerts.

### 4. Sidebar Navigation Cleanup
- **`src/components/sita/ShellLayout.tsx`**: Ensure the sidebar has clear, simple navigation grouping:
  - Primary: Desktop, Daily Pulse, Business, Money, Concierge
  - Remove clutter from the main nav (Brain, Life Dashboard can be sub-items)

### 5. Fix Minor Console Errors
- Toaster ref warning — wrap in `forwardRef` or suppress

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | `/home` → `DesktopPage`, add `/pulse` or `/daily-pulse` → `DailyPulse` |
| `src/components/sita/ShellLayout.tsx` | `isDesktopRoute` includes `/desktop` |
| `src/pages/DailyPulse.tsx` | Simplify to ~200 lines: clean briefing with key metrics, one advisor card, quick actions, collapsible approvals |
| `src/components/sita/DesktopNotifications.tsx` | Guard rendering to desktop route only |
| `src/pages/DesktopPage.tsx` | Minor cleanup |

## Outcome
- `/home` shows the beautiful OS desktop (wallpaper, clock, glass widgets, dock)
- `/pulse` shows a clean, scannable daily briefing (not the old 870-line wall of data)
- Sidebar and topbar hidden on the desktop for true OS feel
- Notifications don't overlap with system alerts
- Navigation is simple: Desktop → open apps from dock or sidebar

