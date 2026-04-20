# SITA OS — Internal AI Workforce

## Separation from Customer-Facing Advisors

| Aspect | Customer Advisors | Internal Agents |
|--------|-------------------|-----------------|
| Visible to | End users | Only in Mission Control |
| Purpose | Recommendations, actions | System reliability, security, cost |
| Trust model | User-earned autonomy | Policy-constrained autonomy |
| Output | Suggestions, drafts, actions | Diagnostics, repairs, guardrails |

## 6 Councils

1. **Product Build** — Feature quality, UX consistency, design system
2. **Reliability Ops** — Uptime, recovery, incident response
3. **Security Trust** — Threat detection, policy compliance, anomaly watching
4. **Runtime Cost** — Token budgets, model selection, waste detection
5. **Architecture Governance** — Import boundaries, module count, contract health
6. **Knowledge Coordination** — Runbook updates, doc freshness, knowledge gaps

## Agent Rights Model (L0-L6)

| Level | Right | Description |
|-------|-------|-------------|
| L0 | Observe | Read-only monitoring |
| L1 | Diagnose | Analyze and classify issues |
| L2 | Recommend | Suggest actions to humans |
| L3 | Draft | Prepare action plans |
| L4 | Simulate | Run what-if scenarios |
| L5 | Approval Ready | Queue for human approval |
| L6 | Constrained Action | Execute within defined boundaries |

## 40 Agents (Current Registry)

See `generated/internal-agent-registry.json` for full definitions.

Each agent has:
- Unique ID, name, council membership
- Mission statement, special ability
- Scope and out-of-scope boundaries
- Allowed and forbidden tools
- Memory scope
- Trigger conditions and schedule
- Escalation targets and receivers
- Confidence rules
- Simulation requirements
- Human approval requirements
- Max autonomy level
- Rollback authority
- KPIs and cost budget
- Failure handling rules
- Maturity level (scaffold/alpha/beta/production)

## 7 Supervisors

Supervisors oversee councils and handle escalations:
- Meta Supervisor (all councils)
- Per-council supervisors (6)

Supervisor capabilities:
- Override agent decisions
- Suspend agents
- Handle concurrent escalations
- Record override proof

## Self-Healing Operations

Internal agents can:
- Detect and auto-recover stuck workflows
- Pause degraded connectors
- Switch AI models on cost spikes
- Update runbooks automatically
- Escalate unresolved issues

All self-healing actions generate proof receipts.
