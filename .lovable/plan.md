

# macOS-Style Widget Gallery

## What We're Building

Replace the current small popup `WidgetPicker` with a **full-screen macOS-style widget gallery** overlay, matching the reference images:

- **Left sidebar**: Searchable list of widget categories with icons (like the macOS widget picker app list)
- **Center area**: Shows available widgets for the selected category with live previews in different sizes (S/M/L selectors)
- **Right column**: Shows widgets currently on the desktop with remove buttons
- **"Done" button** at the bottom to close the gallery
- **Blur the desktop** behind the overlay (like macOS)

```text
┌──────────────────────────────────────────────────────────┐
│ (blurred desktop background)                             │
│ ┌──────────┬────────────────────────┬──────────────────┐ │
│ │ 🔍Search │                        │ On Desktop       │ │
│ │          │   [Widget Preview]     │                  │ │
│ │ Clock    │   "Clock"              │ ☑ Clock          │ │
│ │ Calendar │   Shows current time   │ ☑ Quick Actions  │ │
│ │ Actions  │                        │ ☑ System         │ │
│ │ System   │   ○ S  ● M  ○ L       │ ☑ Calendar       │ │
│ │ Alerts   │                        │ ☐ Notifications  │ │
│ │ Continue │                        │                  │ │
│ └──────────┴────────────────────────┴──────────────────┘ │
│                      [ Done ]                            │
└──────────────────────────────────────────────────────────┘
```

## Widget Catalog

All existing widgets become entries:
- **Clock** — Large time display with date
- **Calendar** — Date card with schedule
- **Quick Actions** — Shortcut grid
- **System Toggles** — WiFi, Bluetooth, etc.
- **Notifications** — Alert feed
- **Continuity** — Resume workspace
- **What Matters** — Priority items (currently unused on desktop — we'll add it)

Each widget shows a description and size selector buttons (S/M/L). Clicking "+" adds it to the desktop; clicking "−" on the right column removes it.

## Technical Changes

### `useDesktopWidgets.ts`
- Add `resizeWidget(id, size)` method
- Add "what-matters" to `DEFAULT_WIDGETS` (hidden by default)
- Add `description` field to `WidgetInstance`

### `WidgetPicker.tsx` — Full rewrite
- Full-screen overlay with `backdrop-blur-3xl` and dark tint
- Left sidebar: search input + scrollable app list with icons, highlight on select
- Center: selected widget's preview (renders actual widget at small scale), name, description, size selector (S/M/L circles)
- Right column: list of active desktop widgets with toggle/remove
- "Done" button at bottom center
- Animated entrance (scale + fade from center)

### `DesktopSurface.tsx`
- Update the "+" FAB to also be accessible via right-click context menu ("Edit Widgets")
- Pass `resizeWidget` to the widget system
- Add "what-matters" widget type to `renderWidget`

## Files

| File | Change |
|------|--------|
| `src/hooks/useDesktopWidgets.ts` | Add `resizeWidget`, `description` field, "what-matters" widget type |
| `src/components/sita/shell/desktop/WidgetPicker.tsx` | Full rewrite — macOS-style full-screen gallery with sidebar, preview, active list |
| `src/components/sita/shell/DesktopSurface.tsx` | Wire new picker, add what-matters to renderWidget, right-click "Edit Widgets" |

