

# SITA OS — Full Codebase Audit Report

## Summary

After examining every major layer — services, edge functions, admin pages, routing, persistence, AI pipeline, and contracts — the codebase is **remarkably comprehensive**. ~400 pages, ~200 services, ~55 edge functions, a canonical AI gateway, and a full persistence layer. However, there are **specific gaps** that prevent the system from being 100% advanced and correctly wired.

---

## Findings

### 1. Dead Code: `event-broker` Service (orphaned)

**File:** `src/lib/services/event-broker/index.ts`

The `UnifiedEventService` in `src/lib/services/event-bus/unified-event-service.ts` already supersedes this. Zero imports of `event-broker` exist anywhere in the codebase. This should be **deleted** and its barrel export removed from `src/lib/services/index.ts` (if referenced).

### 2. Dead Code: `groundedness-gate` Service (orphaned)

**File:** `src/lib/services/groundedness-gate/index.ts`

Zero imports exist. The canonical `ConscienceGate` in `src/lib/core-services/conscience-gate/conscience-gate.ts` (250 lines, fully advanced) already replaces this. Should be **deleted**.

### 3. Mnemosyne — Missing Memory Service File

The `context-assembler.ts` (307 lines) is **fully advanced** — retrieval, scoping, token budgeting, truncation, evidence assembly. However, the god-tier integration engine flags Mnemosyne as needing expansion with:
- **Conversation history persistence** (currently in-memory only via `getConversationWindow`)
- **Memory graph integration** — the `ai-memory-graph` service exists but is not wired into the context assembler
- **Profile context enrichment** — preferences retrieval is basic (name + onboarded flag only)

### 4. Canonical Pipeline — Placeholder Output

**File:** `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts:164`
```
output: request.input, // Placeholder — real inference happens via edge function
```
The inference step returns input as output. While this is correctly noted as "real inference happens via edge function," the pipeline orchestrator should properly delegate to the `callAIGateway` callable rather than returning a placeholder.

### 5. Dual Service Locations (Shim Pattern)

Multiple services exist in both `src/lib/services/` and `src/lib/core-services/` with reverse shims. While this is architecturally functional, the following have **trivial shim files that could be consolidated**:
- `approval-engine` → shim to `core-services/approval-engine`
- `conscience-gate` → shim to `core-services/conscience-gate`
- Many others follow the same pattern

This is not broken but adds indirection. Low priority — leave as-is unless consolidation sprint is planned.

### 6. `: any` Usage (38 files)

543 instances of `return []`, `return {}`, or `: any` across 38 service files. Most are legitimate fallback returns. The true problems are:
- `src/lib/services/database/index.ts:126` — `const opts: any = {}`
- `src/lib/services/offline-sync/index.ts:69,90,100` — multiple `any` params
- `src/lib/services/business-os/accounts.service.ts:35-36` — `(i: any)`, `(o: any)`
- `src/lib/services/auto-proposal/index.ts:117,121` — `(lead: any)`

These should be properly typed.

### 7. Edge Function: `push-dispatch` — Missing `pg_net` Dependency

The `dispatch_push_notification` DB function calls `net.http_post()` which requires the `pg_net` extension. If not enabled, push dispatch silently fails (caught by the exception handler). Should verify the extension is active.

### 8. Missing: Unified Event Bus Integration with Edge Functions

The `UnifiedEventService` operates entirely in-memory on the client side. Server-side events (from edge functions like `event-processor`, `agent-signal`) don't connect to this bus. For true OS-level event architecture, the event bus needs:
- A Supabase Realtime channel subscription that bridges server events to the client bus
- Currently, `event-processor` edge function exists but nothing subscribes to its output

### 9. Missing: Brain Core → ConscienceGate Wiring

The `brain-core` edge function (751 lines) is fully advanced with intent classification, multi-advisor composition, memory retrieval, policy enforcement, and fallback chains. However, the client-side `ConscienceGate` (pre-response validation) is never called before the edge function invocation in `callBrainCore`. The gate should validate intent before the network call.

### 10. Missing: Service Registry Runtime Validation

`src/lib/services/service-registry/` exists but services register themselves statically. No runtime health check confirms all services are actually initialized and operational. The `SystemHealthDashboard` admin page should pull from a live service heartbeat rather than static config.

---

## Implementation Plan

### Phase 1 — Cleanup (quick wins)
1. **Delete dead services**: Remove `event-broker/index.ts` and `groundedness-gate/index.ts`
2. **Type safety**: Replace `any` with proper types in the 6 identified service files
3. **Canonical pipeline**: Wire `callAIGateway` into pipeline orchestrator instead of placeholder

### Phase 2 — Wiring Gaps
4. **ConscienceGate pre-flight**: Add gate check in `callBrainCore` before edge function invocation
5. **Mnemosyne expansion**: Wire `ai-memory-graph` into `ContextAssembler`, add preferences enrichment
6. **Event bus bridge**: Add Supabase Realtime subscription to `UnifiedEventService` to receive server-side events

### Phase 3 — Runtime Integrity
7. **Service heartbeat**: Add runtime registration + heartbeat to service registry, surface in SystemHealthDashboard
8. **pg_net verification**: Add migration check for `pg_net` extension status

---

## Technical Details

### Files to Delete
- `src/lib/services/event-broker/index.ts`
- `src/lib/services/groundedness-gate/index.ts`

### Files to Modify
- `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts` — replace placeholder with `callAIGateway`
- `src/lib/services/ai-gateway/callable.ts` — add ConscienceGate pre-check to `callBrainCore`
- `src/lib/services/mnemosyne/context-assembler.ts` — integrate memory graph + richer profile
- `src/lib/services/event-bus/unified-event-service.ts` — add Realtime bridge
- `src/lib/services/database/index.ts` — type `opts`
- `src/lib/services/offline-sync/index.ts` — type all `any` params
- `src/lib/services/business-os/accounts.service.ts` — type filter callbacks
- `src/lib/services/auto-proposal/index.ts` — type `lead` param

### New Files
- `src/lib/services/service-registry/heartbeat.ts` — runtime service health check

### Estimated Scope
- **Phase 1**: ~30 min — 2 deletions, 5 file edits
- **Phase 2**: ~60 min — 3 substantial integrations
- **Phase 3**: ~30 min — 1 new file, 1 migration check

