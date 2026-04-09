

# Fix All 10 TS2345 Build Errors

## Root Cause

`src/hooks/use-action.ts` (used by all 35 migrated pages) hardcodes `payload: Record<string, unknown>` instead of using a generic type parameter. The build system is rejecting calls where TypeScript can't confirm the exact type match.

## Fix (2 changes)

### 1. Make `useAction` generic in `src/hooks/use-action.ts`

Change the function signature from:
```ts
export function useAction(domain, capabilityId, options) {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
```

To (matching the pattern already in `src/lib/hooks/useAction.ts`):
```ts
export function useAction<TPayload = Record<string, unknown>>(domain, capabilityId, options) {
  return useMutation<Record<string, unknown> | null, Error, TPayload>({
    mutationFn: async (payload: TPayload) => {
      const result = await execute(domain, capabilityId, payload as unknown as Record<string, unknown>);
```

Do the same for `useActionFn`.

### 2. Re-touch all 10 erroring files

Add a trivial trailing comment to force the build to recompile them:
- `src/pages/ConnectorHub.tsx`
- `src/pages/MemoryCenter.tsx`
- `src/pages/PolicyEditor.tsx`
- `src/pages/admin/CN06ConnectorDemoReview.tsx`
- `src/pages/admin/TeamManagement.tsx`
- `src/pages/business/OpportunitiesCenter.tsx`
- `src/pages/business/QuotesWorkspace.tsx`
- `src/pages/concierge/HouseholdTasks.tsx`
- `src/pages/InboxCapture.tsx` (if still erroring)

## Files Changed
- **1 updated**: `src/hooks/use-action.ts` (add generic type parameter)
- **~10 touched**: page files (force recompilation)

