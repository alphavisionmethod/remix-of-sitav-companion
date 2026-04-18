# SITA OS — src/lib Decomposition Model

> **Authority:** Canonical doc for Wave-0 / Wave-1 of the `src/lib` decomposition. Companion: `scripts/architecture/audit-src-lib.ts`, `scripts/architecture/build-target-map.ts`, and `generated/lib-decomposition/*`.

## Problem

`src/lib/` had grown to **1,681 source files** across **88 subfolders**, with **2,115 external consumer files** importing from **719 distinct `@/lib/*` paths**. It became the de-facto implementation gravity center even after `src/platform/`, `src/runtimes/`, `src/data/`, `src/integrations/`, and `src/contracts/` were introduced as canonical homes.

A naive mass-move would have broken thousands of imports. This decomposition is **wave-based**, **wrapper-bridged**, and **audit-first**.

## The 8 Canonical Classes

Every file under `src/lib/` is classified by `audit-src-lib.ts` into exactly one of:

| Class | Canonical home | Purpose |
|-------|----------------|---------|
| `domain` | `src/domains/{business,finance,concierge,...}/` | Bounded-context business logic |
| `platform` | `src/platform/{policy,observability,ai-gateway,...}/` | Cross-domain governance + services |
| `runtime` | `src/runtimes/{core,devices,surfaces,reality,...}/` | Substrate / environment logic |
| `data` | `src/data/{persistence,sync,clients,projections,seed}/` | Persistence, repositories, projections |
| `integration` | `src/integrations/{external,supabase,api,...}/` | External provider adapters |
| `contract` | `src/contracts/` | Types, schemas, manifests |
| `shared-internal` | `src/lib/utils.ts`, `src/hooks/` | True shared utilities — stay put |
| `legacy` | `src/legacy/{canonical-backend,unclassified,...}/` | Documented archive, not trash |

## Classification Rules (from `audit-src-lib.ts`)

1. **Folder-name first** — top-level folder under `src/lib` maps to a class via `FOLDER_CLASS` table.
2. **`services/<sub>/` requires per-subfolder routing** — `services/business-os/` → `domain`, `services/projection-service/` → `data`, etc.
3. **Loose root files** (e.g. `business-launcher.ts`) are mapped individually via `ROOT_FILE_CLASS`.
4. **Unmatched** → `legacy/unclassified/` for explicit manual review (never silently dropped).

## Wave Sequence

See `generated/lib-decomposition/SRC_LIB_MIGRATION_PLAN.md`.

| Wave | Class | Approx. files |
|-----:|-------|--------------:|
| 0 | Audit (read-only) | 1,681 scanned |
| 1 | Scaffold + target map | barrels created |
| 2 | `data` | ~171 |
| 3 | `runtime` | ~113 |
| 4 | `platform` | ~1,085 (sub-batched) |
| 5 | `domain` | ~240 |
| 6 | `integration` | ~9 (+ supabase-helpers) |
| 7 | `contract` | ~23 |
| 7b | services-unclassified | manual per-file review |
| 8 | Guardrail CI checks | new validators |
| 9 | Final verification + reports | — |

## No-Loss Contract

- No file deleted in this refactor — every file is moved, wrapped, or archived in `src/legacy/` with a documented reason.
- Every moved file leaves a thin re-export wrapper at its old `src/lib` path.
- Wrappers are tracked in `generated/lib-decomposition/src-lib-wrapper-map.json` with a removal condition.
- Build runs after every wave (`tsc --noEmit` + `full-render-smoke`).

## Stays in `src/lib`

These are not misplaced — they are true shared utilities and remain canonical:

- `src/lib/utils.ts` (763 external importers)
- `src/lib/utils/`

Hooks under `src/lib/hooks/` migrate to `src/hooks/` in Wave 5b.

## Guardrails (Wave 8)

After migration, regression is prevented by:

- `scripts/architecture/checks/check-lib-ownership-drift.ts` — fails CI if new files appear in `src/lib/` outside the allowlist.
- `scripts/architecture/checks/check-misplaced-runtime-logic.ts` — flags runtime imports inside `src/domains/`.
- `scripts/architecture/checks/check-misplaced-data-logic.ts` — flags raw DB access outside `src/data/` and `src/integrations/`.
- `scripts/architecture/checks/check-misplaced-domain-logic.ts` — flags business-context names inside `src/platform/`.
- `scripts/architecture/checks/check-legacy-wrapper-usage.ts` — counts remaining wrapper imports; CI fails if they grow.
