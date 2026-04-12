

# God Tier Features 11-16: Adaptive Visuals + Hold-Key Command + Seamless Multitasking + Background Intelligence + Signature Micro-Details

## Current State

| Feature | Exists | Gap |
|---|---|---|
| **11. Adaptive Visual System** | Wallpaper themes with time-of-day auto mode. `colorTemperature` in adaptive interface (warm/neutral/cool). | No wallpaper-to-UI color extraction. No dynamic accent colors from wallpaper. No time-based tone shift on surfaces (just wallpaper gradient changes). |
| **12. Hold-Key Command Overlay** | `UniversalCommand` (Cmd+K) and `CommandLayer` exist. Full NL parser. | No "hold a key" instant overlay showing all available actions contextually. Must type Cmd+K first. No visual action map. |
| **13. Seamless Multitasking** | FlowSpace + SpatialDesktop + View Transition API. Scroll restore. | Route transitions still feel like page switches. No crossfade between app content areas. No "morphing" between views. |
| **14. Background Intelligence** | Predictive prefetch, session persistence, routine detection. Service worker registered. | No dedicated background task runner. No memory cleanup scheduler. No preload orchestrator. No file/entity organization. |
| **15. Signature Micro-Details** | `MI_TIMINGS` (hover 80ms), `sita-pressed` spring-back, `SoundEngine` clicks, `ClickRipple`. | Sound not synced to spring-back. No "soft" window open (windows pop in). No cursor velocity awareness on buttons. No hover glow. |
| **16. Signature Feature** | FlowSpace is the strongest candidate. | Not branded/polished as THE identity. No "wow" entry animation. No distinctive visual signature. |

## Plan

### 1. Adaptive Visual System (`src/lib/services/adaptive-visual-system.ts` -- CREATE)

Extract dominant colors from current wallpaper gradient and inject as CSS custom properties:

- Parse wallpaper HSL values from gradient string using regex
- Derive `--adaptive-accent`, `--adaptive-surface`, `--adaptive-glow` from wallpaper dominant hue
- Time-of-day tone modulation: morning = warm gold tint, afternoon = neutral, evening = warm amber, night = cool blue
- Apply as CSS vars on `:root` — all surfaces subtly tint to match wallpaper
- Update on wallpaper change and every 30 min for time shifts
- Hook: `useAdaptiveVisuals()` wired into ShellLayout

### 2. Hold-Key Command Overlay (`src/components/sita/shell/HoldKeyOverlay.tsx` -- CREATE)

Hold `Alt`/`Option` for 300ms → instant translucent overlay showing all available actions:

- Grid of contextual actions based on current page (navigate, window, system)
- Each action shows its keyboard shortcut
- Release key = dismiss. Click action = execute + dismiss
- Visual: frosted glass fullscreen overlay, actions in a radial/grid layout
- Actions sourced from UniversalCommand's route aliases + system commands
- Page-aware: on `/money` shows finance actions, on `/business` shows business actions

### 3. Seamless App Transitions (`src/components/sita/shell/AppTransitionLayer.tsx` -- CREATE)

Continuous morphing between route changes instead of hard page switches:

- Wrap main content area in a transition container
- On route change: crossfade old → new content (opacity 1→0 and 0→1, 200ms)
- Shared elements (headers, sidebars) don't transition — only main content morphs
- Use `startViewTransition` with `view-transition-name` on key elements
- Add CSS `::view-transition-old/new` styles for slide + fade
- Wire into ShellLayout's `<main>` wrapper

### 4. Background Intelligence Engine (`src/lib/services/background-intelligence.ts` -- CREATE)

Invisible maintenance that makes the OS feel smooth:

- **Memory cleanup**: Every 5 min, prune stale localStorage entries (expired sessions, old nav transitions beyond 500)
- **Prefetch orchestrator**: During idle, prefetch top 3 predicted routes + their data
- **Entity organization**: Track entity access frequency, auto-sort recent files/contacts
- **Health monitor**: Track JS heap size via `performance.memory`, warn if > 80% budget
- **Stale cache eviction**: Clear cached responses older than 1 hour
- Runs entirely via `requestIdleCallback` — zero impact on user interactions
- Hook: `useBackgroundIntelligence()` in ShellLayout, starts on mount

### 5. Signature Micro-Details (multiple files)

**Window Open Animation** (`FloatingWindow.tsx`):
- Replace instant appear with "soft" spring: scale 0.85→1.02→1.0, opacity 0→1, 300ms
- Origin morph from dock icon position (already has `originRect` prop — wire it)
- Subtle blur-in on content (blur 4px→0 during open)

**Hover Glow** (`index.css`):
- Interactive elements get subtle radial gradient glow following cursor on hover
- 80ms delay matching `MI_TIMINGS.hover`
- Buttons: `box-shadow: 0 0 20px hsl(var(--primary) / 0.15)` on hover

**Sound Sync** (`FloatingWindow.tsx` + `use-zero-latency.ts`):
- Window open → `SoundEngine.click()` on mount
- Button press (sita-pressed) → `SoundEngine.click()` synced to spring-back
- Window snap → `SoundEngine.approve()` on snap detection

**Cursor Velocity on Buttons** (`use-zero-latency.ts`):
- Track pointer velocity globally
- Fast click = smaller spring (scale 0.98), slow deliberate click = full spring (scale 0.94)
- Makes buttons feel responsive to intent

### 6. FlowSpace Signature Polish (`FlowSpace.tsx` + `index.css`)

Brand FlowSpace as THE identity feature:

- **Entry animation**: Zoom-out with parallax depth (windows fly back in Z-space, 400ms spring)
- **Ambient particles**: Subtle floating dots connecting related windows with thin lines
- **Signature glow**: Active window gets pulsing primary-color border glow
- **Sound**: `SoundEngine.boot()` on FlowSpace open (shortened to 200ms)
- **Exit**: Reverse zoom-in, selected window flies forward to fill screen

## Files

| File | Action |
|---|---|
| `src/lib/services/adaptive-visual-system.ts` | **CREATE** — wallpaper color extraction + time-of-day toning |
| `src/components/sita/shell/HoldKeyOverlay.tsx` | **CREATE** — hold-Alt instant action overlay |
| `src/components/sita/shell/AppTransitionLayer.tsx` | **CREATE** — crossfade transition wrapper |
| `src/lib/services/background-intelligence.ts` | **CREATE** — invisible maintenance engine |
| `src/components/sita/shell/FloatingWindow.tsx` | **MODIFY** — soft open animation, sound sync |
| `src/hooks/use-zero-latency.ts` | **MODIFY** — cursor velocity tracking, sound-synced press |
| `src/index.css` | **MODIFY** — hover glow, view-transition CSS, FlowSpace signature styles |
| `src/components/sita/shell/FlowSpace.tsx` | **MODIFY** — entry/exit zoom parallax, ambient particles, signature glow |
| `src/components/sita/ShellLayout.tsx` | **MODIFY** — mount adaptive visuals, hold-key overlay, background intelligence, transition layer |

## Order

1. Adaptive Visual System (color extraction + CSS vars)
2. Background Intelligence Engine (invisible maintenance)
3. Signature Micro-Details (window open, hover glow, sound sync, velocity)
4. Hold-Key Command Overlay
5. Seamless App Transitions (crossfade layer)
6. FlowSpace Signature Polish

