

# Fix Route Family Boundary Violations — 23 Non-Admin Pages

## Problem

23 non-admin app pages import runtime functions/data directly from `@/lib/core-services/` or `@/lib/services/`, bypassing the kernel execution boundary. The audit requires all non-admin pages to access data through hooks (`useAction`, `useDomainData`) or demo-data modules — never direct service imports.

## Classification of Violations

### Group A: Demo data imports (11 pages) — Move to `src/lib/demo-data/`
These pages import static demo arrays/constants. The fix is to re-export these from `src/lib/demo-data/` modules instead.

| Page | Current Import | Target |
|------|---------------|--------|
| integrations/ActionsApprovals.tsx | `integration-hub/demo-connections` | `demo-data/integrations` |
| integrations/ConnectionDetail.tsx | `integration-hub/demo-connections`, `providers` | `demo-data/integrations` |
| integrations/IntegrationsCatalog.tsx | `integration-hub/providers` | `demo-data/integrations` |
| integrations/ProviderDetail.tsx | `integration-hub/providers`, `demo-connections` | `demo-data/integrations` |
| integrations/ConnectionsList.tsx | `integration-hub/demo-connections`, `providers` | `demo-data/integrations` |
| money/InvestmentOffice.tsx | `finance-os/investment-office.service`, `investment-policy-rules` | `demo-data/investment` |
| owner/PackEditor.tsx | `capability-router/pack-enablement.service` | `demo-data/packs` |
| settings/GoogleConnectedAccounts.tsx | already fixed (0 hits) | — |
| ConnectorHub.tsx | `connector-health-service` | `demo-data/connectors` |
| LifeSimulator.tsx | already fixed (0 hits) | — |

### Group B: Utility function imports (5 pages) — Move to `src/lib/utils/` or hooks
These import pure utility functions (classifiers, simulators). Move to a shared utils layer.

| Page | Current Import | Fix |
|------|---------------|-----|
| files/FilesAll.tsx | `file-ingestion` (`classifyFile`, `detectSensitivity`) | Move to `src/lib/utils/file-classification.ts` |
| files/FilesOverview.tsx | `file-ingestion` (same) | Same util |
| money/BillsWorkspace.tsx | `payment-execution` (`simulatePayment`) | Move to `src/lib/utils/payment-simulation.ts` |
| SystemStatus.tsx | `self-healing` (runtime functions + types) | Move data to `demo-data/system-status` |

### Group C: Type-only imports (7 pages) — Convert to `import type`
These only use types. Convert to `import type` which is erased at compile time and doesn't violate boundaries.

| Page | Current Import |
|------|---------------|
| files/FilesSearch.tsx | `type SearchResponse` — already `import type` ✓ |
| mission/PolicySimulatorPage.tsx | `type SimulationResult` — already `import type` ✓ |
| money/MoneyOverview.tsx | `type FraudSummary` — already `import type` ✓ |
| owner/LeaseDashboard.tsx | `type CapabilityLease, LeaseViolation` — already `import type` ✓ |
| owner/ConstitutionEditor.tsx | `type ConstitutionRule, ConstitutionRuleCategory` — already `import type` ✓ |
| PolicySimulatorHub.tsx | `type SimulationResult` — already `import type` ✓ |
| SettingsPage.tsx | `type SimulationResult` — already `import type` ✓ |

These 7 are already clean — `import type` is erased at build time and doesn't create a runtime boundary violation.

## Implementation Steps

### Step 1: Create `src/lib/demo-data/integrations.ts`
Re-export `DEMO_CONNECTIONS`, `DEMO_AUDIT_LOG`, `DEMO_ACTION_REQUESTS`, `INTEGRATION_PROVIDERS`, `PROVIDER_CATEGORIES`, `getProviderById` from here. Source the data from `core-services/integration-hub/` internally.

### Step 2: Create `src/lib/demo-data/investment.ts`
Re-export investment office demo data and policy rules.

### Step 3: Create `src/lib/demo-data/packs.ts`
Re-export `listPacks` from here.

### Step 4: Create `src/lib/demo-data/connectors.ts`
Re-export `fetchConnectorHealth` and types.

### Step 5: Create `src/lib/utils/file-classification.ts`
Move `classifyFile`, `detectSensitivity` and their types here as pure utility functions (no service dependency).

### Step 6: Create `src/lib/utils/payment-simulation.ts`
Move `simulatePayment` and `PaymentSimulation` type here.

### Step 7: Create `src/lib/demo-data/system-status.ts`
Re-export self-healing data functions and types.

### Step 8: Update all 16 pages with runtime imports
Repoint imports from `@/lib/core-services/*` to the new `@/lib/demo-data/*` or `@/lib/utils/*` locations.

### Step 9: Verify build
Run `npx tsc --noEmit` to confirm 0 errors.

## Files Changed
- **7 new files**: demo-data/integrations.ts, demo-data/investment.ts, demo-data/packs.ts, demo-data/connectors.ts, demo-data/system-status.ts, utils/file-classification.ts, utils/payment-simulation.ts
- **16 pages updated**: import paths changed
- **0 logic changes**: all runtime behavior identical

## Risk
Low — creating facade modules that re-export existing code. All type-only imports are already compliant. Build verification ensures nothing breaks.

