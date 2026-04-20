# SITA OS — Atlas Operations & Platform Truth

## Ownership

Domain: `platform`
Service: `atlas`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Durability Dashboard | System-wide health, uptime, data integrity monitoring |
| Deployment Truth | Build verification, artifact validation, drift detection |
| Proof Coverage | Receipt chain completeness, gap detection, audit trails |
| Validation Engine | Schema validation, contract testing, conformance checks |
| Projection Engine | Event sourcing projections, materialized views, consistency |
| Platform Diagnostics | Error clustering, performance profiling, resource usage |

## Page Map

| Route | Purpose |
|-------|---------|
| `/atlas` | Dashboard — platform health, proof coverage, drift status |
| `/atlas/durability` | Data durability metrics and backup status |
| `/atlas/deployment` | Build artifacts, deployment history, drift reports |
| `/atlas/proof` | Receipt chain coverage and gap analysis |
| `/atlas/validation` | Schema and contract validation results |
| `/atlas/projections` | Event projection status and consistency |
| `/atlas/diagnostics` | Error clusters, performance, resource usage |

## Data Model

- `deployment_artifacts` — build outputs and validation
- `drift_reports` — artifact drift detection results
- `proof_coverage_snapshots` — receipt chain completeness
- `validation_runs` — schema/contract test results
- `projection_state` — event sourcing materialized views
- `platform_diagnostics` — error clusters and metrics

## Proof Model

- Deployment receipt (build hash, artifacts validated, drift status)
- Validation receipt (checks run, pass/fail, timestamp)
- Proof coverage receipt (coverage %, gaps identified)

## Integration Points

- `verification-engine` — artifact and receipt verification
- `receipt-service` — platform-level proof chain
- `event-bus` — deployment and validation events
- `support-diagnostics` — error clustering and escalation
