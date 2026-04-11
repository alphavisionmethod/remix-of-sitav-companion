

# Window Dragging with Mac-Level Smoothness + Bootable OS Spec

## What We're Building

Two additions from the user's Parts 3 and 4:

1. **Smooth window dragging** — upgrade `FloatingWindow.tsx` with interpolated movement (lerp smoothing) and release inertia, matching the user's C++ `DragState` spec
2. **Bootable OS prototype spec** — add kernel entry, bootloader config, and framebuffer access docs to the architecture, completing the full pipeline from React prototype to bare-metal boot

## Plan

### 1. Upgrade FloatingWindow drag to use lerp smoothing + inertia
**Edit**: `src/components/sita/shell/FloatingWindow.tsx`

Current drag is instant (set position = mouse delta). Replace with:
- **Lerp smoothing**: `pos += (target - pos) * 0.2` via `requestAnimationFrame` loop during drag — window trails the cursor slightly for that fluid macOS feel
- **Velocity tracking**: Store `dx/dy` per frame during drag
- **Inertia on release**: After pointer up, apply decaying velocity (`*= 0.92`) over ~10-15 frames until near zero, with boundary clamping
- Keep snap zone detection working (it reads pointer position, not window position, so unaffected)

### 2. Add drag physics to compositor-sim.ts
**Edit**: `src/lib/engine/compositor-sim.ts`

Add exported types and helpers matching the C++ spec:
- `DragState` interface (`active`, `offsetX/Y`, `velocityX/Y`)
- `lerpPosition(current, target, smoothing)` — pure function
- `applyInertia(state, friction)` — returns updated position + velocity
- These are pure-logic helpers usable by both the React prototype and future native engine

### 3. Bootable OS prototype spec document
**New file**: `infra/docs/BOOTABLE_PROTOTYPE_SPEC.md`

Contains (from user's Part 4):
- GRUB bootloader config (`grub.cfg` with multiboot entry)
- Kernel entry point (`kernel_main` with framebuffer + compositor init)
- Framebuffer memory-mapped access pattern
- Simple draw test (blue screen fill)
- Compositor integration with `Framebuffer` struct
- Build system (cross-compiler + linker script)
- QEMU run command
- Full system pipeline diagram (Input → WM → UI Toolkit → Rasterizer → Compositor → Framebuffer → Display)

### 4. Cross-link from architecture docs
**Edit**: `infra/docs/NOVA_OS_ARCHITECTURE.md`
- Add Phase 3 reference to `BOOTABLE_PROTOTYPE_SPEC.md`
- Note the drag physics spec in the Window Manager section

## Files
- 1 new file (`BOOTABLE_PROTOTYPE_SPEC.md`)
- 3 edits (`FloatingWindow.tsx`, `compositor-sim.ts`, `NOVA_OS_ARCHITECTURE.md`)

## Technical Notes
- Lerp drag uses `requestAnimationFrame` — no extra dependencies, stays within 16ms frame budget
- Inertia decay runs max ~15 frames (300ms), self-cancels when velocity < 0.5px
- All drag math is transform-only (no layout recalc)

