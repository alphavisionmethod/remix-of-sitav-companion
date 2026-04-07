

# Full Platform Error & Integration Audit — Fix Plan

## Current Status

- **TypeScript build**: 0 errors (clean)
- **Dev server**: Running, no errors
- **Console**: No runtime errors

## Remaining Issues Found

### 1. ForgotPassword & ResetPassword still import OS providers
Both `ForgotPassword.tsx` and `ResetPassword.tsx` still import `useDataMode` and `DemoModeBadge` — these are public routes wrapped in `PublicLayout` (no DataModeProvider available). They will crash at runtime.

**Fix**: Remove `useDataMode` import and `DemoModeBadge` from both files (same pattern already applied to Login/Signup).

**Files**: `src/pages/auth/ForgotPassword.tsx`, `src/pages/auth/ResetPassword.tsx`

### 2. useAction() hook never created — kernel adoption at ~0.4%
The plan called for a `useAction()` hook wrapping `kernel.executeAction()` wired into the 10 highest-risk mutation pages. `useCanonicalAction()` exists in `SitaKernelContext` but is only used in 1 page (`ReplayRecoveryConsole`). 

26 page files contain 61 direct `fromTable`/`supabase.from` mutation calls (insert/update/delete) bypassing the kernel entirely.

**Fix**: Create `src/lib/hooks/useAction.ts` as a thin wrapper around `useCanonicalAction()` that:
- Accepts domain, capability, payload
- Returns `{ mutate, isLoading, error, data }`
- Integrates with React Query for cache invalidation

Wire it into the **10 P0 mutation pages**:
- `money/BillsWorkspace.tsx` (5 mutations)
- `money/SubscriptionsWaste.tsx` (4 mutations)
- `money/ReservesSavings.tsx` (2 mutations)
- `owner/ConstitutionEditor.tsx` (already has kernel context, needs mutation wiring)
- `business/CustomersPage.tsx` (1 mutation)
- `business/InvoicesCollections.tsx` (mutations)
- `business/LeadsInbox.tsx` (mutations)
- `WorkflowsCenter.tsx` (1 mutation)
- `AutomationCenter.tsx` (mutations)
- `ApprovalsCenter.tsx` / `admin/HQApprovalQueue.tsx` (mutations)

Each mutation call gets replaced with `useAction("finance-os", "bill.pay", { id })` style calls that route through the canonical execution chain.

### 3. Remaining `as never` casts (cosmetic, non-blocking)
~30 `as never` casts remain in admin pages (Badge variants, Tabs values, insert calls). These don't cause build errors but are type-safety gaps. Lower priority — can be addressed in a follow-up.

## Summary of Changes

| File | Change |
|---|---|
| `src/pages/auth/ForgotPassword.tsx` | Remove `useDataMode`, `DemoModeBadge` |
| `src/pages/auth/ResetPassword.tsx` | Remove `useDataMode`, `DemoModeBadge` |
| `src/lib/hooks/useAction.ts` | **New** — kernel mutation hook with React Query integration |
| 10 P0 page files | Replace `fromTable` mutations with `useAction()` calls |

**~13 files modified, 1 new file**

## Technical Detail

The `useAction` hook pattern:

```ts
export function useAction(domain: string, capabilityId: string, options?: { queryKeysToInvalidate?: string[][] }) {
  const { execute, isExecuting, error } = useCanonicalAction();
  const queryClient = useQueryClient();
  
  const mutate = useCallback(async (payload: Record<string, unknown>) => {
    const result = await execute(domain, capabilityId, payload);
    if (result && options?.queryKeysToInvalidate) {
      options.queryKeysToInvalidate.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    }
    return result;
  }, [execute, domain, capabilityId, queryClient, options]);
  
  return { mutate, isLoading: isExecuting, error };
}
```

Page usage:
```tsx
const { mutate: payBill, isLoading } = useAction("finance-os", "bill.pay", {
  queryKeysToInvalidate: [["bills"]]
});
// replaces: await fromTable("bills").update({ status: "paid" }).eq("id", id)
await payBill({ id, status: "paid" });
```

