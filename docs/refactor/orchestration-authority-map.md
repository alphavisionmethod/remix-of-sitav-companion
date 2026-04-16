> ⚠️ **Status: Future Monorepo Target — Aspirational Reference**
> This document describes a post-Lovable monorepo migration design. The current platform remains a **single Vite SPA + Lovable Cloud** deployment. Treat as reference architecture, not current state.

# SITA OS — Orchestration Authority Map

## Canonical 4-Layer Hierarchy

| Layer | Authority | Owner File | Responsibilities |
|-------|-----------|-----------|-----------------|
| **A — Intent** | "What should happen" | `orchestration/intent/intent-orchestrator.ts` | Parsing, classification, routing, recommendation ranking, escalation |
| **B — Planning** | "How should it happen" | `orchestration/planning/planning-orchestrator.ts` | Workflow construction, dependency resolution, simulation, approval packaging |
| **C — Execution** | "Do the work" | `orchestration/execution/execution-orchestrator.ts` | Connector invocation, job dispatch, retries, rollback, postconditions |
| **D — Proof** | "What happened" | `orchestration/proof/proof-orchestrator.ts` | Receipts, audit trails, event lineage, reversibility, truth records |

## Single Entry Point

`orchestration-facade.ts` → `processIntent()` is the ONLY public API.

## Legacy Migration Status

| Legacy Orchestrator | New Role | Status |
|-------------------|----------|--------|
| canonical-chain-orchestrator | Internal execution impl | Adapted |
| brain-core/orchestrate-intent | Decision-support helper | Adapted |
| intent-orchestrator-service | Intent classification engine | Adapted |
| agent-orchestrator | Execution adapter | Adapted |
| workforce-orchestrator | Execution adapter | Adapted |
| council-orchestrator | Intent support (synthesis) | Adapted |
| founder-orchestrator | Mode/policy adapter | Adapted |
| ecosystem-orchestrator | Cross-device continuity adapter | Adapted |
| operating-autopilot | Policy profile | Adapted |
| orchestration-pipeline | Signal transport (feeds intent) | Adapted |
| proof-orchestrator-service | Proof layer impl | Adapted |
| setup-orchestration-engine | Domain-scoped planning adapter | Adapted |
| advisor-orchestration | Type definitions only | Canonical |
| boardroom-service | Read-model projection | Adapted |

## Dependency Rules

```
orchestration/intent/    → shared/, brain-core helpers, pipeline signals
orchestration/planning/  → shared/, WorkflowEngine, simulation-engine
orchestration/execution/ → shared/, ExecutorService, agent-orchestrator, connectors
orchestration/proof/     → shared/, ReceiptService, canonical-chain-persistence
orchestration-facade     → all 4 layers (only file touching all)

hooks/*                  → orchestration-facade ONLY
pages/*                  → hooks/* ONLY
boardroom-service/*      → proof + planning outputs (read-only)
```
