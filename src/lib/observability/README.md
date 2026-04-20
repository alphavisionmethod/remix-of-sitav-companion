# Observability — Telemetry Primitives

## Purpose
**Telemetry primitives** — structured logging, distributed tracing, SLO instrumentation, Sentry hooks. The "see what happened" layer.

## Layer
Cross-cutting **telemetry** layer consumed by every domain and platform module.

## What lives here
- Logger configuration and factories.
- Tracing helpers (spans, baggage, correlation IDs).
- SLO/SLI definitions and emitters.
- Sentry initialization and breadcrumb helpers.

## What does NOT belong here
- **Symptom→runbook classification** → `src/lib/incidents/` (different lifecycle: incident response, not telemetry emission).
- Domain-specific event taxonomies → emit through this layer, define in domain.
- Admin dashboards → `src/pages/admin/*`.

## Canonical neighbors
- `src/lib/incidents/` — symptom→runbook classifier. Consumes telemetry from here, emits to incident response surfaces. **Kept separate by design** — different consumers (admin dashboards vs. incident response) and different lifecycle (always-on vs. event-triggered).
- `src/lib/platform/` — wraps this layer for cross-cutting concerns.

## Cross-link
See `src/lib/incidents/README.md` for the incident-response side of the loop.
