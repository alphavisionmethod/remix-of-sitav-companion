

# SITA OS — Full Codebase Audit Report (Post-Phase 1-3)

## Previous Audit Completions (verified)

The Phase 1-3 work from the last audit was correctly implemented:
- **event-broker** deleted, barrel export removed ✅
- **groundedness-gate** deleted, barrel export removed ✅
- **Pipeline orchestrator** wired to `callAIGateway` ✅
- **ConscienceGate pre-flight** in `callBrainCore` ✅
- **Mnemosyne context-assembler** expanded (425 lines, memory graph, persisted conversation, rich profiles) ✅
- **Unified Event Service** Realtime bridge added ✅
- **Service heartbeat** created ✅
- **Type safety** fixed in `database`, `offline-sync`, `accounts.service`, `auto-proposal` ✅

## Remaining Gaps Found

### 1. Stale References to Deleted Services (5 files)

The god-tier-integration-engine.ts and service-ownership-registry.ts still reference `groundedness-gate/` and `event-broker/` as if they exist. These references should be updated to reflect the completed consolidations.

**Files:**
- `src/lib/services/architecture/god-tier-integration-engine.ts` — lines 65-85 (ConscienceGate entry still says "groundedness-gate/" exists), lines 200-216 (Event Bus entry still says "event-broker/" exists), lines 560-564 (anti-sprawl matrix), lines 676-680 (phase roadmap)
- `src/lib/services/service-registry/service-ownership-registry.ts` — line 220 (transitional: `groundedness-gate`), line 408 (directory classification)

### 2. Remaining `: any` Types (6 files, ~80 instances)

**Priority files:**
- `src/lib/services/finance-os/overview.service.ts:36` — `(a: any)`
- `src/lib/services/flagship-loops/flagship-loop-service.ts:284-286` — `loops: any[]`, `(l: any)`
- `src/lib/services/google-provider-family/google-provider-family.service.ts` — 14 instances of `(c: any)`, `(s: any)`, `(p: any)`, `(e: any)`, plus `getGoogleConsentHistory(): Promise<any[]>`
- `src/lib/services/observability/observability-service.ts:174-176,189` — `(r: any)`, `(d: any)`
- `src/lib/services/approval-engine/approval-requests.service.ts:102` — `([k, v]: any)`
- `src/lib/services/push-notification/push-registration-service.ts:90` — `mod: any` (legitimate dynamic import, can ignore)

### 3. Realtime Bridge Not Wired into PlatformInit

`startRealtimeBridge()` exists in `UnifiedEventService` but is never called. It should be invoked from `PlatformInit.tsx` (or a new hook) so server-side events flow to the client bus after authentication.

### 4. Service Heartbeat Not Wired into SystemHealthDashboard

`serviceHeartbeat` is created but never imported anywhere. The `SystemHealthDashboard` page uses `runAllProbes()` from `health-probes` but doesn't include service registry heartbeat data.

### 5. Stale Mnemosyne Description in god-tier-integration-engine

Lines 124-136 still describe Mnemosyne as "stub — 34 lines" needing expansion, but it's now 425 lines with memory graph, profile enrichment, and conversation persistence.

### 6. Stale `mnemosyne-service.ts` Reference

The god-tier engine references `src/lib/services/mnemosyne/mnemosyne-service.ts` (line 126) which no longer exists. The canonical file is `context-assembler.ts`.

---

## Implementation Plan

### Phase A — Update Stale Architecture References (~15 min)
1. Update `god-tier-integration-engine.ts`:
   - ConscienceGate entry: mark as "✅ Completed — consolidated into conscience-gate/"
   - Event Bus entry: mark as "✅ Completed — merged into unified-event-service.ts"
   - Mnemosyne entry: update to "✅ Completed — 425-line context assembler with memory graph"
   - Anti-sprawl matrix: update statuses to "completed"
   - Phase roadmap: mark items as done
2. Update `service-ownership-registry.ts`: remove `groundedness-gate` from transitional and directory classification arrays

### Phase B — Fix Remaining `: any` Types (~15 min)
3. Type `finance-os/overview.service.ts` — replace `(a: any)` with proper record type
4. Type `flagship-loops/flagship-loop-service.ts` — replace `any[]` with `{ truth_pct?: number }[]`
5. Type `google-provider-family.service.ts` — replace all 14 `any` instances with `Record<string, unknown>` and type the consent history return
6. Type `observability/observability-service.ts` — replace `(r: any)` with `{ data: unknown[] }` pattern
7. Type `approval-engine/approval-requests.service.ts` — replace `([k, v]: any)` with `[string, unknown]`

### Phase C — Wire Unused Services (~10 min)
8. Add `useRealtimeBridge` hook that calls `unifiedEventService.startRealtimeBridge()` on auth, wire into `PlatformInit.tsx`
9. Add heartbeat section to `SystemHealthDashboard.tsx` importing `serviceHeartbeat`

### Technical Details

**Files to modify:**
- `src/lib/services/architecture/god-tier-integration-engine.ts` — update ~8 status fields
- `src/lib/services/service-registry/service-ownership-registry.ts` — remove 2 stale entries
- `src/lib/services/finance-os/overview.service.ts` — 1 line type fix
- `src/lib/services/flagship-loops/flagship-loop-service.ts` — 3 line type fix
- `src/lib/services/google-provider-family/google-provider-family.service.ts` — 14 type fixes
- `src/lib/services/observability/observability-service.ts` — 4 type fixes
- `src/lib/services/approval-engine/approval-requests.service.ts` — 1 type fix
- `src/components/sita/PlatformInit.tsx` — add Realtime bridge init
- `src/pages/admin/SystemHealthDashboard.tsx` — add heartbeat section

**New files:**
- `src/hooks/useRealtimeBridge.ts` — hook to start/stop Realtime bridge on auth state

