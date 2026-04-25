# Platform — Canonical cross-pillar systems

> Owner: platform team. Imports allowed from anywhere; **may not import from
> `src/modules/<pillar>/**`** (validator: `check-module-ownership.ts`).

## Subsystems

### Cross-pillar runtime (Wave 3 elevation)
| Path | Purpose |
| --- | --- |
| `platform/contracts/` | Pure types/contracts: `pillar-contract`, `decision-queue` |
| `platform/registry/` | Module registry (route ↔ owning module) |
| `platform/workspace/` | Active workspace context + provider |
| `platform/ai/` | Orchestrator client, explainability, streaming chat panel |
| `platform/knowledge/` | Memory + chunks + ingestion + voice spine + federation + attribution + cross-workspace approvals |
| `platform/trust/` | Receipts, approvals, action registry, authority engine, Trust UI primitives |

### Pre-existing platform subsystems
admin · architecture · auth · capabilities · ci · cloud · control-plane ·
core-services · deploy · design-system · eventing · execution · experience ·
fip · governance · migration · notifications · nova-sdk · observability ·
operations · orchestration · product · proof · runtime · search · security ·
setup · support · sync-engine · topology · truth · verification

## Boundary rule
`src/platform/**` MAY import from `src/lib/**`, `src/integrations/**`,
`src/components/ui/**`, and other `src/platform/**` subsystems. It MUST NOT
import from `src/modules/<pillar>/**` (only `_shared`/`_trust` deprecation
shims are tolerated until Wave 9).
