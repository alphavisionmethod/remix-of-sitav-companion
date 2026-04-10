

# SITA OS — Activation Audit & Fix Plan

## Verification Results

### What's Wired and Working (Confirmed)

All 8 flagship pages and shell components now consume the OS orchestration layer:

| Page/Component | OS Hooks Used | Status |
|---|---|---|
| DailyPulse | `useOSOrchestration`, `useAdaptiveInterface`, `useExperienceSignature` | Wired, consuming attention stack + cognitive load + mode + interventions |
| Boardroom | `useOSOrchestration`, `useExperienceSignature`, `useAdaptiveInterface` | Wired, consuming attention stack + mode |
| PersonalBrain | `useOSOrchestration`, `useExperienceSignature` | Wired, routes queries through intent orchestrator, passes OS mode + tone to edge function |
| NotificationCenter | `useAdaptiveInterface`, `useOSOrchestration` | Wired, auto-quiet on high cognitive load |
| ConciergeCenter | `useExperienceSignature`, `useOSOrchestration` | Wired |
| TasksWorkflowsCenter | `useOSOrchestration`, `useAdaptiveInterface` | Wired, attention stack consumed |
| SettingsPage | `useOSOrchestration` | Wired, 12-mode selector fully functional |
| AppSidebar | `useOSOrchestration` | Wired, mode badge + cognitive load exposed |
| ShellLayout | `useAdaptiveInterface` | Globally activating CSS variables |

### 15 CAI Admin Pages — All consuming `useSitaOS()` (confirmed in 22 files)

### Issues Found (3 bugs to fix)

**Bug 1 — Dead code in SettingsPage (lines 514-543)**
After the `case "operating-modes"` block returns at line 512, there's an unreachable `return` block starting at line 515 that renders a "Notifications" card. This means the `case "notifications"` label is missing — the Notifications settings section is broken/unreachable.

**Bug 2 — `useMemo` misused as side-effect in NotificationCenter (line 152)**
`useMemo(() => { if (cogLoad > 0.8) setQuietMode(true) }, [cogLoad])` — `useMemo` should not trigger state updates. This should be `useEffect`.

**Bug 3 — `cogLoad` variable unused in AppSidebar**
`cogLoad` is computed (line 257) but never rendered anywhere in the sidebar. Should show a subtle cognitive load indicator.

### What's Still Demo-Only (Structural Reality)

~490 of ~779 pages reference `isDemoMode` or mock data. This is by design (dual reality architecture). The flagship pages (DailyPulse, Boardroom, TasksWorkflows, NotificationCenter) already have real Supabase queries that activate when `isDemoMode === false`. This is correct behavior — not a gap.

## Fix Plan

### Fix 1 — SettingsPage: Restore notifications case label
Remove the dead unreachable code block and add proper `case "notifications":` before the notifications settings card.

### Fix 2 — NotificationCenter: Replace `useMemo` with `useEffect`
Change `useMemo` to `useEffect` for the cognitive load auto-quiet feature.

### Fix 3 — AppSidebar: Show cognitive load indicator
Add a subtle progress bar or dot indicator in the sidebar footer showing current cognitive load level.

### Files to Modify
- `src/pages/SettingsPage.tsx` — fix dead code, restore notifications case
- `src/pages/NotificationCenter.tsx` — useMemo → useEffect
- `src/components/sita/AppSidebar.tsx` — render cogLoad indicator

### Summary
The OS wiring from the previous implementation is **correct and complete**. All flagship pages consume OS hooks, all 15 admin pages work, ShellLayout activates adaptive CSS globally. Three small bugs need fixing. No major gaps remain between architectural ambition and operational activation for the pages that were targeted.

