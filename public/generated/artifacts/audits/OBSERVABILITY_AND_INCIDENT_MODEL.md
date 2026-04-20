# Observability & Incident Model

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/observability/observability-registry.ts`

## Purpose

Single registry for every signal SITA OS emits — logs, metrics, traces, drift indicators, diagnostics, incidents — including who can see them and where they're surfaced.

## Signal Kinds

| Kind | Examples |
|------|----------|
| `log` | `log.app.action`, `log.app.error`, `log.security.event` |
| `metric` | `metric.executor.latency_ms`, `metric.ai.cost_cents`, `metric.connector.uptime`, `metric.session.active` |
| `trace` | `trace.command.lifecycle`, `trace.advisor.invocation` |
| `drift` | `drift.policy.coverage`, `drift.schema.manifest` |
| `diagnostic` | `diag.support.bundle` |
| `incident` | `incident.runtime` |

## Per-Runtime Coverage

Every signal declares its runtimes (`web`, `desktop`, `appliance`, `mobile`, `edge`, `kernel`). Use `signalsForRuntime(runtime)` to get the catalog applicable to a given runtime.

## Admin Inspection Surfaces

Every signal points to an admin inspection route (e.g. `/admin/health/executor`, `/admin/ai-runtime/cost`, `/admin/incidents`). UI consumers can read the registry to render the navigation entries automatically.

## Retention

| Class | Retention |
|-------|-----------|
| Security events | 7 years |
| Errors | 90 days |
| App actions | 30 days |
| Metrics | 30–365 days |
| Traces | 14–30 days |
| Incidents | 2 years |

## Drift Indicators

Drift signals raise warn-level when:
- A registered service is missing from runtime catalog
- DB schema diverges from declared manifest
- Policy coverage drops below threshold

## Incidents

Incidents are first-class proofs. Opening one emits `incident.opened` (notification class) and creates a row in the incident table with linked observability context.

## Enforcement

- Floods are intercepted (`log-flood-kill` switch) when an emitter exceeds rate threshold.
- Signals not present in the registry are dropped at the bus.
