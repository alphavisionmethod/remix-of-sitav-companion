# Truth Source Reconciliation Plan

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** References `generated/architectural-cleanup/TRUTH_MANIFEST_RECONCILIATION_PLAN.md`

## 1. Reconciliation principle

Each architectural concern has **exactly one canonical source**. Other artifacts may reference it but never duplicate or compete with it.

## 2. Reconciliation actions for this pass

### 2.1 Carryover from prior cleanup (already reconciled)

The economic-trust-and-future closure is now `now-shipped-and-wired` per `generated/architectural-cleanup/architectural-cleanup-status.json`. No action required this pass.

### 2.2 New canonical sources introduced this pass

| Concern | New canonical | Drift validator |
|---|---|---|
| Architecture-hardening verification | `architecture-hardening-verification.json` | `check-doc-canonicality.ts` |
| Portability hardening status | `portability-hardening-status.json` | `check-runtime-host-boundaries.ts` |
| Truth hardening status | `truth-hardening-status.json` | `check-no-duplicate-truth-manifests.ts` |
| Architecture hardening status | `architecture-hardening-status.json` | (this closure aggregator) |

### 2.3 No competing truths

Verified for this pass:
- ❌ No duplicate route truth files
- ❌ No duplicate plane maps
- ❌ No duplicate ownership manifests
- ❌ No duplicate runtime tier registries

## 3. Consumer rewiring

All new validators and the new `ArchitectureHardeningTruthPanel` consume the canonical JSONs in `generated/architecture-hardening/`. No legacy paths consulted.

## 4. Drift-prevention guarantees

- `check-no-duplicate-truth-manifests.ts` (existing) — runs every CI cycle
- `check-doc-canonicality.ts` (NEW) — runs every CI cycle, surfaces orphans
- All new gates wired into `check-os-release-readiness.ts` BLOCK list

## 5. Forward path

Future closures must:
1. Add their canonical status JSON to their own sub-directory under `generated/`
2. Reference (not duplicate) prior closures
3. Wire validators into `check-os-release-readiness.ts`
4. Mount their truth panel on `AIRuntimeHome.tsx` if operator visibility is needed

## 6. Cross-references

- `generated/architectural-cleanup/TRUTH_MANIFEST_RECONCILIATION_PLAN.md`
- `CANONICAL_SOURCE_OF_TRUTH_MAP.md` (companion in this directory)
