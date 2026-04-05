
# SITA OS — Premium Shell Surfaces Implementation

## What Exists (Keep & Enhance)
- `LockScreen.tsx` — basic password lock, needs trust-aware states, privacy modes, approval indicators, ambient upgrade
- `PostArrivalDesktop.tsx` — first-arrival view, needs to evolve into the persistent living desktop
- `CommandPalette.tsx` — basic cmdk search, needs intent/simulation/capture/trust-aware modes
- `ShellLayout.tsx` — shell frame with sidebar/topbar, needs ambient background system + shell state machine
- `SitaTopBar.tsx` — functional top bar, needs trust indicator, approval badge, refined layout
- `MacDock.tsx` — basic dock, needs workspace pinning + continuity indicators
- `DesktopEntryCeremony.tsx` — transition animation, keep as-is
- Full design token system in `index.css` — excellent foundation

## Implementation Plan (7 Tasks)

### 1. Shell Ambient Background System
Create `src/components/sita/shell/ShellAmbientBackground.tsx`
- Shared ambient canvas used by Lock Screen, Desktop, and Setup
- Responds to time-of-day, trust state, and display mode
- Subtle gradient orbs with breathing animation
- `useReducedMotion` aware
- CSS variables for ambient colors so all surfaces share DNA

### 2. Enhanced Lock Screen
Rewrite `LockScreen.tsx` with:
- **Trust state indicator** (secure/approval-waiting/attention-needed/quiet/offline)
- **Pending approvals count** badge
- **Urgent alerts summary** (bills due, calendar conflicts, critical follow-ups)
- **Privacy-aware modes**: personal (show details), shared (counts only), managed (policy alerts)
- **Notification summary** strip at bottom
- **Day glance** (next meeting, top priority)
- **Unlock states**: idle → biometric_ready → scanning → success/failed → unlocking
- **Ambient background** from shared system
- **Smooth unlock→desktop dissolve** transition (not hard cut)
- **Network/connectivity status** chip
- **Calendar quick-view** if privacy allows

### 3. Living Desktop Surface
Create `src/components/sita/shell/DesktopSurface.tsx` — the primary home screen replacing current `/` route content:
- **Top system bar** stays (SitaTopBar, already exists)
- **Center canvas** with adaptive modules:
  - Boardroom preview card (compact domain health)
  - Today summary card (meetings, tasks, bills, follow-ups)
  - Active workflows card
  - Continuity card ("You were working on…", "Drafts prepared")
  - Advisor insights strip
- **Quick actions row** (Start day review, Enter boardroom, Review approvals, Capture note)
- **Trust mode indicator** (suggest/preview-first/approval-required/quiet)
- **Personalization**: adapts card ordering based on `primaryUseMode` from setup
- **States**: first_arrival, returning_user, quiet_mode, offline_mode, empty_state, approvals_waiting
- **Empty state**: useful even with no data (surfaces planning, starter workflows)
- Dock remains at bottom via ShellLayout

### 4. Universal Command Surface
Rewrite `CommandPalette.tsx` as `src/components/sita/shell/UniversalCommandSurface.tsx`:
- **4 modes in one**:
  - Instant command (direct actions)
  - Intent understanding (natural language → structured result)
  - Search (cross-entity retrieval)
  - Simulation preview (trust-aware action preview)
- **Trust-aware execution**: low-risk → instant, medium → preview, high → approval gate
- **Quick capture**: "note: …", "remind me …", "new lead …" parsed into actions
- **Command suggestions** adaptive by context, time-of-day, workspace
- **Result categories**: Actions, Workspaces, People, Tasks, Calendar, Files, Finance, Proof, Settings
- **Simulation panel**: shows affected entities, policy implications, proof that will be created
- **Recent commands** section
- **Rich result cards** with domain colors and status badges
- **Keyboard-first**: arrow nav, category jump, hotkeys
- **States**: closed → opening → active → searching → previewing → executing → result_ready

### 5. Shell State Machine & Integration Layer
Create `src/components/sita/shell/useShellState.ts`:
- Shell state: `locked | unlocking | desktop | command_open | workspace_active`
- Trust posture: derives from trust profile + pending approvals + active incidents
- Notification digest: aggregates notification counts by domain
- Continuity context: tracks last workspace, draft state, pending items
- Connects lock→desktop→command transitions
- Shared by all shell surfaces

### 6. Shell Surface Wiring
Update `ShellLayout.tsx`:
- Integrate `ShellAmbientBackground` behind content
- Wire `UniversalCommandSurface` replacing old `CommandPalette`
- Add shell state context
- Update `SitaTopBar` with trust indicator chip and approval badge
- Ensure lock→desktop dissolve works via shell state

### 7. Desktop Route Integration
Update home route to use `DesktopSurface` instead of current `DailyPulse` or existing home content:
- Wire to existing data hooks (notifications, approvals, workflows)
- Connect boardroom summary
- Connect advisor insights
- Ensure PostArrivalDesktop is shown on first visit, then DesktopSurface on return

## Files Created/Modified
| File | Action |
|------|--------|
| `src/components/sita/shell/ShellAmbientBackground.tsx` | Create |
| `src/components/sita/shell/useShellState.ts` | Create |
| `src/components/sita/shell/DesktopSurface.tsx` | Create |
| `src/components/sita/shell/UniversalCommandSurface.tsx` | Create |
| `src/components/sita/shell/index.ts` | Create |
| `src/components/sita/LockScreen.tsx` | Rewrite |
| `src/components/sita/ShellLayout.tsx` | Update |
| `src/components/sita/SitaTopBar.tsx` | Update |
| `src/pages/Index.tsx` | Update (wire DesktopSurface) |

## Order
1. Shell ambient background + useShellState (foundations)
2. Lock Screen enhancement
3. Desktop Surface
4. Universal Command Surface
5. Shell Layout wiring + TopBar updates
6. Route integration
7. TypeScript verification
