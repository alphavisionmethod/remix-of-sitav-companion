

## Wave 12.5 — Advisor Runtime Wiring & Deduplication

### Problem

The advisor governance layer is **structurally complete but operationally disconnected**:

1. `src/lib/advisors/` (10 files, 416 lines) — canonical contracts with **zero consumers**
2. `src/domains/engines/advisor-orchestration.ts` — a **parallel advisor registry** (9 advisors with different IDs: `trust-advisor`, `risk-advisor`, `execution-advisor`) that the UI components actually import
3. `src/domains/engines/cross-advisor-coordinator.ts` — duplicates debate/conflict logic from `src/lib/advisors/advisor-debate-orchestrator.ts`
4. `src/packages/advisor-runtime-contracts/` — requested in the plan but never created
5. No page, component, hook, or edge function imports from `@/lib/advisors`

### Phase 1 — Unify Advisor Identity (Consolidate Duplicates)

**Problem**: Two advisor registries exist with incompatible IDs.

| Source | Advisors | Used By |
|---|---|---|
| `src/packages/advisor-config/registry.ts` | 26 advisors (ExtendedAdvisorId) | `Boardroom.tsx`, `AdvisorRegistry.tsx` |
| `src/domains/engines/advisor-orchestration.ts` | 9 advisors (different IDs) | All `advisor-board/` components |
| `src/lib/advisors/advisor-identity-registry.ts` | 26 advisors | Nothing |

**Action**: Refactor `src/domains/engines/advisor-orchestration.ts` to import identity data from `src/lib/advisors/advisor-identity-registry.ts` instead of maintaining its own `CORE_ADVISORS` array. Map legacy IDs (`trust-advisor`, `risk-advisor`, etc.) to canonical ExtendedAdvisorId entries. Add the missing advisors to `advisor-identity-registry.ts` if needed.

**Files modified**:
- `src/domains/engines/advisor-orchestration.ts` — import from canonical registry, remove inline advisor definitions
- `src/lib/advisors/advisor-identity-registry.ts` — add `trust-advisor`, `risk-advisor`, `execution-advisor`, `family-advisor`, `growth-advisor`, `boardroom-advisor`, `collections-advisor`, `travel-advisor`, `school-advisor` entries (9 additional identities)

### Phase 2 — Wire Contracts Into Domain Engines

**Problem**: The governance contracts (confidence, escalation, permissions, reversibility, debate, conflict resolution) exist in `src/lib/advisors/` but are unused. The domain engines (`advisor-orchestration.ts`, `cross-advisor-coordinator.ts`, `advisor-tool-execution-engine.ts`) implement their own inline versions.

**Action**: Wire each domain engine to consume the canonical contracts.

**Files modified**:
- `src/domains/engines/advisor-orchestration.ts` — import and use `evaluateConfidenceGate` from `advisor-confidence-policy.ts`, `shouldEscalate` from escalation policy, `getDisablementPolicy` from disablement policy
- `src/domains/engines/cross-advisor-coordinator.ts` — import and use `resolveConflict` from `advisor-conflict-resolution-policy.ts` and `resolveDebate` from `advisor-debate-orchestrator.ts` instead of inline logic
- `src/domains/engines/advisor-tool-execution-engine.ts` — import `isActionAllowed` from permission matrix, `getReversibility` from reversibility map
- `src/domains/engines/advisor-reflection-engine.ts` — import `deriveAdjustments` from `advisor-reflection-policy-loop.ts`
- `src/domains/engines/advisor-memory-engine.ts` — import `shouldExpire`, `shouldPromote`, `getAgingRule` from `advisor-memory-aging-policy.ts`

### Phase 3 — Wire Contracts Into UI Components

**Problem**: UI components for debate, escalation, tool execution, memory, and performance use hardcoded logic instead of the canonical contracts.

**Action**: Wire key UI components to consume contracts for display and enforcement.

**Files modified**:
- `src/components/business/advisor-board/AdvisorDebateView.tsx` — import `DebatePolicy` type and `resolveDebate` for programmatic resolution display
- `src/components/business/advisor-board/EscalationPacketPreview.tsx` — import `ESCALATION_RULES` to display which rule triggered the escalation
- `src/components/business/advisor-board/AdvisorToolExecutionPanel.tsx` — import `isActionAllowed` and `getReversibility` for permission/reversibility badges
- `src/components/business/advisor-board/AdvisorMemoryInspector.tsx` — import `MEMORY_AGING_RULES` for aging layer visualization
- `src/components/business/advisor-board/AdvisorPerformancePanel.tsx` — import `getDisablementPolicy` for failure mode display

### Phase 4 — Create Typed Runtime Contracts Package

**Problem**: `src/packages/advisor-runtime-contracts/` was specified but never created.

**Action**: Create a thin typed-contract package that re-exports and groups all advisor governance types into a single import surface for edge functions and future packages.

**Files created**:
- `src/packages/advisor-runtime-contracts/index.ts` — barrel re-exporting all types from `@/lib/advisors` and `@/lib/ai-platform/runtime/advisor-*`
- `src/packages/advisor-runtime-contracts/types.ts` — unified `AdvisorRuntimeContext` interface combining identity + persona + permissions + confidence + escalation + reversibility + memory + override + diagnostics into one typed context object
- `src/packages/advisor-runtime-contracts/resolver.ts` — `resolveAdvisorContext(advisorId)` function that assembles the full `AdvisorRuntimeContext` from all canonical registries in one call

### Phase 5 — Wire Edge Functions to Contracts

**Problem**: The 9 advisor edge functions (`advisor-agent-loop`, `advisor-conversation`, `chat-advisor`, etc.) do not reference the governance contracts.

**Action**: Import the `AdvisorRuntimeContext` resolver into key edge functions to enforce governance at the execution boundary.

**Files modified**:
- `supabase/functions/advisor-agent-loop/index.ts` — import permission matrix and escalation policy for action gating
- `supabase/functions/advisor-conversation/index.ts` — import confidence gates for response quality enforcement
- `supabase/functions/chat-advisor/index.ts` — import persona boundaries for domain fencing
- `supabase/functions/business-advisor-intelligence/index.ts` — import reversibility map for action classification

### Phase 6 — Regenerate Proof Bundle with Wiring Evidence

**Problem**: Current proof artifacts report structural existence but not wiring/consumer counts.

**Action**: Regenerate all 13 `generated/advisor-boardroom-proof/*.json` artifacts with updated consumer counts, wiring evidence, and import paths. Update the closure summary verdict from structural to behavioral.

**Files modified**:
- All 13 files in `generated/advisor-boardroom-proof/` — add `consumers` and `importedBy` fields
- Mirror to `public/generated/advisor-boardroom-proof/`
- `generated/advisor-boardroom-proof/advisor-boardroom-closure-summary.json` — update verdict to include wiring evidence

### What This Delivers

- **Single canonical advisor identity** — all 35 advisors (26 original + 9 from orchestration engine) in one registry
- **Zero orphaned contracts** — every file in `src/lib/advisors/` has at least one consumer
- **Domain engines governed** — orchestration, coordination, tool execution, reflection, and memory engines all import from canonical contracts
- **UI components wired** — debate, escalation, permissions, memory, and performance panels reference governance rules
- **Edge functions gated** — advisor edge functions enforce permission, confidence, persona, and reversibility at execution boundary
- **Typed runtime context** — single `resolveAdvisorContext(id)` call assembles full governance context
- **No duplicates** — parallel advisor registry consolidated into canonical source

### Implementation Order

Phases 1-2 first (identity consolidation + engine wiring), then 3-4 in parallel (UI + contracts package), then 5-6 (edge functions + proof regeneration).

