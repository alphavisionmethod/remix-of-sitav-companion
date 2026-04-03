# SITA OS — Mission Control Shell

## Purpose

Mission Control is the owner/admin operational cockpit. It is NOT a DevOps dashboard.
It must feel Mac-like: calm, premium, powerful, and safe for non-technical operators.

## Separation of Concerns

| Layer | What it shows |
|-------|---------------|
| Customer-facing advisors | Business, Money, Concierge advisors visible in Advisor Council |
| Internal AI workforce | Governed background agents visible ONLY in Mission Control |
| System health | Connector, workflow, cost, trust, release status |

## Tabs

1. **Home** — System pulse hero, urgent items, recent activity timeline
2. **AI Team** — Internal agent registry grouped by council, grid/list toggle
3. **Incidents** — Severity, scope, root cause, timeline, rollback options
4. **Connectors** — Health scores, sync freshness, error rates, impacted workflows
5. **Recovery** — Stuck/failed workflows with retry, rollback, human intervention
6. **Costs** — Daily budget bar, per-agent token breakdown, cost anomalies
7. **Trust** — Policy anomalies, approval chain health, permission drift
8. **Replay** — Rollback history, event replay timeline, step-through incidents
9. **Releases** — Canary status, ring progression, rollout safety
10. **Permissions** — Advisor and agent autonomy levels, allowed/blocked actions
11. **Safe Mode** — Emergency controls to pause automation, lock domains
12. **History** — AI team evolution timeline, policy changes, recovery events

## System Pulse Hero

Circular health score gauge (0-100) computed from:
- Agent health (40%)
- Open incidents (25%)
- Connector health (20%)
- Stuck workflows (15%)

Six metric pills: AI Team, Incidents, Connectors, Workflows, Tokens/24h, Release

## Quick Actions

One-click buttons for: Refresh All, Run Diagnostics, View AI Spend, Replay Last Incident, Privacy Controls, Toggle Safe Mode

## Agent Cards

Each internal agent card shows:
- Name, role, council membership
- Health status (healthy/degraded/paused/error)
- Autonomy level (L0-L6)
- Token consumption (24h)
- Invocation count
- Last action timestamp
- Permissions summary

## Safe Mode

Emergency controls:
- Global safe mode toggle
- Per-domain execution pause
- Automation hold
- Connector pause
- Approval-only mode
