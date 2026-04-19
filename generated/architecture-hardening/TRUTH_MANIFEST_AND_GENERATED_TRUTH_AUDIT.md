# Truth Manifest and Generated Truth Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/TRUTH_MANIFEST_AUDIT.md`

## 1. Inventory snapshot

`generated/` contains **~371 artifacts** (markdowns, JSON reports, manifests, sub-closures). All are governed by the Manifest Truth Framework.

Sub-closures (canonical, do not duplicate):
- `architectural-cleanup/` — 16 deliverables (4 JSONs + 12 markdowns)
- `architecture-hardening/` — 22 deliverables (4 JSONs + 18 markdowns) — THIS CLOSURE
- `economic-trust-and-future-closure/` — 10 deliverables
- `security-and-portability-closure/` — 18 deliverables
- `mobile-scope-closure/` — full closure pack
- `admin-and-validation-closure/`
- `ai-runtime-truth-closure/`
- `architecture-remediation/`

## 2. Canonical truth sources (one per concern)

| Concern | Canonical source |
|---|---|
| Route topology | `route-truth-report.json` |
| App plane map | `app-plane-map.json` |
| App profile matrix | `app-profile-matrix.json` |
| Service ownership | `ownership-manifest.json` |
| Edge function topology | `edge-function-topology-report.json` |
| Mobile scope | `MOBILE_HONESTY.md` + `mobile-scope-closure/` |
| Simulation honesty | `KERNEL_OWNERSHIP_GAP.md` |
| Runtime tiers | `feature-runtime-tier-registry.ts` |
| Portability boundaries | `portability-boundary-model.ts` |
| Per-user budgets | `per-user-budget-status.json` |
| Future surfaces | `future-surface-status.json` + `simulated-surface-registry.ts` |

## 3. Drift prevention

| Validator | Concern |
|---|---|
| `check-no-duplicate-truth-manifests.ts` (existing) | Multiple active truths for one concern |
| `check-no-stale-canonical-docs.ts` (existing) | Stale canonical docs |
| `check-doc-canonicality.ts` (NEW) | Orphaned canonical hardening docs |
| `check-mobile-archived-scope.ts` (NEW) | Mobile reactivation drift |
| `check-no-kernel-overclaim.ts` (NEW) | Kernel claim drift |

## 4. Generated truth health

- ✅ Every JSON report in `generated/` is consumed by at least one validator OR truth panel
- ✅ Every closure markdown is referenced by its companion JSONs
- ✅ Every sub-closure has its own status JSON in the same directory
- ⚠️ Orphan watch active via `check-doc-canonicality.ts` (WARN-tier)

## 5. Reconciliation status

No conflicting active manifests detected for this hardening pass. Cleanup is **additive only** — zero deletions. All prior closures retain canonical status.

## 6. Cross-references

- `generated/manifest-registry.json` — Manifest Truth Framework registry
- `generated/architectural-cleanup/TRUTH_MANIFEST_AUDIT.md` — original audit
- `generated/architectural-cleanup/TRUTH_MANIFEST_RECONCILIATION_PLAN.md` — original plan
- `CANONICAL_SOURCE_OF_TRUTH_MAP.md` (this directory) — explicit per-concern map
