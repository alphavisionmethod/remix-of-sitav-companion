# Edge-Function Contract Coverage — Audit

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.
> Scanner: `scripts/validation/check-edge-function-contract-coverage.ts`.

## Live count

- **Total edge functions:** 173 (under `supabase/functions/`)
- **Contract tests present (baseline):** 29 `*_test.ts` / `*.test.ts` files (~17%)
- **Contract tests present (after this closure):** 49 (~28%)
- **Target for BLOCK promotion:** ≥50% (≥87 of 173)
- **Current gate level:** WARN (clear roadmap published)

## What "contract test" means here

Each `_test.ts` must assert at minimum:
1. **CORS** — OPTIONS returns 200 with `Access-Control-Allow-Origin`
2. **JWT validation** — unauthenticated POST returns 401
3. **Error-shape contract** — invalid body returns 400 with `{ error: ... }`
4. **Success-shape contract** — valid call returns expected JSON shape

## Coverage by criticality tier

| Tier | Functions | Covered (post-closure) | % |
|---|---|---|---|
| Tier 1 (deployment-critical) | 24 | 24 | 100% |
| Tier 2 (trust/security) | 35 | 18 | 51% |
| Tier 3 (workforce/runtime) | 64 | 5 | 8% |
| Tier 4 (utility/cron) | 50 | 2 | 4% |

## Roadmap to ≥50% (BLOCK promotion)

Phase 1 (this closure): +20 tests (Tier 2 saturation) → 49/173 (28%)
Phase 2 (next pass): +20 tests (Tier 3 priority — agent loop, reflect, etc.) → 69/173 (40%)
Phase 3 (BLOCK promotion): +18 tests (Tier 3+4 utility) → 87/173 (50%) → gate becomes BLOCK
