

# Desktop Wallpaper System + Draggable Widget Manager

## What We're Building

Three major features inspired by macOS Tahoe:

### 1. Branded Wallpaper with Logo
- Create a **macOS Tahoe-style default wallpaper** — a rich blue/purple gradient background with the SITA logo rendered large and centered (like the "26" in the reference), using glassmorphic/frosted treatment on the logo
- The existing `ShellAmbientBackground` orbs layer on top as an overlay
- Add the SITA brand wallpaper as the new default "first boot" experience — logo prominently displayed with brand purple/blue gradient

### 2. Wallpaper Chooser on Desktop
- Add a **right-click context menu** or a wallpaper picker accessible from the dock/settings that lets users swap between wallpaper themes
- Extend `use-wallpaper.ts` to support a new "sita-hero" wallpaper type that renders the branded logo wallpaper (CSS gradient + centered logo)
- Wire `ShellAmbientBackground` to actually respect the selected wallpaper theme (currently it ignores the wallpaper hook)

### 3. Draggable, Removable, Addable Desktop Widgets
- Create a **widget manager system** with drag-and-drop positioning
- Each widget (Clock, Quick Actions, System Toggles, Calendar, Notifications, Continuity) becomes independently draggable on the desktop canvas
- Widgets can be **removed** (right-click > Remove, or an X on hover)
- An **"Add Widget"** panel lets users add back removed widgets or add new ones
- Widget positions and visibility are persisted to `localStorage`
- The clock widget moves from its fixed bottom-left position to a draggable widget like all others

## Layout Change

```text
BEFORE:                          AFTER:
┌────────────────────────┐       ┌────────────────────────┐
│         [Logo]         │       │    [SITA Logo Hero]    │
│                        │       │   (large, glassmorphic)│
│                 [Widgets│       │                        │
│                  Panel] │       │  [Widget]    [Widget]  │
│                        │       │     (draggable anywhere)│
│ [Clock]          ...   │       │  [Widget]    [Widget]  │
│         [Dock]         │       │         [Dock]         │
└────────────────────────┘       └────────────────────────┘
```

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useDesktopWidgets.ts` | **New** — Widget manager hook: positions, visibility, add/remove/move, localStorage persistence |
| `src/components/sita/shell/desktop/DraggableWidget.tsx` | **New** — Wrapper that makes any widget draggable on the desktop canvas with snap-to-grid |
| `src/components/sita/shell/desktop/WidgetPicker.tsx` | **New** — "Add Widget" overlay panel showing available widgets to place |
| `src/components/sita/shell/DesktopSurface.tsx` | Rewrite desktop content layer — replace fixed widget panel with free-form draggable widget canvas; add branded hero wallpaper layer; integrate widget manager |
| `src/components/sita/shell/ShellAmbientBackground.tsx` | Wire to `useWallpaper` hook so selected theme actually applies; add "sita-hero" branded wallpaper mode with large centered logo |
| `src/hooks/use-wallpaper.ts` | Add new "sita-hero" theme as default; add logo-based wallpaper category |

## Technical Details

### Widget Manager (`useDesktopWidgets`)
- Each widget has: `id`, `type`, `position: {x, y}`, `visible: boolean`, `size: "sm" | "md" | "lg"`
- Default layout: Clock at bottom-left, Quick Actions top-right, System Toggles mid-right, Calendar below that, Notifications below that
- `moveWidget(id, x, y)` — updates position on drag end
- `removeWidget(id)` — hides widget
- `addWidget(type)` — shows widget at a default position
- All state persisted to `localStorage` key `sita-desktop-widgets`

### Draggable Widget (`DraggableWidget`)
- Uses framer-motion `drag` with `dragMomentum={false}`
- Shows subtle border glow on drag
- Right-click context menu with "Remove Widget" option
- Optional close button on hover (top-right X)

### Branded Wallpaper
- New wallpaper type renders SITA logo large (200px) centered on a blue-to-purple gradient matching brand colors
- Glass circle behind logo (like the macOS Tahoe "26" circle)
- This is the default wallpaper on first boot

