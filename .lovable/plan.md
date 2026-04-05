

# SITA OS — Fix 123 In-Memory Services: DB-Backing Plan

## Current State

**Already fixed (working correctly):**
- **EventBus** → `os_event_log` (fully wired, persistence on every publish)
- **MemoryService** → `os_memory_scoped` (fully wired, supersession, forget audit)
- **PolicyEngine** → `os_policy_evaluations` (fully wired, deny/approval decisions persisted)
- 25 services already import Supabase and use existing tables

**The problem:** 123 services use in-memory `Map()`, arrays, or class state. Data dies on refresh.

**BUT — critical nuance:** Most of these 123 services are **pure logic/type-export modules** (brain-core, capability-router, executor-service). They don't hold durable state — they compute, classify, or orchestrate. Only ~30-40 services actually hold meaningful state that should survive refresh.

## Strategy: Tiered Persistence

Instead of individually wiring 123 services (weeks of work, massive code churn), we implement a **universal persistence substrate** that any service can opt into with 1-2 lines of code.

### Phase 1 — Universal Service Persistence Hook (Day 1)

Create a generic `useServicePersistence` system that:
- Wraps any class-based service with automatic save/load to a single `os_service_state` table
- Uses the existing `engine_state` table pattern (already exists in DB)
- Services opt in by adding `implements Persistable` and calling `this.persist()`

**New table:** `os_service_state` (generic key-value state store per service per user)

```
os_service_state
  id UUID PK
  user_id UUID NOT NULL
  service_id TEXT NOT NULL (e.g. "billing", "booking-scheduling")
  state_snapshot JSONB NOT NULL
  version INTEGER DEFAULT 1
  updated_at TIMESTAMPTZ
  UNIQUE(user_id, service_id)
```

**New adapter:** `src/lib/persistence/universal-service-persistence.ts`
- `saveServiceState(serviceId, state)` → upsert to `os_service_state`
- `loadServiceState(serviceId)` → fetch from `os_service_state`
- Debounced auto-save (30s intervals)

### Phase 2 — Wire Top-Priority Stateful Services (Day 1-2)

Add persistence to the ~15 highest-impact services that hold real user state:

| Service | State Type | Table |
|---------|-----------|-------|
| billing | plans, invoices, usage | `os_service_state` |
| booking-scheduling | bookings, availability | `bookings` (exists) |
| capital-allocation | allocations | `capital_allocations` (exists) |
| workflow-engine | workflow runs | `os_service_state` |
| notifications | queue, preferences | `notifications_queue` (exists) |
| approval-engine | pending approvals | `approval_queue` (exists) |
| executor-service | execution state | `execution_envelopes` (exists) |
| receipt-service | receipts | `agent_action_receipts` (exists) |
| connector-runners | connector state | `connector_sync_history` (exists) |
| communication-service | messages | `communications` (exists) |
| timeline-calendar | events | `events` (exists) |
| keyvault | secrets | `encrypted_secrets` (exists) |
| entity-graph | entities | `os_service_state` |
| decision-intelligence | decisions | `os_service_state` |
| trust-governor | trust state | `os_service_state` |

For services where a dedicated table already exists, wire the import. For others, use `os_service_state`.

### Phase 3 — Wire Remaining Stateful Services (Day 2-3)

Add `os_service_state` persistence to the next ~20 services:
- personalization-engine, family-constitution, autonomous-negotiation, ai-economics, ai-workforce, model-router, opportunity-radar, duress-detection, revenue-autopilot, digital-twins, etc.

### Phase 4 — Mark Pure-Logic Services as Non-Stateful (Day 3)

~70-80 services are pure logic (re-exports, type definitions, stateless functions). These don't need persistence — they just need to be documented as stateless. Examples:
- brain-core (re-exports orchestration functions)
- capability-router (re-exports registry)
- accuracy-classifier, auth, data-scope-model, etc.

Add a `// @persistence: none — stateless module` header comment to each.

## Technical Details

### Migration SQL
One table: `os_service_state` with RLS, indexes on `(user_id, service_id)`, and `update_updated_at` trigger.

### Universal Persistence Adapter
```typescript
// saveServiceState(serviceId, stateObject) → upserts JSONB
// loadServiceState(serviceId) → returns parsed state
// createPersistentService(serviceId, factory) → auto-hydrate on init
```

### Per-Service Wiring Pattern
Each stateful service gets:
1. Import the universal adapter
2. In constructor: `loadServiceState("billing").then(s => this.hydrate(s))`
3. On mutation: `debouncedSave("billing", this.serialize())`
4. ~5-10 lines of code per service

### Files Created/Modified
- **1 migration** — `os_service_state` table
- **1 new file** — `src/lib/persistence/universal-service-persistence.ts`
- **~35 modified services** — add persistence calls
- **~80 annotated services** — mark as stateless

## Outcome
- 3 critical services already persist (EventBus, Memory, Policy) ✅
- ~35 stateful services gain DB persistence via universal adapter
- ~80 stateless services documented as needing no persistence
- State survives refresh for all meaningful services
- Single migration, single adapter, minimal per-service code

