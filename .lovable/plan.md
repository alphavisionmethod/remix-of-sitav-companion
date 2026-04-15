

# Add Desktop Widgets Section to Settings App

## Problem
There is no "Widgets" section in the unified Settings app. The desktop has a full Widget Gallery (WidgetPicker) and widget management system (`useDesktopWidgets` with 18 widget types), but users can only access it from the desktop right-click/gallery button — not from Settings where it logically belongs.

## What Will Be Built
A new **"Desktop Widgets"** section under the **System** group in Settings, providing full widget management without leaving the Settings window:

- **Active Widgets list** — all currently visible desktop widgets with toggle switches to show/hide
- **Available Widgets gallery** — browseable grid of all 18 widget types with descriptions, categorized by type (Core, Business, Finance, Lifestyle)
- **Widget size control** — resize each active widget (Small / Medium / Large)
- **Layout reset** — one-click restore to default widget arrangement
- **Search/filter** — filter widgets by name or category
- **Live stats** — count of active vs total widgets

## Implementation

### 1. Add WidgetsContent to SystemSections.tsx
New `WidgetsContent` component that imports `useDesktopWidgets` hook and renders:
- Summary card showing active count / total count
- Category-filtered grid (Core: Clock, System, Quick Actions, Calendar, Notifications, Continuity; Business: CRM Pipeline, Leads, Business KPIs, Boardroom Brief; Finance: Investment Pulse, Finance Snapshot, Portfolio Map; Lifestyle: Weather, Concierge Tasks, What Matters, Advisor Council, Notifications Feed)
- Each widget card shows icon, name, description, on/off toggle, and size selector
- "Reset to Default Layout" button at the bottom

### 2. Register in SettingsWindow.tsx
- Add `{ id: "widgets", label: "Desktop Widgets", icon: <LayoutGrid />, group: "System" }` to SECTIONS array
- Add `widgets: WidgetsContent` to CONTENT map
- Import `LayoutGrid` icon

### Files Modified
| File | Change |
|---|---|
| `src/components/sita/shell/windows/settings/SystemSections.tsx` | Add `WidgetsContent` export (~120 lines) |
| `src/components/sita/shell/windows/SettingsWindow.tsx` | Add section entry + content map + import |

