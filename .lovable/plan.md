

# Make Desktop Widgets Fully Interactive

## Problem
1. **Domain widgets are not clickable** — Business KPIs, Finance Snapshot, Boardroom Brief, Concierge Tasks, Investment Pulse, CRM Pipeline, Leads Recovered, Advisor Council, and Portfolio Map are static cards. Clicking them does nothing. They should open their corresponding app.
2. **Remove/move is not discoverable** — The drag handle only appears on hover (tiny grip icon above widget), and remove requires either right-click or hovering to find a tiny X. Users need clearer affordances.
3. **Some widgets (Clock, System, Calendar, Notifications, Weather) are pure info** — these don't need click-to-launch, but the domain widgets do.

## Plan

### Step 1: Add `onClick` to `DesktopWidgetCard`
- Add optional `onClick` prop to `DesktopWidgetCard.tsx`
- When provided, render the card as a clickable surface with a subtle hover indicator (cursor-pointer, slight glow)

### Step 2: Wire domain widgets to launch their apps
Each domain widget gets an `onLaunchApp` prop and wraps its `DesktopWidgetCard` with an onClick:

| Widget | Launches App |
|--------|-------------|
| `DesktopBusinessKPIWidget` | `business` |
| `DesktopFinanceSnapshotWidget` | `finance` |
| `DesktopConciergeTasksWidget` | `concierge` |
| `DesktopBoardroomBriefWidget` | `boardroom` |
| `DesktopInvestmentPulseWidget` | `investment` |
| `DesktopCRMPipelineWidget` | `business` |
| `DesktopLeadsRecoveredWidget` | `business` |
| `DesktopAdvisorCouncilWidget` | `boardroom` |
| `DesktopPortfolioMapWidget` | `investment` |
| `DesktopCalendarTodayWidget` | `calendar` |
| `DesktopWhatMattersWidget` | (no single app) |

### Step 3: Pass `onLaunchApp` through `renderWidget` in `DesktopSurface.tsx`
- The `renderWidget` function already receives `onLaunchApp` — pass it down to each domain widget

### Step 4: Improve drag/remove discoverability in `DraggableWidget.tsx`
- Make the drag handle larger and always slightly visible (not just on hover)
- Make the remove X button always visible on hover with a clearer design
- Add a subtle "hold to drag" tooltip or visual cue
- Keep right-click-to-remove as secondary method

### Files to modify
- `src/components/sita/shell/desktop/DesktopWidgetCard.tsx` — add onClick
- `src/components/sita/shell/desktop/DraggableWidget.tsx` — improve drag/remove UX
- `src/components/sita/shell/desktop/DesktopBusinessKPIWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopFinanceSnapshotWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopConciergeTasksWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopBoardroomBriefWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopInvestmentPulseWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopCRMPipelineWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopLeadsRecoveredWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopAdvisorCouncilWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopPortfolioMapWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/desktop/DesktopCalendarTodayWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/DesktopSurface.tsx` — pass onLaunchApp to all domain widgets in renderWidget

No new files. No database changes.

