

# Fix Service Duplication & Direct OS Imports

## Problem Summary

Two structural issues:

### A. 9 Duplicate Services
These services have **two independent implementations** — a monolithic file in `core-services/*.ts` AND a modular directory in `lib/services/*/`:

| Service | core-services (lines) | lib/services (modular) |
|---|---|---|
| event-bus | 248 | 3 sub-modules |
| receipt-service | 275 | 4 sub-modules |
| policy-engine | 249 | 4 sub-modules |
| memory-service | 354 | 5 sub-modules |
| executor-service | 371 | 3 sub-modules |
| verification-engine | 228 | 3 sub-modules |
| capability-router | 128 | 3 sub-modules |
| projection-service | 233 | sub-modules |
| workflow-engine | 740 | 7KB modular |

The 7 "MISSING" services (brain-core, model-router, etc.) are **already re-exported** from `core-services/index.ts` lines 28-34. No action needed there.

### B. 15 Non-Admin Pages with Direct OS Imports
Pages import directly from `@/lib/core-services/*` instead of through hooks/engines. These are architecture violations but not runtime bugs.

## Fix Strategy

### Step 1: Deduplicate — Make `core-services/*.ts` files re-export from `lib/services/*/`

For each of the 9 duplicated services, replace the monolithic `core-services/*.ts` file with a thin re-export from `lib/services/*/`. This preserves all existing import paths while eliminating dual implementations.

**Pattern** (for each service):
```ts
// src/lib/core-services/event-bus.ts — BEFORE: 248-line implementation
// AFTER: thin re-export
export * from "@/lib/services/event-bus";
// Keep any classes/functions that exist ONLY in core-services and not in lib/services
```

Before replacing, I'll diff each pair to identify any exports unique to the core-services version that don't exist in lib/services. Those get preserved or merged.

**Files modified**: 9 files in `src/lib/core-services/`:
- `event-bus.ts`
- `receipt-service.ts`
- `policy-engine.ts`
- `memory-service.ts`
- `executor-service.ts`
- `verification-engine.ts`
- `capability-router.ts`
- `projection-service.ts`
- `workflow-engine.ts`

### Step 2: Fix non-admin page imports

Redirect the 15 non-admin page imports from `@/lib/core-services/*` to `@/lib/services/*` (the canonical layer). These are mostly type imports and pure function imports:

| Page | Current Import | Redirect To |
|---|---|---|
| BillsWorkspace | core-services/payment-execution | lib/services/payment-execution-service |
| InvestmentOffice | core-services/investment-policy-rules | *(keep — no lib/services equivalent)* |
| MoneyOverview | core-services/fraud-sentinel | lib/services/fraud-sentinel |
| ConstitutionEditor | core-services/constitution-compiler | lib/services/constitution-engine |
| LeaseDashboard | core-services/lease-manager | *(keep — no lib/services equivalent)* |
| FilesAll, FilesOverview | core-services/file-ingestion | lib/services/file-ingestion |
| FilesSearch | core-services/search-fabric | lib/services/search-fabric |
| PolicySimulator*, SettingsPage, MissionControl | core-services/governance-simulator | lib/services/governance-simulator |
| SystemStatus | core-services/self-healing | lib/services/self-healing |
| MissionControl | core-services/fraud-sentinel | lib/services/fraud-sentinel |

Some services (investment-policy-rules, lease-manager) only exist in core-services — those imports stay.

**Files modified**: ~13 page files

### Step 3: Clean up `core-services/index.ts`

Remove duplicate explicit re-exports that are now covered by the thin re-export files. The barrel already does `export * from "./event-bus"` which will now chain to `lib/services/event-bus`.

## Summary

- **9 core-services files** → converted to thin re-exports from lib/services
- **~13 page files** → imports redirected to lib/services
- **1 barrel file** → cleaned up redundant re-exports
- **0 new files**
- **~23 files total modified**

All existing import paths continue to work. No breaking changes.

