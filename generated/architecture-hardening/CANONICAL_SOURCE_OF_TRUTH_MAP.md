# Canonical Source-of-Truth Map

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Purpose:** Explicit single-source-of-truth registry per architectural concern.

## How to use this map

When you need to know "what is the truth about X in this repo?", look up X in the table below. The named source is **canonical**. All other references must defer to it.

## 1. Architecture topology

| Concern | Canonical source | Type |
|---|---|---|
| 5-plane boundaries | `generated/5-plane-boundaries-report.json` | JSON |
| Plane import graph | `scripts/architecture/checks/check-plane-import-graph.ts` output | Validator |
| App plane map | `generated/app-plane-map.json` | JSON |
| App profile matrix | `generated/app-profile-matrix.json` | JSON |
| Domain boundaries | `src/domains/user/**` + `src/domains/admin/**` | Code |

## 2. Routes

| Concern | Canonical source |
|---|---|
| Route topology | `generated/route-truth-report.json` |
| Route registry | `src/lib/route-registry.ts` |
| Sealed baseline | `generated/sealed-baseline-report.json` |

## 3. Profiles & Tiers

| Concern | Canonical source |
|---|---|
| Deployment profiles (user / operator) | `src/runtimes/deployment-profile.ts` |
| Runtime tiers (web/desktop/appliance/simulated) | `src/runtimes/feature-runtime-tier-registry.ts` |
| Capability fallbacks | `src/runtimes/capability-fallbacks.ts` |
| Launch honesty rules | `src/runtimes/launch-honesty-rules.ts` |

## 4. Services

| Concern | Canonical source |
|---|---|
| Service ownership | `generated/ownership-manifest.json` |
| Service topology | `generated/service-topology-report.json` |
| Service governance report | `generated/SERVICE_GOVERNANCE_REPORT.md` |

## 5. Edge functions

| Concern | Canonical source |
|---|---|
| Edge function topology | `generated/edge-function-topology-report.json` |
| Logging coverage | `generated/edge-function-structured-logging-report.json` |
| Log shape compliance | `generated/edge-function-log-shape-report.json` (NEW) |
| Contract coverage | `generated/edge-function-contract-coverage-report.json` |

## 6. Mobile

| Concern | Canonical source |
|---|---|
| Mobile scope (ARCHIVED) | `MOBILE_HONESTY.md` + `archive/mobile/ARCHIVED.md` |
| Reactivation conditions | `generated/mobile-scope-closure/REACTIVATION_CHECKLIST.md` |
| Mobile scope drift | `generated/mobile-archived-scope-report.json` (NEW) |

## 7. Simulation / Kernel

| Concern | Canonical source |
|---|---|
| Kernel ownership gap | `docs/architecture/native-os-future/KERNEL_OWNERSHIP_GAP.md` |
| Simulated surfaces | `src/runtimes/simulated-surface-registry.ts` |
| Nova Runtime SDK | `src/lib/nova-sdk/kernel/` (correctly named — not "kernel ownership") |
| Kernel overclaim drift | `generated/no-kernel-overclaim-report.json` (NEW) |

## 8. Portability

| Concern | Canonical source |
|---|---|
| Portability boundary model | `src/runtimes/portability-boundary-model.ts` |
| Runtime host adapter | `src/runtimes/runtime-host-adapter.ts` |
| Portability rules | `src/runtimes/portability-rules.ts` |
| Boundary compliance | `generated/runtime-host-boundaries-report.json` (NEW) |

## 9. Launch claims

| Concern | Canonical source |
|---|---|
| Launch honesty rules | `src/runtimes/launch-honesty-rules.ts` |
| Capability launch honesty map | `src/runtimes/capability-launch-honesty-map.ts` |
| Reality classification | `src/runtimes/reality-classification-registry.ts` |
| Forbidden phrases | `scripts/validation/check-no-prohibited-native-claims.ts` |

## 10. Trust UX & Budgets

| Concern | Canonical source |
|---|---|
| Per-user AI ceilings | `generated/economic-trust-and-future-closure/per-user-budget-status.json` |
| Trust copy alignment | `src/lib/microcopy.ts::aiAgency` |
| Calm-mode posture | `generated/calm-mode-default-posture-report.json` |
| Future surfaces | `generated/economic-trust-and-future-closure/future-surface-status.json` |

## 11. Generated truth manifests

| Concern | Canonical source |
|---|---|
| Manifest registry | `generated/manifest-registry.json` |
| Architectural cleanup | `generated/architectural-cleanup/` |
| Architecture hardening | `generated/architecture-hardening/` (THIS CLOSURE) |
| Security & portability | `generated/security-and-portability-closure/` |

## 12. Release readiness

| Concern | Canonical source |
|---|---|
| Master release aggregator | `scripts/architecture/checks/check-os-release-readiness.ts` |
| Block-gate list | (BLOCK_GATES array in above file) |
| Closure status | per-closure `*-status.json` |

## Drift prevention

If a future PR introduces a competing source for any concern in this map, `check-no-duplicate-truth-manifests.ts` will fail the build.
