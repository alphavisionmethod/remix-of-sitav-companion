# SITA OS — src/lib Decomposition Verification

> Generated: 2026-04-18T03:02:53.602Z
> Gate: `lib-decomposition-readiness`  Verdict: 🟡 YELLOW (in-migration)

## Counts

| Metric | Value |
|---|---|
| Files remaining in src/lib (non-allowlist) | 1731 |
| Files in src/lib allowlist (utils/internal/hooks) | 36 |
| Detected shim-shaped wrappers | 194 |
| Populated canonical destination roots | 5 / 7 |

## Canonical destination population

| Root | Total files | Non-barrel files |
|---|---|---|
| `src/domains` | 30 | 14 |
| `src/platform` | 42 | 6 |
| `src/runtimes` | 9 | 1 |
| `src/data` | 24 | 17 |
| `src/integrations` | 7 | 2 |
| `src/contracts` | 3 | 0 |
| `src/legacy` | 3 | 0 |

## Wrapper sample (first 20)

| File | LOC | Re-exports from |
|---|---|---|
| `src/lib/admin-ai/index.ts` | 7 | `./admin-ai-workforce-client` |
| `src/lib/advisor-intelligence/index.ts` | 15 | `./types` |
| `src/lib/ai-engineering/index.ts` | 22 | `./observation-layer` |
| `src/lib/api/index.ts` | 4 | `./edge-client` |
| `src/lib/app-platform/index.ts` | 8 | `./types` |
| `src/lib/app-platform/types.ts` | 1 | `@/domains/apps/types` |
| `src/lib/backend-topology/index.ts` | 14 | `./edge-function-registry` |
| `src/lib/boardroom/index.ts` | 5 | `./types` |
| `src/lib/capabilities/index.ts` | 16 | `./capability-registry` |
| `src/lib/cloud-backbone/index.ts` | 20 | `./cloud-storage-service` |
| `src/lib/constants/index.ts` | 1 | `./ui-config` |
| `src/lib/contracts/index.ts` | 1 | `./global-contracts-registry` |
| `src/lib/core-services/ai-gateway/diagnostics.service.ts` | 1 | `@/lib/services/ai-gateway/diagnostics.service` |
| `src/lib/core-services/ai-gateway/index.ts` | 1 | `@/lib/services/ai-gateway` |
| `src/lib/core-services/ai-workforce/admin-budget-routing-policy.ts` | 1 | `@/lib/services/ai-workforce/admin-budget-routing-policy` |
| `src/lib/core-services/ai-workforce/index.ts` | 1 | `@/lib/services/ai-workforce` |
| `src/lib/core-services/ai-workforce/workforce-orchestrator.ts` | 1 | `@/lib/services/ai-workforce/workforce-orchestrator` |
| `src/lib/core-services/approval-engine/index.ts` | 4 | `./approval-history.service` |
| `src/lib/core-services/architecture/god-tier-integration-engine.ts` | 1 | `@/lib/services/architecture/god-tier-integration-engine` |
| `src/lib/core-services/architecture/index.ts` | 1 | `./god-tier-integration-engine` |

## Verdict

🟡 Decomposition is in flight. Track wrapper count → 0 across waves.
