# SITA OS — Cross-Module Integration Audit

Generated: `2026-04-27T17:46:21.471Z`

## Counts

- Total touchpoints: **47**

### By kind

- `adaptive-signal-emitter` — 3
- `adaptive-signal-receiver` — 1
- `advisor-outcome-handler` — 1
- `background-task-resolver` — 1
- `bridge-service` — 1
- `fk-column-usage` — 19
- `link-table` — 1
- `linkage-component` — 3
- `readiness-consumer` — 7
- `set-linked-context` — 10

### By classification

- `missing-identity` — 1
- `partial` — 8
- `strong` — 38

## Touchpoints

| Kind | Classification | File |
| --- | --- | --- |
| `adaptive-signal-emitter` | `partial` | `src/lib/debug/page-data-source-registry.ts` |
| `adaptive-signal-emitter` | `partial` | `src/modules/business/components/business/adaptive/CrossDomainSignalBridge.tsx` |
| `adaptive-signal-emitter` | `strong` | `src/platform/integration/cross-module-integration-map.ts` |
| `adaptive-signal-receiver` | `partial` | `src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx` |
| `advisor-outcome-handler` | `strong` | `src/platform/integration/cross-module-integration-map.ts` |
| `background-task-resolver` | `strong` | `src/lib/business/task-target-resolver.ts` |
| `bridge-service` | `strong` | `src/lib/services/business-os/crm-finance-bridge.service.ts` |
| `fk-column-usage` | `strong` | `src/__tests__/business-os/integration/appointment-noshow-recovery.test.ts` |
| `fk-column-usage` | `strong` | `src/__tests__/business-os/integration/background-task-routing.test.ts` |
| `fk-column-usage` | `strong` | `src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx` |
| `fk-column-usage` | `strong` | `src/__tests__/business-os/integration/support-health-loop.test.ts` |
| `fk-column-usage` | `strong` | `src/data/repositories/business-scheduling-service.ts` |
| `fk-column-usage` | `strong` | `src/lib/kernel-handlers/business-handlers.ts` |
| `fk-column-usage` | `strong` | `src/lib/kernel-handlers/finance-handlers.ts` |
| `fk-column-usage` | `strong` | `src/lib/operations/golden-path-registry.ts` |
| `fk-column-usage` | `strong` | `src/lib/services/business-os/crm-finance-bridge.service.ts` |
| `fk-column-usage` | `strong` | `src/lib/services/business-os/support-health-loop.service.ts` |
| `fk-column-usage` | `strong` | `src/modules/business/components/business/crm/CRMConciergeLinkage.tsx` |
| `fk-column-usage` | `strong` | `src/modules/business/components/business/crm/CRMFinanceLinkage.tsx` |
| `fk-column-usage` | `strong` | `src/modules/business/components/business/shared/AppointmentLineagePanel.tsx` |
| `fk-column-usage` | `strong` | `src/modules/business/domain/background-tasks/types.ts` |
| `fk-column-usage` | `strong` | `src/modules/business/domain/scheduling/types.ts` |
| `fk-column-usage` | `strong` | `src/modules/business/hooks/use-follow-through-queues.ts` |
| `fk-column-usage` | `strong` | `src/modules/business/pages/AppointmentsScheduling.tsx` |
| `fk-column-usage` | `strong` | `src/modules/business/pages/QuotesWorkspace.tsx` |
| `fk-column-usage` | `strong` | `src/platform/integration/cross-module-integration-map.ts` |
| `link-table` | `strong` | `supabase/migrations/20260426181345_53355088-a21c-4ba5-8be0-7b1fdb6a5b9f.sql` |
| `linkage-component` | `strong` | `src/modules/business/components/business/crm/CRMConciergeLinkage.tsx` |
| `linkage-component` | `missing-identity` | `src/modules/business/components/business/crm/CRMFilesLinkage.tsx` |
| `linkage-component` | `strong` | `src/modules/business/components/business/crm/CRMFinanceLinkage.tsx` |
| `readiness-consumer` | `partial` | `src/lib/debug/page-data-source-registry.ts` |
| `readiness-consumer` | `strong` | `src/packages/contracts/domain-types/admin-view-models.ts` |
| `readiness-consumer` | `strong` | `src/packages/internal-agent-config/agents/product-build.ts` |
| `readiness-consumer` | `partial` | `src/platform/integration/cross-module-integration-map.ts` |
| `readiness-consumer` | `partial` | `src/platform/sita/components/sita/ShellLayout.tsx` |
| `readiness-consumer` | `partial` | `src/platform/sita/components/sita/shell/ShellLiveLayer.tsx` |
| `readiness-consumer` | `partial` | `src/runtimes/portability-boundary-model.ts` |
| `set-linked-context` | `strong` | `src/__tests__/business-os/integration/lead-recovery-loop.test.ts` |
| `set-linked-context` | `strong` | `src/modules/business/components/business/InvoiceDetailPane.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/components/business/LeadRecoveryPane.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/components/business/crm/CRMConciergeLinkage.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/components/business/crm/CRMFinanceLinkage.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/components/business/shared/AppointmentLineagePanel.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/pages/BackgroundTaskCenter.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/pages/OpportunitiesCenter.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/pages/ProposalsContracts.tsx` |
| `set-linked-context` | `strong` | `src/modules/business/pages/QuotesWorkspace.tsx` |
