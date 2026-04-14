

# Concierge OS — Full Windowed App Merge

## What This Does
Converts the Concierge domain from a route-based `ConciergeCenter.tsx` page into a fully windowed app (matching Business OS and Finance OS patterns). All 19 sub-pages become internal modules within `ConciergeAppShell`, with event-based deep-linking, collapsible sidebar groups, and the redirect shim pattern.

## Current State
- `ConciergeAppShell.tsx` (windowed) has only 7 modules, most show "DATA CANVAS" placeholders
- `ConciergeCenter.tsx` (route-based) has all 19 pages properly wired with imports and page components
- No `sita-open-concierge` event exists — no deep-linking or launcher integration
- No `concierge-launcher.ts` utility exists
- Route-based concierge still renders inside the OS shell as a page, not a true windowed app

## Implementation Plan — 3 Batches

### Batch 1: Rewrite ConciergeAppShell with full page registry + sidebar groups

**File: `src/components/sita/apps/concierge/ConciergeAppShell.tsx`** — Complete rewrite:
- Import all 19 page components from `src/pages/concierge/`
- Define 4 collapsible sidebar groups matching existing `TAB_GROUPS` from ConciergeCenter (Home, Life, Support, Office)
- Create full `pages` record mapping all 19 module IDs to components
- Add `SidebarGroupSection` component (reuse pattern from BusinessAppShell)
- Add `ConciergeDataProvider` wrapper with `useRelationshipContexts` and `useHumanObligations` hooks
- Add `sita-concierge-navigate` event listener for deep-linking
- Wire Boardroom, Advisors, and Pipeline Health views (already exist as inline components)
- Add header toolbar with current page label
- Add `BoardroomStatusStrip` (already exists in file)
- Concierge accent: purple `hsl(270 60% 55%)`

**New file: `src/lib/concierge-launcher.ts`**:
- `openConciergeModule(module)` — dispatches `sita-open-concierge` custom event
- Matches pattern of `business-launcher.ts` and `finance-launcher.ts`

### Batch 2: Wire event system + redirect shim

**File: `src/components/sita/ShellLayout.tsx`** — Add event listener:
- Add `sita-open-concierge` listener (matching business/finance pattern)
- Sets `window.__conciergeInitialModule`, calls `doLaunchApp("concierge")`, dispatches `sita-concierge-navigate`

**File: `src/pages/ConciergeCenter.tsx`** — Convert to redirect shim:
- Same pattern as `BusinessCenter.tsx` — extract module from path, dispatch `sita-open-concierge`, redirect to `/desktop`

**File: `src/contexts/ConciergeNavigationContext.tsx`** — New context:
- `navigateTo(moduleKey)` and `activeModule` — matches `BusinessNavigationContext`

### Batch 3: Integration polish

**File: `src/components/sita/shell/ShellWindowLayer.tsx`** — Already wired (concierge entry exists)

**File: `src/components/sita/CommandPalette.tsx`** — Add concierge deep-link dispatches for relevant actions

**Update cross-references**: Any component that currently navigates to `/concierge/*` routes should instead dispatch `sita-open-concierge` events (scan and update `DailyPulse.tsx`, `GlobalBoardroom.tsx`, etc.)

## Files

| File | Action | Batch |
|------|--------|-------|
| `src/components/sita/apps/concierge/ConciergeAppShell.tsx` | Rewrite — full 19-page shell | 1 |
| `src/lib/concierge-launcher.ts` | Create — event dispatcher | 1 |
| `src/contexts/ConciergeNavigationContext.tsx` | Create — nav context | 2 |
| `src/components/sita/ShellLayout.tsx` | Add concierge event listener | 2 |
| `src/pages/ConciergeCenter.tsx` | Convert to redirect shim | 2 |
| `src/components/sita/CommandPalette.tsx` | Add concierge deep-links | 3 |
| Cross-reference files (DailyPulse, GlobalBoardroom, etc.) | Update navigations | 3 |

No database changes needed.

