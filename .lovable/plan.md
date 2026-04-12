

# Ambient Intelligence + Spatial Desktop + Zero-Latency + Universal Command Layer

## What Exists Today

| Feature | Current State |
|---|---|
| Contextual awareness | `InteractionTracker` captures dwell/navigation/clicks. `use-adaptive-personalization` has behavioral learning engine. `ContextualRail` shows entity details. `ContinuityBanner` resumes handoffs. |
| Spatial desktop | `useWindowManager` tracks window positions with localStorage memory. `CommandLayer` reveals system actions on Meta hold. No zoom levels or spatial navigation. |
| Zero-latency perception | `ClickRipple` exists. `PageSkeleton`/`SectionSkeleton` for loading states. No predictive preloading or optimistic transitions. |
| Universal command | `CommandPalette` (Cmd+K) searches apps/routes/actions. Time-based suggestions. No natural language commands, no system control, no automation. |

## Plan

### 1. Ambient Context Engine (`src/lib/services/ambient-context-engine.ts`)

Core intelligence service that observes all user activity and produces real-time contextual suggestions.

- **Activity graph**: Tracks current page, recent entities, clipboard contents, open windows, time patterns
- **Relation inference**: When user opens a file/entity, queries for related items (same client, same project, recent co-accessed)
- **Clipboard intelligence**: Monitors `navigator.clipboard` reads/writes, suggests paste targets, share actions, format conversions
- **Context restoration**: On app switch, stores full scroll position + form state + selection; restores on return
- **Proactive suggestions**: Emits `AmbientSuggestion[]` — typed recommendations (related files, next actions, relevant people) ranked by relevance score

### 2. Ambient Suggestions Rail (`src/components/sita/AmbientSuggestionsBar.tsx`)

Thin floating bar that appears contextually (not always visible).

- Shows 2-3 top suggestions from the Ambient Context Engine
- Types: "related entity", "clipboard action", "continue workflow", "predicted next"
- Appears with subtle animation near the user's last interaction zone
- Dismissible, learns from acceptance/dismissal patterns
- Wired into `InteractionTracker` for feedback loop

### 3. Spatial Desktop with Zoom Levels (`src/components/sita/shell/SpatialDesktop.tsx`)

Transform the flat desktop into a navigable spatial environment.

- **3 zoom levels**: Overview (all workspaces as cards) → Workspace (apps arranged spatially) → App (focused single app)
- Pinch/scroll zoom transitions between levels with smooth `framer-motion` animations
- Apps remember their spatial position per workspace (extend `useWindowManager` memory)
- Workspace groups: Business, Money, Concierge, System (mapped to domains)
- Minimap in corner showing current viewport position
- Keyboard: `Ctrl+-/+` for zoom, `Ctrl+arrow` for spatial navigation

### 4. Zero-Latency Perception System (`src/hooks/use-zero-latency.ts` + `src/lib/services/predictive-prefetch.ts`)

Make everything feel instant through prediction and progressive rendering.

- **Predictive prefetch**: Based on navigation patterns from `use-adaptive-personalization`, prefetch likely next routes via `<link rel="prefetch">`
- **Optimistic page transitions**: Show destination page skeleton immediately on click (<16ms), fade in real content
- **Hover intent preloading**: On sidebar/link hover for >100ms, begin data prefetch
- **Click feedback**: Extend `ClickRipple` — every interactive element gets instant visual response (<16ms)
- **Progressive data loading**: Critical data first (header/title), then details, then charts — each section animates in independently
- **Route transition orchestrator**: Manages enter/exit animations with content-aware timing

### 5. Universal Command Layer Upgrade (`src/components/sita/UniversalCommand.tsx`)

Rebuild the command palette as a true universal control interface.

- **Natural language parsing**: "resize window left", "send file to John", "show last week's revenue" — parsed into structured intents
- **System control commands**: "dark mode", "lock screen", "mute notifications", "set focus mode"
- **Window management**: "tile windows", "close all", "minimize background", "snap left/right"
- **Workflow automation**: "every Monday send pipeline report" — creates auto-rules via personalization engine
- **Inline results**: Show calculations, unit conversions, date math directly in palette
- **Command history**: Recent commands with frequency ranking
- **Fuzzy matching + aliases**: "biz" → Business Center, "money" → Money Center
- **Contextual commands**: Commands change based on current page (on Money page: "show cash flow", "add transaction")
- Categories: Navigation, System, Window, Automation, Calculate, Search

## Files to Create

| File | Purpose |
|---|---|
| `src/lib/services/ambient-context-engine.ts` | Activity graph, relation inference, clipboard monitoring, suggestion generation |
| `src/components/sita/AmbientSuggestionsBar.tsx` | Floating contextual suggestions UI |
| `src/components/sita/shell/SpatialDesktop.tsx` | Zoom-level spatial workspace navigator |
| `src/hooks/use-zero-latency.ts` | Predictive prefetch, hover preload, optimistic transitions |
| `src/lib/services/predictive-prefetch.ts` | Route prediction engine based on behavioral patterns |
| `src/components/sita/UniversalCommand.tsx` | Rebuilt universal command palette with NL parsing |

## Files to Modify

| File | Changes |
|---|---|
| `src/components/sita/InteractionTracker.tsx` | Feed events to ambient context engine, clipboard monitoring |
| `src/components/sita/ShellLayout.tsx` | Mount AmbientSuggestionsBar, SpatialDesktop, UniversalCommand, zero-latency hooks |
| `src/components/sita/CommandPalette.tsx` | Delegate to UniversalCommand or replace |
| `src/hooks/use-adaptive-personalization.ts` | Expose navigation patterns for predictive prefetch |
| `src/components/sita/shell/useShellState.ts` | Add spatial zoom level state |
| `src/components/sita/AppSidebar.tsx` | Add hover-intent preloading data attributes |

## Implementation Order

1. Ambient Context Engine (core intelligence)
2. Predictive Prefetch + Zero-Latency hooks
3. Universal Command Layer
4. Spatial Desktop
5. Ambient Suggestions Bar
6. Wire everything into ShellLayout + InteractionTracker

