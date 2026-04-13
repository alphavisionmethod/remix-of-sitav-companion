

# New Desktop Widgets — Expanded Catalog

## Overview

Add **12 new widget types** to the desktop widget system, covering all major SITA OS domains. Each widget is a compact, glanceable card using the existing `DesktopWidgetCard` wrapper, rendered at ~320px width on the desktop canvas.

## New Widgets

| # | Widget ID | Label | What It Shows |
|---|-----------|-------|---------------|
| 1 | `notifications-feed` | Notifications | 3 latest alerts (collections follow-up, obligation due, travel prep) with app badge and time |
| 2 | `investment-pulse` | Investment Pulse | Portfolio value, daily P&L %, top 3 holdings with mini sparklines |
| 3 | `crm-pipeline` | CRM Pipeline | Pipeline total value, # of open opportunities, top 3 deals with stage badges |
| 4 | `leads-recovered` | Leads Recovered | Recovered lead count, cart recovery stats, total recovered revenue |
| 5 | `calendar-today` | Today's Schedule | Next 3-4 calendar events with times, color-coded by domain |
| 6 | `boardroom-brief` | Boardroom Brief | Next scheduled boardroom, summary of pending decisions and carryover items |
| 7 | `advisor-council` | Advisor Council | 3-4 advisor avatars with names, confidence %, and domain badge (business/finance/concierge) |
| 8 | `business-kpi` | Business KPIs | Revenue, pipeline, conversion rate — 3 mini stat rows with trend arrows |
| 9 | `finance-snapshot` | Finance Snapshot | Total balance, income, expenses — mirroring the stat cards from Finance OS |
| 10 | `concierge-tasks` | Concierge Tasks | Top 3 pending errands/tasks with priority dots and due times |
| 11 | `weather` | Weather | Current temp, condition icon, high/low for the day (demo data) |
| 12 | `portfolio-globe` | Portfolio Map | Mini asset allocation donut chart with top 3 regions/sectors |

## Technical Approach

### 1. Create 12 new widget components
Each in `src/components/sita/shell/desktop/Desktop[Name]Widget.tsx`, using the `DesktopWidgetCard` wrapper. All use hardcoded demo data (consistent with the demo-mode pattern used by existing widgets).

### 2. Update `useDesktopWidgets.ts`
- Add all 12 new types to `DEFAULT_WIDGETS` (all with `visible: false` so they don't clutter the desktop by default)
- Add descriptions for the gallery

### 3. Update `WidgetPicker.tsx`
- Add icons for all new widget types in the `WIDGET_ICONS` map

### 4. Update `DesktopSurface.tsx`
- Add all 12 new types to `renderWidget()` switch statement
- Import all new components

### 5. Update `desktop/index.ts`
- Export all new widget components

## Files

| File | Change |
|------|--------|
| `src/components/sita/shell/desktop/DesktopNotificationsFeedWidget.tsx` | **New** — Latest alerts feed |
| `src/components/sita/shell/desktop/DesktopInvestmentPulseWidget.tsx` | **New** — Portfolio value + holdings |
| `src/components/sita/shell/desktop/DesktopCRMPipelineWidget.tsx` | **New** — Pipeline + deals |
| `src/components/sita/shell/desktop/DesktopLeadsRecoveredWidget.tsx` | **New** — Recovered leads stats |
| `src/components/sita/shell/desktop/DesktopCalendarTodayWidget.tsx` | **New** — Today's schedule |
| `src/components/sita/shell/desktop/DesktopBoardroomBriefWidget.tsx` | **New** — Boardroom summary |
| `src/components/sita/shell/desktop/DesktopAdvisorCouncilWidget.tsx` | **New** — Advisor avatars + confidence |
| `src/components/sita/shell/desktop/DesktopBusinessKPIWidget.tsx` | **New** — Business metrics |
| `src/components/sita/shell/desktop/DesktopFinanceSnapshotWidget.tsx` | **New** — Balance/income/expenses |
| `src/components/sita/shell/desktop/DesktopConciergeTasksWidget.tsx` | **New** — Pending errands |
| `src/components/sita/shell/desktop/DesktopWeatherWidget.tsx` | **New** — Weather card |
| `src/components/sita/shell/desktop/DesktopPortfolioMapWidget.tsx` | **New** — Asset allocation donut |
| `src/components/sita/shell/desktop/index.ts` | Export all new widgets |
| `src/components/sita/shell/desktop/WidgetPicker.tsx` | Add icons for all new types |
| `src/hooks/useDesktopWidgets.ts` | Add 12 new entries to DEFAULT_WIDGETS (hidden) |
| `src/components/sita/shell/DesktopSurface.tsx` | Add all new types to renderWidget + imports |

