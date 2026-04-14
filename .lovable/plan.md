

# SITA OS — Update Center UI Overhaul + Onboarding/Update Integration Wiring

## Current State

### Already Built (Engines)
- **`updated.ts`** (611 lines): Full A/B slot manager, preflight checks, download/stage/reboot simulation, health validation, rollback with audit trail, channel management, policy integration
- **`onboardingd.ts`** (416 lines): Full onboarding daemon with 11-step flow, session persistence, hardware detection, protection defaults, policy-aware defaults
- **`os-subsystem-flows.ts`** (308 lines): End-to-end flow wiring between daemons
- **All daemons**: `auditd`, `authd`, `controlcenterd`, `policyd`, `sessiond`, `secretsd`, `notifyd` — fully implemented

### Already Built (UI)
- **`OSSetupExperience.tsx`** (1136 lines): 24-phase premium onboarding with DAG orchestration, resume, rollback, branch evaluation, persistence to Supabase
- **`FirstBootScreen.tsx`** (559 lines): Hardware detection, secure init, boot recovery, accessibility shortcuts

### Gap: Update Center UI is Static
- **`UpdateCenter.tsx`** (120 lines): Hardcoded update history, static channel cards, no connection to `UpdateDaemon` at all
- No slot visualization, no preflight UI, no download progress, no health validation display, no rollback history, no recovery integration

## Implementation Plan — 4 Batches

### Batch 1: Update System Hook + Core Engine Wiring
**Create `src/hooks/useUpdateDaemon.ts`** (~120 lines)

React hook wrapping the `UpdateDaemon` singleton for reactive UI:
- `useUpdateDaemon()` returns: state, progress, activeSlot, inactiveSlot, channel, catalog, healthResults, rollbackHistory, updateHistory
- Actions: checkForUpdates, downloadUpdate, stageUpdate, rebootAndValidate, cancelUpdate, manualRollback, setChannel, runPreflight
- Uses `useCallback` + `useState` with progress polling during downloads/staging
- Exposes loading states and error handling

### Batch 2: Premium Update Center Page Overhaul
**Rewrite `src/pages/UpdateCenter.tsx`** (~500 lines)

Fully wired to UpdateDaemon via the hook. Premium dark glassmorphic design:

**Hero Section**: Current system version, active slot badge, channel indicator, last check time, "Check Now" button with animated spinner

**A/B Slot Visualization**: Two slot cards side-by-side showing slot ID, version, status badge (active/inactive/pending/failed), boot count, health status, integrity verified indicator. Active slot has green glow, inactive has muted treatment.

**Available Updates Section**: Cards from catalog with version, type badge (security/full/delta), size, criticality flag, release notes expandable, component list chips, rollout percentage bar. "Install" button triggers preflight → download → stage flow.

**Update Progress Panel** (appears during active update):
- State machine progress stepper: Preflight → Download → Verify → Stage → Reboot → Health Check → Committed
- Download progress bar with bytes/total, speed estimate, ETA
- Cancel button when available
- Health validation checklist (kernel, root_fs, policyd, sessiond, shell, networking, shieldd, powerd) with pass/fail/running indicators

**Channel Selector**: Interactive channel cards (Stable/Beta/Dev) with policy enforcement — blocked channels show lock icon with policy reason

**Preflight Results Panel**: Battery, storage, network, policy, channel checks with pass/fail indicators and blocker messages

**Update History Timeline**: Chronological list with version transitions, action type (installed/failed/rolled_back/deferred), timestamps, expandable details

**Rollback Section**:
- Rollback history cards showing source→target slot, trigger type, reason, health results
- Manual rollback button (when inactive slot is marked good)
- Recovery info card linking to RecoveryCenter

**Auto-Update Policy Card**: Shows current policy from policyd (auto-apply critical, require approval for features, battery/network requirements)

### Batch 3: Update Progress Overlay + Notification Integration
**Create `src/components/sita/os/UpdateProgressOverlay.tsx`** (~200 lines)

Full-screen overlay shown during active update operations (staging/rebooting/validating):
- Cinematic boot-style progress animation
- Health check waterfall display
- Rollback alert with diagnostic summary if triggered
- "System Restored" confirmation when rollback completes
- Integrates with `notifyd` for desktop notifications

**Create `src/components/sita/os/UpdateSlotVisualization.tsx`** (~120 lines)

Reusable A/B slot diagram component:
- Two slot blocks with animated status transitions
- Arrow showing active direction
- Health badge per slot
- Used in UpdateCenter and Settings

### Batch 4: Integration Wiring + Recovery + Settings
**Modify `src/pages/RecoveryCenter.tsx`**

Add "Update Recovery" tab:
- Shows failed update attempts from UpdateDaemon
- Rollback history with health validation details
- Manual rollback action
- Links to UpdateCenter for retry

**Modify `src/pages/SettingsPage.tsx`** (or system settings)

Wire update settings section:
- Current version and slot info
- Channel preference
- Auto-update toggle
- Battery threshold for updates
- Link to full Update Center

**Create `src/components/sita/UpdateBannerWired.tsx`** (~80 lines)

Replace existing static `UpdateBanner.tsx` with a version wired to UpdateDaemon:
- Shows available updates count
- "Critical update available" alert
- Dismiss/install actions
- Appears in desktop shell

## Design Language
- Dark glassmorphic consistent with existing: `bg-[hsl(0_0%_9%)]`, borders `hsl(0_0%_100%/0.06)`
- Slot A/B uses green (active) / muted (inactive) / amber (pending) / red (failed) status colors
- Health checks use `trust-safe` green for pass, `destructive` for fail
- Progress bars use `primary` purple
- Rollback events use amber/red treatment with `AlertTriangle` iconography
- Security updates get `Shield` icon with critical red badge
- Framer Motion transitions on all state changes

## File Summary
- **Create**: useUpdateDaemon.ts, UpdateProgressOverlay.tsx, UpdateSlotVisualization.tsx, UpdateBannerWired.tsx (4 files)
- **Rewrite**: UpdateCenter.tsx (1 file)
- **Modify**: RecoveryCenter.tsx, SettingsPage.tsx or system settings (2 files)
- **Total**: ~7 files, ~1,200 lines

