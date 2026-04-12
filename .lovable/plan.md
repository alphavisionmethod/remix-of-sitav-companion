

# Upgrade: Ambient Intelligence + Spatial Desktop + Zero-Latency + Universal Command

## Current Gaps

| System | Gap |
|---|---|
| **Ambient Context** | Clipboard uses polling (requires permissions, often fails). No `copy`/`cut` event listeners. No form state tracking. No selection tracking. No `getActivitySummary()`. No `getRelatedFiles()`. |
| **Spatial Desktop** | Only 4 workspaces with 2-3 routes each. App zoom level is empty placeholder. No arrow-key navigation. No activity badges. No search/filter. No 5th Intelligence workspace. |
| **Zero-Latency** | Pressed feedback lasts 2 frames (invisible). No view transition API. No focus-intent prefetch (keyboard Tab). No transition progress bar. Only prefetches top 2 (should be 3). No `requestIdleCallback` prefetch. |
| **Universal Command** | System commands (dark mode, lock, mute) just close palette — don't execute. Window commands don't execute. No unit conversion execution. Contextual commands are stubs. No ambient suggestions in empty state. No "what was I doing" command. No color preview. |
| **Suggestions Bar** | No "SITA noticed" prefix. No thinking pulse. No confidence indicator. |
| **InteractionTracker** | No `copy`/`cut` event delegation. No form input tracking. |

## Plan

### 1. Ambient Context Engine — event-driven clipboard + form tracking + activity summary

**File**: `src/lib/services/ambient-context-engine.ts`

- Replace clipboard polling with `trackClipboardEvent(text, source)` method called from InteractionTracker's `copy`/`cut` listeners
- Remove the `setInterval` clipboard monitor entirely
- Add `trackFormField(path, fieldName, value)` — stores form state per page for context restoration
- Add `trackSelection(path, selectedText)` — enables "search for selection" suggestions
- Add `getActivitySummary()` — returns `{ currentFocus, durationMinutes, recentPages, topEntities }` for UI display
- Add `getRelatedFiles(path)` — returns co-accessed pages for current path

### 2. Universal Command — wire real execution

**File**: `src/components/sita/UniversalCommand.tsx`

- Accept `onSystemCommand` prop: `(cmd: string, args?: Record<string,string>) => void`
- Dark mode → `document.documentElement.classList.toggle('dark')`
- Lock → call `onSystemCommand('lock')`
- Mute → call `onSystemCommand('mute')`
- Unit conversions: implement km↔mi, kg↔lb, C↔F, USD↔EUR with actual math
- Add "what was I doing" command → calls `ambientContext.getActivitySummary()`
- Show ambient suggestions in empty state (no query)
- Wire contextual commands to actual `navigate()` calls
- Add color preview: hex/rgb input shows color swatch inline
- Add clipboard content display: "paste" shows what's in clipboard

### 3. Spatial Desktop — 5 workspaces, more routes, arrow nav, activity

**File**: `src/components/sita/shell/SpatialDesktop.tsx`

- Add 5th "Intelligence" workspace (Advisors, Boardroom, Brain, Proof Center)
- Expand each workspace to 5-6 routes (Pulse, Revenue Office, Invoices, Cash Flow, Pipeline, etc.)
- Replace empty App zoom level with list of recent activity + route preview cards
- Add arrow-key navigation between workspace cards in overview
- Add activity badges per workspace (last visit time, access count from ambient context)
- Add search/filter bar at top of overview
- Add animated connection lines between workspaces showing cross-domain navigation frequency

### 4. Zero-Latency — real feedback + view transitions + idle prefetch

**File**: `src/hooks/use-zero-latency.ts`

- Extend pressed feedback to 120ms with CSS transition (scale 0.97 → 1.0 spring-back)
- Add `startViewTransition` API usage for route changes (with fallback)
- Add focus-intent preloading: Tab key on links triggers prefetch
- Add thin progress bar at top during route transitions

**File**: `src/lib/services/predictive-prefetch.ts`

- Prefetch top 3 instead of 2
- Add `prefetchOnIdle()` using `requestIdleCallback` for predicted routes during idle

### 5. Ambient Suggestions Bar — polish

**File**: `src/components/sita/AmbientSuggestionsBar.tsx`

- Add "SITA noticed..." prefix for proactive suggestions
- Add animated thinking pulse when new suggestions arrive
- Add subtle relevance confidence bar per suggestion
- Replace emoji icons with Lucide icons matching suggestion type

### 6. InteractionTracker — feed events

**File**: `src/components/sita/InteractionTracker.tsx`

- Add `copy`/`cut` event listeners via event delegation, feed to `ambientContext.trackClipboardEvent()`
- Add `input`/`change` event delegation on form fields, feed to `ambientContext.trackFormField()`

### 7. ShellLayout — wire system commands

**File**: `src/components/sita/ShellLayout.tsx`

- Pass `onSystemCommand` handler to `UniversalCommand` that dispatches lock/mute/theme/spatial commands to shell state

## Files Modified

| File | Action |
|---|---|
| `src/lib/services/ambient-context-engine.ts` | Modify — event-driven clipboard, form tracking, activity summary, related files |
| `src/components/sita/UniversalCommand.tsx` | Modify — real execution, unit conversion, color preview, ambient integration |
| `src/components/sita/shell/SpatialDesktop.tsx` | Modify — 5 workspaces, more routes, arrow nav, activity badges, search |
| `src/hooks/use-zero-latency.ts` | Modify — view transitions, better feedback, focus-intent, progress bar |
| `src/lib/services/predictive-prefetch.ts` | Modify — top 3, idle prefetch |
| `src/components/sita/AmbientSuggestionsBar.tsx` | Modify — SITA noticed prefix, pulse, confidence bar |
| `src/components/sita/InteractionTracker.tsx` | Modify — copy/cut/form event delegation |
| `src/components/sita/ShellLayout.tsx` | Modify — wire system command handler |

## Implementation Order

1. Ambient Context Engine (foundation for everything else)
2. InteractionTracker (feeds the engine)
3. Universal Command (executes real actions)
4. Spatial Desktop (5 workspaces, navigation)
5. Zero-Latency (transitions, feedback)
6. Ambient Suggestions Bar (polish)
7. ShellLayout (wiring)

