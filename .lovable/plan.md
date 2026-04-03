

# SITA OS — Fully Automatic Backend AI Team Implementation Plan

## Current State

The system already has extraordinary depth:
- **40 internal agents** across 6 councils with full definitions (scope, tools, confidence, rollback, KPIs)
- **7 supervisors** including Chief of Staff
- **Agent Orchestrator** (418 lines): lifecycle, scheduler, task queue, fleet status, promotion/demotion
- **26 customer-facing advisors** across 4 councils with handoff, escalation, performance evaluation
- **10 edge functions** including `brain-core` (737 lines with intent classification, policy evaluation, LLM routing, multi-advisor composition), `agent-executor`, `agent-heartbeat`, `self-healing`
- **Model Router** with budget-aware tier selection
- **Complete rights system** (L0-L6, promotion rules, demotion triggers, never-allowed list)

## What Is Missing

The 40 internal agents are fully **defined** but not **executable**. The agent-executor edge function only handles 4 agent types (connector-health, stale-workflow, cost-anomaly, data-freshness). The remaining 36 agents have definitions but no backend execution logic. The orchestrator runs client-side only.

### Gap 1: Agent Execution Backends (the core gap)
The `agent-executor` edge function needs execution logic for all agent categories, not just 4 diagnostics agents. Each pod needs real execution handlers.

### Gap 2: Agent Scheduling Service
No cron/scheduler calls `agent-heartbeat` or triggers scheduled agents. Agents with `schedule: "continuous"` or `"hourly"` have no invocation mechanism.

### Gap 3: Agent-to-Agent Communication
Agents can escalate to supervisors (defined), but there's no message-passing between agents. The orchestrator manages lifecycle but doesn't route inter-agent signals.

### Gap 4: Agent Execution Receipt Chain
The orchestrator creates work items but doesn't generate proof receipts per-agent-action that chain into the existing receipt service.

### Gap 5: Agent Dashboard Backend API
The frontend `AdvisorCouncilDashboard` uses hardcoded demo data. No edge function serves real agent telemetry, escalation logs, or performance data.

---

## Implementation Plan

### Task 1: Expand Agent Executor with Pod Handlers

**File:** `supabase/functions/agent-executor/index.ts`

Expand from 4 handlers to cover all 6 council categories:

**Product Build pod** — handlers for:
- `feature-governance`: query feature registry table, check completeness
- `contract-validator`: query API contracts, detect drift
- `schema-checker`: validate schema versions match

**Reliability Ops pod** (extend existing):
- `incident-response`: query incidents table, classify severity, recommend healing
- `self-healing-controller`: orchestrate multi-step recovery (already partially in self-healing function — wire into executor)
- `release-safety`: check recent deployments, validate canary metrics

**Security Trust pod**:
- `fraud-sentinel`: query auth logs, detect anomalous patterns
- `access-monitor`: check permission changes in last 24h
- `policy-validator`: verify active policies match expected state

**Runtime Cost pod**:
- `cost-guardrail`: query advisor_responses for token spend, enforce budget
- `model-router`: validate model selection matches routing rules
- `budget-enforcer`: check daily spend against limits

**Architecture Governance pod**:
- `boundary-enforcer`: validate service boundaries from registry
- `dependency-auditor`: check dependency freshness

**Knowledge Coordination pod**:
- `memory-curator`: check memory freshness, flag stale entries
- `runbook-updater`: detect docs that need updates based on recent changes

Each handler follows the existing pattern: query Supabase tables, compute health/status, return structured results with `health` field.

### Task 2: Agent Scheduling Edge Function

**File:** `supabase/functions/agent-scheduler/index.ts`

New edge function that:
- Reads agent definitions and their `schedule` field
- Queries `agent_telemetry` for last execution timestamps
- Determines which agents are due to run
- Calls `agent-executor` for each due agent
- Records execution results in `agent_telemetry`
- Can be invoked by Supabase pg_cron or external cron

### Task 3: Inter-Agent Signal Bus

**File:** `supabase/functions/agent-signal/index.ts`

New edge function for agent-to-agent messaging:
- Accepts `{ from_agent, to_agent, signal_type, payload }`
- Signal types: `escalation`, `data-request`, `finding`, `alert`
- Stores in `agent_signals` table (new migration)
- Target agent picks up signals on next execution cycle
- Supervisor agents can broadcast to their council

**Migration:** Create `agent_signals` table with columns: id, from_agent, to_agent, signal_type, payload (jsonb), status (pending/processed), created_at, processed_at, tenant_id.

### Task 4: Agent Receipt Integration

Modify `agent-executor` to generate proof receipts for every agent action:
- Create `agent_action_receipts` table (new migration)
- Each execution produces a receipt with: agent_id, action_type, input_summary, output_summary, confidence, duration_ms, cost_tokens, receipt_hash, parent_receipt_hash
- Hash-chain receipts for tamper evidence (matching existing receipt-service pattern)

### Task 5: Agent Intelligence API

**File:** `supabase/functions/agent-intelligence/index.ts`

New edge function serving the frontend dashboard with real data:
- `GET /fleet-status`: aggregate agent_telemetry into fleet health
- `GET /council-status/:council`: per-council health metrics
- `GET /agent/:id/history`: last N executions with results
- `GET /escalations`: recent escalation records
- `GET /budget`: real spend from advisor_responses + agent_action_receipts
- `GET /signals`: recent inter-agent communications

### Task 6: Database Migrations

New tables needed:
- `agent_signals` — inter-agent communication
- `agent_action_receipts` — proof chain for agent actions
- `agent_schedules` — override schedule configs per tenant

All with RLS policies scoped to `auth.uid()`.

---

## What Does NOT Change

- The 40 agent definitions in `src/lib/internal-agents/agents/` — complete and correct
- The orchestrator in `src/lib/core-services/agent-orchestrator.ts` — stays as client-side fleet manager
- The advisor protocol (26 advisors, handoff, escalation, performance) — complete
- The brain-core edge function (737 lines) — already production-grade
- The rights system, councils, supervisors — complete
- The existing self-healing edge function — stays, executor will delegate to it

## Critical Separation Maintained

Customer-facing advisors (26 in advisor-protocol) remain completely separate from internal platform agents (40 in internal-agents). Users interact with advisors through brain-core. Internal agents operate invisibly through agent-executor/scheduler/heartbeat. The only shared surface is Mission Control, which is an admin-only view.

## Implementation Order

1. Database migrations (tables for signals, receipts, schedules)
2. Expand agent-executor with all pod handlers
3. Agent scheduling edge function
4. Inter-agent signal bus
5. Agent receipt chain integration
6. Agent intelligence API for dashboard

