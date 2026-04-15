

# Mission Control — Single Windowed App Conversion

## Problem
All ~140 admin/founder pages currently render as traditional page layouts inside `FounderControlShell` (sidebar + content + AI panel). This breaks the OS paradigm where everything is an independent windowed app. The admin plane should work identically to Business OS, Finance OS, and Concierge — a single app window with internal navigation.

## Architecture

```text
Current:
  /admin/* routes → FounderControlShell layout → page components
  (full-page, breaks OS feel)

Target:
  Desktop → doLaunchApp("mission-control") → MissionControlAppShell window
  /admin/* routes → redirect shim → dispatch "sita-open-mission-control" → desktop
  (windowed app, internal sidebar nav, matches Business OS pattern)
```

## Implementation — 4 Steps

### Step 1: Create `MissionControlAppShell.tsx`
**New file**: `src/components/sita/apps/mission-control/MissionControlAppShell.tsx`

A windowed app shell following the exact pattern of `BusinessAppShell`:
- Internal `activeModule` state (string-based, not React Router)
- Glassmorphic sidebar with the same nav groups from `FounderSidebar` (Overview, Infrastructure, People & Trust, Intelligence, Operations, Support, Authority, Architecture, Security, Engineering, Founder, AI Team, AI Gateway, Intelligence Layer, Strategic, CAI)
- Lazy-loads each admin page component based on `activeModule`
- Internal command palette (Cmd+K)
- Status strip and AI transparency panel embedded inside the window
- Module mapping: `"dashboard" → AdminDashboard`, `"mc-devices" → MCDevicesCenter`, etc.
- Listens for `sita-mission-control-navigate` events for cross-app deep linking

### Step 2: Create Admin Redirect Shim
**New file**: `src/pages/AdminCenter.tsx`

Follows the exact pattern of `BusinessCenter.tsx` / `ConciergeCenter.tsx`:
- Maps `/admin/*` path segments to module IDs
- Dispatches `sita-open-mission-control` custom event
- Redirects to `/desktop`

### Step 3: Wire into Window Manager
**Modified**: `src/components/sita/shell/ShellWindowLayer.tsx`

- Import `MissionControlAppShell`
- Add to `APP_REGISTRY`: `"mission-control"` and `"sita-mission-control"` entries (width: 1300, matching other large apps)
- Add to `CANONICAL_WINDOW_ID`: `"sita-mission-control" → "mission-control"`

**Modified**: `src/components/sita/ShellLayout.tsx`

- Add `sita-open-mission-control` event listener (same pattern as business/finance/concierge)

**New file**: `src/lib/mission-control-launcher.ts`

- `openMissionControlModule(module)` helper function

### Step 4: Convert Routing
**Modified**: `src/App.tsx`

- Remove `AdminShellLayout` / `FounderControlShell` wrapper from admin routes
- Replace with redirect shim: all `/admin/*` routes → `AdminCenter` component
- Keep `AdminRoute` permission gate wrapping the redirect

**Modified**: `src/routes/AdminRoutes.tsx`

- Simplify to a single catch-all route: `<Route path="/admin/*" element={<AdminCenter />} />`
- Move all lazy imports into the `MissionControlAppShell` module map (loaded on demand internally)

### Files Summary

| File | Action |
|---|---|
| `src/components/sita/apps/mission-control/MissionControlAppShell.tsx` | Create — windowed app shell with sidebar + lazy module loading |
| `src/pages/AdminCenter.tsx` | Create — redirect shim (dispatches event, navigates to /desktop) |
| `src/lib/mission-control-launcher.ts` | Create — launcher helper |
| `src/components/sita/shell/ShellWindowLayer.tsx` | Modify — register in APP_REGISTRY |
| `src/components/sita/ShellLayout.tsx` | Modify — add event listener |
| `src/App.tsx` | Modify — replace admin layout wrapper with redirect shim route |
| `src/routes/AdminRoutes.tsx` | Modify — simplify to single catch-all |

### Design Details
- Dark glassmorphic sidebar matching Business OS aesthetic
- Collapsible sidebar with icon-only mode
- Module groups with expand/collapse
- Active module highlighting
- Status indicators (incident count, system health) in sidebar badges
- Smooth transitions between modules
- All ~140 admin pages preserved — zero functionality loss

