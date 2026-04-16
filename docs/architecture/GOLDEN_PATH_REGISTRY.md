# Golden Path Registry

The Golden Path Registry is the authoritative inventory of every critical
end-to-end journey the SITA OS platform must keep green for launch
readiness. Each path is cross-linked to bounded contexts, surfaces, kill
switches, runbooks, and verification artifacts.

## Why this exists

A Golden Path is a customer or operator journey that the platform commits
to keeping working at all times. If a Golden Path is broken, the platform
is not launch-ready, regardless of how many features ship.

## Registry shape

Source: `src/lib/operations/golden-path-registry.ts`

Every entry declares:

| Field | Purpose |
|---|---|
| `pathId` | Stable `GP-*` identifier |
| `primaryContextId` | Owning bounded context (Phase 1) |
| `contextIds` | All bounded contexts the path traverses |
| `surfaces` | Surfaces (Phase 2) the path runs on |
| `steps` | Ordered, contracted steps with their own owner context |
| `verifications` | Playwright/probe/receipt artifacts |
| `blockingKillSwitches` | Phase 4 kill switches that block the whole path |
| `recoveryRunbookRefs` | Phase 5 runbooks that recover the path |
| `completionReceipts` | Receipts emitted when the full path completes |
| `slaLatencyMsP95` | SLA budget for the path end-to-end |
| `requiredCoveragePct` | Minimum coverage required to certify |

## Cross-linkage with other phases

| Phase | Field | Linkage |
|---|---|---|
| 1 — Bounded Contexts | `primaryContextId`, `contextIds`, `step.contextId` | `BoundedContextEntry.contextId` |
| 2 — Surfaces | `surfaces`, `step.surface` | `SurfaceFamily` |
| 3 — Policy | `step.expectedMutations` | `PolicyDomain.actions` |
| 4 — Kill Switches | `blockingKillSwitches`, `step.blockingKillSwitches` | `KillSwitchEntry.switchId` |
| 5 — Runbooks | `recoveryRunbookRefs`, `step.recoveryRunbookRefs` | `RunbookEntry.runbookId` |

## CI gate

`scripts/architecture/checks/check-golden-path-coverage.ts` enforces:

- Every `contextId` resolves to a real bounded context
- Every `blockingKillSwitches` resolves to a real kill switch
- Every `recoveryRunbookRefs` resolves to a real runbook
- Every `BOUNDED_CONTEXT_REGISTRY.criticalJourneys` reference resolves to a real Golden Path
- Steps have unique IDs and strictly-increasing order
- Every P0/P1 path has at least one Playwright e2e verification
- Every P0 path has at least one receipt-emitted verification

## Runtime evaluator

`src/lib/operations/golden-path-evaluator.ts` provides
`evaluateGoldenPaths(armedSwitchIds)` that returns each path's health
(`healthy`, `degraded`, `blocked`). Admin surfaces and the launch
readiness gate consume this to render real-time status.

## Generated artifact

`scripts/support/runbooks/generate-golden-path-registry.ts` emits
`generated/golden-path-registry.json` for downstream tooling.

## Current coverage (15 Golden Paths)

| ID | Title | Persona | Criticality | Primary Context |
|---|---|---|---|---|
| GP-FIRST-BOOT | First Boot — New Owner Provisioning | new-user | P0 | setup-identity |
| GP-SIGN-IN | Sign In — Returning Owner | owner | P0 | setup-identity |
| GP-RESTORE | Restore Account State | owner | P0 | cloud-control-plane |
| GP-SETUP-CONTINUATION | Resume Interrupted Setup | new-user | P1 | setup-identity |
| GP-CONNECT-CRM | Connect CRM Provider | owner | P0 | integrations |
| GP-OAUTH-AND-SYNC | OAuth Refresh and Scheduled Sync | operator | P1 | integrations |
| GP-RECOVER-STALE-LEADS | Recover Stale Leads | advisor | P1 | business-os |
| GP-APPROVE-OUTBOUND-FOLLOWUP | Approve Outbound Follow-Up | owner | P0 | boardroom |
| GP-REVIEW-PROOF | Review Proof Receipt | owner | P0 | proof-trust |
| GP-WORKFLOW-REPLAY | Workflow Replay | operator | P1 | runtime-kernel |
| GP-MOBILE-APPROVAL | Mobile Approval | owner | P0 | mobile |
| GP-PUSH-TO-APPROVAL | Push To Approval | owner | P1 | mobile |
| GP-OWNER-INTERVENTION | Owner Intervention (Pause/Resume) | admin | P0 | admin |
| GP-LAUNCH-READINESS | Launch Readiness Gate | admin | P0 | admin |
| GP-ENV-RECOVERY | Environment Recovery | admin | P0 | cloud-control-plane |
