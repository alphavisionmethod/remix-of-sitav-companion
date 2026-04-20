# SITA OS — Self-Healing Operations

## Philosophy

The system should recover from failures automatically where safe, and surface problems clearly where human judgment is needed. Self-healing does not mean unconstrained autonomy — it means the system can detect issues early, summarize them clearly, recommend safe responses, take limited low-risk actions where explicitly allowed, escalate to humans for higher-risk actions, and preserve logs, receipts, and evidence.

## Principles

Self-healing must be: trust-safe, simulation-first for risky actions, reversible where possible, fully logged, explainable, scoped, policy-aware, cost-aware, and supportable.

It must never silently: widen permissions, change core policy without approval, deploy unreviewed code, alter privacy boundaries, hide incidents, or pretend recovery happened when it failed.

## Canonical Self-Healing Pipeline

```
Detection → Classification → Triage → Plan → Approval (if needed) → Execute → Verify → Close
```

1. **Detection** — Continuous health checks, metric watchers, event listeners
2. **Classification** — Root cause categorization (16 categories including resource-exhaustion, dependency-failure, connector-failure, workflow-stuck, trust-failure, etc.)
3. **Triage** — Severity assignment (P0 outage → P4 info) with escalation rule lookup
4. **Plan** — Select healing actions based on root cause + severity from 11-capability table
5. **Approval** — P0/P1: auto-execute with owner notification. P2: known patterns only. P3: draft plan, needs approval. P4: log only
6. **Execute** — Apply healing action through executor-service with circuit breaker (max 3 attempts, 30s cooldown)
7. **Verify** — Post-healing health check to confirm recovery
8. **Close** — Emit receipt, update incident record, notify relevant parties

## Self-Healing Capabilities

| Capability | Detection Agent | Action Agent | Autonomy |
|---|---|---|---|
| Service restart | aw-incident-response | aw-incident-response | L4 |
| Circuit breaker | aw-incident-response | aw-incident-response | L4 |
| Connector failover | aw-connector-health | aw-connector-health | L3 |
| Cache flush | aw-latency-optimizer | aw-cache-compression | L3 |
| Workflow unstick | aw-workflow-recovery | aw-workflow-recovery | L3 |
| Rollback | aw-release-safety | aw-rollback | L4 |
| Auto-scale | aw-fleet-health | aw-capacity-planning | L3 |
| Rate limit adjust | aw-connector-health | aw-sre | L3 |
| Model swap | aw-model-routing | aw-model-routing | L3 |
| Queue drain | aw-workflow-recovery | aw-workflow-recovery | L3 |
| Permission revert | aw-permission-drift | aw-permission-drift | L2 |

## Problem Classes

### Workflow failures
Stuck workflows, illegal transitions, timeouts, orphaned approval states, failed postconditions, replay-required states.

### Connector failures
Authentication failures, provider outages, rate limiting, schema drift, webhook failures, degraded provider quality.

### Release failures
Bad deploys, regression spikes, route/workspace failures, broken projections, missing manifests, design-system breakage.

### Trust failures
Policy mismatch, permission drift, missing proof, audit gaps, privacy boundary violations, unsafe autonomy attempts.

### Runtime and cost failures
Spend spikes, latency spikes, queue pressure, model routing inefficiency, cache misses, capacity saturation.

### UX quality failures
Broken trust-state rendering, proof-center rendering bugs, shell grammar violations, design drift, empty/loading/error state regressions.

## Escalation Rules

| Severity | Auto-Heal | Autonomy | Council Quorum | Human Approval | Max Attempts | Owner Notified |
|---|---|---|---|---|---|---|
| P0 (outage) | Yes | L6 | No | No | 2 | Yes |
| P1 (critical) | Yes | L4 | Yes | No | 3 | Yes |
| P2 (degraded) | Yes | L3 | No | No | 3 | No |
| P3 (warning) | No | L2 | No | Yes | 0 | No |
| P4 (info) | No | L1 | No | No | 0 | No |

## Circuit Breaker Rules

- Maximum 3 auto-heal attempts per service per incident
- Minimum 30s cooldown between heal attempts
- If 3 attempts fail, circuit breaks: no further auto-healing until human review or 30-minute window
- Circuit breaker state visible in fleet-health dashboard

## Degraded Mode

When self-healing cannot fully recover, the system enters degraded mode:

1. Affected service marked as `degraded` in fleet health
2. Non-critical features gated behind the degraded service are disabled
3. User-facing surfaces show a calm degraded indicator
4. Incident escalated to `sup-reliability` → `chief-of-staff`
5. Owner receives notification through preferred channel

Degraded mode is exited when 3 consecutive health checks pass, or human operator explicitly marks service as healthy.

### Degraded Mode Definitions

| Mode | Description | Fallback |
|---|---|---|
| connector-unavailable | Connector unavailable but UI preserved | Cached data with staleness warning |
| ai-reduced | AI summarization reduced | Deterministic fallback |
| proof-readonly | Proof center read-only | Read-only display |
| boardroom-partial | Boardroom generation partial | Partial packet with warning |
| communications-simulation | Communications simulation-only | Simulation mode only |
| finance-readonly | Finance read-only safety | Read-only with approval queue |

## Recovery Sequencing

For multi-service incidents:
1. Identify dependency graph of affected services
2. Heal upstream dependencies first (topological sort)
3. Wait for health confirmation before healing downstream
4. Apply healing actions with cooldown between steps
5. Verify end-to-end workflow health after full recovery

## Incident Lifecycle States

```
detected → classified → triaging → planning → healing → verifying → resolved
                                                    ↓
                                                escalated → human-review → resolved
```

## Auto-Allowed Actions (Low-Risk)

- Cache flush
- Queue drain
- Rate limit adjust
- Model swap

## Never-Auto Actions (Always Require Human Approval)

- Widen permissions
- Change policy thresholds
- Disable privacy controls
- Destructive data actions
- Sensitive connector enablement
- Irreversible migrations
- Cross-tenant repair with destructive potential
- Auto-calling users/clients as incident response

## Immune Controller

The immune controller manages quarantine and pattern-matching:
- Quarantine/release services that misbehave
- 7 default immune rules matching root causes to healing capabilities
- Auto-block for repeated offenders (5+ incidents in 1 hour)
- Pattern matching for known failure modes

## Fleet Health Service

- Fleet-wide health aggregation across all services
- Per-service health score (0-100) based on uptime, latency, error rate
- Dependency graph with cascade failure prediction
- Recovery sequencing with topological sort

## Integration Points

| Service | Integration |
|---|---|
| `self-healing/service.ts` | Core healing logic, incident management |
| `self-healing/immune-controller.ts` | Immune system rules, quarantine management |
| `self-healing/fleet-health.ts` | Fleet-wide health aggregation |
| `event-bus` | All incidents and healing events emitted as events |
| `receipt-service` | Every healing action generates a receipt |
| `executor-service` | Healing uses execution envelopes |
| `connector-control` | Connector-failover capability |
| `internal-agent-config` | Agent definitions, autonomy levels |

## Observability

Every healing action must produce:
- Correlation ID linking detection → action → verification
- Receipt with before/after state
- Event on the event bus
- Entry in the incident timeline
- Diagnostic bundle if severity ≥ P2

## Diagnostics and Proof

Every self-healing action generates:
- Incident ID and classification
- Timestamps for detection, classification, bundle generation
- Evidence references and affected services
- Probable cause with confidence level
- Recommended actions
- Support-readable diagnostic bundles

## Routes

| Route | Description |
|---|---|
| `/system/self-healing` | Self-healing dashboard with pipeline, escalation rules, capabilities |
| `/system/incidents` | All incidents with timeline, severity, state |
| `/system/fleet` | Fleet health with service grid, degraded/quarantined services |

## File Ownership

| File | Owner |
|---|---|
| `src/lib/core-services/self-healing/types.ts` | Self-healing type system |
| `src/lib/core-services/self-healing/service.ts` | Self-healing service |
| `src/lib/core-services/self-healing/immune-controller.ts` | Immune controller |
| `src/lib/core-services/self-healing/fleet-health.ts` | Fleet health service |
| `src/lib/core-services/self-healing/index.ts` | Barrel export |
| `src/test/self-healing.test.ts` | Tests (48 tests) |
| `docs/architecture/SELF_HEALING_OPERATIONS.md` | This document |
