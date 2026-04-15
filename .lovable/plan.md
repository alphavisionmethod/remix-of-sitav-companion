

# SITA OS — Control Domain Architecture: Protocols, Release, Graph, AI, Simulations

## What This Plan Does

Adds 5 **control domain** packages to the shared layer and wires them into the existing architecture. These are not new planes — they are structured contract/engine packages that consolidate scattered logic into disciplined, importable domains with strict dependency rules.

Since this is a Lovable SPA (not a monorepo with separate `/os`, `/backend` folders on disk), all new domains live under `src/packages/` (shared contracts) and `src/lib/` (implementations), following the existing pattern.

---

## Current State

- **Protocols**: `src/packages/protocols/` exists with 5 files (commands, approvals, trust, agent, rollout). Missing: websocket, receipts, notifications, sync, updates, timeline, compatibility.
- **Release**: `src/lib/services/release-intelligence/` has 124 lines. No structured release domain.
- **Graph**: `src/packages/contracts/graph/` has node/edge types. `src/lib/services/entity-graph/` has a basic in-memory service. No lineage, retrieval, privacy, or reconciliation.
- **AI**: Scattered across `src/lib/ai/`, `src/lib/sovereign-ai-gateway/`, `src/lib/compute-governance/`, `src/lib/no-hallucination/`, `src/lib/ai-gateway/`. No unified domain.
- **Simulations**: `src/lib/simulation/` has 3 files (Monte Carlo). `src/lib/services/digital-twins/` exists. No scenario packs, chaos, dry-runs, or verification.

---

## Implementation Plan

### Phase 1: Expand Protocol Contracts (src/packages/protocols/)

Add 7 new protocol definition files. These are **pure types/schemas only** — zero runtime dependencies.

**New files:**
- `src/packages/protocols/receipt-protocol.ts` — execution/approval/verification/rollback/trust receipt schemas
- `src/packages/protocols/websocket-protocol.ts` — event envelope, reconnect/resume, subscription model, backpressure rules, delivery assurance
- `src/packages/protocols/notification-protocol.ts` — categories, urgency semantics, action payloads, push wake format, delivery acknowledgement
- `src/packages/protocols/sync-protocol.ts` — sync state, conflict payload, repair request, checkpoint, device capability
- `src/packages/protocols/update-protocol.ts` — update manifest, install state, rollback, post-update verification, compatibility negotiation
- `src/packages/protocols/timeline-protocol.ts` — timeline event schema, narrative events, system journal, digest feed
- `src/packages/protocols/compatibility-protocol.ts` — version compatibility, capability fallback, graceful degradation, rollout compatibility gates

**Updated:** `src/packages/protocols/index.ts` — re-export all 12 protocol modules.

### Phase 2: Release Engineering Domain

**Contracts (src/packages/release-contracts/):**
- `index.ts` barrel
- `rollout-types.ts` — rollout state machine, cohort targeting, canary promotion, blast-radius estimation
- `rollback-types.ts` — rollback orchestration, eligibility, preconditions, receipts
- `compatibility-types.ts` — app/backend/OS compatibility matrix, migration compatibility, release gates
- `regression-types.ts` — regression fingerprints, suspected regression detectors, known-bad patterns
- `artifact-types.ts` — version metadata, bundle metadata, SBOM references, signing policy
- `health-types.ts` — post-release health comparisons, hold/expand/rollback thresholds

**Engine (src/lib/engines/release-engine.ts):**
Consolidates `release-intelligence` into a structured engine with: rollout planner, rollback orchestrator, compatibility checker, regression detector, release health scorer, release narrative generator.

### Phase 3: Graph Domain

**Contracts (src/packages/graph-contracts/):**
- `index.ts` barrel
- `node-types.ts` — 12 canonical node types (user, device, workspace, file, command, approval, app, incident, policy, release, timeline, automation)
- `edge-types.ts` — 12 canonical edge types (owns, affects, depends_on, approved_by, executed_on, caused_by, belongs_to, generated_from, blocked_by, escalated_to, triggered, resolved_by)
- `lineage-types.ts` — data/decision/AI/command/release lineage
- `retrieval-types.ts` — evidence pack builder contract, trust-scoped retrieval filters, semantic retrieval orchestration
- `privacy-types.ts` — visibility scopes, workspace isolation, sensitive relationship masking
- `reconciliation-types.ts` — graph drift detection, eventual consistency rules, canonical correction paths

**Engine (src/lib/engines/graph-engine.ts):**
Wraps and extends the existing `EntityGraphService` with lineage tracking, privacy filtering, and reconciliation hooks.

### Phase 4: AI Governance Domain

**Contracts (src/packages/ai-contracts/):**
- `index.ts` barrel
- `prompt-types.ts` — prompt definitions, versioning, ownership, rollout/rollback, quality metadata
- `routing-types.ts` — model routing policies, inference tier mapping, local vs cloud, fallback rules
- `safety-types.ts` — trust boundaries, action gating, grounding enforcement, contradiction checks
- `economics-types.ts` — budget policies, cost tracking, cache strategy, spend ceilings, feature cost allocation
- `tool-policy-types.ts` — which AI roles may call which tools, data exposure rules, high-risk restrictions
- `memory-types.ts` — AI-specific memory governance, preference/workflow/procedural memory contracts, expiry rules
- `eval-types.ts` — prompt evaluations, regression evals, hallucination evals, task success benchmarks
- `agent-governance-types.ts` — agent role definitions, rights, planner/reviewer separation, escalation rules

**Engine (src/lib/engines/ai-governance-engine.ts):**
Unified AI governance facade that coordinates existing modules: `compute-governance/model-routing-engine`, `no-hallucination/*`, `sovereign-ai-gateway`, and `ai/ai-capability-client`. Provides: `evaluatePromptSafety()`, `routeModel()`, `checkBudget()`, `enforceToolPolicy()`, `auditAIAction()`.

### Phase 5: Simulation Domain

**Contracts (src/packages/simulation-contracts/):**
- `index.ts` barrel
- `digital-twin-types.ts` — user/device/system/release/trust/sync twin models
- `scenario-types.ts` — scenario pack definitions, rollout/sync-failure/trust-attack/budget-reduction/network-degradation scenarios
- `dry-run-types.ts` — command/policy/rollout/approval simulation contracts
- `what-if-types.ts` — forecasting, tradeoff comparisons
- `chaos-types.ts` — chaos scripts, outage scenarios, resilience drills
- `verification-types.ts` — simulation result validation, predicted-vs-actual comparison, simulation confidence

**Engine (src/lib/engines/simulation-engine.ts):**
Wraps existing `monte-carlo-engine`, `digital-twins`, and `governance-simulator`. Adds: scenario runner, dry-run executor, chaos orchestrator, verification pipeline.

### Phase 6: Dependency Enforcement & Validation Scripts

**New CI validation scripts:**
- `scripts/validation/check-protocol-purity.ts` — Ensures `src/packages/protocols/` imports nothing from `src/lib/` or plane implementations
- `scripts/validation/check-no-runtime-in-shared.ts` — Ensures all `src/packages/` files are pure types/schemas with no runtime side effects
- `scripts/validation/check-no-ui-in-backend.ts` — Ensures backend services don't import React/UI components
- `scripts/validation/check-no-backend-in-ui.ts` — Ensures UI pages don't import backend internals directly (must go through services layer)
- `scripts/validation/check-deployable-plane-isolation.ts` — Validates each plane's manifest dependencies

**Updated docs:**
- `docs/refactor/dependency-matrix.md` — Add protocols, release, graph, ai, simulations rows
- `docs/refactor/protocol-ownership.md` — New file mapping each protocol to its owning service
- `docs/refactor/deployment-map.md` — New file documenting deployment targets per plane

### Phase 7: Barrel Exports & Wiring

**Wire into existing architecture:**
- Update `src/packages/index.ts` to export new contract packages
- Update `src/planes/shared.ts` to re-export key types from new domains
- Update `src/lib/services/protocol-bridge/index.ts` to integrate new protocol types (receipt, websocket, notification, sync)
- Update `scripts/check-import-boundaries.ts` to include new domain boundary rules
- Add per-plane `PLANE_MANIFEST.md` updates for new dependency declarations

### Phase 8: TypeScript Build Verification

Full `tsc --noEmit` to confirm 0 errors across all new and modified files.

---

## File Count Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Protocol contracts | 7 | 1 (index.ts) |
| Release contracts | 7 | 0 |
| Graph contracts | 7 | 0 |
| AI contracts | 9 | 0 |
| Simulation contracts | 7 | 0 |
| Engines | 5 | 0 |
| Validation scripts | 5 | 1 (check-import-boundaries.ts) |
| Docs | 2 | 1 (dependency-matrix.md) |
| Wiring/barrels | 0 | 4 (index.ts, shared.ts, protocol-bridge, packages/index) |
| **Total** | **49** | **7** |

## Dependency Rules Enforced

```text
src/packages/*     → NOTHING (pure types, zero imports from src/lib/)
src/lib/engines/*  → src/packages/* + src/lib/services/* (implementation layer)
src/lib/services/* → src/packages/* (contracts only)
src/pages/*        → src/hooks/* + src/lib/services/* (never direct engine/packages)
src/hooks/*        → src/lib/services/* (bridge layer)
```

All new contract packages are leaf nodes — they import nothing.

