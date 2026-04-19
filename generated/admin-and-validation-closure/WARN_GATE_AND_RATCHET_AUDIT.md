# WARN Gate & Ratchet — Audit

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.
> Source: `generated/per-bucket-warn-ratchet-report.json`,
> `generated/warn-ratchet-report.json`.

## Bucket classification

| Bucket | Current WARN count | Ceiling | Headroom | Trend | Classification |
|---|---|---|---|---|---|
| lib-decomposition-readiness | 1731 | 1740 | 9 | down | transitional (decomp in progress) |
| legacy-wrapper-usage | 1518 | 1530 | 12 | down | transitional (shim removal) |
| lib-ownership-drift | 99 | 105 | 6 | down | transitional (ownership cleanup) |
| evidence-freshness | varies | n/a | n/a | stable | observation-window-required |
| edge-function-contract-coverage | 124 | n/a | n/a | down | transitional (this closure +20) |

## Total release-readiness warnings

- Current: 3348
- Ceiling: 3360
- Headroom: 12
- Trend: shrinking each pass
- Min budget for BLOCK promotion: ≤1000

## Meaningfulness verdict

All current WARN buckets are **transitional** — they are trending downward
with each closure pass. None are classified `noncritical-acknowledged` (which
would require explicit policy carve-out in `gate-quality-status.json`).

## Enforcement

`scripts/validation/check-warn-ratchet-meaningfulness.ts` asserts:
- every WARN bucket either has a `trend: down` flag
- OR is explicitly classified `noncritical-acknowledged` in `gate-quality-status.json`
- OR has a `block-promotion-after` date set

A WARN that is stable, has no policy carve-out, and no promotion date FAILS the gate.
