

# SITA OS — 15 Missing Systems: Full Implementation Plan

## Current State Assessment

Many of the 15 requested systems already have **partial implementations** (stubs, basic classes, or contract types). The work is to elevate each from stub/basic to advanced, wire them together, and create the orchestration layer that makes them feel like one coherent OS.

### What Already Exists (Partial/Stub)
| System | Current State | Files |
|--------|-------------|-------|
| Entity Graph | Basic in-memory graph, 55 lines | `entity-graph/index.ts` |
| Handoff | Supabase-backed, 118 lines | `handoff/index.ts` + contracts |
| SITA Modes | 7 modes, 43 lines | `sita-modes/index.ts` |
| Relationship Intelligence | 156 lines, reciprocity, decay | `relationship-intelligence/index.ts` |
| Opportunity Engine | 35 lines, basic signals | `opportunity-engine/index.ts` |
| Intent Inbox | 33 lines, basic queue | `intent-inbox/index.ts` |
| Predictive Intent | 133 lines, time-pattern learning | `predictive-intent/index.ts` |
| Predictive Needs | 200 lines, cross-domain | `predictive-needs/index.ts` |
| Trust Governor | 201 lines, score-based evaluation | `trust-governor/trust-governor.ts` |
| Memory Governance | Contract types exist | `memory-governance.ts` |
| Operating Autopilot | 33 lines | `operating-autopilot/index.ts` |
| Household Graph | 33 lines | `household-org-graph/index.ts` |
| Compound Life Score | 134 lines | `compound-life-score/index.ts` |
| Ambient Intelligence | 139 lines, daily briefing | `os-awareness/ambient-intelligence.ts` |
| Data Scope Model | 151 lines, boundary engine | `data-scope-model/index.ts` |
| Surface Detection | 122 lines | `surface-detection/index.ts` |
| Continuity Fabric | Contract types only | `graph/continuity-fabric.ts` |
| Action Queue | 138 lines | `action-queue/index.ts` |

### What's Completely Missing
- **Unified Personal Operating Graph** (cross-service graph federation)
- **Unified Intent/Command Orchestrator** (single orchestration entry point)
- **Ambient Continuity Engine** (active handoff intelligence)
- **Chief-of-Staff Layer** (coordinated role personas)
- **Priority Stack / Attention OS** (attention governance)
- **Trust-Weighted Action System** (multi-surface trust decisions)
- **Proactive Timing Intelligence** (when-to-help subsystem)
- **Unified Digest Engine** (canonical summary producer)
- **Adaptive Interface System** (context-driven UI adaptation)
- **Experience Signature Layer** (tone/cadence/language system)

---

## Implementation Plan

Due to the massive scope (15 systems), this will be implemented as **new service files** that elevate existing stubs and add missing orchestration layers. Each service will be a fully-typed, advanced implementation that wires into existing contracts and the canonical execution chain.

### Wave 1 — Orchestration Magic (5 systems)

**1. Unified Personal Operating Graph** — `src/lib/services/personal-graph/personal-operating-graph.ts` (~250 lines)
- Federates: entity-graph, household-org-graph, relationship-intelligence, trust-governor, device-presence, connector-truth
- Graph query API: `getContext(entityId)`, `traverse(from, depth, filters)`, `findConnections(entityA, entityB)`
- Cross-domain link resolution: "this approval touches money + boardroom + travel"
- Meeting prep: `getMeetingContext(contactId)` → pulls relationship, pending tasks, recent conversations
- Event-driven graph updates via UnifiedEventService subscription

**2. Unified Intent / Command Orchestrator** — `src/lib/services/intent-orchestrator/intent-orchestrator.ts` (~300 lines)
- Single entry point: `processIntent(intent, source, surface, context)`
- Classifies intent → routes to capability → applies policies → creates receipts → updates surfaces
- Sources: command palette, assistant, UI actions, wearable, automation, connector events, notifications
- Wires: brain-core, policy-engine, capability-router, executor-service, receipt-service, event-bus
- Replaces the basic IntentInboxService with full orchestration

**3. Priority Stack / Attention OS** — `src/lib/services/attention-os/attention-os.ts` (~250 lines)
- Priority stack: what matters now, what can wait, what should be bundled, what needs escalation
- Surface routing: watch vs phone vs desktop vs queue vs suppress
- Attention budget: cognitive load tracking, notification throttling
- Integrates: SITA modes, predictive-intent, trust-governor, surface-detection
- API: `getAttentionStack(userId)`, `routeToSurface(item)`, `suppress(itemId, reason)`

**4. Ambient Continuity Engine** — `src/lib/services/continuity-engine/continuity-engine.ts` (~200 lines)
- Elevates handoff service + continuity-fabric contracts into active intelligence
- Auto-detect when to hand off based on surface-detection + device-presence
- State preservation: serialize current context, task position, scroll state, form data
- Resume protocol: `initiateHandoff(from, to)`, `resumeOnSurface(surfaceId)`, `getActiveThreads()`
- Wires: handoff service, surface-detection, device-presence, event-bus

**5. Trust-Weighted Action System** — `src/lib/services/trust-actions/trust-weighted-actions.ts` (~250 lines)
- Unified framework: can this action happen auto? needs confirmation? needs biometric? boardroom review?
- Multi-surface trust decisions based on: action risk tier, device trust, user trust score, policy
- Action routing: auto → queued → wearable-confirm → mobile-confirm → desktop-confirm → boardroom
- Wires: trust-governor, approval-engine, biometric-auth, device-presence, policy-engine
- API: `evaluateAction(action)` → `{ executionMode, confirmationSurface, approvalRequired }`

### Wave 2 — Human Support Magic (5 systems)

**6. Chief-of-Staff Layer** — `src/lib/services/chief-of-staff/chief-of-staff.ts` (~250 lines)
- Coordinated role personas: Chief of Staff, Executive Assistant, Operator, Strategist, Money Sentinel, Wellness Sentinel, Relationship Sentinel
- Each role has: scope, trigger conditions, proactive behaviors, tone, escalation rules
- Coordination: roles don't overlap; the layer decides which role speaks
- Wires: brain-core, attention-os, predictive-needs, relationship-intelligence, compound-life-score

**7. Proactive Timing Intelligence** — `src/lib/services/timing-intelligence/timing-intelligence.ts` (~200 lines)
- When-to-help subsystem: best timing for summaries, approvals, reminders
- Deferment during fatigue/workout/sleep/focus (reads SITA modes + readiness)
- Escalation when truly urgent despite quiet mode
- Wires: sita-modes, sovereign-time, predictive-intent, attention-os, compound-life-score
- API: `shouldActNow(action, context)` → `{ act: boolean, bestTime, reason }`

**8. Relationship Memory + Human Context Engine** — Elevate `relationship-intelligence/index.ts` (~300 lines)
- Add: conversation history tracking, promise/commitment tracking, key dates, follow-up obligations
- Emotional/strategic relevance scoring
- Meeting prep enrichment: "you're about to meet X, here's what matters"
- Wires: entity-graph → personal-operating-graph, memory-service, predictive-needs

**9. Unified Digest / Summary Engine** — `src/lib/services/digest-engine/digest-engine.ts` (~250 lines)
- Canonical summary producer: daily pulse, weekly boardroom, travel/day brief, risk digest, opportunities digest
- Composable digest sections that assemble from all domains
- Wires: ambient-intelligence, compound-life-score, opportunity-engine, relationship-intelligence, finance-os, business-os
- API: `generateDigest(type, userId)` → structured digest with sections

**10. Personal Operating Modes** — Elevate `sita-modes/index.ts` (~200 lines)
- Add modes: Recovery, Execution, Founder, Investor Demo, Boardroom
- Each mode affects: summaries, notifications, assistant behavior, surfaces, priorities, routing, automations
- Mode transitions: auto-detect (e.g., calendar says "board meeting" → boardroom mode)
- Wires: attention-os, timing-intelligence, surface-detection, chief-of-staff

### Wave 3 — Polish and Moat (5 systems)

**11. Adaptive Interface System** — `src/lib/services/adaptive-interface/adaptive-interface.ts` (~200 lines)
- Context-driven UI adaptation: surface, urgency, context, cognitive load, task mode, readiness, role mode, trust
- Density selection: calm → standard → focus → analyst → presentation
- API: `getInterfaceState(context)` → `{ density, theme, layout, animations, prioritySections }`
- Wires: sita-modes, attention-os, surface-detection, compound-life-score

**12. Opportunity Detection Engine** — Elevate `opportunity-engine/index.ts` (~200 lines)
- Cross-domain detection: money inefficiencies, underused assets, strategic openings, relationship leverage
- Anomaly detection, overdue follow-ups, pattern recognition
- Wires: finance-os, business-os, relationship-intelligence, personal-operating-graph

**13. Memory Governance / Forgetting** — `src/lib/services/memory-governance/memory-governance-engine.ts` (~250 lines)
- Implements the existing contracts: confidence, freshness, correction, invalidation, archival, forgetting
- Human override system, decay policies, contradiction resolution
- Wires: memory-service (correction.service already exists), memory-governance contracts

**14. Life/Work/Wealth Boundary Engine** — `src/lib/services/boundary-engine/boundary-engine.ts` (~200 lines)
- Household vs business vs personal boundary enforcement
- Role-based visibility, cross-domain synthesis, privacy walls, attention boundaries
- Wires: data-scope-model, household-org-graph, sita-modes, policy-engine

**15. Experience Signature Layer** — `src/lib/services/experience-signature/experience-signature.ts` (~150 lines)
- Tone, cadence, trust language, assistant language, visual calmness, transitions
- Escalation style, summary style, proof/receipt style
- Mode-aware: changes with sita-modes
- API: `getSignature(context)` → `{ tone, verbosity, urgency, visualDensity, animationLevel }`

### Barrel Exports & Wiring
- Update `src/lib/services/index.ts` to export all new services
- Create `src/lib/services/os-orchestration/index.ts` as the meta-barrel for Wave 1 orchestration services
- Wire intent-orchestrator into brain-core callable as the canonical entry point

---

## Technical Details

### New Files (15)
```
src/lib/services/personal-graph/personal-operating-graph.ts
src/lib/services/intent-orchestrator/intent-orchestrator.ts
src/lib/services/attention-os/attention-os.ts
src/lib/services/continuity-engine/continuity-engine.ts
src/lib/services/trust-actions/trust-weighted-actions.ts
src/lib/services/chief-of-staff/chief-of-staff.ts
src/lib/services/timing-intelligence/timing-intelligence.ts
src/lib/services/digest-engine/digest-engine.ts
src/lib/services/memory-governance/memory-governance-engine.ts
src/lib/services/boundary-engine/boundary-engine.ts
src/lib/services/adaptive-interface/adaptive-interface.ts
src/lib/services/experience-signature/experience-signature.ts
src/lib/services/os-orchestration/index.ts
```

### Files to Elevate (3)
```
src/lib/services/relationship-intelligence/index.ts — add conversation/commitment tracking
src/lib/services/sita-modes/index.ts — add 5 new modes, auto-transition
src/lib/services/opportunity-engine/index.ts — add cross-domain detection
```

### Files to Update (1)
```
src/lib/services/index.ts — add barrel exports
```

### Architecture Rules
- No new domains (still 3: business, finance, concierge)
- All services follow existing persistence pattern (universal-service-persistence)
- All use existing contracts from `@/packages/contracts`
- No new edge functions needed (these are client-side orchestration layers)
- All wired through UnifiedEventService for cross-service communication
- ~3,200 lines of new code total across all 15 systems

