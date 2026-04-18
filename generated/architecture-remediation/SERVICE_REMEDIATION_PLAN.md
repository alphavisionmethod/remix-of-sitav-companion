# SITA OS — Service Remediation Plan (Phase B3 scope)

## Decision summary
- ✅ **Do NOT create `src/services/`** — service classes already have canonical homes.
- ⚠️ Reduce hidden-service drift in `src/lib/` from 178 → < 100 over the next 4 waves (opportunistic, not mass-move).

## Wave plan (deferred; not in this commit)
| Wave | Target subtree | Action |
|---|---|---|
| 1 | `src/lib/admin-ai/` | Move admin-AI services to `src/platform/admin-ai/` |
| 2 | `src/lib/advisor-intelligence/`, `src/lib/advisor-protocol/` | Move to `src/domains/advisors/` |
| 3 | `src/lib/ai/`, `src/lib/ai-engineering/`, `src/lib/ai-gateway/` | Consolidate under `src/platform/ai-gateway/` |
| 4 | `src/lib/canonical-backend/`, `src/lib/cloud-backbone/`, `src/lib/control-plane/` | Move to `src/platform/control-plane/` |

Each wave: copy → barrel → shim → verify. Same pattern as the page-consolidation waves.

## Guardrail (active now)
`scripts/architecture/checks/check-service-topology.ts` runs warn-level with budget 200 — triggers if drift grows.
