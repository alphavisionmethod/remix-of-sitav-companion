# SITA OS — src/lib Decomposition Verification

> Generated: 2026-04-18T03:07:37.996Z
> Gate: `lib-decomposition-readiness`  Verdict: 🟡 YELLOW (in-migration)

## Counts

| Metric | Value |
|---|---|
| Files remaining in src/lib (non-allowlist) | 1731 |
| Files in src/lib allowlist (utils/internal/hooks) | 36 |
| Detected shim-shaped wrappers | 329 |
| Populated canonical destination roots | 5 / 7 |

## Canonical destination population

| Root | Total files | Non-barrel files |
|---|---|---|
| `src/domains` | 86 | 70 |
| `src/platform` | 59 | 23 |
| `src/runtimes` | 10 | 2 |
| `src/data` | 84 | 77 |
| `src/integrations` | 8 | 3 |
| `src/contracts` | 3 | 0 |
| `src/legacy` | 3 | 0 |

## Wrapper sample (first 20)

| File | LOC | Re-exports from |
|---|---|---|
| `src/lib/admin-ai/index.ts` | 7 | `./admin-ai-workforce-client` |
| `src/lib/advisor-intelligence/index.ts` | 15 | `./types` |
| `src/lib/advisor-topology.ts` | 1 | `@/domains/advisors/topology` |
| `src/lib/ai-engineering/index.ts` | 22 | `./observation-layer` |
| `src/lib/api/index.ts` | 4 | `./edge-client` |
| `src/lib/app-platform/index.ts` | 8 | `./types` |
| `src/lib/app-platform/types.ts` | 1 | `@/domains/apps/types` |
| `src/lib/backend-topology/index.ts` | 14 | `./edge-function-registry` |
| `src/lib/boardroom/index.ts` | 5 | `./types` |
| `src/lib/capabilities/index.ts` | 16 | `./capability-registry` |
| `src/lib/cloud-backbone/cloud-abuse-service.ts` | 1 | `@/platform/cloud/cloud-abuse-service` |
| `src/lib/cloud-backbone/cloud-audit-service.ts` | 1 | `@/platform/cloud/cloud-audit-service` |
| `src/lib/cloud-backbone/cloud-device-service.ts` | 1 | `@/platform/cloud/cloud-device-service` |
| `src/lib/cloud-backbone/cloud-lifecycle-service.ts` | 1 | `@/platform/cloud/cloud-lifecycle-service` |
| `src/lib/cloud-backbone/cloud-quota-service.ts` | 1 | `@/platform/cloud/cloud-quota-service` |
| `src/lib/cloud-backbone/cloud-storage-service.ts` | 1 | `@/platform/cloud/cloud-storage-service` |
| `src/lib/cloud-backbone/cloud-support-service.ts` | 1 | `@/platform/cloud/cloud-support-service` |
| `src/lib/cloud-backbone/cloud-sync-service.ts` | 1 | `@/platform/cloud/cloud-sync-service` |
| `src/lib/cloud-backbone/cloud-tenant-service.ts` | 1 | `@/platform/cloud/cloud-tenant-service` |
| `src/lib/cloud-backbone/cloud-worker-service.ts` | 1 | `@/platform/cloud/cloud-worker-service` |

## Verdict

🟡 Decomposition is in flight. Track wrapper count → 0 across waves.
