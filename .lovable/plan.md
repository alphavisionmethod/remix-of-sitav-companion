

# Fix 23 Non-Admin Pages — Redirect Direct OS Imports to Kernel Hooks

## Problem

23 app pages bypass the kernel by importing service classes/functions directly from `@/lib/core-services/` or `@/lib/services/`. This means service instantiation happens per-component (e.g., `new FraudSentinelService()`, `new GovernanceSimulatorService()`) instead of through the kernel's shared, audited service tree.

## Strategy

Two categories of fix based on what's imported:

### Category A: Service class instantiation (must route through kernel)
Pages that do `new SomeService()` and call methods — these need kernel hooks.

### Category B: Pure data/config/type imports (acceptable, just redirect path)
Pages importing constants (`INTEGRATION_PROVIDERS`, `DEMO_CONNECTIONS`), types, or pure functions (`classifyFile`, `simulatePayment`) — these aren't execution bypasses, they're data. Redirect from `core-services` to `lib/services` where possible, or keep if no equivalent exists.

## Step 1: Create 5 new kernel-domain hooks in `src/contexts/SitaKernelContext.tsx`

Add hooks that expose kernel-managed service instances. The kernel singleton (`sita-kernel.ts`) already instantiates `FraudSentinelService`. For missing services, add them to the kernel.

**New hooks:**
```ts
export function useFraudSentinel() {
  const kernel = useSitaKernel();
  return kernel.fraudSentinel;
}

export function useGovernanceSimulator() {
  // kernel doesn't have this yet — instantiate via useMemo from the kernel context
  return useMemo(() => new GovernanceSimulatorService(), []);
}

export function useSearchFabric() {
  return useMemo(() => new SearchFabricService(), []);
}

export function useFileIngestion() {
  return useMemo(() => ({
    classifyFile, detectSensitivity // re-export pure functions
  }), []);
}

export function useSelfHealingServices() {
  return useMemo(() => ({
    selfHealing: createSelfHealingService(),
    immune: createImmuneController(),
    fleet: createFleetHealthService(),
    capabilities: HEALING_CAPABILITY_MAP,
    escalation: ESCALATION_RULES,
    degradedModes: DEGRADED_MODES,
  }), []);
}
```

**Add `governanceSimulator` and `searchFabric` to the kernel singleton** in `src/lib/sita-kernel.ts` so they're shared across the tree.

**Files**: `src/lib/sita-kernel.ts`, `src/contexts/SitaKernelContext.tsx`

## Step 2: Fix 13 pages importing `@/lib/core-services/`

| Page | Current | Fix |
|---|---|---|
| `MoneyOverview.tsx` | `new FraudSentinelService()` | Use `useFraudSentinel()` hook |
| `MissionControlPage.tsx` | `new FraudSentinelService()`, `new GovernanceSimulatorService()` | Use `useFraudSentinel()`, `useGovernanceSimulator()` |
| `SettingsPage.tsx` | `new GovernanceSimulatorService()` | Use `useGovernanceSimulator()` |
| `PolicySimulatorPage.tsx` | `new GovernanceSimulatorService()` | Use `useGovernanceSimulator()` |
| `PolicySimulatorHub.tsx` | `new GovernanceSimulatorService()` | Use `useGovernanceSimulator()` |
| `FilesSearch.tsx` | `new SearchFabricService()` | Use `useSearchFabric()` |
| `FilesAll.tsx` | `classifyFile, detectSensitivity` | Import from `useFileIngestion()` or keep pure function import (not a bypass) |
| `FilesOverview.tsx` | `classifyFile, detectSensitivity` | Same as FilesAll |
| `BillsWorkspace.tsx` | `simulatePayment` (pure function) | Keep — pure function, not a service bypass |
| `ConstitutionEditor.tsx` | `type ConstitutionRule` (type-only) | Keep — type imports are not bypasses |
| `LeaseDashboard.tsx` | `type CapabilityLease` (type-only) | Keep — type imports are not bypasses |
| `SystemStatus.tsx` | `createSelfHealingService()` etc. | Use `useSelfHealingServices()` hook |
| `InvestmentOffice.tsx` | service functions from `finance-os` | These are pure domain functions (deterministic engines), not stateful services — keep |

**Files modified**: ~8 page files (excluding type-only and pure-function imports which are architecturally acceptable)

## Step 3: Fix 10 pages importing `@/lib/services/`

| Page | Current Import | Classification | Fix |
|---|---|---|---|
| `IntegrationsCatalog.tsx` | `INTEGRATION_PROVIDERS`, `DEMO_CONNECTIONS` | Pure data constants | Keep — not a service bypass |
| `ConnectionsList.tsx` | `DEMO_CONNECTIONS`, `getProviderById` | Pure data/lookup | Keep |
| `ConnectionDetail.tsx` | `DEMO_CONNECTIONS`, `getProviderById` | Pure data/lookup | Keep |
| `ProviderDetail.tsx` | `getProviderById`, `DEMO_CONNECTIONS` | Pure data/lookup | Keep |
| `ActionsApprovals.tsx` | `DEMO_ACTION_REQUESTS` | Pure data constant | Keep |
| `GoogleConnectedAccounts.tsx` | `type GoogleConnectorState` | Type-only | Keep |
| `PackEditor.tsx` | `listPacks` | Pure function | Keep |
| `ConnectorHub.tsx` | `fetchConnectorHealth` | Async fetch function | Wrap in kernel query or keep (read-only) |
| `InvestmentOffice.tsx` | Service functions from `finance-os` | Pure deterministic functions | Keep |
| `LifeSimulator.tsx` | `LifeShockSimulator` class | Stateful service | Create `useLifeSimulator()` hook |

Most `@/lib/services/` imports are pure data constants, types, or stateless lookup functions — these are **not** execution bypasses. Only `LifeSimulator.tsx` and `ConnectorHub.tsx` instantiate stateful services.

**Files modified**: 2 page files

## Summary

| Action | Count |
|---|---|
| New kernel hooks added to `SitaKernelContext.tsx` | 5 hooks |
| Services added to `sita-kernel.ts` singleton | 2 (`governanceSimulator`, `searchFabric`) |
| Page files modified (service → hook) | ~10 |
| Page files kept as-is (type/data/pure-fn imports) | ~13 |
| **Total files modified** | ~12 |

After this fix, every stateful service access in non-admin pages goes through the kernel. Pure data constants, types, and deterministic functions remain importable directly — these don't violate the architecture since they carry no state and produce no side effects.

