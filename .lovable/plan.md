

# Window System Spec Compliance — Final Fixes

## Audit Results

After reading every line of FloatingWindow.tsx, snap-zones.ts, compositor.ts, window-perf.ts, WindowErrorBoundary.tsx, sound-engine.ts, app-window-system.ts, nova-os.ts, and window-physics.ts, the system is **90% complete**. Here are the remaining deviations from the spec:

## Issues Found

| # | Spec Requirement | Current Value | Fix |
|---|---|---|---|
| 1 | Open scale: 0.96 → 1.0 | 0.85 → 1.0 | Too dramatic — update to 0.96 |
| 2 | Close scale: 1.0 → 0.98 | 1.0 → 0.95 | Too dramatic — update to 0.98 |
| 3 | Close duration: 120–160ms | Spring (unpredictable) | Switch to tween with 140ms |
| 4 | Focus fade: 120ms | 200ms (`duration-200`) | Change to `duration-[120ms]` |
| 5 | Drag uses `left/top` CSS | Triggers layout per frame | Switch to `transform: translate()` for GPU-composited movement |
| 6 | `willChange` mismatch | Says "transform" but uses left/top | Align with transform-based positioning |
| 7 | Frame tracking never started | `startFrameTracking()` not called | Auto-start on mount in DesktopSurface |
| 8 | Drag position not persisted | `updateWindowPosition` never called on drag end | Call it in `handlePointerUp` via callback |

## Plan

### 1. Fix animation values in FloatingWindow.tsx + nova-os.ts
- `NOVA_MOTION.window.enter.initial.scale`: 0.95 → **0.96**
- `NOVA_MOTION.window.exit.exit.scale`: 0.95 → **0.98**
- FloatingWindow morphInitial fallback scale: 0.85 → **0.96**
- Close exit: add `transition: { duration: 0.14, ease: "easeOut" }` for deterministic 140ms

### 2. Fix focus transition timing in FloatingWindow.tsx
- Change `transition-[box-shadow,border-color,filter] duration-200` to `duration-[120ms]`

### 3. Switch drag from left/top to transform: translate() in FloatingWindow.tsx
- Position via `transform: translate3d(x, y, 0)` instead of `left`/`top`
- Remove `left`/`top` from style during drag
- Keep `left`/`top` for snapped/static positioning with CSS transitions
- This eliminates layout thrashing — the single biggest perf win

### 4. Start frame tracking in DesktopSurface.tsx
- Call `WindowPerformanceMonitor.startFrameTracking()` on mount
- Call `stopFrameTracking()` on unmount

### 5. Persist drag position on release
- Add `onPositionChange` callback prop to FloatingWindow
- Call it in `handlePointerUp` and snap completion
- Wire in DesktopSurface to call `updateWindowPosition`

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/design-system/nova-os.ts` | Fix enter/exit scale values |
| `src/components/sita/shell/FloatingWindow.tsx` | Transform-based drag, fix scales, fix timing, add position callback |
| `src/components/sita/shell/DesktopSurface.tsx` | Start frame tracking, wire position persistence |

