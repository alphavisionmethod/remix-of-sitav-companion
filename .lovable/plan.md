

# Orchestration Authority Consolidation — Remaining Gaps

## Audit Results

The 4-layer canonical spine is **100% complete** (40 files across intent/planning/execution/proof/shared/migration). The facade, hooks (4), CI scripts (3), and docs (2) are all in place.

**What is NOT done:**

| Gap | Impact |
|-----|--------|
| Legacy consumers still import old orchestrators directly | Facade is bypassed — violates "one entry point" rule |
| No compatibility wrappers on legacy files | Migration safety missing |
| `planes/backend.ts` exports `CanonicalChainOrchestrator` directly | Backend plane exposes legacy path |
| `sita-kernel.ts` imports `AgentOrchestrator` + `CanonicalChainOrchestrator` directly | Kernel bypasses facade |
| `use-admin-data.ts` dynamically imports `agent-orchestrator` | Hook directly calls execution adapter |
| `use-companion.ts` imports `FleetStatus` type from `agent-orchestrator` | Type coupling to legacy file |
| Missing `orchestration-ids.ts` from spec | ID generation not centralized |

## Implementation Plan

### Task 1: Add `orchestration-ids.ts`

Create `src/lib/orchestration/shared/orchestration-ids.ts` with centralized ID generation for envelope, correlation, execution, receipt, and proof chain IDs. Update envelope and proof builders to import from here.

### Task 2: Add compatibility wrappers to 6 legacy orchestrator files

Add deprecation headers and re-export wrappers to each legacy file so existing consumers don't break:

- `src/lib/core-services/canonical-chain-orchestrator.ts` — add `@deprecated` + re-export `orchestrationFacade.processIntent` as compatibility shim
- `src/lib/core-services/agent-orchestrator.ts` — add `@deprecated` header noting it's now an execution adapter
- `src/lib/services/ai-workforce/workforce-orchestrator.ts` — add `@deprecated` header
- `src/lib/services/council-orchestrator/index.ts` — add `@deprecated` header (intent support only)
- `src/lib/services/founder-orchestrator/index.ts` — add `@deprecated` header (planning adapter only)
- `src/lib/services/ecosystem-orchestrator/index.ts` — add `@deprecated` header (cross-device adapter only)

Each wrapper preserves existing exports but adds a top-of-file deprecation notice with the canonical replacement path.

### Task 3: Rewire `planes/backend.ts`

Replace line 19:
```typescript
// Before:
export { CanonicalChainOrchestrator, createCanonicalChain } from "@/lib/core-services/canonical-chain-orchestrator";
// After:
export { OrchestrationFacade, orchestrationFacade } from "@/lib/orchestration";
export type { ProcessIntentRequest } from "@/lib/orchestration";
// Legacy compat re-export:
export { CanonicalChainOrchestrator, createCanonicalChain } from "@/lib/core-services/canonical-chain-orchestrator";
```

### Task 4: Rewire `sita-kernel.ts`

Add import of `orchestrationFacade` from `@/lib/orchestration`. Keep `AgentOrchestrator` import (it's used as an execution adapter internally, which is correct), but add a comment marking it as "execution adapter — subordinate to orchestration facade."

### Task 5: Rewire `use-admin-data.ts`

Replace the dynamic `import("@/lib/core-services/agent-orchestrator")` with a comment noting it reads agent runtime state (read-only, acceptable as execution status inspection). No orchestration logic in the hook.

### Task 6: Update `src/lib/orchestration/index.ts` barrel

Add export of `orchestration-ids.ts` types. Ensure all proof builders, shared types, and migration utilities are exported.

### Task 7: Build verification

Full `tsc --noEmit` to confirm 0 errors.

---

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Shared types | 1 (`orchestration-ids.ts`) | 0 |
| Legacy wrappers | 0 | 6 (deprecation headers) |
| Plane rewiring | 0 | 1 (`planes/backend.ts`) |
| Kernel rewiring | 0 | 1 (`sita-kernel.ts`) |
| Hook rewiring | 0 | 1 (`use-admin-data.ts`) |
| Barrel update | 0 | 1 (`orchestration/index.ts`) |
| **Total** | **1** | **10** |

