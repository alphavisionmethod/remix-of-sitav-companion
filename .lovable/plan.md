

# Fix ~75 Page-Level Type Errors — Upstream Typing Strategy

## Root Causes (5 patterns, not 75 individual fixes)

### 1. `callAdminAPI()` returns `unknown` — affects OwnerCenter (20 errors)
The `callAdminAPI` function has no return type annotation. All 8 owner center hooks (`useTrustCenter`, `useReleases`, etc.) return `unknown` data. The mock data objects ARE typed, but the union with `callAdminAPI()` degrades to `unknown`.

**Fix**: Add generic return type to `callAdminAPI<T>()` and type each hook's `queryFn` with explicit return types matching the mock data shapes. Define interfaces for each data shape (TrustCenterData, ReleasesData, etc.) in `use-admin-data.ts`.

### 2. Supabase join results typed as `unknown` — affects ISA01-07, AR06-08, RecoveryCenter, ConnectorGovernanceCenter (~25 errors)
When using `.select("*, provider_families(name, provider_key)")`, the joined table resolves to `unknown` if the FK isn't in generated types or uses dynamic tables.

**Fix**: For each affected query, define a typed result interface and cast the query result once at the data boundary. Example:
```ts
type ExecWithJob = Database['public']['Tables']['execution_log']['Row'] & {
  scheduled_jobs: { name: string; domain: string; job_class: string; target_function: string } | null;
};
const data = (rawData ?? []) as ExecWithJob[];
```

### 3. `never[]` from explicit `as never[]` casts — affects FL01, RecoveryCenter, OwnerCenter support/change sections (~12 errors)
Several files have `(data as never[])` which makes all property access fail.

**Fix**: Replace `as never[]` with proper typed arrays. For FL01 `verificationRuns`, type as the verification run row shape. For RecoveryCenter `failedRuns`, type as workflow_runs row + workflows join.

### 4. Missing columns on DB types — affects PermissionsCenter, PersistenceStatus, ConnectorGovernanceCenter (~6 errors)
`trust_score`, `is_primary` don't exist on `trusted_devices`. `receipt_type` doesn't exist on `sita_receipts`. `last_sync_at` doesn't exist on `connected_accounts`.

**Fix**: Read these from `metadata` JSON column with safe narrowing, or remove references if they're not real fields. For `receipt_type`, use the correct column name from the actual schema (likely `type` or `domain`).

### 5. `unknown` from dynamic table / view queries — affects CJ01, CJ08 (~8 errors)
`fromDynamicTable()` returns untyped results. When used as index types or with `.split()`, TS rejects.

**Fix**: Define interfaces for view results and cast once at the hook level. For CJ08, narrow `route_key` and numeric fields with `String()` / `Number()` before use.

### 6. TeamManagement `unknown` from Record cast — 3 errors
`(perf as Record<string, unknown>)?.total_calls` yields `unknown`. Rendered directly in JSX.

**Fix**: Define a `PerfData` interface and cast `perf` once: `const perf = perfMap.get(id) as PerfData | undefined`.

### 7. WorkflowsCenter insert type mismatch — 1 error
Passing `Record<string, unknown>` where typed insert is expected.

**Fix**: Remove the `as Record<string, unknown>` cast from the insert object. Use the proper typed fields directly.

### 8. ComputeGovernanceBoard `downgradeReason` — 1 error
Accessing `downgradeReason` via `Record<string, unknown>` cast, rendering unknown.

**Fix**: `String((r as Record<string, unknown>).downgradeReason ?? "")`

## Files Modified

- **`src/hooks/use-admin-data.ts`** — Add return types to `callAdminAPI<T>()` and all 8 owner center hooks; define data shape interfaces
- **`src/pages/OwnerCenter.tsx`** — Remove inline `as Record<string, unknown>` casts; use typed data from hooks
- **`src/pages/RecoveryCenter.tsx`** — Type `failedRuns` with join shape; remove `as never[]`
- **`src/pages/PermissionsCenter.tsx`** — Read `trust_score`/`is_primary` from metadata
- **`src/pages/WorkflowsCenter.tsx`** — Fix insert to use typed object
- **`src/pages/admin/TeamManagement.tsx`** — Type `perf` with PerfData interface; cast `totalCalls` to number
- **`src/pages/admin/AR06ExecutionTraceExplorer.tsx`** — Type joined `scheduled_jobs`
- **`src/pages/admin/AR07RetryFailureCenter.tsx`** — Same join typing
- **`src/pages/admin/AR08KillSwitchCenter.tsx`** — Type `existing` kill switch record
- **`src/pages/admin/ComputeGovernanceBoard.tsx`** — Stringify `downgradeReason`
- **`src/pages/admin/ConnectorGovernanceCenter.tsx`** — Use `connected_at` instead of `last_sync_at` or read from metadata
- **`src/pages/admin/FL01FlagshipLoopsExecutive.tsx`** — Type verification runs; remove `as never[]`
- **`src/pages/admin/PersistenceStatus.tsx`** — Use correct column name instead of `receipt_type`
- **`src/pages/admin/ISA01-05,07*.tsx`** (6 files) — Type joined `provider_families`/`provider_capabilities`
- **`src/pages/admin/customer-journey/CJ01ExecutiveReport.tsx`** — Type view data with interface; narrow before indexing
- **`src/pages/admin/customer-journey/CJ08RouteActionCoverage.tsx`** — Narrow `route_key` and numeric fields

**~20 files modified, 0 new files**

## Approach
Fix each at the data boundary (query result or state declaration), not at each JSX usage point. This eliminates all downstream errors from each upstream fix.

