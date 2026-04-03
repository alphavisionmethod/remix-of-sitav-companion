
# SITA OS — Phase 4: OS Unification & Platform Engines

## Executive Summary

The admin control plane is normalized. Now we build the **system foundations** that make SITA feel like one unified OS — not modules glued together. This phase focuses on contracts, engines, and runtime unification.

## Implementation Order (Launch-First)

### NOW — Foundational (This Phase)

**1. OS Unification Contracts** — Shared type system ensuring all surfaces use one action-state, one proof model, one trust chain
- `src/lib/types/os-unified.types.ts` — Canonical contracts: ActionState, ProofRecord, TrustChain, TimelineEntry, OpportunityNode
- `src/lib/types/entity-graph.types.ts` — Person, Household, Org, Entity, Role, DelegatedAuthority, VisibilityBoundary
- `src/lib/types/memory-governance.types.ts` — MemoryEntry, MemoryType, MemoryPrivacy, MemoryConfidence, ContradictionRecord
- `src/lib/types/advisor-orchestration.types.ts` — AdvisorCapability, EscalationRule, HandoffProtocol, CollaborationFrame
- `src/lib/types/policy-depth.types.ts` — PolicyRule, PolicyInheritance, ConsentRecord, PolicyConflict, PolicyAuditEntry
- `src/lib/types/revenue-engine.types.ts` — OpportunityNode, LeakageSignal, RecoveredValue, CapacitySlot

**2. Action-State Machine** — Canonical workflow states used by ALL domains
- `src/lib/engines/action-state-machine.ts` — 16-state FSM with transitions, time-in-state, stuck detection, rollback eligibility

**3. Entity & Role Graph Engine** — Identity, household, org, delegation
- `src/lib/engines/entity-role-graph.ts` — Who can see/approve/execute, household-shared vs private, role revocation

**4. Memory Governance Engine** — Confidence, contradiction, lineage, privacy
- `src/lib/engines/memory-governance.ts` — Memory persistence rules, expiration, "forget this", conflict resolution

**5. Advisor Orchestration Engine** — Multi-advisor collaboration, escalation, handoff
- `src/lib/engines/advisor-orchestration.ts` — Registry, capability map, priority resolution, disagreement resolution

**6. Deep Policy Engine** — Inheritance, consent, conflict resolution
- `src/lib/engines/policy-depth-engine.ts` — User/household/business/advisor/device policies, inheritance chain, conflict resolver

**7. Revenue & Opportunity Engine** — Leakage detection, recovery, ranking
- `src/lib/engines/revenue-opportunity.ts` — Missed callbacks, stale leads, overdue invoices, recovered value ledger

**8. Integration Concierge** — Use-case-first connector wizard
- `src/components/sita/IntegrationConcierge.tsx` — Guided wizard, plain-language permissions, simulation mode
- `src/lib/engines/connector-concierge.ts` — Use-case templates, readiness checker, post-connect health

**9. Digital Twin & Boardroom Engine** — Business/money/household twins, scenario simulation
- `src/lib/engines/digital-twin.ts` — Twin models with bottleneck/overload/risk detection
- `src/lib/engines/boardroom-intelligence.ts` — Boardroom templates, memory, outcome log, decision timeline

**10. Token Governance & Model Router** — Cost-aware AI routing
- `src/lib/engines/token-governance.ts` — Model routing, budgets, compression, anomaly detection

### NEXT — Post-Launch Enhancement
- Enterprise/Family Office admin console
- Support case management system
- Distributed tracing & SLO dashboards
- Avatar identity system
- Ambient/device surface extensions

### LATER — Premium/Enterprise
- Compliance vault
- 3D/voice avatar path
- Trusted-device signing
- Multi-tenant fleet management

## Anti-Patterns to Avoid
- No domain-specific action states — use the canonical FSM
- No domain-specific proof formats — use shared ProofRecord
- No domain-specific trust logic — use shared TrustChain
- No silent memory accumulation — all memory governed
- No advisor silos — all advisors registered and orchestrated
- No ungoverned AI calls — all routed through token governance

## Files to Create (12 type files + 10 engine files + 2 UI components)
All engines export pure functions and classes — no UI coupling, fully testable.
