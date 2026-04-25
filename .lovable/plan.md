
# Wave E — `generated/` Physical Zoning + Consumer-Safe Rewiring

## Audit findings (real repo, not assumptions)

| Metric | Count |
|---|---|
| Files in `generated/` | **1,463** (1107 JSON, 354 MD, 1 HTML, 1 SQL) |
| Top-level files at `generated/*.json\|md` | **818** |
| Existing subfolders | **52** |
| Distinct `generated/...` reference paths in code | **740** |
| Of those, top-level references | **497** |
| Files in `scripts/` referencing `generated/` | **571** |
| Files in `src/` referencing `generated/` | **77** |
| Files in `docs/` referencing `generated/` | **48** |
| Files in `.github/workflows/` referencing `generated/` | **17** |
| Files in `public/generated/` (mirror) | **619** |
| Entries in `generated/INDEX.json` (canonical registry) | **913** |
| Entries in Wave-B governance map | **1,446** (1 active-blocking, 152 active-informational, 1254 reference, 37 historical-archived) |
| Hottest single path | `generated/service-manifest.json` — referenced **39 times** |

Wave B already installed lifecycle classification for every file. What's missing physically is **purpose-zoned folders**.

## The physical-move risk

A blind move of 818 root files into `manifests/`, `audits/`, `proof/`, `readiness/`, `lifecycle/`, `historical/`, `reports/` would:
- Break 497 hardcoded references in scripts/CI/src
- Break `INDEX.json` (913 entries with absolute paths)
- Break `public-mirror-policy.ts` `MIRROR_RULES` (619 mirrored files)
- Break 17 GitHub workflows
- Violate the **strict no-logic/no-API-change rule** the user mandated, because path-resolving code is API

## The Wave-E approach: tiered, evidence-backed physical moves

**Tier 1 — SAFE physical moves (no rewiring needed)**

Move the **38 historical-archived "closure"/"phase"/"remediation" subfolders** that already live as their own subdirectories into a single `generated/historical/` parent. These subfolders are referenced 0 times by name in scripts (only by their internal files, which already use the subfolder path).

Concrete moves (verified historical-archived per Wave B governance map):
- `generated/admin-ai-engineer-team/` → `generated/historical/admin-ai-engineer-team/`
- `generated/admin-and-validation-closure/` → `generated/historical/admin-and-validation-closure/`
- `generated/admin-coherence-and-responsive-closure/` → `generated/historical/admin-coherence-and-responsive-closure/`
- `generated/admin-empty-state-closure/` → `generated/historical/admin-empty-state-closure/`
- `generated/advisor-boardroom-proof/` → `generated/historical/advisor-boardroom-proof/`
- `generated/ai-fallback-replay-bundle/` → `generated/historical/ai-fallback-replay-bundle/`
- `generated/ai-runtime-truth-closure/` → `generated/historical/ai-runtime-truth-closure/`
- `generated/app-lifecycle-closure/` → `generated/historical/app-lifecycle-closure/`
- `generated/architectural-cleanup/` → `generated/historical/architectural-cleanup/`
- `generated/architecture-hardening/` → `generated/historical/architecture-hardening/`
- `generated/architecture-remediation/` → `generated/historical/architecture-remediation/`
- `generated/behavioral-equivalence-proofs/` → `generated/historical/behavioral-equivalence-proofs/`
- `generated/boardroom-layer7-closure/` → `generated/historical/boardroom-layer7-closure/`
- `generated/claim-safety-hardening/` → `generated/historical/claim-safety-hardening/`
- `generated/connector-truth-closure/` → `generated/historical/connector-truth-closure/`
- `generated/deployment-gap-closure/` → `generated/historical/deployment-gap-closure/`
- `generated/economic-trust-and-future-closure/` → `generated/historical/economic-trust-and-future-closure/`
- `generated/final-deployment-closure/` → `generated/historical/final-deployment-closure/`
- `generated/final-hardening/` → `generated/historical/final-hardening/`
- `generated/final-proof-verification/` → `generated/historical/final-proof-verification/`
- `generated/flagship-surface-closure/` → `generated/historical/flagship-surface-closure/`
- `generated/frontend-polish-closure/` → `generated/historical/frontend-polish-closure/`
- `generated/frontend-truth-backing-closure/` → `generated/historical/frontend-truth-backing-closure/`
- `generated/hardware-and-operator-closure/` → `generated/historical/hardware-and-operator-closure/`
- `generated/integration-proof-bundles/` → `generated/historical/integration-proof-bundles/`
- `generated/internal-ai-runtime-phase{1..7}/` → `generated/historical/internal-ai-runtime-phase{1..7}/`
- `generated/lib-decomposition/` → `generated/historical/lib-decomposition/`
- `generated/lib-remediation/` → `generated/historical/lib-remediation/`
- `generated/master-deployment-readiness/` → `generated/historical/master-deployment-readiness/`
- `generated/mobile-identity-reconciliation/` → `generated/historical/mobile-identity-reconciliation/`
- `generated/mobile-scope-closure/` → `generated/historical/mobile-scope-closure/`
- `generated/page-consolidation/` → `generated/historical/page-consolidation/`
- `generated/profile-and-runtime-hardening/` → `generated/historical/profile-and-runtime-hardening/`
- `generated/refactor/` → `generated/historical/refactor/`
- `generated/release-artifact-proof/` → `generated/historical/release-artifact-proof/`
- `generated/remediation/` → `generated/historical/remediation/`
- `generated/restore-and-oauth-hardening/` → `generated/historical/restore-and-oauth-hardening/`
- `generated/security-and-portability-closure/` → `generated/historical/security-and-portability-closure/`
- `generated/self-healing/` → `generated/historical/self-healing/`
- `generated/trust-state-and-copy-closure/` → `generated/historical/trust-state-and-copy-closure/`
- `generated/windowing-proof/` → `generated/historical/windowing-proof/`
- `generated/workflow-proof-bundles/` → `generated/historical/workflow-proof-bundles/`

**Pre-move proof obligation per Rule 47** (executed via `generate-retirement-evidence-proof.ts`):
- For each subfolder: `rg "<subfolder>/" scripts src docs .github supabase tests` must return **0 hits** (only internal generated/ self-references allowed).
- Any subfolder with non-zero hits is **excluded from Tier 1** and pinned in `generated/baselines/historical-move-blockers.json`.

**Post-move rewiring** (mandatory):
- Update `generated/manifests/generated-artifact-governance-map.json` paths
- Update `generated/INDEX.json` paths for any moved entries
- Update `scripts/architecture/lib/public-mirror-policy.ts` if any `MIRROR_RULES` `sourceDir` points at a moved subfolder
- Update `generated/baselines/orphan-artifact-baseline.json` (paths only — not entries)
- Re-run `generate-public-artifact-mirror.ts` so `public/generated/` re-mirrors from new paths
- Re-run `generate-artifact-governance-map.ts`

**Tier 2 — VIRTUAL zoning (no physical move; preserves all 740 reference paths)**

For the 818 top-level files (referenced 497 times), introduce a **virtual zoning view** without moving:
- Generate `generated/lifecycle/generated-artifact-zone-index.json` mapping every file to one of 7 zones (manifests/audits/proof/readiness/lifecycle/historical/reports) using deterministic name-based rules + governance-map lifecycle class.
- Generate `generated/REZONED_INDEX.md` as a human-readable directory of files grouped by zone, so engineers can navigate by purpose without breaking any path.
- Add `scripts/architecture/checks/check-generated-zone-coverage.ts` (BLOCK): every file in `generated/**` must appear in the zone index.

This delivers the user's "purpose-zoned" experience **without** the 497-rewiring blast radius.

**Tier 3 — Future enforcement (prevent root-sprawl regression)**

- New rule: any **new** generated artifact created after Wave E **must** be written to a zone subfolder (`generated/manifests/`, `generated/audits/`, etc.). Root-level new files are forbidden.
- Validator: `check-generated-root-sprawl.ts` (BLOCK) — pins current 818 root files in `generated/baselines/root-sprawl-baseline.json`; any new root file added is a CI failure.

## Files to create / modify

### Create
1. `generated/historical/` (new parent folder; populated by Tier 1 moves)
2. `generated/lifecycle/generated-artifact-zone-index.json` (Tier 2 virtual zoning)
3. `generated/REZONED_INDEX.md` (human-readable zone directory)
4. `generated/baselines/root-sprawl-baseline.json` (818 pinned root files)
5. `generated/baselines/historical-move-blockers.json` (any subfolder excluded from Tier 1)
6. `generated/audits/wave-e-generated-folder-zoning-hardening-report.md`
7. `scripts/architecture/generate/generate-generated-zone-index.ts`
8. `scripts/architecture/checks/check-generated-zone-coverage.ts` (BLOCK validator)
9. `scripts/architecture/checks/check-generated-root-sprawl.ts` (BLOCK validator, ratchet)
10. `docs/architecture/GENERATED_FOLDER_ZONING_MODEL.md`

### Modify
- `docs/architecture/REPOSITORY_CONSTITUTION.md` — add **§B.3 Generated Folder Zoning Law** (Rules 48–49)
- `docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md` — cross-reference §B.3
- `src/lib/ci/validator-gate-map.ts` — register two new BLOCK validators
- `generated/manifests/generated-artifact-governance-map.json` — regenerate to reflect new paths for Tier-1 moved files
- `generated/INDEX.json` — regenerate via existing producer script
- `scripts/architecture/lib/public-mirror-policy.ts` — review and update `sourceDir` for any rule that pointed at a Tier-1 moved subfolder (re-grep first)
- `public/generated/artifact-index.json` and mirror — regenerate via `generate-public-artifact-mirror.ts`

### Constitutional Rules to add (Rule 48 + Rule 49)

**Rule 48 — Generated Folder Zoning Law (BLOCKING)**
> Every file under `generated/**` must be assigned to exactly one canonical zone (`manifests`, `audits`, `proof`, `readiness`, `lifecycle`, `historical`, `reports`) in `generated/lifecycle/generated-artifact-zone-index.json`. Zone assignment is mandatory and enforced by `check-generated-zone-coverage.ts`. Historical/closure/remediation/phase subfolders **must** physically reside under `generated/historical/`.

**Rule 49 — Generated Root-Sprawl Ratchet (BLOCKING)**
> The set of files at `generated/<file>` (top level) is sealed. Any **new** generated artifact created after Wave E must live under a zone subfolder. `check-generated-root-sprawl.ts` enforces a monotone-decreasing ratchet against `generated/baselines/root-sprawl-baseline.json`.

## Safety discipline (per the user's mandate)

| Requirement | How satisfied |
|---|---|
| **Verified canonical destination proof for every moved file** | Tier-1 destinations explicitly enumerated above; each is a 1:1 subfolder rename under `generated/historical/`. |
| **Reverse-dependency proof across src/tests/docs/generated/scripts/workflows** | `rg "<subfolder>/" scripts src docs .github supabase tests` for each Tier-1 subfolder before move; 0-hit gate. |
| **Stronger verification gates for old-path removal** | `check-generated-root-sprawl.ts` and `check-generated-zone-coverage.ts` added as BLOCK gates. |
| **Targeted smoke tests for multi-consumer moves** | `tsc --noEmit` + `check-public-artifact-mirror.ts` + `check-artifact-index-traceability.ts` re-run post-move. |
| **Explicit semantic verification for `EmptyState`** | N/A — no UI files touched. Asserted in audit report. |
| **Attestation resealing only via canonical generation script** | User runs `npx tsx scripts/architecture/wave-10-emit-attestation.ts` post-merge (not in this wave). |
| **Exactly one canonical owner path per moved concept** | Every Tier-1 subfolder has exactly one new home under `generated/historical/`; no aliases, no shims. |
| **Strict no-logic/no-UI/no-API-change rule** | Tier 1 only renames historical subfolders; Tier 2 generates additive index files; Tier 3 adds validators. Zero src/, zero edge functions, zero supabase migrations touched. |

## What this plan **does not** attempt (and why)

- **It does not move the 818 root-level files** into `manifests/`/`audits/`/etc. zones. Doing so would require rewiring 497 hardcoded references across 571+ scripts and is a Wave-F undertaking with its own consumer-migration plan and codemod tooling. Tier 2 virtual zoning gives the user the navigational benefit immediately; Tier 3 prevents the problem from growing.
- **It does not delete any artifact.** Per Rule 47, deletion requires reverse-dependency proof; this wave is move-only.
- **It does not change `MIRROR_RULES` semantics.** Only `sourceDir` strings are updated where necessary, and only after grep-zero verification.

## Verification gates before completion

1. `tsc --noEmit` → clean
2. `npx tsx scripts/architecture/checks/check-generated-zone-coverage.ts` → pass
3. `npx tsx scripts/architecture/checks/check-generated-root-sprawl.ts` → pass (sealed)
4. `npx tsx scripts/architecture/checks/check-public-artifact-mirror.ts` → pass (re-mirrored)
5. `npx tsx scripts/architecture/checks/check-generated-artifact-governance.ts` → pass (Wave-B regenerated map)
6. `rg` for every Tier-1 subfolder old path returns 0 hits in scripts/src/docs/.github/supabase/tests
7. Audit report `wave-e-generated-folder-zoning-hardening-report.md` produced
