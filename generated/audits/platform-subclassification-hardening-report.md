# Wave 0.5 — Platform Subclassification Hardening Report

**Status:** ✅ Installed and enforced.
**Date:** 2026-04-25
**Authority:** Constitution Rules 27 & 28.
**Canonical model:** [`docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md`](../../docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md)
**Map:** [`generated/manifests/platform-subclassification-map.json`](../manifests/platform-subclassification-map.json)
**Ratchet baseline:** [`generated/manifests/platform-cross-subclass-baseline.json`](../manifests/platform-cross-subclass-baseline.json)

---

## 1 · The problem

Before Wave 0.5, `src/platform/` was a flat enumeration of **54 top-level
folders** with a single boundary rule (no imports from `src/modules/<pillar>/`).
There was no internal taxonomy, no allowed-dependency matrix between platform
families, and no validator to prevent the directory from becoming an
"everything bucket". Two validators (`check-platform-anti-patterns`,
`check-platform-readiness`) appeared in `validator-gate-map.json` as orphaned
advisory entries with no implementation on disk.

## 2 · The new platform taxonomy

Every `src/platform/<X>/` folder is now classified into exactly one of six
canonical sub-classes with an explicit allowed-dependency matrix:

| Sub-class | Members | Allowed deps |
|---|---:|---|
| `runtime-bridges` (lowest layer) | 17 | `governance`, `identity-and-tenant` |
| `identity-and-tenant` | 3 | `governance`, `runtime-bridges` |
| `governance` | 7 | `identity-and-tenant`, `runtime-bridges` |
| `intelligence` | 6 | `governance`, `identity-and-tenant`, `runtime-bridges` |
| `product-infrastructure` | 13 | all except `operator-control` |
| `operator-control` (consumer) | 8 | all others |
| **Total** | **54** | |

Universal rule retained: **no sub-class may import from `src/modules/<pillar>/**`**
(Constitution Rule 2).

### Member breakdown

- **runtime-bridges (17):** architecture · capabilities · ci · control-plane ·
  core-services · deploy · eventing · execution · fip · integration · migration ·
  nova-sdk · orchestration · registry · runtime · sync-engine · topology
- **identity-and-tenant (3):** auth · enterprise · tenant
- **governance (7):** contracts · governance · proof · security · trust · truth ·
  verification
- **intelligence (6):** advisors · ai · boardroom · intelligence · knowledge · product
- **product-infrastructure (13):** app-platform · apps · cloud · design-system ·
  experience · files · marketing · notifications · personal-brain · search ·
  settings · setup · workspace
- **operator-control (8):** admin\* · atlas · mission-control · observability ·
  operations · owner · sita\* · support

\* dispositioned `relocate-future` to `src/admin/` (see model doc §"Future
Platform Relocation Wave"). Deferred from Wave 0.5 to preserve the Wave-10
attestation seal.

## 3 · Constitution amendments

- **Rule 27** — Platform Subclassification Law (subclassification map +
  monotone ratchet are mandatory).
- **Rule 28** — Platform vs Admin boundary (capability vs UI separation).

## 4 · Files installed / changed

| Change | Path |
|---|---|
| ➕ Generator | `scripts/manifests/generate/generate-platform-subclassification-map.ts` |
| ➕ Foundation validator | `scripts/architecture/check-platform-subclassification.ts` |
| ➕ Discovery shim | `scripts/architecture/checks/check-platform-subclassification.ts` |
| ↻ Revived (was orphaned) | `scripts/architecture/checks/check-platform-anti-patterns.ts` |
| ➕ Subclass map | `generated/manifests/platform-subclassification-map.json` |
| ➕ Ratchet baseline | `generated/manifests/platform-cross-subclass-baseline.json` |
| ➕ Model doc | `docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md` |
| ↻ Constitution | `docs/architecture/REPOSITORY_CONSTITUTION.md` (Rules 27, 28) |
| ↻ Platform manifest | `src/platform/MANIFEST.md` (six-subclass grouping) |
| ↻ Foundation index | `generated/manifests/foundation-manifest-index.json` (14 → 16 manifests) |
| ↻ Validator gate map | `generated/validator-gate-map.json` (2 promotions to BLOCK) |
| ↻ CI workflow | `.github/workflows/foundation-gate.yml` (Rule 27 step) |
| ↻ Override registry | `src/lib/ci/validator-gate-map.ts` (BLOCK overrides for both gates) |

## 5 · Validator & CI hardening

| Gate | Before | After | Consumer |
|---|---|---|---|
| `check-platform-anti-patterns` | advisory (orphaned) | **BLOCK** | release-readiness |
| `check-platform-subclassification` | did not exist | **BLOCK** | release-readiness + foundation-gate |

The foundation-gate workflow now runs `check-platform-subclassification`
directly. Both gates are recorded in `generated/validator-gate-map.json` with
classification `block` and consumer `release-readiness`.

## 6 · Monotone ratchet baseline

`generated/manifests/platform-cross-subclass-baseline.json` records **509**
pre-existing cross-subclass import violations. The validator enforces a
**decrease-only** rule — any PR that increases this count fails CI. Top
offenders are documented as candidates for the future Platform Relocation Wave.

## 7 · Safety verification

| Check | Result |
|---|---|
| All imports still resolve | ✅ no file moves performed |
| All routes still resolve | ✅ no file moves performed |
| Wave-10 attestation seal | ✅ preserved (no physical moves) |
| Foundation manifest index | ✅ 16/16 present, 0 missing |
| Validator gate-map coverage | ✅ 100% (237 validators) |
| Subclassification map fresh | ✅ regenerated 2026-04-25 |

## 8 · Remaining future-facing work

1. **Platform Relocation Wave** — physically move
   `src/platform/{admin,sita}/**` to `src/admin/**` and break up `sita/**` per
   the model doc. Each move requires a safe-change-evidence ledger entry
   (Rule 24) and a re-emit of the Wave-10 attestation (Rule 19).
2. **Drain the 509-violation ratchet** to zero by refactoring imports rather
   than relocating files, where possible.
3. **Promote `platform-readiness`** from advisory to BLOCK once it has a real
   implementation backing the gate id (still orphaned today).

— End of report —
