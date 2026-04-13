

# SITA OS — Full Wiring, Orchestration & Verification System

## What Already Exists

- **Event Bus**: In-memory pub/sub with envelope factory, dead-letter queue, and persistence adapter
- **Boardroom Bridge**: `escalateToBoardroom()` and `pushDecisionToApp()` writing to `boardroom_items` / `advisor_action_queue`
- **Council Orchestrator**: Multi-advisor deliberation with voting policies and conflict detection
- **Domain App Shells**: Business, Finance, Concierge each have Advisors + Boardroom sidebar modules with `DomainAdvisorBoard` and `BoardroomStatusStrip`
- **Live Data Hook**: `useBoardroomLiveData` queries all 5 boardroom tables with demo fallback
- **Service Registry**: Ownership manifest, route inventory, heartbeat system

## What Is Missing

The prompt describes a 7-layer runtime (Domain Data → Module Signals → Module Advisors → App Board → Boardroom Intake → Boardroom Orchestration → Follow-Through). Currently only layers E-G partially exist (Boardroom bridge + live data). Layers A-D (structured signal emission, module advisor consumption, app board synthesis, and Boardroom-worthiness scoring) are **not wired** — domain apps have no signal emitters, advisors don't consume structured packets, and the event bus is not connected to the advisor pipeline.

---

## Implementation Plan — 5 Phases

### Phase 1 — Domain Signal Emitter & Packet Types

Create the canonical packet model that all layers share.

**New file: `src/lib/services/orchestration-pipeline/types.ts`**
- `DomainSignal` — module-level event (signal_id, module, domain, severity, summary, triggering_conditions, linked_objects, freshness, confidence)
- `AdvisorOutputPacket` — advisor observation/recommendation (advisor_id, scope, target_objects, recommendation, rationale, confidence, assumptions, risks, boardroom_relevance_score)
- `AppBoardSynthesis` — app-level synthesis (app_id, issue_summary, module_advisor_positions, recommendation, disagreement_areas, scenario_need, boardroom_candidate_motion)
- `BoardroomIntakePacket` — everything needed for Boardroom intake (wraps AppBoardSynthesis + evidence refs + freshness + urgency + approval requirement)

**New file: `src/lib/services/orchestration-pipeline/signal-emitter.ts`**
- `emitDomainSignal(signal: DomainSignal)` — publishes to event bus with topic `domain.signal.{module}`
- Immediate signals for critical severity, batched for low/medium (accumulate and flush every 60s)

### Phase 2 — Advisor Routing Registry & Module Advisor Consumption

**New file: `src/lib/services/orchestration-pipeline/advisor-routing-registry.ts`**
- Static registry mapping: module → advisor IDs (e.g., `crm` → `["revenue-advisor", "crm-advisor"]`)
- `getAdvisorsForSignal(signal)` — returns matching advisor IDs
- `getBoardroomWorthinessScore(signal)` — scores 0-1 based on urgency, cross-domain impact, value-at-risk, reversibility, uncertainty

**New file: `src/lib/services/orchestration-pipeline/module-advisor-consumer.ts`**
- Subscribes to `domain.signal.*` events on the event bus
- For each signal, routes to registered advisors
- Generates `AdvisorOutputPacket` (in demo mode: deterministic mock output; in live mode: calls AI gateway)
- If any advisor output has `boardroom_relevance_score > 0.6`, elevates to app board layer

### Phase 3 — App Board Synthesis & Boardroom Intake

**New file: `src/lib/services/orchestration-pipeline/app-board-synthesizer.ts`**
- Collects `AdvisorOutputPacket`s per domain
- Produces `AppBoardSynthesis` — identifies consensus, disagreement, missing data
- Applies Boardroom-worthiness threshold (score > 0.65 → auto-candidate; 0.4-0.65 → user decides; < 0.4 → stays in domain)
- Calls `escalateToBoardroom()` from existing bridge for qualifying items

**Modify: `src/hooks/useBoardroomBridge.ts`**
- Add `synthesisForDomain` query that reads the latest `AppBoardSynthesis` from the synthesizer
- Surface synthesis status in `BoardroomStatusStrip`

### Phase 4 — State Machine & Lifecycle Tracking

**New file: `src/lib/services/orchestration-pipeline/issue-lifecycle.ts`**
- State machine: `detected → advisor_review → app_board_review → boardroom_candidate → boardroom_active → simulation_pending → approval_pending → approved | deferred → executed → outcome_tracking → closed`
- `transitionState(itemId, newState)` — validates allowed transitions, writes to `boardroom_items.status`
- Emits lifecycle events to event bus for observability

**Modify: `src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx`**
- Replace hardcoded status badges with lifecycle state from the state machine
- Show full lifecycle trail on item detail expand

### Phase 5 — Wiring Manifest, Probes & Observability

**New file: `src/lib/services/orchestration-pipeline/wiring-manifest.ts`**
- Static manifest declaring all connections: modules → advisors → app boards → boardroom categories → output sinks
- `getWiringManifest()` returns the full graph
- `validateWiring()` — checks all declared advisors exist, all routes have subscribers, all sinks are reachable

**New file: `src/lib/services/orchestration-pipeline/pipeline-probe.ts`**
- `runEndToEndProbe(scenario)` — fires a test signal through the full pipeline and verifies it reaches each layer
- Built-in scenarios: "stalled lead", "reserve breach", "travel prep incomplete"
- Returns trace log: `[{layer, timestamp, packet_type, status}]`
- Logs every transmission: source, destination, packet type, confidence, freshness, missing-data flags

**New file: `src/hooks/useOrchestrationHealth.ts`**
- React hook exposing: pipeline status, last probe result, wiring manifest, dead letters, transmission log tail
- Used by admin/debug surfaces

**Modify: Domain app shells (Business, Finance, Concierge)**
- Wire "Escalate to Boardroom" to emit a proper `DomainSignal` through the pipeline instead of calling `escalateToBoardroom()` directly
- Show pipeline trace on escalation confirmation

---

## File Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `src/lib/services/orchestration-pipeline/types.ts` | New — all packet types |
| 1 | `src/lib/services/orchestration-pipeline/signal-emitter.ts` | New — domain signal emission |
| 2 | `src/lib/services/orchestration-pipeline/advisor-routing-registry.ts` | New — module→advisor mapping + worthiness score |
| 2 | `src/lib/services/orchestration-pipeline/module-advisor-consumer.ts` | New — event bus subscriber, advisor routing |
| 3 | `src/lib/services/orchestration-pipeline/app-board-synthesizer.ts` | New — cross-advisor synthesis per domain |
| 3 | `src/hooks/useBoardroomBridge.ts` | Modify — surface synthesis data |
| 4 | `src/lib/services/orchestration-pipeline/issue-lifecycle.ts` | New — state machine for item lifecycle |
| 4 | `BoardroomExecutiveView.tsx` | Modify — lifecycle state display |
| 5 | `src/lib/services/orchestration-pipeline/wiring-manifest.ts` | New — declarative connection graph |
| 5 | `src/lib/services/orchestration-pipeline/pipeline-probe.ts` | New — end-to-end verification probes |
| 5 | `src/hooks/useOrchestrationHealth.ts` | New — React hook for observability |
| 5 | `BusinessAppShell.tsx`, `FinanceAppShell.tsx`, `ConciergeAppShell.tsx` | Modify — route escalations through pipeline |

12 files total (8 new, 4 modified). No new database tables. No new dependencies.

