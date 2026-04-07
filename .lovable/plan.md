

# Wire 9 Unused + 3 Underutilized SitaKernel Context Hooks

## Problem

9 hooks exported from `SitaKernelContext.tsx` have zero imports. 3 more (`useCanonicalAction`, `useSharedMemory`, `useEntityScoped`) only appear in test mocks — never in real pages.

## Mapping: Hook → Target Page

| Hook | Target Page | Rationale |
|------|------------|-----------|
| `useWorkflowRecovery` | `admin/ReplayRecoveryConsole.tsx` | Recovery console — use `deadLetterQueue` + `getCheckpoints` |
| `useWorkflowReplay` | `admin/WorkflowReplayAudit.tsx` | Replay audit — use `replay()` engine |
| `useTransitionValidator` | `admin/WorkflowReplayAudit.tsx` | Validate transitions alongside replay |
| `useReceiptVerification` | `admin/ProofMatrixExplorer.tsx` | Proof explorer — use `verifyIntegrity` + `validateChain` |
| `useWebsiteManager` | `digital-presence/DomainPublishManager.tsx` | Domain/publish manager — use `pages`, `domains`, `getStats` |
| `useCloudControlPlane` | `SystemStatus.tsx` | System status — use `listRegions`, `getTopology` |
| `useEdgeDeviceRuntime` | `admin/FleetHealthPage.tsx` | Fleet health — use `listRuntimes`, `getFleetSummary` |
| `useFleetOTA` | `admin/FleetHealthPage.tsx` | Fleet health — use `listReleases`, `getRolloutProgress` |
| `useIncidentManagement` | `admin/IncidentCommandCenter.tsx` | Incident center — use `getActiveIncidents`, `getIncidentMetrics` |
| `useCanonicalAction` | `admin/ReplayRecoveryConsole.tsx` | Dispatch canonical actions during replay |
| `useSharedMemory` | `admin/ProofMatrixExplorer.tsx` | Access shared memory for proof context |
| `useEntityScoped` | `admin/IncidentCommandCenter.tsx` | Scope incident queries to current entity |

## Implementation per file

For each target page:
1. Add import of the hook(s) from `@/contexts/SitaKernelContext`
2. Call the hook inside the component function body
3. Use at least one returned value (e.g., assign to a variable, pass as prop, or use in conditional rendering)

No existing logic will be replaced — hooks are additive alongside current demo data patterns.

## Verification

- `grep` confirms all 9+3 hooks have ≥1 import outside `SitaKernelContext.tsx` and `test-utils.tsx`
- `npx tsc --noEmit` — 0 errors
- Build succeeds

## Files changed: 8

- `src/pages/admin/ReplayRecoveryConsole.tsx` — add `useWorkflowRecovery` + `useCanonicalAction`
- `src/pages/admin/WorkflowReplayAudit.tsx` — add `useWorkflowReplay` + `useTransitionValidator`
- `src/pages/admin/ProofMatrixExplorer.tsx` — add `useReceiptVerification` + `useSharedMemory`
- `src/pages/digital-presence/DomainPublishManager.tsx` — add `useWebsiteManager`
- `src/pages/SystemStatus.tsx` — add `useCloudControlPlane`
- `src/pages/admin/FleetHealthPage.tsx` — add `useEdgeDeviceRuntime` + `useFleetOTA`
- `src/pages/admin/IncidentCommandCenter.tsx` — add `useIncidentManagement` + `useEntityScoped`

