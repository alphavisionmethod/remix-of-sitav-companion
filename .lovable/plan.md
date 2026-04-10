

# SITA OS Admin Control Plane — Gap Analysis & Implementation Plan

## Audit Summary

After thorough codebase inspection, the admin control plane has **strong coverage** across 22+ operator surfaces, 16 truth components, and 12 ATLAS pages. However, several spec requirements remain unimplemented:

### MISSING PAGES (4 entirely absent)

1. **Intelligence Dashboard** (`/admin/intelligence`) — No page exists. Spec requires: incident forecasting, anomaly detection, cost optimization, trend momentum, confidence scoring, preventive recommendations, root-cause-linked insights.

2. **Founder Council** (`/admin/founder-council`) — No page exists. Spec requires: decision proposals, strategic context, stakeholder impact, council recommendations, historical precedent, implementation risk, confidence scores, approval linkage.

3. **Canonical Chain Explorer** (`/admin/chain-explorer`) — No page exists. Spec requires: trigger → policy → approval → execution → event → receipt → projection → replay/rollback tracing for any single action.

4. **Release Ring Command Board** (`/admin/release-ring`) — No page exists. Spec requires: Ring 0/1/2 readiness, blockers, evidence checklists, feedback gates, incident impact, promotion actions, rollback visibility.

### MISSING POWER-USER SYSTEM (3 components absent)

5. **Global Command Palette** (`Cmd+K`) — The `cmdk` library exists, but no `AdminCommandPalette` component is wired. Spec requires: fuzzy search, route/action/record search, recent actions, pinned commands, keyboard-only execution.

6. **Keyboard Shortcuts System** — No global shortcut handler exists. Spec requires: `Cmd+K`, `J/K` navigation, `Cmd+Z/Shift+Z` undo/redo, `Cmd+R` refresh, investigation keys (F/T/M/G/P).

7. **Shortcut Overlay** (`?`) — No overlay component. Spec requires: categorized shortcut display triggered by `?` key.

### PAGES NEEDING DEPTH UPGRADE (2 pages)

8. **AlertTriageBoard** (118 LOC, single filter) — Missing: cluster grouping view, ownership assignment panel, suppression management, investigation launch workflow, time-to-breach countdown. Needs tabs for severity lanes, cluster themes, suppression state.

9. **MissionControlHome** (191 LOC) — Missing: projection freshness warnings, admin durability warnings, council/decision pulse, "what changed since last visit" section, deployment readiness summary, proof coverage highlights as live indicators.

---

## Implementation Plan

### Step 1 — Create 4 Missing Pages

**IntelligenceDashboard.tsx** (~250 LOC)
- 4 tabs: Smart Alerts, Forecasts, Optimization, Strategic Intelligence
- IntelligenceCard components with confidence scores, evidence links, trend indicators
- Demo data for 6+ forecasts, 4+ optimizations, 3+ strategic insights

**FounderCouncilBoard.tsx** (~200 LOC)
- Decision proposals list with status, stakeholder impact, confidence scores
- Historical precedent panel, implementation risk assessment
- Approval/receipt linkage for each decision

**CanonicalChainExplorer.tsx** (~230 LOC)
- Step-by-step chain visualization: trigger → policy → approval → execution → event → receipt → projection
- Evidence cards per step, branch chooser, proof artifact panel
- Demo data for 3+ capability chains

**ReleaseRingCommandBoard.tsx** (~220 LOC)
- Ring 0/1/2 status cards with readiness scores
- Blocker lane, evidence checklists, feedback gates
- Promotion action bar with rollback visibility

### Step 2 — Build Global Command Palette

**AdminCommandPalette.tsx** (~180 LOC)
- Uses existing `cmdk` library
- `Cmd+K` to open, fuzzy search across routes/actions/records
- Sections: Navigation, Actions, Recent, Pinned
- Integrated into admin layout

### Step 3 — Build Keyboard System

**AdminKeyboardShortcuts.tsx** (~120 LOC)
- Global `useEffect` listener for all spec shortcuts
- `?` triggers ShortcutOverlay modal
- `Cmd+K` opens command palette
- `Cmd+R` refresh, `J/K` nav, investigation keys

**ShortcutOverlay.tsx** (~80 LOC)
- Categorized shortcut display (Global, Navigation, Editing, Investigation)

### Step 4 — Upgrade AlertTriageBoard

Expand from 118 → ~250 LOC:
- Add tabs: Severity Lanes, Cluster Themes, Suppression, Ownership
- Add cluster grouping, ownership assignment, time-to-breach countdown
- Add investigation launch workflow

### Step 5 — Upgrade MissionControlHome

Expand from 191 → ~300 LOC:
- Add "What Changed" section showing recent mutations/events
- Add projection freshness warnings banner
- Add admin durability warnings
- Add deployment readiness + proof coverage as live KPIs
- Add council decision pulse

### Step 6 — Wire Routes in App.tsx

Add 4 new lazy imports and routes:
- `/admin/intelligence` → IntelligenceDashboard
- `/admin/founder-council` → FounderCouncilBoard
- `/admin/chain-explorer` → CanonicalChainExplorer
- `/admin/release-ring` → ReleaseRingCommandBoard

### Step 7 — Integrate Command Palette into Shell

Wire AdminCommandPalette into the admin layout so it's accessible from any admin page via `Cmd+K`.

### Files Created/Modified

| File | Action |
|---|---|
| `src/pages/admin/IntelligenceDashboard.tsx` | **NEW** |
| `src/pages/admin/FounderCouncilBoard.tsx` | **NEW** |
| `src/pages/admin/CanonicalChainExplorer.tsx` | **NEW** |
| `src/pages/admin/ReleaseRingCommandBoard.tsx` | **NEW** |
| `src/components/admin/AdminCommandPalette.tsx` | **NEW** |
| `src/components/admin/AdminKeyboardShortcuts.tsx` | **NEW** |
| `src/components/admin/ShortcutOverlay.tsx` | **NEW** |
| `src/pages/admin/AlertTriageBoard.tsx` | **UPGRADE** |
| `src/pages/admin/MissionControlHome.tsx` | **UPGRADE** |
| `src/App.tsx` | **MODIFY** (add 4 routes) |

No duplicates. All new pages use existing demo data patterns and truth components.

