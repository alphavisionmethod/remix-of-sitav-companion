# Incidents — Symptom → Runbook Classifier

## Purpose
**Symptom→runbook classifier.** Maps observed failure symptoms to the runbook that operators should execute. The "what do I do about it" layer.

## Layer
Cross-cutting **incident response** layer. Distinct from `observability/` (which emits the signals this layer classifies).

## What lives here
- Classifier rules (symptom pattern → runbook ID).
- Runbook ID registry and metadata.
- Bindings to admin runbook surfaces.

## What does NOT belong here
- **Telemetry emission** (logs, traces, SLOs) → `src/lib/observability/` (different lifecycle: always-on emission vs. event-triggered classification).
- Runbook execution UI → admin pages.
- Domain logic → `src/lib/services/`.

## Why kept separate from `observability/`
- **Different consumers**: observability serves admin dashboards + SRE tooling; incidents serves on-call response + runbook navigation.
- **Different lifecycle**: observability is always-on emission; incidents is event-triggered classification.
- **Different ownership**: observability is platform-team; incidents is operator/SRE-team.

## Canonical neighbors
- `src/lib/observability/` — emits the telemetry this layer classifies.
- BLOCK gate #25 `runbook-coverage` — asserts every kill-switch maps to a runbook and vice-versa.

## Cross-link
See `src/lib/observability/README.md` for the telemetry side of the loop.
