

# Eliminate All `as any` and `as unknown as` Casts from Pages

## Problem

69 `as any` casts and 8 `as unknown as` double-casts across ~20 page files. The build compiles (0 errors), but these hide real type gaps and will rot the codebase. The user's instructions 11–13 call for typed parser functions, per-page view-model mappers, and eliminating unsafe casts.

## Categorized Clusters

### Cluster A: Supabase relation payloads (28 casts, 7 files)
Files: `AR06ExecutionTraceExplorer`, `AR07RetryFailureCenter`, `ISA01–ISA05`, `ISA07`

Pattern: `((row as any).scheduled_jobs as any)?.name` or `((row as any).provider_families as any)?.name`

These are nested Supabase `select("*, scheduled_jobs(name, domain, ...)")` results where the relation object is inferred as `unknown`.

**Fix**: Create shared parser types and helpers:
- `parseRelation<T>(raw: unknown): T` in `src/lib/types/relation-parsers.ts`
- `ScheduledJobRef { name, domain, job_class, target_function }`
- `ProviderFamilyRef { name, provider_key }`
- `ProviderCapabilityRef { display_name }`
- Apply at the query boundary, not in JSX

### Cluster B: Edge function / hook results used as `any` (15 casts, 7 files)
Files: `MoneyOverview` (`cf`, `br`), `CashTiming` (`safeToSpendData`), `TaxEstimator` (`t`, `d`), `BusinessOverview` (`crmHealth`), `MissionControlPage` (`adminIncidents`, `tokenEngine.routes`), `OwnerCenter` (`intelligenceData`, `simulatePolicy.data`)

**Fix**: Add proper generic types to `useQuery` calls in `use-backend-actions.ts`:
- `SafeToSpendResult { safe_to_spend_cents: number }`
- `BurnRateResult { monthly_burn_cents, runway_months, ... }`
- `TaxEstimateResult { federal_tax_cents, se_tax_cents, total_tax_cents, ... }`
- `TaxDeductionsResult { total_deductions_cents, items: ... }`
- Then pages destructure typed data directly — no casts needed

### Cluster C: Mixed union / joined items (10 casts, 3 files)
Files: `RecoveryCenter` (workflow_runs + incidents union), `FL01FlagshipLoopsExecutive` (verification runs), `SubscriptionsWaste` (`waste_flag`, `duplicate_of`)

**Fix**:
- `RecoveryCenter`: Define `RecoveryItem` union type with discriminant (`_isIncident`). Normalize `selected` via a `toRecoveryDetail()` parser
- `FL01`: Type `verificationRuns` with explicit generic on `useQuery<VerificationRun[]>`
- `SubscriptionsWaste`: `waste_flag` and `duplicate_of` are metadata fields — parse from `metadata` column via `getString`/`getBoolean` guards, or if they're real columns, ensure the DB type includes them

### Cluster D: JSON metadata access (8 casts, 4 files)
Files: `PermissionsCenter` (device metadata), `PersistenceStatus` (receipt fields), `FilesSettings` (settings blob), `ComputeGovernanceBoard` (`downgradeReason`)

**Fix**: Use existing `isRecord`/`getString`/`getNumber`/`getBoolean` guards from `src/lib/types/guards.ts` at the data boundary

### Cluster E: In-memory engine hacks (8 casts, 3 files)
Files: `BusinessOverview` (revenue engine signals), `LeaseDashboard` (mutating lease object), `AutomationSimLab` (static simulation object policy check)

**Fix**:
- `AutomationSimLab`: The `simulation.policyCheck` is a static const — just type it properly with an interface
- `LeaseDashboard`: Use `leaseManager.expireLease(id)` method instead of direct property mutation; if method doesn't exist, add it
- `BusinessOverview`: Type the revenue engine's `signals` and `shouldAutoRecover` properly

### Cluster F: Remaining scattered casts (8 casts, 5 files)
Files: `AR08KillSwitchCenter`, `TeamManagement`, `CJ01ExecutiveReport`, `CJ08RouteActionCoverage`, `SAGFallbackCenter`

**Fix**: Apply `isRecord` + field extractors at data boundaries

## Implementation Plan

### Step 1: Create `src/lib/types/relation-parsers.ts`
Shared parsers for Supabase relation objects:
```
parseScheduledJobRef(raw) → { name, domain, job_class, target_function }
parseProviderFamilyRef(raw) → { name, provider_key }
parseProviderCapabilityRef(raw) → { display_name }
```

### Step 2: Add typed generics to edge function hooks
In `src/hooks/use-backend-actions.ts`:
- Add `SafeToSpendResult`, `BurnRateResult`, `TaxEstimateResult`, `TaxDeductionsResult` interfaces
- Apply as generics to `useQuery<T>` calls

### Step 3: Type the `AutomationSimLab` simulation object
Define a `PolicyCheckEntry` interface so `Object.entries(simulation.policyCheck)` yields typed values

### Step 4: Fix RecoveryCenter union typing
Define `RecoveryItem` type. Normalize `selected` before render.

### Step 5: Fix SubscriptionsWaste metadata fields
Parse `waste_flag` / `duplicate_of` from metadata or ensure DB types include them.

### Step 6: Apply relation parsers to ISA01–07, AR06, AR07
Replace all `((row as any).provider_families as any)?.name` with `parseProviderFamilyRef(row.provider_families).name`

### Step 7: Fix remaining scattered casts
- `AR08KillSwitchCenter`: Type `existing` from query result
- `TeamManagement`: Type `perf` record
- `CJ01/CJ08`: Type loop variables from query results
- `SAGFallbackCenter`: Type health check record
- `FilesSettings`: Type settings blob
- `MoneyOverview/CashTiming`: Use typed hook results (from step 2)
- `OwnerCenter`: Type `intelligenceData` and `simulatePolicy.data`
- `MissionControlPage`: Type `adminIncidents` and `tokenEngine.routes`
- `LeaseDashboard`: Use proper lease mutation method
- `BusinessOverview`: Type revenue engine access
- `ComputeGovernanceBoard`: Type routing record with `downgradeReason`
- `PersistenceStatus`: Use guards for receipt fields
- `PermissionsCenter`: Use metadata guards (already partially done)

### Step 8: Verify
Run `npx tsc --noEmit` — must remain 0 errors. Grep for `as any` in pages — target: 0.

## Files Modified
- 1 new: `src/lib/types/relation-parsers.ts`
- 1 modified: `src/hooks/use-backend-actions.ts` (add result types)
- ~20 page files modified (remove `as any`, apply parsers/types)

## What This Does NOT Do
- No `@ts-ignore` or `@ts-expect-error`
- No `as unknown as SomeType` without validation
- No rendering raw JSON in JSX
- No `useState([])` without explicit generic

