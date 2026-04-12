

# Upgrade: Ambient Intelligence + Spatial Desktop + Zero-Latency + Universal Command

## What Exists vs What's Missing

All four systems exist but have significant gaps that prevent "wow":

| System | Has | Missing / Weak |
|---|---|---|
| **Ambient Context** | Activity graph, clipboard classify, co-access, suggestions | Form state capture, selection tracking, input focus memory, copy event listener (only polls clipboard), no visual context indicator showing "OS knows what you're doing" |
| **Spatial Desktop** | 3 zoom levels, 4 workspaces, minimap | App zoom is a placeholder with no content. No 4th "detail" zoom. No drag-to-reposition apps. No live app previews/thumbnails. No pinch gesture. No spatial arrow-key navigation between workspaces. Only 2-3 routes per workspace (missing many). Intelligence workspace missing entirely |
| **Zero-Latency** | Progressive phases, hover prefetch, scroll restore, pressed CSS | No page transition animation (no crossfade/slide), no skeleton shown during transition, no transition progress indicator, no preload on link focus (keyboard nav), pressed class only lasts 2 frames (invisible) |
| **Universal Command** | NL parse, calculator, history, contextual cmds | System commands don't actually execute (dark mode, lock, mute just close the palette). Window commands don't execute. No unit conversion execution. No "send file to" or automation. No ambient suggestions integration. Contextual command actions are empty stubs |

## Plan

### 1. Ambient Context Engine — Make It Feel Alive

**File**: `src/lib/services/ambient-context-engine.ts`
- Add `copy` event listener (instead of polling clipboard which requires permissions) — listen to `document.oncopy` and `document.oncut` events
- Track form input state: add `trackFormField(path, fieldName, value)` for automatic form restoration
- Track text selection: `trackSelection(path, selectedText)` — enables "search for selected" suggestions
- Add `getActivitySummary()` — returns human-readable "You've been working on X for Y minutes" for UI display
- Add `getRelatedFiles(currentPath)` — returns files/entities accessed alongside current page

**File**: `src/components/sita/AmbientSuggestionsBar.tsx`
- Add animated "thinking with you" pulse indicator when new suggestions arrive
- Add suggestion type icons (distinct visual per type instead of emoji)
- Add swipe-to-dismiss gesture on mobile
- Show relevance confidence as subtle bar
- Add "SITA noticed..." prefix for proactive suggestions to make it feel intelligent

### 2. Spatial Desktop — Beyond Mission Control

**File**: `src/components/sita/shell/SpatialDesktop.tsx`
- Add 5th "Intelligence" workspace (Advisors, Boardroom, Proof Center, Brain)
- Add many more routes to each workspace (Pulse, Revenue Office, Invoices, etc.)
- Replace empty "App" zoom level with actual embedded preview showing current route content via a mini-iframe or route screenshot
- Add arrow-key spatial navigation between workspace cards in overview
- Add animated particles/connection lines between related workspaces
- Add live activity indicators per workspace (badge count, last visit time)
- Add drag handles so users can reposition workspace cards (persist to localStorage)
- Add search/filter bar at top of overview to find apps across all workspaces
- Add smooth scale transition between zoom levels (not just opacity swap)

### 3. Zero-Latency — Feel Instant

**File**: `src/hooks/use-zero-latency.ts`
- Add page transition crossfade animation using `startViewTransition` API (with fallback)
- Make pressed feedback last 120ms with spring-back animation (currently invisible at 2 frames)
- Add focus-intent preloading (Tab key navigation triggers prefetch)
- Add transition progress bar at top of screen during route changes (thin animated line)
- Add optimistic content placeholder — show route-specific skeleton color matching destination workspace

**File**: `src/lib/services/predictive-prefetch.ts`
- Add confidence threshold display in dev mode
- Prefetch top 3 instead of top 2 predictions
- Add `prefetchOnIdle` — use `requestIdleCallback` to prefetch predicted routes during idle time

### 4. Universal Command — Actually Execute Everything

**File**: `src/components/sita/UniversalCommand.tsx`
- **Wire system commands to real actions**: dark mode → toggle `document.documentElement.classList`, lock → call shell `lock()`, mute → toggle notification state
- **Wire window commands**: tile/snap/minimize → call `useWindowManager` methods
- **Execute unit conversions**: km↔mi, kg↔lb, C↔F with actual conversion logic
- **Add ambient suggestions integration**: show top ambient suggestions in empty state
- **Fix contextual command stubs**: wire contextual commands to actual navigation
- **Add clipboard results**: "paste" → show clipboard content, "copy result" after calculation
- **Add "what was I doing" command**: returns ambient context activity summary
- **Add timer/stopwatch**: "start timer 5 min", "set reminder"
- **Add color preview**: typing hex/rgb shows color swatch inline
- **Improve empty state**: show keyboard shortcuts cheat sheet, recent files, workspace quick-switch

### 5. Integration Wiring

**File**: `src/components/sita/ShellLayout.tsx`
- Pass shell state setters (lock, theme toggle, notification mute) to UniversalCommand via props or context
- Wire CommandLayer's "mission" action to also offer spatial desktop

**File**: `src/components/sita/InteractionTracker.tsx`
- Add `copy`/`cut` event listeners feeding ambient context engine (replaces clipboard polling)
- Add form input change tracking via event delegation on `input`/`textarea` elements

## Files to Modify

| File | Changes |
|---|---|
| `src/lib/services/ambient-context-engine.ts` | Copy/cut events, form tracking, selection tracking, activity summary, related files |
| `src/components/sita/AmbientSuggestionsBar.tsx` | Thinking pulse, better icons, swipe dismiss, confidence bar, "SITA noticed" prefix |
| `src/components/sita/shell/SpatialDesktop.tsx` | 5th workspace, more routes, real app preview, arrow nav, activity badges, search, drag |
| `src/hooks/use-zero-latency.ts` | View transitions, better pressed feedback, focus-intent, progress bar |
| `src/lib/services/predictive-prefetch.ts` | Top 3, idle prefetch |
| `src/components/sita/UniversalCommand.tsx` | Execute all commands, unit conversion, ambient integration, clipboard, color preview |
| `src/components/sita/ShellLayout.tsx` | Pass shell controls to command layer |
| `src/components/sita/InteractionTracker.tsx` | Copy/cut listeners, form tracking |

## Implementation Order

1. Ambient Context Engine upgrades (copy events, form tracking, activity summary)
2. Universal Command — wire real execution for all commands
3. Spatial Desktop — more workspaces, app preview, arrow nav, activity badges
4. Zero-Latency — view transitions, progress bar, better feedback
5. Ambient Suggestions Bar — visual polish
6. Integration wiring (ShellLayout, InteractionTracker)

