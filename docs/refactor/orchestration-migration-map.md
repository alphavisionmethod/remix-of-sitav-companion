# SITA OS — Orchestration Migration Map

## Old Path → New Role

| Old Path | New Canonical Path | Role Change |
|----------|-------------------|-------------|
| `src/lib/core-services/canonical-chain-orchestrator.ts` | Facade delegates to it internally | Was top-level orchestrator → now internal execution impl |
| `src/lib/services/intent-orchestrator/` | `src/lib/orchestration/intent/` | Classification logic preserved, orchestration ownership moved |
| `src/lib/core-services/agent-orchestrator.ts` | Execution adapter via `job-dispatcher.ts` | Fleet lifecycle kept, orchestration verbs removed |
| `src/lib/services/ai-workforce/workforce-orchestrator.ts` | Execution adapter via `job-dispatcher.ts` | DB role invocation kept, subordinate to execution layer |
| `src/lib/services/council-orchestrator/` | Intent support under `intent-orchestrator.ts` | Deliberation kept, no execution authority |
| `src/lib/services/founder-orchestrator/` | Planning adapter | Directive parsing as planning support only |
| `src/lib/services/ecosystem-orchestrator/` | Cross-device adapter | Sync/presence kept, business logic removed |
| `src/lib/services/operating-autopilot/` | Policy profile | Rule definitions only, no execution |
| `src/lib/services/orchestration-pipeline/` | Signal transport | Feeds intent layer, no independent orchestration |
| `src/lib/services/proof-orchestrator/` | `src/lib/orchestration/proof/` | Absorbed into canonical proof layer |
| `src/lib/services/setup-orchestration-engine.ts` | Domain-scoped planning adapter | DAG logic aligned with canonical chain |
| `src/lib/architecture/advisor-orchestration.ts` | Unchanged (types only) | Already pure types |
| `src/lib/services/boardroom-service/` | Read-model projection | Forbidden from executing or planning |
