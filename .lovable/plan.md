

# SITA OS — Orchestration Authority Consolidation

## Current State Audit

15 orchestration-like files identified across the codebase, creating overlapping authority:

| File | Lines | Current Role | Consumers |
|------|-------|-------------|-----------|
| `canonical-chain-orchestrator.ts` | 304 | Full intent→execution→proof chain | SitaKernelContext, planes/backend |
| `brain-core/orchestrate-intent.ts` | 131 | Intent parsing + plan building | use-brain-core hook (6 consumers) |
| `intent-orchestrator/` | 312 | Intent routing, middleware, receipts | useOSOrchestration, os-orchestration barrel |
| `agent-orchestrator.ts` | 418 | Agent fleet lifecycle + scheduling | error-patrol, companion hook |
| `workforce-orchestrator.ts` | 171 | DB-backed AI role invocation | workforce-service, admin pages |
| `council-orchestrator/` | 228 | Multi-advisor deliberation | Not directly consumed by pages |
| `founder-orchestrator/` | 422 | Directive parsing + task decomposition | Founder pages (DB-backed) |
| `ecosystem-orchestrator/` | 767 | OS+Cloud+App coordination | os-security boot |
| `operating-autopilot/` | 33 | Rule-based automation triggers | SitaOSContext |
| `os-orchestration/` | 22 | Barrel re-export of 15 services | SitaOSContext |
| `orchestration-pipeline/` | 7 files | Signal→Advisor→Board→Boardroom pipeline | usePipelineBootstrap, useBoardroomBridge |
| `proof-orchestrator/` | 35 | Proof chain management | SitaOSContext |
| `setup-orchestration-engine.ts` | 797 | DAG-based setup phase orchestration | useSetupOrchestration |
| `advisor-orchestration.ts` | 105 | Advisor declaration + council types | architecture barrel |
| `boardroom-service/` | ~10 | Packet composition + carry-over | boardroom pages |

**Key finding**: `canonical-chain-orchestrator.ts` already implements the correct Intent→Policy→Workflow→Execution→Verification→Receipt→Projection→Memory→Events chain. The consolidation must promote this as THE canonical facade and demote everything else to its proper layer.

---

## Implementation Plan

### Phase 1: Create Canonical Orchestration Spine (`src/lib/orchestration/`)

**27 new files** organized into the 4-layer hierarchy:

#### Shared Types & Infrastructure (7 files)
- `shared/orchestration-types.ts` — OrchestrationLayer enum (Intent/Planning/Execution/Proof), OrchestrationClass registry
- `shared/orchestration-envelope.ts` — Universal envelope: correlationId, source surface, domain, intent, planning/execution/proof state, policy snapshot, timestamps
- `shared/orchestration-context.ts` — Unified context: user, trust, capability, surface, business/domain, device/runtime, permission, provenance
- `shared/orchestration-result.ts` — Canonical result type with layer-specific outcomes
- `shared/orchestration-errors.ts` — Typed error hierarchy for each layer
- `shared/orchestration-policy.ts` — Policy contracts for layer transitions (intent→plan, plan→execute, execute→proof)
- `shared/orchestration-registry.ts` — Registry of every orchestration class, its canonical owner, allowed/forbidden responsibilities, layer membership, plus legacy migration map

#### Intent Layer (6 files)
- `intent/intent-orchestrator.ts` — Canonical "what should happen" authority. Wraps brain-core's `parseIntent` + `chooseExecutionMode` + existing `IntentOrchestratorService`. Delegates to decision-router for domain routing
- `intent/decision-router.ts` — Routes parsed intents to correct domain (business/finance/concierge/platform)
- `intent/recommendation-prioritizer.ts` — Ranks recommendations by urgency, trust, evidence grade
- `intent/issue-selection-engine.ts` — Selects which issues/risks to surface from orchestration-pipeline signals
- `intent/opportunity-selection-engine.ts` — Selects opportunities from advisor outputs
- `intent/escalation-router.ts` — Determines when to escalate to boardroom (wraps existing `shouldAutoEscalate`)
- `intent/intent-types.ts` — Re-exports ParsedIntent, IntentType, IntentSource from existing types

#### Planning Layer (7 files)
- `planning/planning-orchestrator.ts` — Canonical "how should it happen" authority. Wraps brain-core's `buildOrchestrationPlan` and enhances with dependency resolution
- `planning/workflow-planner.ts` — Adapter over existing `WorkflowEngine` for plan construction
- `planning/simulation-planner.ts` — Connects to simulation-engine for dry-run planning
- `planning/dependency-resolver.ts` — Resolves step dependencies within plans
- `planning/approval-package-builder.ts` — Builds approval packages when plan requires approval
- `planning/action-plan-builder.ts` — Constructs ActionEnvelopes from approved plans
- `planning/contingency-planner.ts` — Builds rollback/fallback strategies
- `planning/planning-types.ts` — OrchestrationPlan, OrchestrationStep re-exports + new planning types

#### Execution Layer (8 files)
- `execution/execution-orchestrator.ts` — Canonical "do the work" authority. Wraps existing `ExecutorService` + `CanonicalChainOrchestrator.execute()`. Only layer that causes side effects
- `execution/execution-router.ts` — Routes execution to correct service/connector
- `execution/connector-executor.ts` — Adapter for connector invocations
- `execution/job-dispatcher.ts` — Dispatches jobs to agent-orchestrator (now an execution adapter)
- `execution/workflow-step-runner.ts` — Runs individual workflow steps
- `execution/retry-engine.ts` — Retry logic with backoff and circuit breaker
- `execution/rollback-engine.ts` — Rollback execution when needed
- `execution/postcondition-checker.ts` — Validates postconditions after execution
- `execution/execution-types.ts` — ExecutionEnvelope, ExecutionResult re-exports

#### Proof Layer (7 files)
- `proof/proof-orchestrator.ts` — Canonical "what happened" authority. Wraps existing `ReceiptService`, `ProofOrchestratorService`, and `canonical-chain-persistence`
- `proof/receipt-builder.ts` — Constructs receipts from execution results
- `proof/audit-trail-writer.ts` — Writes audit trail entries
- `proof/event-lineage-builder.ts` — Builds event lineage chains
- `proof/approval-proof-builder.ts` — Records approval decisions as proof
- `proof/reversibility-writer.ts` — Records reversibility metadata
- `proof/truth-record-builder.ts` — Builds truth records for admin inspection
- `proof/proof-types.ts` — Receipt, ProofChain, AuditEntry re-exports

#### Top-Level Facade (1 file)
- `orchestration-facade.ts` — Single entry point: `processIntent()` → intent layer → planning layer → execution layer (if approved) → proof layer → result. Replaces `CanonicalChainOrchestrator` as the public API while delegating to it internally

#### Migration Infrastructure (3 files)
- `migration/legacy-orchestrator-map.ts` — Maps every legacy orchestrator to its new role, canonical owner, and migration status
- `migration/deprecation-log.ts` — Runtime deprecation tracking
- `migration/compatibility-rules.ts` — Rules for backward-compatible wrappers

#### Barrel
- `index.ts` — Exports facade + all layer types

### Phase 2: Convert Legacy Orchestrators to Adapters/Wrappers

For each legacy file, apply the exact treatment from the prompt:

| Legacy File | New Role | Action |
|------------|----------|--------|
| `brain-core/orchestrate-intent.ts` | Decision-support helper | Keep parseIntent/chooseExecutionMode/buildExplanation. Remove orchestration ownership. Intent layer imports these as helpers |
| `canonical-chain-orchestrator.ts` | Internal implementation of orchestration-facade | Rename role to "canonical execution implementation". Facade delegates to it |
| `agent-orchestrator.ts` | Execution adapter (`agent-execution-adapter`) | Keep fleet lifecycle. Remove orchestration verbs. Execution layer dispatches to it |
| `workforce-orchestrator.ts` | Execution adapter | Keep DB-backed role invocation. Subordinate to execution layer |
| `council-orchestrator/` | Intent support (multi-advisor synthesis) | Keep deliberation logic. Subordinate to intent layer |
| `founder-orchestrator/` | Mode/policy adapter | Keep directive parsing as planning support. Not independent orchestrator |
| `ecosystem-orchestrator/` | Cross-device continuity adapter | Keep sync/presence. Remove business decision logic |
| `operating-autopilot/` | Policy profile | Keep rule definitions. Not execution authority |
| `os-orchestration/` | Barrel only (unchanged) | Already just re-exports |
| `orchestration-pipeline/` | Signal transport + advisor routing | Keep signal-emitter, advisor-consumer, board-synthesizer. These feed into intent layer |
| `proof-orchestrator/` | Proof layer implementation | Absorbed into `proof/proof-orchestrator.ts` |
| `setup-orchestration-engine.ts` | Domain-scoped planning adapter | Keep DAG logic. Align with canonical intent→plan→execute→proof |
| `advisor-orchestration.ts` | Type definitions only | Already pure types — keep as-is |
| `boardroom-service/` | Read-model projection | Keep packet composition. Forbidden from executing or planning |

**Compatibility wrappers**: Each legacy file retains its current exports but delegates to the new canonical layer. Deprecation comments added.

### Phase 3: Create Canonical Hooks

4 new hooks replacing direct orchestrator access from UI:

- `src/hooks/useOrchestrationFacade.ts` — Primary hook: `processIntent()`, `getOrchestrationState()`, `subscribeToResults()`. Calls facade only
- `src/hooks/useOrchestrationProof.ts` — Read-only hook for proof/receipt/audit inspection
- `src/hooks/useOrchestrationPlanning.ts` — Read-only hook for active plans, approval queue
- `src/hooks/useOrchestrationExecution.ts` — Read-only hook for execution status, job state

Update existing hooks to delegate:
- `useOSOrchestration` → thin wrapper over `useOrchestrationFacade` (backward compat)
- `use-brain-core` → keeps AI advisor logic, removes any orchestration ownership
- `useBoardroomBridge` → consumes proof/planning outputs only

### Phase 4: Rewire Consumers

Update all files that import legacy orchestrators:
- `SitaKernelContext` — use `orchestration-facade` instead of direct `CanonicalChainOrchestrator`
- `planes/backend.ts` — re-export from `orchestration/` instead of `core-services/canonical-chain-orchestrator`
- `usePipelineBootstrap` — feed pipeline signals into intent layer
- Admin pages (BrainCoreDashboard, etc.) — inspect canonical orchestration state
- `os-security/index.ts` — boot ecosystem-orchestrator as continuity adapter

### Phase 5: CI Enforcement & Validation

3 new validation scripts:

- `scripts/validation/check-orchestration-authority.ts` — Assert only 4 canonical orchestrators own authority. Flag any file outside `src/lib/orchestration/` that contains orchestration verbs (orchestrate, dispatch, execute+plan, route+intent)
- `scripts/validation/check-hook-purity.ts` — Assert hooks don't import from `orchestration/intent/`, `orchestration/planning/`, `orchestration/execution/`, or `orchestration/proof/` internals — only facade
- `scripts/validation/check-no-hidden-executor.ts` — Assert files outside execution layer don't call `ExecutorService` or connector executors directly

### Phase 6: Documentation & Manifests

- `docs/refactor/orchestration-authority-map.md` — Final ownership map with all 4 layers + legacy migration status
- `docs/refactor/orchestration-migration-map.md` — Old path → new role for every orchestrator
- Update `docs/refactor/dependency-matrix.md` — Add orchestration layers as rows

### Phase 7: TypeScript Build Verification

Full `tsc --noEmit` to confirm 0 errors.

---

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Orchestration spine | 27 | 0 |
| Migration infrastructure | 3 | 0 |
| Hooks | 4 | 3 (useOSOrchestration, use-brain-core, useBoardroomBridge) |
| Compatibility wrappers | 0 | 12 (legacy orchestrator files get deprecation + delegation) |
| CI scripts | 3 | 0 |
| Docs | 2 | 1 (dependency-matrix) |
| Wiring | 1 (index.ts) | 3 (SitaKernelContext, planes/backend, os-security) |
| **Total** | **40** | **19** |

## Dependency Rules Enforced

```text
orchestration/intent/    → shared/, brain-core helpers, orchestration-pipeline signals
orchestration/planning/  → shared/, WorkflowEngine, simulation-engine
orchestration/execution/ → shared/, ExecutorService, agent-orchestrator, connectors
orchestration/proof/     → shared/, ReceiptService, canonical-chain-persistence
orchestration-facade     → all 4 layers (only file allowed to touch all)

hooks/*                  → orchestration-facade ONLY (never layer internals)
pages/*                  → hooks/* ONLY (never orchestration directly)
boardroom-service/*      → proof outputs + planning outputs (read-only)
```

