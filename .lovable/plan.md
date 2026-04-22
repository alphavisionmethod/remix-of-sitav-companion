

# Fix All Build Errors — isDemoMode/user Scope Issues

## Problem Summary

The automated mock-gating pass injected `useDataMode()` calls in wrong locations across ~20 files, creating three classes of errors:

1. **Hook called inside nested function** (violates React rules of hooks) — 4 files
2. **`isDemoMode` referenced but never declared** — 4 hook files (~90 error lines)
3. **`user` referenced but never declared** — 2 component files
4. **Duplicate `isDemoMode` declarations** — 3 component files
5. **Missing import** — 1 file

## Fixes (file-by-file)

### Category 1: Hook called inside nested function (move to component/hook top level)

**`src/components/admin/shells/SimulationPreview.tsx`** (line 87)
- `useDataMode()` is inside `handleRun()` — move to top of `SimulationPreview` component body (line 83)

**`src/components/sita/shell/windows/CodeEditorWindow.tsx`** (line 107)
- `useDataMode()` is inside `openFile()` — add import for `useDataMode` from `@/contexts/DataModeContext`, move call to top of parent component

**`src/components/sita/AgentAuditLog.tsx`** (line 242)
- `useDataMode()` is inside `handleExport()` — move to top of `AgentAuditLog` component (line 207)

**`src/components/sita/CABWorkflow.tsx`** (line 388)
- `useDataMode()` is inside `handleExport()` — move to top of parent component

### Category 2: `isDemoMode` never declared in hook functions

**`src/hooks/use-admin-data.ts`** — Only `useAdminIncidents` (line 46) declares `isDemoMode`. All other exported hooks (`useAdminPolicies`, `useAdminDevices`, etc.) reference `isDemoMode` without declaring it. Fix: add `const { isDemoMode } = useDataMode();` at the top of every exported hook function that uses it.

**`src/hooks/use-backend-actions.ts`** — `isDemoMode` used in `useCashflowForecast`, `useSafeToSpend`, `useBurnRate` without declaration. Fix: add `const { isDemoMode } = useDataMode();` to each.

**`src/hooks/use-compute-governance.ts`** — `isDemoMode` used in `useAISpendSummary` and other hooks without declaration. Fix: add `const { isDemoMode } = useDataMode();` to each hook function.

**`src/hooks/use-ai-engineering-data.ts`** — `isDemoMode` used in the main data hook without declaration. Fix: add `const { isDemoMode } = useDataMode();` at the start of the function body.

### Category 3: `user` never declared

**`src/components/admin/recovery/DiagnosticExportAudit.tsx`** (lines 31, 32, 36)
- `user` referenced but only `isDemoMode` is destructured from `useDataMode()`. Missing `const { user } = useAuth();`. Fix: add `const { user } = useAuth();` after line 27.

**`src/components/sita/AISpendIndicator.tsx`** (lines 33, 34, 36)
- `user` and `isDemoMode` both used but neither declared. Fix: add `const { isDemoMode } = useDataMode();` and `const { user } = useAuth();` at top of component.

### Category 4: Duplicate declarations

**`src/components/sita/DataLoadingWrapper.tsx`** — `isDemoMode` is both a prop and destructured from useDataMode. Fix: remove the useDataMode import and call; use the prop.

**`src/components/sita/apps/boardroom/BoardroomApprovalView.tsx`** — `isDemoMode` comes from `useBoardroomLiveData()` (line 252) and is also declared elsewhere. Fix: remove the duplicate declaration, keep the one from the hook.

**`src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx`** — same pattern. Fix: remove duplicate.

### Category 5: Missing import

**`src/components/sita/shell/windows/CodeEditorWindow.tsx`** — `useDataMode` not imported. Fix: add import.

### Webhook Replay Panel

**`src/components/admin/recovery/WebhookReplayPanel.tsx`** (lines 25, 43)
- `isDemoMode` used at module scope (line 25, computing `EVENT_TYPES`) and inside `useMemo` but never declared. Fix: move `EVENT_TYPES` computation inside the component after `useDataMode()` call; add hook call at component top level.

## Verification

After all fixes, run `npx tsc --noEmit` to confirm zero errors, then `bun run build:dev` for clean build.

## Estimated Scope

- ~20 files modified
- No new files, no DB changes
- Pure scope/declaration fixes

