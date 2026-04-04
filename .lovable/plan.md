

# Fix All Merge Conflicts — Plan

## Problem
17 files have unresolved git merge conflict markers (`<<<<<<< HEAD` / `=======` / `>>>>>>>`), plus 1 Deno type error. This breaks the entire build.

## Resolution Strategy

For every conflict, **keep the HEAD version** — it's the richer, more complete implementation with the orchestration engine, onboarding steps, and existing `MOCK_*` data imports that all resolve correctly.

### File-by-file resolutions

**1. `src/components/sita/OSSetupExperience.tsx`** (largest — 7 conflict regions)
- Keep HEAD for all 7 conflicts:
  - Imports: keep orchestration engine, onboarding components, RestoreFlow, EnterpriseFlow, Progress, etc.
  - Phase type: keep `SetupPhaseId` from orchestration contract
  - SetupData: keep full state with all fields (role, domains, painPoints, householdNodes, etc.)
  - Main component body: keep orchestration hook, state sync, resume banner, learning panel
  - finishSetup: keep HEAD's full persistence (device enrollment, boot logs, setup sessions, seed-user-data)
  - Navigation: keep `navigate("/first-win")` and `canAdvance()` logic
  - Render: keep two-column layout with PhaseProgressRail, all onboarding phases, LearningPanel
- Remove the simpler incoming branch code (SetupLanguageRegion/SetupOperatingMode/etc. are still importable but not used in this version)

**2. 10 page files** (simple — 1 conflict each)
- Keep HEAD version for all. Each keeps `MOCK_*` import from `@/lib/mock-data` and removes the `DEMO_*` alias from `@/lib/demo-data`:
  - `src/pages/ActivityStream.tsx` — keep HEAD (removes unused `ICON_LOOKUP`/`demoTimeline` block)
  - `src/pages/AutomationCenter.tsx` — keep HEAD (removes unused `demoRules`/`delegations` aliases)
  - `src/pages/InboxCapture.tsx` — keep HEAD (removes unused `demoItems` alias)
  - `src/pages/files/FilesOverview.tsx` — keep HEAD `MOCK_FILES_OVERVIEW`
  - `src/pages/files/FilesProcessing.tsx` — keep HEAD `MOCK_FILES_PROCESSING`
  - `src/pages/mobile/MobileAlerts.tsx` — keep HEAD `MOCK_MOBILE_ALERTS`
  - `src/pages/mobile/MobileApprovals.tsx` — keep HEAD `MOCK_MOBILE_APPROVALS`
  - `src/pages/mobile/MobileProof.tsx` — keep HEAD `MOCK_MOBILE_PROOFS`
  - `src/pages/mobile/MobileWorkflowDetail.tsx` — keep HEAD `MOCK_MOBILE_WORKFLOW_STEPS`
  - `src/pages/money/ReservesSavings.tsx` — keep HEAD `MOCK_RESERVES_SAVINGS`

**3. `supabase/functions/seed-user-data/index.ts`** (Deno type error)
- Line 221: `err` is `unknown`. Fix: `(err as Error).message`

### Implementation order
1. Fix all 10 simple page files in parallel (strip conflict markers, keep HEAD)
2. Rewrite `OSSetupExperience.tsx` — strip all conflict markers, keep HEAD version throughout
3. Fix `seed-user-data/index.ts` type error
4. Verify with `npx tsc --noEmit`

