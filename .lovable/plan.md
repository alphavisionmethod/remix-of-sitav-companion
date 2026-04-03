

# SITA OS — Unification Layer Implementation Plan

## The Core Problem

Every service creates its own isolated instance. The `EventBus` has a `getEventBus()` singleton — but nothing calls it. The `CanonicalChainOrchestrator` exists — but no UI component uses it. The `EntityContext` is in the React tree — but no service reads it. The `MemoryService`, `TrustStateService`, `ReceiptService` all work — but each lives alone.

**Result:** 40+ services. Zero shared state. The OS is a collection of brilliant demos, not a unified system.

## What the Unification Layer Is

One runtime kernel that boots once, shared by every surface, every hook, every advisor call.

```text
┌─────────────────────────────────────────────────────┐
│                   React App                         │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │         <SitaKernelProvider>                 │   │
│   │                                             │   │
│   │   EventBus (singleton)                      │   │
│   │   CanonicalChain (singleton)                │   │
│   │   MemoryService (singleton)                 │   │
│   │   TrustStateService (singleton)             │   │
│   │   EntityGraphService (singleton)            │   │
│   │   IdentityGraph (singleton)                 │   │
│   │   PolicyEngine (stateless — already shared) │   │
│   │   ReceiptService (singleton)                │   │
│   │   WorkflowEngine (singleton)                │   │
│   │                                             │   │
│   │   Entity context scoping on every call      │   │
│   │                                             │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   useSitaKernel() — access any service              │
│   useCanonicalAction() — Intent → full chain        │
│   useEntityScoped() — auto-scope to current entity  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Task 1: SitaKernel — The Runtime Singleton

**New file:** `src/lib/sita-kernel.ts`

A single class that instantiates every core service exactly once, wiring them together with shared references:

- One `EventBus` — every service uses this one
- One `ReceiptService` — every receipt chains to the same hash sequence
- One `MemoryService` — shared memory across all domains
- One `TrustStateService` — unified trust scores
- One `WorkflowEngine` — all workflows in one state machine
- One `EntityGraphService` — cross-domain entity resolution
- One `IdentityGraph` — identity + household + delegation
- One `CanonicalChainOrchestrator` — wired to all of the above
- One `AgentOrchestrator` — wired to shared EventBus + ReceiptService
- One `ProjectionService` — shared projections

The kernel exposes a `boot()` method and typed getters. It boots lazily on first access.

### Task 2: SitaKernelProvider — React Context

**New file:** `src/contexts/SitaKernelContext.tsx`

A React context that:
- Creates the kernel once on mount
- Subscribes to `EntityContext` changes and scopes the kernel's active entity
- Provides `useSitaKernel()` hook returning typed access to every service
- Provides `useCanonicalAction(domain, capabilityId)` — a hook that calls `kernel.chain.execute()` with the current entity context auto-injected
- Provides `useSharedMemory(key)` — reads from the singleton memory service
- Provides `useSharedTrust(entityId)` — reads from the singleton trust service
- Provides `useProofTimeline(correlationId?)` — reads from the singleton receipt service

**Wire into App.tsx:** Wrap inside `EntityContextProvider`, so kernel can read entity context.

### Task 3: Entity-Scoped Operations

**Modify:** `src/lib/sita-kernel.ts`

Add entity scoping so every operation automatically tags with current entity:
- `kernel.setActiveEntity(entityProfile)` — called when EntityContext changes
- All `memory.store()` calls auto-tag with `entityId`
- All `receipts.createReceipt()` calls include entity in metadata
- All `eventBus.publish()` calls include `tenantId: entity.id`
- All `trust` lookups scope to current entity

### Task 4: Wire useBrainCore Through the Kernel

**Modify:** `src/hooks/use-brain-core.ts`

Currently creates its own `ReceiptService`. Change to:
- Import `useSitaKernel()` 
- Use `kernel.receipts` instead of local instance
- Use `kernel.memory` to store advisor responses
- Use `kernel.eventBus` to emit `advisor.response.v1` events
- Use `kernel.trust` to check advisor trust before executing

This means every advisor call now: generates shared receipts, emits events other services can hear, stores in shared memory, and checks trust.

### Task 5: Wire useSitaData Through the Kernel

**Modify:** `src/hooks/use-sita-data.ts`

Currently standalone Supabase queries. Add:
- On successful data fetch, publish `data.loaded.v1` to shared EventBus
- On mutation, run through `kernel.chain.execute()` instead of raw Supabase calls (for write operations that need policy/approval/proof)
- Entity-scope all queries using `kernel.activeEntity`

### Task 6: Shared Proof Timeline Hook

**New file:** `src/hooks/use-proof-timeline.ts`

A hook that subscribes to the kernel's receipt service and returns a live timeline:
- All receipts from the current session
- Filtered by entity, domain, or correlationId
- Used by Proof Center, Inspector Rail, and Boardroom to show the same data

### Task 7: Shared Event Subscription Hook

**New file:** `src/hooks/use-kernel-events.ts`

A hook that subscribes to the kernel's EventBus:
- `useKernelEvent("execution.completed.v1", handler)` — React-safe subscription
- Auto-unsubscribe on unmount
- Used by: notification system, activity stream, real-time dashboards
- Replaces any component that currently polls or uses isolated state

### Task 8: Wire Existing Surfaces to Kernel

Update key pages to use kernel hooks instead of isolated data:

- **Daily Pulse:** Use `useSharedMemory("daily-pulse")` for advisor recommendations
- **Money Center:** Use `useCanonicalAction("finance", "pay-bill")` for bill payments — gets policy check, receipt, proof
- **Business Center:** Use `useCanonicalAction("business", "update-lead")` for CRM mutations
- **Proof Center:** Use `useProofTimeline()` — shows all receipts from all domains in one view
- **Inspector Rail:** Use `useSharedTrust(entityId)` and `useProofTimeline(correlationId)` — shows trust + proof for inspected entity
- **Owner Center:** Use `useKernelEvent("*")` for live activity feed
- **Boardroom:** Use `useSharedMemory` for replay data sourced from real kernel state

---

## What This Achieves

After implementation:
1. **One EventBus** — every action anywhere emits events that every other surface can hear
2. **One ReceiptService** — every action produces a receipt in one hash chain (Proof Center shows everything)
3. **One MemoryService** — advisors, agents, and surfaces share context
4. **One TrustStateService** — trust scores are system-wide, not per-component
5. **One WorkflowEngine** — all workflows visible in one place
6. **Entity scoping** — switch from Personal to Household and everything re-scopes instantly
7. **Policy enforcement** — every mutation goes through the canonical chain (policy → approval → execution → receipt → projection)

## Implementation Order

1. `SitaKernel` class (the runtime singleton)
2. `SitaKernelContext` + `useSitaKernel()` hook
3. Entity scoping integration
4. `use-brain-core.ts` rewire
5. `use-proof-timeline.ts` and `use-kernel-events.ts` hooks
6. Wire Proof Center, Inspector Rail, Daily Pulse, Money Center
7. Wire Owner Center activity feed and Boardroom replay
8. Wire Business Center mutations through canonical chain

## Technical Notes

- Zero new backend services — this is purely client-side service unification
- Zero breaking changes to existing pages — hooks maintain the same return signatures
- All existing core-services stay exactly as they are (EventBus, MemoryService, etc.) — only their instantiation changes from `new X()` everywhere to `kernel.x` everywhere
- The kernel is tree-shakeable — services only initialize when first accessed
- Performance: singleton services mean less memory, less GC, and shared caches

