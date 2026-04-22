

# Haptic Feedback + Enlarged Resize Handles for SITA OS Windows

## Summary

Two enhancements to improve the mobile touch experience:

1. **Vibration and visual feedback** on window focus, minimize-to-dock, and restore actions.
2. **Larger resize handle hit areas** with visible hover/active indicators during touch resizing.

---

## Technical Details

### 1. Haptic feedback utility

Create `src/lib/utils/haptics.ts` — a tiny wrapper around `navigator.vibrate()` that silently no-ops on unsupported browsers:

- `hapticTap()` — 10ms pulse (focus, restore)
- `hapticHeavy()` — 20ms pulse (minimize)

### 2. Visual focus pulse on AppWindow

In `src/components/sita/os/AppWindow.tsx`:

- When the window receives focus (`onMouseDown` / `focusWindow`), briefly flash the border glow (e.g. `ring-2 ring-primary/30` for 200ms via a transient state `focusPulse`).
- Call `hapticTap()` inside `focusWindow` handler.

### 3. Minimize and restore feedback

In `AppWindow.tsx`:

- `handleMinimize`: call `hapticHeavy()` at animation start. Add a subtle scale-bounce (`scale(0.96)` → `scale(1)` over 150ms) before the existing shrink animation.
- Restore path (in `WindowContext.tsx` `focusWindow` which also un-minimizes): trigger `hapticTap()`. The existing `animate-in fade-in zoom-in-95` handles the visual restore; no additional change needed there.

### 4. Enlarged resize handle hit areas

In `AppWindow.tsx`, update the `ResizeHandle` component:

- Increase `RESIZE_HANDLE_SIZE` from `6` to `14` on touch-capable devices (detect via `window.matchMedia('(pointer: coarse)')`). Keep 6px for mouse.
- Add a visible feedback layer inside each handle `<div>`: a child `<div>` that is invisible by default, but on `:hover` and during active resize (`isResizing` state + matching edge) shows a translucent accent bar/dot:
  - Edge handles: 2px-wide colored line (e.g. `bg-primary/40`) centered in the hit area.
  - Corner handles: small 6×6 rounded dot (`bg-primary/50`).
- Use the existing `isResizing` state plus a new `activeEdge` state (set in `onResizePointerDown`, cleared in `onResizePointerUp`) to apply an `active` style (`bg-primary/60`, slightly wider).

### Files changed

| File | Change |
|---|---|
| `src/lib/utils/haptics.ts` | New — haptic helper |
| `src/components/sita/os/AppWindow.tsx` | Enlarge resize handles, add visual hover/active indicators, add focus pulse + haptic calls on focus/minimize |

No database or backend changes required.

