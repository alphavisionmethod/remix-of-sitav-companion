# Evidence Freshness — Policy

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## Freshness windows (canonical)

| Evidence | Window | Category | Block-promotion eligible? |
|---|---|---|---|
| os-release-readiness-report.json | 168h (7d) | release-readiness | yes |
| profile-and-runtime-hardening/baseline.sealed.json | 720h (30d) | baseline | yes |
| warn-ratchet-report.json | 168h (7d) | release-readiness | yes |
| per-bucket-warn-ratchet-report.json | 168h (7d) | release-readiness | yes |
| frontend-backend-substrate-matrix.json | 336h (14d) | deployment-gap | yes |
| db-truth-closure-map.json | 336h (14d) | deployment-gap | yes |
| manifest-truth-closure-map.json | 336h (14d) | deployment-gap | yes |
| app-install-truth-map.json | 336h (14d) | deployment-gap | yes |
| supportability-coverage-map.json | 336h (14d) | deployment-gap | yes |

## Observation-window requirement for BLOCK promotion

`evidence-freshness` is currently a **WARN-tier** gate. To promote to BLOCK:

1. **Clean window:** 30 consecutive days where every required evidence file
   was within its freshness window.
2. **Recorded by:** `generated/observation-window-status.json` with
   `clean_days_consecutive >= 30`.
3. **Validator:** `scripts/validation/check-evidence-freshness-blocking.ts`
   reads the observation status and enforces BLOCK only when promotion
   conditions are met. Otherwise emits WARN with explicit countdown.

## Exception handling

A single-file freshness violation downgrades the clean-window counter to 0 and
restarts the observation period. This prevents premature BLOCK promotion while
still rewarding sustained discipline.

## Operator visibility

The Hardware-and-Operator truth panel surfaces the current observation-window
status, days-to-promotion, and any freshness-failing artifact name.
