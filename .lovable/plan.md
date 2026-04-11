
# NovaOS Advanced Living Desktop — Full Implementation

## What Exists vs. What's Missing

| Feature | Status | Action |
|---------|--------|--------|
| 1. Living Desktop (breathing wallpaper) | Partial — ambient orbs move but wallpaper gradient is static | Add slow gradient interpolation between time moods |
| 2. Intent-Aware UI | Missing | Add suggestion overlay that detects idle + context |
| 3. Zero-Friction Magnetic Dragging | Partial — lerp exists but no magnetic edge pull | Add edge magnetism to snap zones |
| 4. Depth Without GPU | Partial — single shadow only | Add stacked shadow system (near+far) |
| 5. Universal Search (everything) | Done — CommandPalette + UniversalCommandSurface | Skip |
| 6. Smart File Previews | Missing | Add preview thumbnails to desktop icons + Finder |
| 7. Instant Everything (progressive load) | Missing | Add skeleton shimmer to window content |
| 8. Modular Panels (edge widgets) | Missing | Add slide-from-edge panel system |
| 9. Focus Mode | Done — soft focus dims background | Skip |
| 10. Calm Notifications | Done — fade instead of slide | Skip |
| 11. Memory-Aware UI (restore positions) | Missing | Persist window positions to localStorage |
| 12. Adaptive Color System | Partial — dock tint only | Add window accent adaptation |
| 13. Micro-Details (hover delay, ripple) | Missing | Add click ripple, tuned hover timing |
| 14. Signature Feature — "Command Layer" | Missing | Hold-key overlay showing all actions |

## Plan (8 deliverables)

### 1. Living Wallpaper — slow gradient breathing
**Edit**: `DesktopSurface.tsx`

Add a `wallpaperPhase` that cycles every 30 seconds between two gradient variations of the current mood. Use CSS `transition: background 8s ease` on the root div. Alternate between the base gradient and a shifted version (hue +/- 5 degrees). No per-frame work — just a `setInterval` toggling a class.

### 2. Intent-Aware Suggestion Pill
**New file**: `src/components/sita/shell/IntentSuggestion.tsx`

A small floating pill that appears after 5 seconds of idle on desktop:
- Context-based suggestions: "Open recent project?", "3 approvals waiting — review now?"
- Positioned below the clock, fades in gently (300ms), disappears on any interaction
- Reads from `continuity` state (pending drafts, unfinished workflows)

### 3. Magnetic Edge Attraction for Windows
**Edit**: `FloatingWindow.tsx`

During drag, when window edge is within 20px of viewport edge or another window edge, apply a magnetic pull: `force = (snapEdge - windowEdge) * 0.15`. This modifies `targetPos` in the existing lerp loop. Subtle — just a gentle tug, not a hard snap.

### 4. Stacked Depth Shadows (Near + Far)
**Edit**: `nova-os.ts`

Replace single `NOVA_SHADOWS.window` with a dual-shadow system:
- Near: `0 2px 8px hsl(0 0% 0% / 0.15)` (sharp, close)
- Far: `0 16px 48px hsl(0 0% 0% / 0.20)` (soft, distant)
- Combined via `box-shadow` shorthand. Apply in `FloatingWindow.tsx`.

### 5. Smart File Preview Icons
**Edit**: `DesktopIconGrid.tsx`

For specific folder types, show a mini preview instead of generic icon:
- Documents: tiny page icon with lines
- Downloads: arrow with progress ring
- Projects: code bracket icon
- Each icon gets a subtle inner glow that pulses once on hover (200ms)

### 6. Progressive Content Loading (Instant Everything)
**Edit**: `FloatingWindow.tsx`

Add a content shimmer: when window first opens, show a 3-line skeleton shimmer for 150ms before revealing children. Uses CSS animation only. Creates perception of instant response.

### 7. Window Position Memory
**Edit**: `useWindowManager.ts`

On window close or position change, persist `{id, x, y, width}` to `localStorage("nova-window-memory")`. On `openWindow`, check for saved position and restore it. Clear entries older than 7 days.

### 8. Command Layer (Signature Feature)
**New file**: `src/components/sita/shell/CommandLayer.tsx`

Hold `Meta` key for 500ms to reveal a full-screen overlay showing:
- Grid of all available actions grouped by category (Files, Navigation, System)
- Each action shows icon + keyboard shortcut
- Glassmorphic overlay with 70% opacity background
- Release key to dismiss
- Click any action to execute + dismiss

Wire into `ShellLayout.tsx` via `keydown`/`keyup` event listeners.

### 9. Click Ripple + Micro-Details
**New file**: `src/components/sita/shell/ClickRipple.tsx`

A global click ripple effect:
- On `mousedown` anywhere on desktop surface, create a 24px circle at click point
- Expands to 48px over 300ms, fades from 0.15 to 0 opacity
- Color matches the current mood accent
- Pure CSS animation, removes self after completion

Also tune hover timing: add `transition-delay: 80ms` to dock icon hover scale.

## Files Changed
- 2 new: `IntentSuggestion.tsx`, `CommandLayer.tsx`, `ClickRipple.tsx` (3 new)
- 6 edits: `DesktopSurface.tsx`, `FloatingWindow.tsx`, `nova-os.ts`, `DesktopIconGrid.tsx`, `useWindowManager.ts`, `ShellLayout.tsx`

## Technical Constraints
- Living wallpaper uses `setInterval(30s)` + CSS transition — zero per-frame cost
- Magnetic edge pull integrates into existing RAF drag loop — no extra loop
- Stacked shadows are pure CSS, no runtime cost
- Command Layer uses `keydown`/`keyup` with 500ms `setTimeout` — no polling
- All animations stay within 150-300ms budget, transform+opacity only
- Window memory uses debounced localStorage writes (500ms after last move)
