# Wave 3 — Platform Elevation Report

**Status:** ✅ Complete
**Strategy:** Lift-and-shim — physical files moved to canonical `src/platform/*` homes; legacy `@/modules/_shared` and `@/modules/_trust` paths preserved as deprecation shims (removable in Wave 9).

## Migration summary

### `src/modules/_shared/**` → `src/platform/**`
| From | To | Files |
| --- | --- | ---: |
| `_shared/knowledge/*` | `platform/knowledge/` | 23 |
| `_shared/ai/*` | `platform/ai/` | 6 |
| `_shared/workspace/*` | `platform/workspace/` | 1 |
| `_shared/registry/*` | `platform/registry/` | 1 |
| `_shared/{pillar-contract,decision-queue}.ts` | `platform/contracts/` | 2 |

### `src/modules/_trust/**` → `src/platform/trust/**`
| From | To | Files |
| --- | --- | ---: |
| `_trust/registry/*` | `platform/trust/registry/` | 2 |
| `_trust/authority/*` | `platform/trust/authority/` | 2 |
| `_trust/ui/*` | `platform/trust/ui/` | 3 |
| `_trust/index.ts` (TRUST_LAYER + emitters) | `platform/trust/index.ts` | 1 (canonical recreate) |

**Total physical files relocated:** 41

## Internal absolute-import rewrites
4 files inside the moved tree had absolute `@/modules/_shared|_trust` imports. Updated to canonical `@/platform/*`:
- `src/platform/ai/StreamingChatPanel.tsx` → `@/platform/knowledge`
- `src/platform/ai/useOrchestrator.ts` → `@/platform/workspace/workspace-context`
- `src/platform/trust/ui/TrustBoundary.tsx` → `@/platform/trust`
- `src/platform/trust/registry/trust-action-registry.ts` → `@/platform/trust`

Relative imports inside the moved trees (`../authority`, `../registry`, `../index`) all resolve correctly because the sibling structure was preserved.

## Deprecation shims (legacy paths kept compiling)
**29 shim files** under `src/modules/_shared/` and `src/modules/_trust/` re-export from the new canonical platform homes. Each is a single `export * from "@/platform/..."` line marked `@deprecated Wave 3`. Plus the two top-level barrels (`_shared/index.ts`, `_trust/index.ts`).

External consumers preserved (no rewriting required this wave):
- `src/modules/{business,concierge,finance,health}/index.ts` — `_shared/pillar-contract`
- `src/modules/finance/pages/MoneyApprovals.tsx` — `_trust/ui/TrustBoundary`
- `src/modules/health/data/use-health-data.ts` — `_trust/registry/emit-registered`
- `src/pages/admin/architecture/{KnowledgeSpineBoard,LiveCortexBoard,SemanticSpineBoard,WorkspaceFederationBoard}.tsx` — `_shared/knowledge/*`, `_shared/ai/*`
- `src/pages/admin/modules/MCAIOrchestration.tsx` — `_shared/ai`
- `src/pages/trust/{TrustAutomationAuthority,TrustDecisions}.tsx` — `_trust/ui/ActionAuthorityPanel`, `_shared/decision-queue`

These will be migrated to canonical `@/platform/*` paths in Wave 4 (pillar pages) and Wave 6 (admin consolidation).

## Validator updates
- `check-no-duplicate-platform.ts`: removed `ai/` from forbidden list (now canonical home).
  Forbidden list is now 8 entries: `ai-gateway`, `core`, `os-services`, `services-unclassified`, `policy`, `policies`, `sync`, `nova-runtime-sdk`. **Strict mode green.**
- Constitution updated to reflect Wave 3 elevations; pointer index now references `src/platform/MANIFEST.md` as canonical.

## Manifests
- `src/platform/MANIFEST.md` — created (canonical platform inventory).
- `src/modules/_shared/MANIFEST.md` — rewritten as deprecation manifest with migration table.
- `src/modules/_trust/MANIFEST.md` — rewritten as deprecation manifest with migration table.

## TypeScript verification
`bunx tsc --noEmit` → **0 errors**. All 41 moved files + all consumers compile.

## Baseline drift
| Metric | Wave 2 | Wave 3 | Δ |
| --- | ---: | ---: | ---: |
| `src/platform` files | 287 | 328 | **+41** |
| `src/modules` files | 61 | 61 | 0 (shim count = original) |
| Forbidden duplicate folders | 0 | 0 | 0 |

## Remaining transitional debt
- 29 deprecation shims under `src/modules/{_shared,_trust}/` to be removed in Wave 9 once external consumers (≈10 files listed above) are migrated to canonical `@/platform/*` paths.
- All shims are 2-line `export * from` re-exports — zero behavioral risk.

## Next: Wave 4 — Pillar Migration
Move product page bodies from `src/pages/{business,concierge,finance,health,money,investment-office}/**` into `src/modules/<pillar>/pages/**`, leaving thin re-export adapters in `src/pages/`. While doing so, also rewrite the shared-shim consumers above to use `@/platform/*` directly (free side-effect of Wave 4).
