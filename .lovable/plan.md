

# SITA OS — Admin Architecture Normalization Plan

## Executive Verdict

The current admin route tree is **fragmented and needs consolidation**. There are 4 overlapping admin surfaces rendering conceptually similar content:

| Surface | File | Lines | Purpose |
|---------|------|-------|---------|
| `MissionControl.tsx` | `src/pages/MissionControl.tsx` | 305 | Legacy admin with real Supabase API calls |
| `MissionControlPage.tsx` | `src/pages/mission-control/` | 1118 | Rebuilt 23-tab advanced ops with mock data |
| `OwnerCenter.tsx` | `src/pages/OwnerCenter.tsx` | 2255 | 20-tab mega-component (incidents, connectors, costs, fleet, etc.) |
| `OwnerModePage.tsx` | `src/pages/owner-mode/` | 441 | 6-tab founder-safe control room |

Plus 7 standalone `owner/*` pages (Home, Health, Pulse, Trust, Approvals, AiTeam, AiTeamUpdates) that **overlap** with OwnerCenter tabs — both render incidents, connectors, trust, costs, etc. with different data sources and different quality levels.

## Exact Architectural Problems

1. **Two MissionControl files** — `MissionControl.tsx` (legacy, 305 lines, real API) and `mission-control/MissionControlPage.tsx` (rebuilt, 1118 lines, mocks). Both route to `/mission-control`.
2. **OwnerCenter has 20 tabs** covering the same domains as the 7 standalone `owner/*` pages — incidents, trust, connectors, costs, AI team all exist in both.
3. **Three incident surfaces** — OwnerCenter "incidents" tab, MissionControlPage "incidents" tab, and `/incidents` redirect.
4. **Three connector surfaces** — OwnerCenter "connectors" tab, MissionControlPage "connectors" tab, ConnectorHub standalone.
5. **Three cost surfaces** — OwnerCenter "costs" tab, MissionControlPage "costs" tab, standalone owner cost views.
6. **Trust rendered in 4 places** — OwnerCenter "trust-center" tab, MissionControlPage "trust" tab, OwnerTrustPage, OwnerModePage "Risk & Trust" tab.
7. **Sidebar shows 3 admin entry points** (Owner Mode, Mission Control, Owner Workspace) — confusing for users.

## Canonical Route Hierarchy (Final)

```text
LAYER 1 — Founder-Safe
/owner-mode                     → Single-page tabbed control room (absorbs 15 child concepts)

LAYER 2 — Advanced Owner Workspace  
/owner                          → OwnerCenter (keeps 20 tabs — this is the power user surface)
/owner/home                     → REMOVE (duplicate of /owner overview tab)
/owner/health                   → REMOVE (duplicate of /owner connectors + fleet tabs)
/owner/pulse                    → KEEP (unique boardroom pulse — not in OwnerCenter)
/owner/trust                    → REMOVE (duplicate of /owner trust-center tab)
/owner/approvals                → KEEP (unique dedicated approval workflow)
/owner/ai-team                  → REMOVE (duplicate of /owner workforce tab)
/owner/ai-team/updates          → KEEP (unique updates feed — not in OwnerCenter)
/owner/leases                   → KEEP (unique)
/owner/constitution             → KEEP (unique)
/owner/pricing                  → KEEP (unique)
/owner/packs                    → KEEP (unique)
/owner/advisors                 → KEEP (unique)

LAYER 3 — Mission Ops (drill-downs only)
/mission-control                → MissionControlPage (23-tab ops view)
/mission/overview               → Advanced ops dashboard
/mission/connectors/:id         → Connector drill-down
/mission/incidents/:id          → Incident investigation
/mission/policies/simulate      → Advanced scenario builder
/mission/registry               → System registry
/mission/releases/:id           → Release detail
/mission/workflows/:id/replay   → Workflow replay detail
/mission/error                  → Premium error state

GLOBAL TOOLS
/policy-simulator               → Founder-safe simulation hub
/workflow-replay                → Replay hub/search
/observability                  → Telemetry center
/users                          → User admin

DEPRECATED
/incidents                      → Already redirects to /mission-control ✓
/policies/simulator             → Already redirects to /policy-simulator ✓
/owner-mode/home                → Already redirects to /owner-mode ✓
```

## Implementation Steps

### Step 1: Remove duplicate Owner pages (4 files)
Delete these files — their functionality already exists as tabs in OwnerCenter:
- `src/pages/owner/OwnerHomePage.tsx` → `/owner` overview tab covers this
- `src/pages/owner/OwnerHealthPage.tsx` → `/owner` connectors + fleet tabs cover this
- `src/pages/owner/OwnerTrustPage.tsx` → `/owner` trust-center tab covers this
- `src/pages/owner/OwnerAiTeamPage.tsx` → `/owner` workforce tab covers this

### Step 2: Remove legacy MissionControl
Delete `src/pages/MissionControl.tsx` (305 lines, legacy API approach) — `mission-control/MissionControlPage.tsx` is the canonical replacement.

### Step 3: Clean up App.tsx routes
- Remove routes for deleted pages (`/owner/home`, `/owner/health`, `/owner/trust`, `/owner/ai-team`)
- Add redirects: `/owner/home` → `/owner`, `/owner/health` → `/owner`, `/owner/trust` → `/owner/trust-center`, `/owner/ai-team` → `/owner/internal-agents`
- Point `/mission-control` import to `MissionControlPage` (not legacy `MissionControl`)

### Step 4: Simplify sidebar navigation
Reduce admin sidebar from 3 entry points to 2 clearly labeled options:
- **"Simple Mode"** → `/owner-mode` (founder-safe)
- **"Control Room"** → `/owner` (advanced, with sub-links for mission-control, policy-simulator, etc.)

Remove the separate "Owner Workspace" link — it's confusing alongside "Owner Mode".

### Step 5: Wire MissionControlPage to use real data hooks
Replace mock imports in `MissionControlPage.tsx` with the existing admin hooks (`useAdminIncidents`, `useFleetHealth`, `useTrustCenter`, etc.) that OwnerCenter already uses — ensuring both surfaces share one data layer.

### Step 6: Add cross-navigation between layers
- OwnerModePage "What Matters Now" items should link to `/owner` tabs (not standalone pages)
- OwnerCenter tab headers should link to `/mission/*` drill-downs where applicable
- MissionControlPage should link to `/mission/*` drill-downs

## Anti-Patterns to Avoid

- Do NOT create new standalone pages for concepts already covered by OwnerCenter tabs
- Do NOT maintain two data-fetching patterns (real hooks vs mock hooks) for the same domain
- Do NOT keep 3 admin entry points in the sidebar
- Do NOT let `owner/*` standalone pages and OwnerCenter tabs render competing UIs for the same data

## Priority

**Launch Now**: Steps 1-4 (route cleanup, dedup, sidebar simplification)
**Next**: Step 5 (wire real data into MissionControlPage)
**Later**: Step 6 (cross-navigation polish)

