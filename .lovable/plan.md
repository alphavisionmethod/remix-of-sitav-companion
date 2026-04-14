

# Fix Widget Clicks, Settings Left Rail, and Smooth Dragging

## Issues Identified

1. **To-Do and Pending mini-cards in `DesktopClockWidget`** are plain `<div>` elements — they have no click handler and don't open any app. The To-Do card should open a new Tasks/To-Do app window, and the Pending card should open the Concierge Tasks or Business app to show pending items.

2. **Left Rail (`DesktopLeftRail`)** shown in the screenshot is a fixed list of 6 app icons (Business, Finance, Concierge, Files, Boardroom, Trust). The user wants it to behave like a **settings widget** — meaning it should be a draggable, removable desktop widget (registered in the widget system), not a fixed sidebar element.

3. **No To-Do app exists** — need to create a `TodoAppWindow` with a fully functional task management interface.

4. **DraggableWidget smoothness** — the current widget dragging uses framer-motion's `drag` with `dragMomentum={false}` and `dragElastic={0}`, which positions via `left/top` (triggers layout). FloatingWindow uses `transform` + lerp animation loop for smooth 60fps dragging. DraggableWidget should be upgraded to match.

---

## Plan — 3 Batches

### Batch 1: Create To-Do App + Wire Click Handlers (~250 lines)

**Create `src/components/sita/shell/windows/TodoWindow.tsx`** (~180 lines):
- Full task management app with glassmorphic OS style
- Features: add task, mark complete, delete, categories (Personal/Work/Urgent), due dates, priority levels
- Task list with checkboxes, swipe-to-complete animation
- "Add Task" input with category selector
- Filter tabs: All / Active / Completed
- Task count badge
- Empty state with friendly illustration
- Beautiful dark glassmorphic design matching OS aesthetic

**Modify `DesktopClockWidget.tsx`** — Make To-Do and Pending clickable:
- Accept `onLaunchApp` prop
- To-Do card: `onClick={() => onLaunchApp?.("todo")}` with hover/cursor styles
- Pending card: `onClick={() => onLaunchApp?.("concierge")}` with hover/cursor styles
- Add subtle hover glow effect on both cards

**Register in `ShellWindowLayer.tsx`**:
- Import `TodoWindow` and add to `APP_REGISTRY` as `todo`

**Update `DesktopSurface.tsx`** `renderWidget` for `"calendar"` case:
- Pass `onLaunchApp` to `DesktopClockWidget`

### Batch 2: Convert Left Rail to Draggable Settings Widget (~100 lines)

**Modify `DesktopLeftRail.tsx`** — Convert to a settings/apps widget style:
- Remove the fixed `absolute left-4` positioning (that's handled by `DraggableWidget`)
- Make it a self-contained widget component that renders inside the widget system
- Keep the same visual style but make each icon button removable isn't needed — just the whole rail is draggable/removable as a widget

**Register in `useDesktopWidgets.ts`**:
- Add `apps-rail` widget type to `DEFAULT_WIDGETS` (visible by default)

**Update `DesktopSurface.tsx`**:
- Remove the standalone `<DesktopLeftRail>` from the fixed position
- Add `"apps-rail"` case in `renderWidget()` that renders `<DesktopLeftRail>`

### Batch 3: Smooth Dragging for Widgets (~80 lines)

**Rewrite `DraggableWidget.tsx`** drag mechanics:
- Replace framer-motion `drag` prop with pointer-event-based dragging (same pattern as FloatingWindow)
- Use `requestAnimationFrame` + lerp for 60fps smoothness
- Apply position via `transform: translate3d()` instead of `left/top` to avoid layout thrashing
- Keep the `GripHorizontal` drag handle and `X` remove button
- Retain visual effects (scale on drag, shadow glow)
- Add subtle inertia on release

---

## File Summary
| Action | File | Changes |
|--------|------|---------|
| Create | `windows/TodoWindow.tsx` | ~180 lines |
| Modify | `DesktopClockWidget.tsx` | Add click handlers + props |
| Modify | `ShellWindowLayer.tsx` | Register todo app |
| Modify | `DesktopSurface.tsx` | Wire clock props, add apps-rail widget, remove fixed left rail |
| Modify | `DesktopLeftRail.tsx` | Remove fixed positioning wrapper |
| Modify | `useDesktopWidgets.ts` | Add apps-rail widget type |
| Modify | `DraggableWidget.tsx` | Rewrite to transform-based smooth drag |
| **Total** | **7 files** | **~430 lines** |

