

# Fix Service Layer Boundary Audit — 16 Services to 100%

## Current State

The audit identified 16 services needing action. Investigation reveals:

### 7 MISSING Services (need to move to core-services)
Real implementations live in `lib/services/`. The `core-services/` directories only contain thin re-export shims pointing back to `lib/services/` — the code was never actually moved.

| Service | Files in lib/services | core-services status |
|---------|----------------------|---------------------|
| brain-core | 10 files | shim only |
| model-router | 2 files | shim only |
| conscience-gate | 3 files | shim only |
| inference-gateway | 1 file | shim only |
| mnemosyne | 2 files | shim only |
| trust-governor | 1 file | shim only |
| approval-engine | 5 files | shim only |

### 9 DUP Services (need deduplication)
These exist in both locations with real code. For example `event-bus` has:
- `core-services/event-bus.ts` (standalone implementation)
- `core-services/event-bus/index.ts` (shim → lib/services)
- `lib/services/event-bus/` (5 real files)

| Service | lib/services files | core-services flat file |
|---------|-------------------|------------------------|
| event-bus | 5 | yes |
| receipt-service | 5 | yes |
| policy-engine | 5 | yes |
| memory-service | 7 | yes |
| executor-service | 4 | yes |
| verification-engine | 6 | yes |
| capability-router | 4 | yes |
| projection-service | 1 | yes |
| workflow-engine | 1 | yes |

### 95 Boundary Violations
95 imports in `src/pages/` and `src/components/` reference `@/lib/services/` directly instead of `@/lib/core-services/`.

## Plan — 3 Steps

### Step 1: Move 7 MISSING services to core-services (actual move)

For each of brain-core, model-router, conscience-gate, inference-gateway, mnemosyne, trust-governor, approval-engine:
1. Copy all implementation files from `lib/services/{svc}/` into `core-services/{svc}/`
2. Update the `core-services/{svc}/index.ts` to export from local files (not from lib/services)
3. Replace `lib/services/{svc}/index.ts` with a **reverse shim** pointing to `core-services/{svc}/` so existing consumers don't break

### Step 2: Deduplicate 9 DUP services

For each of event-bus, receipt-service, policy-engine, memory-service, executor-service, verification-engine, capability-router, projection-service, workflow-engine:
1. The `core-services/{svc}.ts` flat file is already the canonical implementation
2. Update `core-services/{svc}/index.ts` to re-export from `../{svc}.ts` (the local flat file) instead of from `lib/services/`
3. Replace `lib/services/{svc}/index.ts` with a **reverse shim** pointing to `core-services/{svc}`

### Step 3: Repoint 95 boundary-violating imports

Update all 95 imports in pages/components that reference `@/lib/services/brain-core`, `@/lib/services/event-bus`, etc. to instead import from `@/lib/core-services/brain-core`, `@/lib/core-services/event-bus`, etc.

The reverse shims from Steps 1-2 ensure nothing breaks during this transition, but the imports should still be updated for audit compliance.

## Files Changed
- **16 `core-services/*/index.ts`**: updated to export real code, not shims
- **16 `lib/services/*/index.ts`**: converted to reverse shims → core-services
- **24 implementation files**: copied from lib/services to core-services (7 MISSING services)
- **~95 import statements**: repointed from `lib/services/` to `core-services/`

## Risk
Medium — reverse shims in `lib/services/` prevent any runtime breakage. All existing imports continue to resolve. TypeScript build verification after each step.

