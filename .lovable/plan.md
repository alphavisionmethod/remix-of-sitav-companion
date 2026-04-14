

# Upgrade Desktop Notification Center and Verify Full Cross-OS Wiring

## Current State
- The **Unified Notification Center** (slide-out panel) is fully implemented with cross-OS aggregation, filtering, deep-linking
- The **Cross-Domain Intelligence Bridge** widget is fully implemented
- The **Command Palette** has 30+ deep-link commands wired via `crossNavigate`
- **Issue**: `DesktopNotificationCenter.tsx` (the inline desktop widget) still uses 3 hardcoded static notifications with no cross-OS integration, no priority sorting, no deep-linking, and no archetype awareness

## Plan

### 1. Upgrade DesktopNotificationCenter to use Cross-OS engine
**File**: `src/components/sita/shell/desktop/DesktopNotificationCenter.tsx`
- Replace hardcoded notifications with `generateNotifications()` from the unified system or a shared notification source
- Add domain color indicators (Business purple, Finance green, Concierge violet)
- Add urgency-based styling (critical/high/medium/low)
- Wire "Review" buttons to `crossNavigate` for deep-linking into windowed apps
- Add unread count badge and "Mark all read" action
- Show cross-OS signal notifications (the `cross-os` domain type)
- Use `useBusinessProfile` for archetype-aware notification generation

### 2. Verify Command Palette deep-link wiring
**File**: `src/components/sita/CommandPalette.tsx`
- Ensure `sita-launch-app` event correctly maps app IDs ("business" / "finance" / "concierge") to window manager app identifiers
- Verify the 200ms timeout for `crossNavigate` after launch is sufficient
- Confirm all 30+ `DEEP_LINK_MAP` entries match actual module IDs in each app shell

### 3. Verify Intelligence Bridge is mounted in all three app shells
- Confirm `CrossDomainIntelligenceBridge` is rendered in BusinessAppShell, FinanceAppShell, and ConciergeAppShell
- Confirm `CrossOSLinksPanel` is rendered in all three sidebars

### Technical Details
- Shared notification data model: reuse the `Notification` interface from `NotificationCenter.tsx`
- Extract `generateNotifications()` into a shared hook or utility so both the slide-out panel and desktop widget can use the same data
- Desktop widget shows max 4 notifications (compact view) with a "View all" button that opens the full slide-out panel
- No database changes needed -- all demo/mock data

