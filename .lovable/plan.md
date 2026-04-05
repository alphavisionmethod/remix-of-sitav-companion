

# SITA OS — AI Team, Investment Office & Admin Backend Enhancement Plan

## Current State Assessment

### What's Strong
- **Agent Orchestrator** (`core-services/agent-orchestrator.ts`): 418-line orchestrator with 40-agent fleet, scheduling, task queue, autonomy promotion/demotion, cost tracking
- **Self-Healing** (`core-services/self-healing/service.ts`): 528-line engine with detect→classify→triage→plan→heal→verify→close pipeline, circuit breakers, escalation rules
- **Investment Office**: 1111-line domain engine (47 deterministic functions), 540-line service layer, 541-line type contracts, full UI with 10 tabs
- **Admin Service**: 503-line consolidated service with audit, dashboards, governance hints, incidents, policies, intelligence engines, anomaly detection, forecasting, optimization
- **AI Workforce Service**: Full agent lifecycle, task assignment, capability matching, teams, councils
- **Agent Governance**: Autonomy ceiling, token budget, simulation gate, council escalation
- **Council Orchestrator**: Multi-advisor deliberation, consensus building, conflict resolution, weighted/unanimous/supervisor-override voting

### What's Missing — 8 Gaps

**1. No Agent Self-Healing Integration** — The simple `src/lib/services/self-healing/index.ts` (14 lines) and `src/lib/services/immune-controller/index.ts` (11 lines) and `src/lib/services/fleet-health/index.ts` (11 lines) are thin wrappers that duplicate functionality already fully built in `src/lib/core-services/self-healing/`. They should be replaced with re-exports from the core-services versions.

**2. No Investment Office Runtime Service** — The types exist (541 lines), the domain engine exists (1111 lines), the service functions exist (540 lines) — but there's no `InvestmentOfficeService` class that orchestrates them with state management, caching, audit trails, and self-healing hooks.

**3. No Agent Health Monitor Loop** — The agent orchestrator manages lifecycle but has no continuous health monitoring that detects degraded agents, auto-restarts failed agents, or triggers self-healing when an agent's error rate spikes.

**4. No Admin Agent Control Panel Service** — The admin service manages incidents and policies but has no direct wire to pause/resume/promote/demote individual agents from the admin backend. Mission Control UI uses mock data for agent fleet status.

**5. No AI Cost Circuit Breaker** — The AI economics runtime defines spend tracking but there's no automatic budget enforcement that pauses agents when cost thresholds are exceeded.

**6. No Cross-Service Health Aggregator** — Fleet health, self-healing, immune controller, and error patrol all run independently. No unified health aggregator feeds a single "system health" score to admin.

**7. No Investment Office Self-Healing** — Portfolio data staleness, connector sync failures, and regime detection errors have no automatic recovery path.

**8. Mock Data in Admin/Mission Control** — `MissionControlPage.tsx` imports `mockInternalAgents, mockIncidents, mockConnectorHealth, mockStuckWorkflows` — these should read from real services.

---

## Implementation Plan

### Phase 1 — Wire Thin Services to Core (3 files)

Replace the thin `src/lib/services/self-healing/index.ts`, `immune-controller/index.ts`, and `fleet-health/index.ts` with re-exports from the advanced `src/lib/core-services/self-healing/` implementations. This eliminates the duplicate simple versions.

### Phase 2 — Agent Health Monitor (1 new file)

Create `src/lib/services/ai-workforce/agent-health-monitor.ts`:
- Continuous agent health scoring (error rate, latency, cost drift, task success ratio)
- Auto-restart failed agents with exponential backoff
- Auto-demote agents exceeding error thresholds
- Self-healing integration: detect degraded agent → create incident → auto-recover
- Heartbeat tracking per agent with staleness detection

### Phase 3 — AI Cost Circuit Breaker (1 new file)

Create `src/lib/services/ai-economics/cost-circuit-breaker.ts`:
- Per-agent and fleet-wide budget enforcement
- Tiered response: warn → throttle → pause → halt
- Automatic model downgrade when cost spikes (e.g., GPT-4 → GPT-3.5)
- Budget period tracking (hourly, daily, monthly) with rollover logic
- Integration with agent governance service

### Phase 4 — Unified Health Aggregator (1 new file)

Create `src/lib/services/observability/health-aggregator.ts`:
- Aggregate signals from: fleet-health, self-healing, immune-controller, error-patrol, agent-health-monitor, cost-circuit-breaker
- Compute weighted system health score (0-100)
- Track health trend (improving/stable/degrading)
- Emit health events for admin dashboard consumption
- Support degraded-mode recommendations

### Phase 5 — Investment Office Runtime Service (1 new file)

Create `src/lib/services/finance-os/investment-office-runtime.ts`:
- Stateful orchestrator wrapping the 47 domain engines
- Portfolio state cache with staleness tracking
- Regime change detection with automatic rebalance suggestion
- Connector sync health monitoring (brokerage, crypto exchange)
- Proof/receipt generation for all investment actions
- Self-healing hooks: auto-retry failed syncs, circuit-break bad data sources

### Phase 6 — Admin Agent Control Backend (1 new file)

Create `src/lib/services/admin-service/agent-control.ts`:
- Pause/resume/promote/demote agents from admin
- View real-time agent status, task queue, error logs
- Force-trigger agent execution
- Agent suspension with reason and audit trail
- Cost override (temporary budget increase for specific agent)
- Wire to agent orchestrator and governance service

### Phase 7 — Replace Mock Data in Mission Control (1 file edit)

Create `src/hooks/use-agent-fleet-live.ts`:
- Hook that reads from agent orchestrator, health monitor, and governance service
- Replaces `mockInternalAgents`, `mockIncidents`, `mockConnectorHealth`, `mockStuckWorkflows`
- Real-time fleet status, incident feed, and connector health from actual services

### Phase 8 — Update Barrel Exports (2 file edits)

- Update `src/lib/services/index.ts` to export new modules
- Update `src/lib/services/ai-workforce/index.ts` to export agent-health-monitor

---

## Summary

| Phase | Files | Type |
|-------|-------|------|
| 1. Wire thin services | 3 edits | Dedup |
| 2. Agent health monitor | 1 new | Core |
| 3. Cost circuit breaker | 1 new | Core |
| 4. Health aggregator | 1 new | Core |
| 5. Investment office runtime | 1 new | Core |
| 6. Admin agent control | 1 new | Core |
| 7. Live fleet hook | 1 new | UI wire |
| 8. Barrel exports | 2 edits | Wiring |

**Total: 6 new files, 5 edits. All pure TypeScript, no external dependencies.**

