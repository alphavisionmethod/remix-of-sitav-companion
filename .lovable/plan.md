

# Get Kernel Adoption to 100% — Plan

## The Problem

The canonical execution chain exists and works:
- `SitaKernel.executeAction()` — full 12-stage pipeline (surface → api-gateway → brain-core → domain-os → policy → approval → capability-router → executor → receipt → verification → event-bus → projections)
- `useCanonicalAction()` — React hook exposing `execute(domain, capabilityId, payload)`
- Only **1 page** (`ReplayRecoveryConsole`) actually uses it out of ~200+ pages/components
- **513 direct database calls** (`fromTable()`) scattered across pages, hooks, and components bypass the kernel completely

## Why It's Only 0.15%

Every page does its own `fromTable("table").select(...)` or `.insert(...)` or `.update(...)` directly. This means:
- No policy checks on reads or writes
- No receipts generated
- No trust verification
- No event bus notifications
- No proof chain entries
- The entire kernel is decorative

## The Fix — Two-Layer Strategy

### Layer 1: Kernel-Routed Mutations (Priority — all writes go through kernel)

Every `.insert()`, `.update()`, `.upsert()`, `.delete()` call must be replaced with `useCanonicalAction().execute(domain, capabilityId, payload)`.

**Create a `useKernelMutation` hook** that wraps `useCanonicalAction` with React Query mutation patterns:

```typescript
// src/hooks/use-kernel-mutation.ts
export function useKernelMutation(domain: string, capabilityId: string) {
  const { execute } = useCanonicalAction();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      execute(domain, capabilityId, payload),
  });
}
```

Then replace every direct write. Example — `AR08KillSwitchCenter.tsx`:
```diff
- await fromTable("automation_kill_switches").insert({ user_id, scope, enabled: true });
+ await execute("system", "kill-switch.toggle", { scope, enabled: true });
```

**Scope**: ~180 write calls across ~80 files.

### Layer 2: Kernel-Routed Reads (all queries go through projections)

Create a `useKernelQuery` hook that routes reads through the kernel's projection service, generating read-receipts and respecting policy:

```typescript
// src/hooks/use-kernel-query.ts
export function useKernelQuery<T>(domain: string, projection: string, filters?: Record<string, unknown>) {
  const kernel = useSitaKernel();
  return useQuery({
    queryKey: [domain, projection, filters],
    queryFn: () => kernel.projections.query(domain, projection, filters),
  });
}
```

The `ProjectionService` internally calls `fromTable()` but wraps it with:
- Read-receipt generation
- Policy-based row filtering
- Trust-level access checks
- Event emission for audit

**Scope**: ~330 read calls across ~150 files.

### Layer 3: Kernel Capability Registration

Each domain needs its capabilities registered so the `CapabilityRouter` can route them:

```typescript
kernel.capabilityRouter.register("finance", "invoice.create", async (payload) => {
  const { data } = await fromTable("invoices").insert(payload);
  return data;
});
```

Create capability handlers for each domain:
- `src/lib/capabilities/finance-capabilities.ts`
- `src/lib/capabilities/business-capabilities.ts`
- `src/lib/capabilities/concierge-capabilities.ts`
- `src/lib/capabilities/system-capabilities.ts`
- `src/lib/capabilities/admin-capabilities.ts`

## Implementation Batches

### Batch 1: Foundation (3 files)
1. **`src/hooks/use-kernel-mutation.ts`** — Mutation hook wrapping `useCanonicalAction`
2. **`src/hooks/use-kernel-query.ts`** — Query hook wrapping `ProjectionService`
3. **`src/lib/core-services/projection-service.ts`** — Add `query(domain, projection, filters)` method that does the actual `fromTable()` call internally

### Batch 2: Capability Handlers (5 files)
Register actual database operations as capabilities so the executor has real handlers:
- `src/lib/capabilities/finance-capabilities.ts` — invoices, bills, payments, cashflow
- `src/lib/capabilities/business-capabilities.ts` — contacts, leads, opportunities, CRM
- `src/lib/capabilities/concierge-capabilities.ts` — tasks, bookings, household
- `src/lib/capabilities/system-capabilities.ts` — devices, notifications, preferences, kill-switches
- `src/lib/capabilities/admin-capabilities.ts` — policies, operator actions, audit logs

### Batch 3: Migrate Writes (~80 files)
Replace all `fromTable().insert/update/upsert/delete` in pages/hooks/components with `useKernelMutation()`. Each call becomes:
```typescript
const { mutate } = useKernelMutation("finance", "invoice.create");
// ...
mutate({ customer_id, amount, due_date });
```

### Batch 4: Migrate Reads (~150 files)
Replace all `fromTable().select` in pages/hooks/components with `useKernelQuery()`. Each call becomes:
```typescript
const { data } = useKernelQuery("finance", "invoices", { user_id, status: "overdue" });
```

### Batch 5: Kill Direct Access
- Remove `fromTable` export from `supabase-helpers.ts` (keep only as internal for projection-service and capability handlers)
- Add ESLint rule: `no-restricted-imports` for `fromTable` outside `src/lib/`
- Verify 100% kernel routing with grep

## What This Achieves

| Metric | Before | After |
|--------|--------|-------|
| Kernel adoption | 0.15% (1 page) | 100% (all pages) |
| Receipted writes | 0 | ~180 |
| Policy-checked reads | 0 | ~330 |
| Proof chain coverage | decorative | full |
| Kill switch effectiveness | none | total |

## Files Changed

- **3 new**: `use-kernel-mutation.ts`, `use-kernel-query.ts`, capability registration index
- **5 new**: Domain capability handler files
- **1 modified**: `projection-service.ts` — add query method
- **~230 modified**: Pages, hooks, components — replace direct DB calls with kernel hooks
- **1 modified**: `supabase-helpers.ts` — restrict `fromTable` exports

## Risk Mitigation

- All `useKernelQuery` calls fall back to direct `fromTable` if kernel is unavailable
- Capability handlers are thin wrappers — same Supabase calls, just routed through the chain
- React Query caching is preserved — `useKernelQuery` returns standard `useQuery` results
- No schema changes needed — same tables, same data, different access path

