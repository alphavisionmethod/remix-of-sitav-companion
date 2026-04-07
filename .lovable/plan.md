

# God-Tier Architecture Safe Adaptation — Full Implementation

## Status: 0% Implemented

The approved plan specified 13 files. **None were created.** Only the planning/governance engine (GOD01) from the prior phase exists. All runtime modules must now be built.

## What Will Be Created

### 1. Global Contracts Registry
**`src/lib/contracts/global-contracts-registry.ts`** (~250 lines)

- `TaskContract` interface with inputSchema, outputSchema, evidenceRequirements, budgetClass, routingClass, allowedProviders, requiresRetrieval, requiresDeterministicVerification, requiresCritique, requiresApproval
- `GLOBAL_TASK_REGISTRY`: 15 task contracts — chat-query, file-assist, boardroom-synthesis, financial-calculation, recommendation-generate, connector-action, approval-review, document-analysis, email-draft, scenario-simulation, kpi-calculation, tax-estimation, executive-briefing, risk-assessment, workflow-step
- `getTaskContract()`, `validateTaskInput()`, `getRoutingPolicy()` functions
- Links to existing `CapabilityContract` types

### 2. ConscienceGate
**`src/lib/services/conscience-gate/conscience-gate.ts`** (~200 lines)

Replaces and elevates the existing `groundedness-gate` (31 lines, basic check only).

- `ConscienceGateService` class with `evaluate()` returning `GateVerdict` (pass/caveat/block/refuse)
- Checks: input validation, risk classification, evidence requirements, budget policy, retrieval required, deterministic required, approval required, critique required
- Consumes Global Contracts Registry task contracts
- Uses existing `ConfidenceMetadata` and `RefusalState` types from contracts

### 3. CritiqueLoop
**`src/lib/services/conscience-gate/critique-loop.ts`** (~120 lines)

- `CritiqueResult` interface: passed, issues, confidenceAdjustment, groundednessScore, determinismVerified, recommendation
- `runCritique()`: validates AI output against task contract requirements
- `verifyGroundedness()`, `verifyDeterminism()`, `verifyCompleteness()` checks

### 4. ConscienceGate Barrel
**`src/lib/services/conscience-gate/index.ts`** (~15 lines)

### 5. Pipeline Orchestrator
**`src/lib/services/canonical-pipeline/pipeline-orchestrator.ts`** (~250 lines)

- `PipelineStage` enum: INTAKE, CONSCIENCE_GATE, RETRIEVAL, ROUTING, INFERENCE, TOOL_EXECUTION, CRITIQUE, RETURN, RECEIPT
- `PipelineContext`: tracks request through stages with timing and decisions
- `PipelineOrchestrator` class with `execute()` running canonical sequence
- `PipelineTrace` interface for stage-by-stage audit trail
- Delegates to ConscienceGate, existing model-router, inference-gateway, Desk, CritiqueLoop

### 6. Pipeline Barrel
**`src/lib/services/canonical-pipeline/index.ts`** (~10 lines)

### 7. Mnemosyne Context Assembler
**`src/lib/services/mnemosyne/context-assembler.ts`** (~150 lines)

Expands the existing stub (34 lines, key-value only) with real context assembly:

- `ContextAssembler` class with `assembleContext()`, `getFileContext()`, `getUserProfile()`, `getConversationWindow()`, `getEvidenceContext()`, `scopeContext()`
- Strict per-user/per-workspace isolation
- Returns `AssembledContext` with sources, tokenCount, scopingDecisions

### 8. Mnemosyne Index Update
**`src/lib/services/mnemosyne/index.ts`** — re-export ContextAssembler alongside existing MnemosyneService

### 9. Desk Executor
**`src/lib/services/desk/desk-executor.ts`** (~200 lines)

Unified facade over existing `executor-service/` (3 action files), `recommendation-execution/`, and `connector-runners/`.

- `DeskExecutor` class with `planExecution()`, `execute()`, `executeConnectorAction()`, `executeRecommendation()`, `executeWorkflowStep()`
- All executions require ConscienceGate clearance + approval token for high-risk actions + receipt emission
- `ToolPlan` and `ExecutionReceipt` interfaces

### 10. Desk Barrel
**`src/lib/services/desk/index.ts`** (~10 lines)

### 11. Unified Event Service
**`src/lib/services/event-bus/unified-event-service.ts`** (~120 lines)

Merges `event-bus/` (4 files) + `event-broker/` (1 file) into single canonical system:

- `UnifiedEventService` class with `publish()`, `subscribe()`, `getEventLog()`, `getTraceByCorrelation()`
- Uses existing `EventEnvelope` from event-envelope.ts
- No Kafka/NATS — stays application-level

### 12. GOD02 Runtime Board
**`src/pages/admin/architecture/GodTierRuntimeBoard.tsx`** (~350 lines)

Admin board showing:
- Pipeline stage implementation status
- ConscienceGate verdict history
- Global Contracts Registry overview (15 task types)
- Desk execution log
- CritiqueLoop pass/fail rates
- Mnemosyne context assembly stats
- Event Bus unified trace
- All sections with `data-testid` attributes

### 13. App.tsx Route Wiring
Add lazy import + route for `/admin/architecture/god-tier-runtime`

## Anti-Sprawl Compliance
- ConscienceGate **replaces** groundedness-gate concept (elevation, not addition)
- Desk **facades** over executor-service + recommendation-execution + connector-runners
- Unified Event Service **merges** event-broker into event-bus (net -1 service concept)
- canonical-pipeline is NOT a second brain — formalized stage sequence consumed by brain-core
- Net: +3 new directories, -1 merged = **+2 net, replacing 4 scattered concepts**

## No Database Changes Required
All runtime code is TypeScript service layer consuming existing DB tables.

## Success Criteria
1. Global Contracts Registry with 15 task contracts
2. ConscienceGate evaluates risk, evidence, budget, retrieval, critique requirements
3. CritiqueLoop validates outputs against task contracts
4. Pipeline Orchestrator defines canonical 9-stage sequence
5. Mnemosyne assembles scoped context (files, profile, conversation, evidence)
6. Desk unifies tool execution with mandatory approval gates
7. Event Bus merged into single service
8. GOD02 board visualizes runtime health
9. All boards have `data-testid` attributes
10. 0 TypeScript errors

