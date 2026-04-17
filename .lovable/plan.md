

## Fix: Drag-anywhere widgets + keep them inside the desktop

Two precise changes to `src/components/sita/shell/desktop/DraggableWidget.tsx` plus an initial-position clamp.

### 1. Drag from anywhere on the widget (remove the dots handle)

Move the pointer handlers (`onPointerDown` / `Move` / `Up`) from the small top pill onto the **wrapper `<div>`** itself. Delete the `GripHorizontal` pill entirely. Use a **5px movement threshold** to distinguish a click from a drag — if the pointer moves <5px before release, the underlying child receives the click normally (so quick-action icons still launch apps); past 5px, we enter drag mode and suppress the click.

The remove (`X`) button keeps its own `stopPropagation` so clicking it never starts a drag.

### 2. Keep widgets inside the desktop (no top overflow)

The quick-actions widget overflows because its initial `y: 40` plus the dragged-up offset of the now-removed top handle pushed it above the visible area. Two fixes:

- **Remove the `-top-4` handle**, so the widget no longer renders above its declared `y` position.
- On mount and on window resize, **clamp** `posRef` against `dragConstraints` bounds (same math already used during drag) and call `onMove` if the position had to be corrected. This ensures any widget — including ones loaded from persisted positions on a smaller viewport — snaps inside the desktop.

### 3. Cursor + affordance

Set `cursor-grab` / `active:cursor-grabbing` on the wrapper, plus `touch-none select-none` so dragging works on touch and never selects text. The remove `X` stays visible on hover in the top-right corner as today.

### Files

| File | Change |
|---|---|
| `src/components/sita/shell/desktop/DraggableWidget.tsx` | Wrapper-level pointer handlers, 5px click/drag threshold, delete top dots pill, mount + resize clamping |

### Acceptance

- Clicking and holding **anywhere** on a widget body drags it
- Tapping a quick-action icon (no movement) still launches the app
- The top "dots" pill is gone
- The quick-actions widget never sits above the desktop top edge, even on first load or after viewport resize
- `X` remove button still works without triggering a drag

