

# Restore the Beautiful Desktop

## What Happened
The DesktopSurface was stripped down from ~1,100 lines to ~90 lines in a prior cleanup. The ambient background and clock are there, but the **desktop icons**, **continuity surface**, and **desktop state awareness** were all removed. The components still exist in the codebase — they just need to be wired back in.

## Plan

### 1. Re-integrate DesktopIconGrid into DesktopSurface
The `DesktopIconGrid` component (144 lines) still exists at `src/components/sita/shell/DesktopIconGrid.tsx`. Add it back as a layer on the desktop surface — right-aligned icons that auto-hide on idle, with hover lift and glow effects. It fades/blurs along with the clock when windows are open.

### 2. Add ContinuitySurface widget
Create `src/components/sita/shell/ContinuitySurface.tsx` (~100 lines) — a small, elegant glassmorphic card in the lower-left of the desktop showing:
- Time-aware greeting ("Good morning", "Good evening")
- "Resume where you left off" with last workspace name
- Count of pending items / what changed
- Auto-hides after 10s idle, fades with windows

### 3. Add desktop state awareness to DesktopSurface
Read `desktopState` from `useShellState()` (already available: `first_arrival`, `returning`, `quiet`, `offline`, `focus`). Use it to:
- Show greeting on first arrival
- Show continuity on returning
- Minimal on quiet/resting
- Muted ambient on offline

### 4. Update DesktopSurface composition
Expand `DesktopSurface.tsx` from ~90 lines to ~180 lines with these layers:
- Layer 1: ShellAmbientBackground (existing)
- Layer 2: Desktop content — Clock (centered), DesktopIconGrid (right-aligned), ContinuitySurface (bottom-left)
- Layer 3: Legacy FloatingWindow compositor (existing)
- Layer 4: OS WindowCompositor (existing)

All desktop content in Layer 2 fades/blurs together when windows open.

### 5. Wire DesktopPage props
Pass `desktopState` and `continuity` from `useShellState()` through to `DesktopSurface`.

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/shell/DesktopSurface.tsx` | Expand (~180 lines) — add icons, continuity, state |
| `src/components/sita/shell/ContinuitySurface.tsx` | Create new (~100 lines) |
| `src/pages/DesktopPage.tsx` | Minor update — pass state props |

## Build Verification
`tsc --noEmit` after all changes.

