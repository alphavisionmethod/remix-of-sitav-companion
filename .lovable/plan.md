

# FlowSpace — Signature Spatial Overview

## Context

A `MissionControl` component already exists (triggered by F3) — it shows window thumbnails in a static grid with basic scale animations. FlowSpace replaces it entirely with a physics-based, intelligent spatial overview that is dramatically more refined.

## Plan (3 deliverables)

### 1. FlowSpace Engine — `src/components/sita/shell/FlowSpace.tsx`
**New file** replacing `MissionControl.tsx` as the spatial overview.

**Physics core**: Each window thumbnail is a `FlowItem` with `x, y, vx, vy, targetX, targetY`. A single `requestAnimationFrame` loop runs the spring equation:
```
vx += (targetX - x) * 0.08
vx *= 0.85
x += vx
```
Items settle naturally (stop RAF when all velocities < 0.3px).

**Layout**: On open, compute a responsive grid of target positions based on window count (auto-columns, centered). Windows animate from their real screen positions to their grid targets via the physics system — not CSS transitions.

**Visual layers**:
- Full-screen overlay with dimmed background (`bg-black/70`) and soft gradient vignette
- Each thumbnail: glassmorphic card (220x150), shows mini-preview of window content at 0.4x scale
- Hover: physics-based scale bump (target scale 1.08, same spring), blue glow border
- Active/recent window gets a subtle pulse ring

**Intelligence layer**:
- Windows grouped by recency (most recent = top-left)
- A "Suggested" row at bottom shows 2-3 unopen apps based on time-of-day patterns (morning = email, afternoon = projects) — static heuristic, no ML
- Desktop itself shown as a card users can click to dismiss all windows

**Interactions**:
- Click thumbnail → physics zoom-in animation (scale 1→full, position→window pos), then close FlowSpace and focus that window
- Drag thumbnail → update its `targetX/targetY` in real-time, rearrange grid (other items shift via physics)
- Scroll/pinch → reserved for future workspace zoom (no-op for now, just prevent default)
- Escape or click backdrop → physics zoom-out back to normal

### 2. Wire FlowSpace into ShellLayout
**Edit**: `src/components/sita/ShellLayout.tsx`

- Replace `MissionControlLazy` import with `FlowSpace`
- Keep F3 trigger, add `Cmd+Space` as alternate trigger (check it doesn't conflict with command palette's Cmd+K)
- Pass `wm.windows`, `wm.focusWindow`, `wm.closeWindow` to FlowSpace

### 3. Remove old MissionControl
**Delete or deprecate**: `src/components/sita/shell/MissionControl.tsx`

FlowSpace fully supersedes it. Remove the file and its lazy import.

## Technical Notes
- Single RAF loop for all items (not one per item) — batch update
- Physics runs max ~60 frames to settle (1s), self-cancels when all items are at rest
- All movement is `transform: translate3d()` — no layout recalc
- Window content previews use the existing `component` ReactNode rendered at `scale(0.4)` inside an overflow-hidden container (same approach as current MissionControl)
- Drag uses pointer events (not mouse events) for touch support
- No new dependencies

## Files
- 1 new: `FlowSpace.tsx`
- 1 edit: `ShellLayout.tsx`
- 1 delete: `MissionControl.tsx`

