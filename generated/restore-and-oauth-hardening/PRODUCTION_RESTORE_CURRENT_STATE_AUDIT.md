# Production Restore — Current State Audit

> Generated as Phase A1 deliverable for the Restore + OAuth Hardening track.

## What exists today

| Area | Status | Evidence |
|---|---|---|
| Schema-only restore drill | ✅ Present | `scripts/db/restore/` — schema dump/replay scripts |
| Production-shape restore drill | ✅ Implemented this phase | `scripts/db/restore/production-shape-restore-drill.ts` |
| Realistic dataset seeding | ⚠ Synthetic, scrubbed | `scripts/db/seed/` (volume tier configurable) |
| Post-restore schema verification | ✅ | Matrix in drill output |
| Post-restore data integrity | ✅ | Row-count + relational sanity checks |
| Post-restore RLS regression check | ✅ | `check-post-restore-rls-integrity.ts` |
| Post-restore critical-route check | ✅ | `check-post-restore-critical-routes.ts` |
| Durable drill receipt | ✅ | `restore_drill_receipts` table (this phase) |
| Operator visibility | ✅ | Surfaced via Drill Cadence Board (`/admin/health`) |
| Freshness gate | ✅ | `check-production-restore-drill.ts` (35-day TTL) |

## Gaps closed by this track
1. Schema-only proofs no longer count as production-shape evidence.
2. Restore receipts are durably persisted with phase-level timing.
3. Operator visibility via canonical admin hub, not detached page.
4. CI/governance gate enforces freshness.

## Owner
Platform / DR working group — backed up by Operator on-call rota.
