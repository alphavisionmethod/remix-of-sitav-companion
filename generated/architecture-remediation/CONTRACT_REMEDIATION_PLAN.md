# SITA OS — Contract Remediation Plan (Phase B3 scope)

## Decision summary
- ✅ **Keep `src/packages/`** as canonical — 33 families, 448 files, healthy structure.
- ✅ **`src/contracts/` becomes a thin re-export barrel** over `src/packages/` for consumers that prefer the `@/contracts/*` path.
- ⚠️ Consolidate 5 named contract families currently leaked into other folders.

## Family consolidation targets (deferred waves)
| Family | Files | New home |
|---|---:|---|
| `architecture-contracts` | 38 | `src/packages/architecture-contracts/` |
| `engines-contracts` | 37 | `src/packages/engines-contracts/` |
| `sync-engine-contracts` | 37 | `src/packages/sync-engine-contracts/` |
| `orchestration-contracts` | 36 | `src/packages/orchestration-contracts/` |
| `nova-sdk-contracts` | 35 | `src/packages/nova-sdk-contracts/` |

## Guardrail (active now)
`scripts/architecture/checks/check-contract-topology.ts` runs warn-level with budget 250.

## Out of scope
- The 873 `misc` "leaked" contracts are mostly co-located UI prop types — **not real leaks**. Detector calibration is sufficient; no action needed.
