

# Memory-Based OS + Micro-Interactions + Calm Mode + State Continuity + Intent Automation

## What Exists vs What's Missing

| Feature | Exists | Missing |
|---|---|---|
| **Memory-Based OS** | Window position memory (localStorage, 7-day TTL). Context snapshots per page (scroll, form). | No full session restore on restart — windows don't reopen. No tab/open-app persistence. No "everything exactly where you left it." |
| **Micro-Interactions** | `FloatingWindow` has magnetic snapping (20px range). Dock has bounce + magnification. `ClickRipple` exists. `sita-pressed` 120ms feedback. | Dock magnification is index-based not cursor-distance-based (not velocity-reactive). No "soft" button physics. Window snap has no preview overlay. No haptic-feel spring on button release. |
| **Calm Mode** | CSS class `.calm-mode` exists — desaturates colors, kills animations. `CalmEngineContext` has idle detection + layer opacity. Mode toggle in AppearanceContext. | No auto-trigger on inactivity. No gradual transition (snap on/off). No progressive simplification (hide secondary UI first, then reduce contrast). No breathing/ambient animation in calm. |
| **State Continuity** | `ambientContext.saveContext()` saves scroll + form per path. Window positions persisted. | No session-level app/window restoration. Closing browser = lose all windows. No "reopen where I left off." |
| **Intent Automation** | Personalization engine tracks patterns. Auto-rules exist (evening calm). App surfacing tracks launch frequency. | No routine detection ("you always open X+Y+Z together"). No "Start your morning?" suggestion. No workspace presets from behavior. |

## Plan

### 1. Session Persistence Manager (`src/lib/services/session-persistence.ts`)

Full session state serialization/restore for "everything exactly where you left it":

- **Serialize on beforeunload**: open windows (ids, positions, sizes), current route, sidebar state, open panels, scroll positions, form data
- **Restore on mount**: reopen all windows, navigate to last route, restore scroll positions
- **Storage**: localStorage with `sita-session-state` key, 24hr TTL
- **Partial restore**: if a window component fails to load, skip it gracefully
- **API**: `persistSession()`, `restoreSession()`, `clearSession()`

### 2. Session Restore Hook + UI (`src/hooks/use-session-restore.ts`)

- Hook that checks for saved session on mount
- If found, shows a toast: "Restore your last session?" with Accept/Dismiss
- On accept: calls `restoreSession()` — reopens windows, navigates, scrolls
- Wired into `ShellLayout.tsx`

### 3. Dock Velocity-Reactive Magnification (`DesktopDock.tsx`)

Upgrade from index-distance to cursor-distance magnification with velocity dampening:

- Track `mousemove` on dock, compute pixel distance from each icon center
- Scale = gaussian falloff based on pixel distance (not array index)
- Track cursor velocity (dx/dt) — faster cursor = less magnification (user is passing through)
- Slow cursor = full magnification (user is targeting)
- Spring physics for scale transitions (not linear)

### 4. Soft Button Physics (`src/index.css` + `use-zero-latency.ts`)

- Upgrade `sita-pressed` from flat scale to spring curve: `scale(0.96)` → `scale(1.02)` → `scale(1.0)` with cubic-bezier
- Add subtle `box-shadow` compression on press (shadow shrinks)
- Add `will-change: transform` for GPU acceleration
- Buttons feel like they have physical depth

### 5. Window Snap Preview Overlay (`FloatingWindow.tsx`)

- During drag near edge, show translucent preview rectangle where window will snap
- Uses existing `detectSnapZone` + `getSnapRect` from `snap-zones.ts`
- Animated overlay fades in/out with 150ms transition
- Magnetic pull intensifies as cursor approaches edge

### 6. Advanced Calm Mode (`src/hooks/use-calm-mode.ts`)

Progressive calm mode with auto-trigger:

- **Auto-trigger**: after 3 minutes of inactivity (from `CalmEngineContext` idle detection), gradually enter calm
- **3 calm levels**: Level 1 (reduce notification badges, mute sounds), Level 2 (desaturate non-essential UI, hide secondary nav items), Level 3 (full calm — current `.calm-mode` CSS)
- **Gradual transitions**: each level fades in over 2s (not instant toggle)
- **Breathing ambient**: subtle pulsing glow on primary surfaces in calm mode (slow 8s cycle)
- **Exit on interaction**: any click/key instantly starts exit transition (500ms)
- **Manual override**: `Cmd+,` toggles calm on/off

### 7. Intent-Driven Routine Detection (`src/lib/services/routine-detector.ts`)

Detect behavioral patterns and suggest workspace presets:

- Track app launch sequences with timestamps (from `useAppSurfacing`)
- Detect co-launches: "User opens Business + Money + Pulse within 5 min" → routine
- Time-of-day correlation: morning routines, evening wind-down
- Minimum 3 occurrences before suggesting
- Generate `RoutineSuggestion`: "Start your morning? Open Business Center, Money Center, Daily Pulse"
- Feed suggestions into `AmbientSuggestionsBar` as `predicted_next` type

### 8. Integration Wiring

**`ShellLayout.tsx`**: Mount `useSessionRestore()`, wire `beforeunload` for session persistence, pass calm level to UI

**`useWindowManager.ts`**: Add `getWindowStates()` for serialization and `restoreWindows(states[])` for deserialization

**`AmbientSuggestionsBar.tsx`**: Accept routine suggestions from detector

## Files

| File | Action |
|---|---|
| `src/lib/services/session-persistence.ts` | **CREATE** — session serialization/restore |
| `src/hooks/use-session-restore.ts` | **CREATE** — restore hook with toast UI |
| `src/lib/services/routine-detector.ts` | **CREATE** — intent/routine detection engine |
| `src/hooks/use-calm-mode.ts` | **CREATE** — progressive auto-calm with levels |
| `src/components/sita/DesktopDock.tsx` | **MODIFY** — velocity-reactive magnification |
| `src/components/sita/shell/FloatingWindow.tsx` | **MODIFY** — snap preview overlay during drag |
| `src/hooks/useWindowManager.ts` | **MODIFY** — add serialization/restore methods |
| `src/hooks/use-zero-latency.ts` | **MODIFY** — soft button spring physics |
| `src/index.css` | **MODIFY** — enhanced pressed states, calm breathing, calm levels |
| `src/components/sita/ShellLayout.tsx` | **MODIFY** — mount session restore, calm mode, routine detector |
| `src/components/sita/AmbientSuggestionsBar.tsx` | **MODIFY** — accept routine suggestions |

## Implementation Order

1. Session Persistence Manager + Window Manager serialization
2. Session Restore Hook + ShellLayout wiring
3. Dock velocity-reactive magnification
4. Soft button physics (CSS + zero-latency)
5. Window snap preview overlay
6. Progressive Calm Mode
7. Routine Detection engine
8. Integration + Ambient Suggestions wiring

