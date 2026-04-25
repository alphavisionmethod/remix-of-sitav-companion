# Wave 1.1 — Shared Component Relocation Wave (Drain the 12 Violators)

## Objective

Physically relocate the **12 baselined shared-component violators** (sealed in `generated/manifests/shared-component-semantic-violation-baseline.json` at Wave 0.9) to their canonical owners. After this wave, the shared-component violation baseline drops from **12 → 0**, the ratchet re-seals at zero, and the Wave 10 architectural attestation digest is re-computed and re-sealed.

This is a **physical relocation wave**, not a baseline-sealing wave. Every move is wired end-to-end: imports, exports, barrels, tests, manifests, validators, attestation seal.

---

## Safety posture (non-negotiable)

1. **Drain, don't rewrite.** Each violator moves to its canonical owner with byte-identical behavior. No logic changes.
2. **Compatibility re-export shims** at the old paths for one wave, marked `@deprecated Wave 1.1` so any straggling import keeps working without churn. The deprecated-shim baseline is updated to track them.
3. **All consumers rewired in the same wave** — the shims exist as belt-and-suspenders, not as the migration path. After this wave, `rg "from '@/components/(launcher|primitives/actions/EvidenceLink|primitives/actions/OperatorActionPanel|primitives/status/ConnectorStateBadge|primitives/feedback/Needs|primitives/feedback/EmptyState|cards|shared/ai|shared/sita|shared/status)"` returns **zero results in non-test code**.
4. **No route, profile, lazy-load chain, or shell mount changes.** Pure import-path shuffling.
5. **Wave 10 attestation re-seal.** The digest covers `src/components`, `src/modules`, `src/platform`, `src/pages`, `src/admin`, `src/runtimes`, `src/routes` — all touched. We will explicitly recompute and update `generated/attestations/wave-10-architectural-attestation.json` with a Wave 1.1 entry recording the relocation.
6. **Ratchet flips, doesn't loosen.** `shared-component-semantic-violation-baseline.json` `baselineCount` goes **12 → 0**. The validator continues to enforce monotone-decreasing (i.e., zero forever).
7. **TypeScript must compile clean** (`npx tsc --noEmit`) before the wave is declared done.
8. **Foundation gate must pass green** locally before commit.

---

## The 12 violators and their canonical destinations

| # | Source path (current) | Canonical destination | Classification | Consumers to rewire |
|---|---|---|---|---|
| 1 | `src/components/cards/index.ts` | `src/platform/sita/components/cards/index.ts` | barrel-only-reexport | 0 direct (re-exports only) |
| 2 | `src/components/launcher/PillarRail.tsx` | `src/platform/sita/components/sita/shell/PillarRail.tsx` | shell-runtime-semantic | 1 (`AppLauncherPanel.tsx`) |
| 3 | `src/components/primitives/actions/EvidenceLink.tsx` | `src/platform/trust/components/EvidenceLink.tsx` | platform-semantic (proof/receipt) | 6 admin pages + tests |
| 4 | `src/components/primitives/actions/OperatorActionPanel.tsx` | `src/admin/components/operator/OperatorActionPanel.tsx` | admin-semantic | 7 admin ai-runtime boards |
| 5 | `src/components/primitives/feedback/EmptyState.tsx` | (delete; canonical already at `@/platform/sita/components/sita/EmptyState`) | barrel-only-reexport shim | 1 (`ConciergeBoardroom`) |
| 6 | `src/components/primitives/feedback/NeedsDataExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsDataExplainer.tsx` | wrapper-with-platform-import | 0 direct (verify) |
| 7 | `src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer.tsx` | wrapper-with-platform-import | 0 direct (verify) |
| 8 | `src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsTimeWindowExplainer.tsx` | wrapper-with-platform-import | 0 direct (verify) |
| 9 | `src/components/primitives/status/ConnectorStateBadge.tsx` | `src/platform/cloud/components/ConnectorStateBadge.tsx` | platform-semantic (connector) | 5 admin pages/components |
| 10 | `src/components/shared/ai/index.ts` | `src/platform/ai/components/index.ts` | barrel-only-reexport | 0 direct (re-exports only) |
| 11 | `src/components/shared/sita/index.ts` | `src/platform/sita/components/index.ts` (merge) | barrel-only-reexport | 0 direct (re-exports only) |
| 12 | `src/components/shared/status/index.ts` | `src/platform/cloud/components/index.ts` | barrel-only-reexport | 0 direct (re-exports only) |

**Total consumer files to rewire: ~20** (all already enumerated in the audit above).

---

## Execution sequence (atomic, per-violator)

For each of the 12 violators, the same six-step ritual:

1. **Create canonical destination file** with the full body copied verbatim from the source (no edits other than fixing internal `@/` paths if any move alongside).
2. **Update every consumer** identified in the audit to import from the new canonical path (absolute `@/...` only).
3. **Replace the old source file** with a thin `@deprecated Wave 1.1` re-export shim that re-exports from the new canonical path. (Same shape as the existing `EmptyState.tsx` shim.)
4. **Update `generated/manifests/deprecated-shim-baseline.json`** to register the new shims and bump the count.
5. **Run `npx tsc --noEmit`** — must be zero errors before moving to the next violator.
6. **Re-run the shared-component classifier** (`scripts/manifests/generate/generate-shared-component-ownership-map.ts`) and confirm the violator's classification changes from `*-semantic` / `barrel-only-reexport` to `deprecated-shim` (counted separately, not as a violation).

Order of execution (lowest-risk → highest-risk):
- **Pure-barrel re-exports first** (#1, #10, #11, #12): zero behavioral risk.
- **Wrapper components next** (#5, #6, #7, #8): single-file moves with 0–1 consumer.
- **Single-consumer semantic moves** (#2): only `AppLauncherPanel.tsx` to rewire.
- **Multi-consumer semantic moves last** (#3, #4, #9): 5–7 consumers each, batched and verified together.

---

## After all 12 are moved — finalization

1. **Re-seal the shared-component baseline** to zero:
   - `generated/manifests/shared-component-semantic-violation-baseline.json`:
     - `baselineCount: 0`
     - `baselineDigest:` recomputed (digest of empty violators array)
     - `wave: "1.1"`
     - `sealedAt:` new timestamp
     - `violators: []`
     - `drainPlan: "Drained by Wave 1.1. Ratchet now enforces zero shared-semantic violations."`
2. **Update the validator** `scripts/architecture/check-shared-component-concept-rule.ts` to read the new zero baseline and continue enforcing monotone-decreasing (which now means: **stay at zero**).
3. **Recompute Wave 10 architectural attestation** at `generated/attestations/wave-10-architectural-attestation.json` (the file the constitution's Rule 19 requires). Add a Wave 1.1 entry documenting:
   - the 12 files relocated
   - the new canonical paths
   - the shims added at the old paths
   - the new digest over `src/components`, `src/modules`, `src/platform`, `src/pages`, `src/admin`, `src/runtimes`, `src/routes`
4. **Update Wave 0.9 hardening report** (`generated/audits/shared-component-ownership-hardening-report.md`) with a "Wave 1.1 Drained" addendum showing the 12 → 0 transition and links to the new canonical files.
5. **Generate Wave 1.1 hardening report** at `generated/audits/shared-component-relocation-wave-report.md` with the full move table, consumer rewiring list, before/after baselines, attestation digests, and verification proof.

---

## Files that will be created

- `src/platform/sita/components/cards/index.ts` (canonical home for cards barrel)
- `src/platform/sita/components/sita/shell/PillarRail.tsx`
- `src/platform/trust/components/EvidenceLink.tsx`
- `src/admin/components/operator/OperatorActionPanel.tsx`
- `src/platform/sita/components/sita/explainers/NeedsDataExplainer.tsx`
- `src/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer.tsx`
- `src/platform/sita/components/sita/explainers/NeedsTimeWindowExplainer.tsx`
- `src/platform/sita/components/sita/explainers/index.ts` (barrel)
- `src/platform/cloud/components/ConnectorStateBadge.tsx`
- `src/platform/cloud/components/index.ts` (canonical status barrel; merge from shared/status)
- `src/platform/ai/components/index.ts` (canonical ai barrel; merge from shared/ai)
- (Augment existing `src/platform/sita/components/index.ts` with shared/sita re-exports)
- `generated/audits/shared-component-relocation-wave-report.md`

## Files that will be modified

- 12 source files at old paths → become 2-line `@deprecated Wave 1.1` re-export shims
- ~20 consumer files → import paths updated to canonical owners
- `generated/manifests/shared-component-semantic-violation-baseline.json` → 12 → 0
- `generated/manifests/deprecated-shim-baseline.json` → +12 new shims
- `generated/attestations/wave-10-architectural-attestation.json` → recomputed digest + Wave 1.1 entry
- `generated/audits/shared-component-ownership-hardening-report.md` → addendum
- `scripts/architecture/check-shared-component-concept-rule.ts` → reads zero baseline
- `src/__tests__/components/primitives-coverage.test.tsx` → updated import paths

## Files explicitly NOT touched

- No route files, no profile gates, no lazy-load chains, no shell mounts
- No `src/modules/<pillar>/**` files except the single `ConciergeBoardroom.tsx` import line
- No platform page bodies, no admin page bodies (only their import lines change)
- No edge functions, no DB migrations, no constitution rules (Rules 36–38 already cover this)

---

## Verification gate (must all pass before declaring done)

1. `npx tsc --noEmit` → zero errors.
2. `rg "from ['\"]@/components/launcher" src/ --type ts --type tsx | grep -v "src/components/launcher"` → zero matches.
3. `rg "from ['\"]@/components/primitives/actions/(EvidenceLink|OperatorActionPanel)" src/ --type ts --type tsx | grep -v "src/components/primitives"` → zero matches.
4. `rg "from ['\"]@/components/primitives/status/ConnectorStateBadge" src/ --type ts --type tsx | grep -v "src/components/primitives"` → zero matches.
5. `rg "from ['\"]@/components/primitives/feedback/Needs" src/ --type ts --type tsx | grep -v "src/components/primitives"` → zero matches.
6. `rg "from ['\"]@/components/(cards|shared/ai|shared/sita|shared/status)" src/ --type ts --type tsx | grep -v "src/components/"` → zero matches.
7. `npx tsx scripts/manifests/generate/generate-shared-component-ownership-map.ts` → emits new map with `violators: []`.
8. `npx tsx scripts/architecture/check-shared-component-concept-rule.ts` → exit 0 against new zero baseline.
9. `npx tsx scripts/architecture/check-deprecated-shim-ratchet.ts` → exit 0 with new shim count.
10. Vitest spot-check: `bunx vitest run src/__tests__/components/primitives-coverage.test.tsx` → green.
11. Wave 10 attestation digest recomputed and committed; the file's `lastResealedAt` updated to Wave 1.1.

---

## Rollback plan

If `tsc --noEmit` fails or any consumer breaks:
- The shims at the old paths preserve the old import contracts, so reverting the consumer-side import edit alone restores function.
- The classifier is idempotent; re-running it produces the current state, not a corrupted state.
- Each of the 12 moves is independently revertable (git-level; conceptually they form 12 atomic units).

---

## What this wave deliberately does NOT do

- Does NOT physically move the 207 platform page bodies (still deferred to Platform→Admin Relocation Wave).
- Does NOT move any of the 47 operator-surfaces baselined in Wave 0.8.
- Does NOT execute the proposed Wave 1.0 hook/context relocation (still in plan-approved-but-unexecuted state).
- Does NOT change any constitution rule text — Rules 36–38 from Wave 0.9 already cover the shared-component law; this wave just empties the baseline they protect.

---

## Outcome

After Wave 1.1:
- `src/components/**` contains **only** truly cross-cutting reusable primitives that pass all three concept-rule tests (vocabulary, dependency, portability).
- The 12 deprecated re-export shims will be removed in **Wave 1.2 — Shared Component Shim Cleanup**, gated by a one-week shim-grace ratchet to catch any straggler imports.
- The shared-component violation ratchet is at **zero forever**, enforced by the existing Rule 37 validator.
- The Wave 10 architectural attestation is re-sealed and the constitution remains intact and machine-enforced.
