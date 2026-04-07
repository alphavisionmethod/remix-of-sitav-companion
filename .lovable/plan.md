

# Eliminate All 761 `as any` Casts — Full Plan

## Scope

761 project-owned `as any` casts across 302 files. Target: **0 casts**.

## Category Breakdown & Fix Strategy

| # | Category | Count | Fix |
|---|----------|-------|-----|
| 1 | **Service hydration** (`state.X as any`) | 177 | Add typed `hydrate(state: ServiceSnapshot)` interface per service |
| 2 | **`(supabase as any).from()`** direct calls | 99 | Replace with `fromTable()` helper (already exists) |
| 3 | **`fromTable` helper itself** | 3 | Replace with typed overloads using `Database["public"]["Tables"]` keyof union |
| 4 | **Browser APIs** (`window/navigator/Intl`) | 21 | Add `src/types/browser.d.ts` ambient declarations |
| 5 | **`return data as any[]`** in hooks | 14 | Add proper return types from Supabase Row types |
| 6 | **Page-level casts** (`trustData as any`, `modelData as any`) | 108 | Define interfaces for each data shape, cast to those |
| 7 | **Edge functions** | 38 | Type request/response bodies, remove casts |
| 8 | **Test files** | 27 | Use `Partial<T>` or proper test fixtures |
| 9 | **Scripts** | 11 | Type script data properly |
| 10 | **Misc** (engines, dual-reality, observability, components, etc.) | ~63 | Individual fixes per pattern |

## Implementation — 8 Batches

### Batch 1: Foundation — Typed `fromTable` + Browser Declarations (24 casts)

**`src/lib/supabase-helpers.ts`** — Replace the untyped helper with a typed overload:
```
type TableName = keyof Database["public"]["Tables"];
function fromTable<T extends TableName>(table: T) {
  return supabase.from(table);
}
```
This makes every `fromTable("table_name")` call fully typed, eliminating the cast at source.

**`src/types/browser.d.ts`** — Ambient declarations for:
- `window.SpeechRecognition` / `webkitSpeechRecognition`
- `window.electron` (with platform, sendNotification, downloadUpdate, etc.)
- `navigator.connection` (NetworkInformation API)
- `Intl.supportedValuesOf`

### Batch 2: Service Hydration Pattern (177 casts, ~100 service files)

Every service follows the same pattern:
```ts
hydrate(state: Record<string, unknown>) {
  if (state.plans) this.plans = new Map(state.plans as any);
  if (state.usage) this.usage = state.usage as any;
}
```

Fix: For each service, define a `Snapshot` interface matching `serialize()` output, then type `hydrate`:
```ts
interface BillingSnapshot {
  plans?: [string, BillingPlan][];
  usage?: UsageRecord[];
  invoices?: BillingInvoice[];
}
hydrate(state: BillingSnapshot) {
  if (state.plans) this.plans = new Map(state.plans);
  if (state.usage) this.usage = state.usage;
}
```

This is mechanical — same pattern across ~100 files.

### Batch 3: Direct `(supabase as any)` in Components/Hooks (99 casts, ~30 files)

Replace every `(supabase as any).from("table")` with `fromTable("table")` (now typed from Batch 1). Files include:
- `ConnectorSyncDashboard.tsx`, `NotificationPanel.tsx`, `PostArrivalDesktop.tsx`
- `use-brain-core.ts`, `use-health-signal-mutations.ts`, `use-user-preferences.ts`, `useOfflineStore.ts`
- `use-adaptive-personalization.ts`, `use-sita-data.ts`
- `canonical-chain-persistence.ts`, `blocker-scoring-engine.ts`
- Multiple CJ hooks, dual-reality files, AI clients

### Batch 4: Hook Return Types (14 casts, ~5 files)

Files like `use-fip-data.ts` (10 casts) and `use-sag-data.ts` (3 casts) do `return data as any[]`. Fix: Import Supabase Row types and return properly typed arrays.

### Batch 5: Page-Level Data Casts (108 casts, ~40 files)

Pages like `OwnerCenter.tsx` (28 casts) do `(trustData as any)?.overallScore`. Fix: Define typed interfaces for each data shape (e.g., `TrustOverview`, `ReleaseRingData`, `ModelUsageData`) and type the state/hook returns.

Files: `OwnerCenter`, `DailyPulse`, `RecoveryCenter`, `FilesSettings`, `AutomationCenter`, `CalendarWorkspace`, `MissionControlPage`, plus ~30 admin pages.

### Batch 6: Edge Functions (38 casts, ~10 files)

Type request bodies and Supabase client calls in edge functions. Replace `(supabase as any)` with typed Supabase client using `Database` generic.

### Batch 7: Engine + Core Services + Observability (66 casts, ~20 files)

- Engines (53 casts): `enterprise-maturity.ts` (17), `memory-governance.ts` (6), etc. — add typed state interfaces
- Core services (7): `canonical-chain-persistence.ts`, `executor-service.ts`, etc.
- Observability (6): `cost-governance.ts`, `telemetry-collector.ts`

### Batch 8: Tests, Scripts, Remaining (38 casts)

- Test files (27): Use `Partial<Type>` instead of `as any` for partial mocks
- Scripts (11): Type the ingestion data in `ingest-journey-results.ts`

## Technical Detail

**Why `fromTable` typing works**: `types.ts` already has 515 tables defined in `Database["public"]["Tables"]`. A typed `fromTable<T extends TableName>(table: T)` returns `PostgrestQueryBuilder<Database["public"]["Tables"][T]["Row"]>`, giving full autocomplete and type safety for every query.

**Service snapshot pattern**: A shared generic could reduce boilerplate:
```ts
type MapSnapshot<K, V> = [K, V][];
```
This lets `new Map(state.plans)` work without casts when `state.plans` is typed as `MapSnapshot<string, BillingPlan>`.

## Files Changed

- **1 modified**: `src/lib/supabase-helpers.ts` — typed overload
- **1 new**: `src/types/browser.d.ts` — ambient declarations
- **~100 modified**: `src/lib/services/*/index.ts` — typed hydration
- **~30 modified**: Components/hooks — `(supabase as any)` → `fromTable()`
- **~5 modified**: Hook files — typed returns
- **~40 modified**: Page files — typed data interfaces
- **~10 modified**: Edge functions — typed bodies
- **~20 modified**: Engines/core-services/observability — typed state
- **~10 modified**: Tests/scripts — proper typing

**Total: ~220 files modified, 2 new files**

## Verification

After all batches: `grep -rn "as any" src/ supabase/ scripts/ tests/ | wc -l` must return **0**.
`npx tsc --noEmit` must return **0 errors**.

