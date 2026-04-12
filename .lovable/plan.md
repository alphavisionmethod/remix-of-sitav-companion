

# Fix: TypeScript Build Errors Across All Supabase Calls

## Problem
The auto-generated `types.ts` has an empty database schema, so every `supabase.from("table_name")` call fails with `'table_name' is not assignable to parameter of type 'never'`. Same for `supabase.rpc()`. The system services layer is already fully implemented — this is the only remaining blocker.

## Solution
Cast `supabase` to `any` at the call site for every affected `.from()` and `.rpc()` call. The project already has a `fromTable()` helper in `src/lib/supabase-helpers.ts` — some files use it, most don't. The fix is to add `as any` casts to every bare `supabase.from()` and `supabase.rpc()` call across all affected files.

## Files to Fix (13 files)

| File | Error Count | Fix |
|------|-------------|-----|
| `src/components/sita/RuntimeTruthProbe.tsx` | 1 | Cast `.from("operating_modes" as any)` |
| `src/contexts/AppPlatformContext.tsx` | 5 | Already partially fixed — remaining `.from()` calls need `as any` |
| `src/contexts/DataModeContext.tsx` | 1 | Already has `as any` — likely needs it on the outer call too |
| `src/hooks/use-admin-durable-state.ts` | 1 | Fix type reference to `policies` table |
| `src/hooks/use-ai-budget-data.ts` | 1 | Cast `.rpc()` call |
| `src/hooks/use-approval-queue-mutations.ts` | 6 | Replace `supabase.from()` with `fromTable()` or add `as any` |
| `src/hooks/use-compute-governance.ts` | 1 | Cast `.rpc()` call |
| `src/hooks/use-implementation-truth.ts` | 2 | Add `as any` casts |
| `src/hooks/use-live-data.ts` | 10 | Replace all `supabase.from()` with `(supabase as any).from()` |
| `src/hooks/use-sita-data.ts` | 2 | Cast two `.from()` calls |
| `src/hooks/use-spec-seed.ts` | 1 | Already has `as any` — check outer call |
| `src/hooks/useAppBadges.ts` | 5 | Cast `.from()` and fix `.domain`/`.urgency` property access |
| `src/hooks/useRequireAdmin.ts` | 1 | Cast `.rpc()` call |
| `src/lib/admin-ai/admin-ai-workforce-client.ts` | ~15 | Replace all `supabase.from()` with `(supabase as any).from()` |
| `src/lib/observability/cost-governance.ts` | remaining | Cast calls |
| `src/lib/services/device-presence-service.ts` | remaining | Cast calls |
| `src/pages/admin/AIG04BudgetCenter.tsx` | remaining | Cast calls |

## Approach
For each file: replace `supabase.from("table")` with `(supabase as any).from("table")` and `supabase.rpc("fn")` with `(supabase as any).rpc("fn")`. For files already importing `fromTable`, migrate remaining direct calls to use it. This is a mechanical find-and-replace across all affected files.

## Note on the System Services
The 5 system services (ServiceManager, FileSystemService, WindowServer, InputService, NotificationService, SettingsService) and barrel exports are **already fully implemented** from the previous message. No additional service code is needed — only these TypeScript fixes remain.

