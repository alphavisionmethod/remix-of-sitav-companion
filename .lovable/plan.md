

# Focus Dock + Intelligent Access Layer — Advanced Enhancement

## Current State vs. Prompt Requirements

| Feature | Status | Gap |
|---------|--------|-----|
| Sectioned dock (Core/Active/Smart/+) | Done | — |
| App Launcher (search, categories) | Done | No fuzzy search, no file/command results |
| Recent Flow Strip | Done | No time-ago labels, no drag-to-dock |
| Magnetic magnification | Done | Icons only scale — don't translate toward cursor |
| App Stacks | Missing | Not implemented anywhere |
| Drag-to-reorder dock | Missing | No drag support at all |
| Pin/Unpin working | Missing | Context menu "Unpin" does nothing |
| Press-in click effect | Missing | No whileTap depression on dock icons |
| Active app smooth entry | Missing | Apps pop in without layout animation |
| Running indicator pulse | Missing | Static dot, no subtle breathing |
| Launcher keyboard nav in grid | Partial | Only works on suggestion row |
| Context menu "Keep in Dock" | Missing | Active apps can't be pinned |

## Enhancement Plan

### 1. Magnetic Cursor Attraction (WOW upgrade)
**File: `DesktopDock.tsx`** — Enhance `DockIcon` so icons translate horizontally toward cursor in addition to scaling. Each icon shifts by `proximity * 3px` toward cursorX, creating a "magnetic pull" effect. Uses the existing Gaussian calculation.

### 2. App Stacks in Launcher
**File: `AppLauncherPanel.tsx`** — Replace flat category headers with visual stack icons. When collapsed, show a 3-layer stacked card effect (offset shadows). On click, fan-expand with staggered height animation. Add a "stack count" badge.

### 3. Dock Drag-to-Reorder + Pin/Unpin
**File: `DesktopDock.tsx`** — Add `Reorder.Group` / `Reorder.Item` from framer-motion for core pinned section. Persist pinned order to localStorage. Make context menu "Unpin" functional (removes from CORE_PINNED). Add "Keep in Dock" option for active/suggestion apps.

### 4. Press-in + Lift Interaction Polish
**File: `DesktopDock.tsx` (DockIcon)** — Add `whileTap={{ scale: 0.88, y: 2 }}` for press-in. Add subtle shadow elevation on hover via `filter: drop-shadow()`. Add running indicator breathing animation (`animate={{ opacity: [0.7, 1, 0.7] }}`).

### 5. Active App Smooth Entry/Exit
**File: `DesktopDock.tsx`** — Wrap each active app `DockIcon` in `motion.div` with `layout` and `layoutId={app.id}` so icons smoothly slide in/out when windows open/close instead of popping.

### 6. Flow Strip Time Labels + Drag-to-Dock
**File: `RecentFlowStrip.tsx`** — Add relative time labels ("2m ago", "15m ago") under each flow icon. Add long-press/drag gesture to pin a flow app to dock.

### 7. Launcher Fuzzy Search + Commands
**File: `AppLauncherPanel.tsx`** — Replace `includes` with weighted fuzzy match (name > tags > category). Add system command results (e.g., typing "dark" shows "Toggle Dark Mode"). Show matched substring highlighting.

### 8. Launcher Full Keyboard Navigation
**File: `AppLauncherPanel.tsx`** — Track `selectedIdx` across all visible items (suggestions + grid + actions). Arrow left/right for grid columns. Tab to jump between sections.

### 9. Premium Dock Reflection
**File: `DesktopDock.tsx`** — Replace the simple gradient reflection with a CSS `transform: scaleY(-1)` mirror of the dock icons at 8% opacity with mask-image fade, creating an actual reflection effect.

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/DesktopDock.tsx` | Magnetic translation, drag reorder, press-in, layout animations, pin/unpin, reflection, running pulse |
| `src/components/sita/shell/AppLauncherPanel.tsx` | App stacks, fuzzy search, command results, full keyboard nav, match highlighting |
| `src/components/sita/shell/RecentFlowStrip.tsx` | Time-ago labels, enhanced interaction |

