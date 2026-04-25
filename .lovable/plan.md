# Wave 0.9 — Concept-Based Shared Component Hardening

## Audit findings (real repository, not assumptions)

### Current `src/components/**` topology — 83 files only
Post-Wave 7/8 the heavy lift already happened: 1,144 components were relocated into `src/modules/<pillar>/components/` (248) and `src/platform/<system>/components/` (896). What remains under `src/components/`:

| Subtree | Files | Status |
|---|---:|---|
| `ui/` | 49 | shadcn primitives (UI_LIB, exempt) |
| `primitives/` | 24 | mixed: 17 truly generic, 5 semantic-leaking, 2 already-deprecated re-export shims |
| `shared/` | 4 | 1 authored (`FileUploadZone.tsx`), 3 are platform-sita / platform-ai / platform-cloud barrels |
| `cards/` | 1 | barrel re-exporting 10 platform-sita-branded cards |
| `navigation/` | 1 | barrel for `NavLink` |
| `launcher/` | 1 | `PillarRail.tsx` — shell concern with pillar IDs hard-coded |
| `__tests__/` | 2 | Vitest harnesses (test-only) |
| Loose root | 1 | `NavLink.tsx` (allowlisted) |

### The loophole the prompt asks us to close
- Constitution Rule 13 says `src/components/**` is for "shared UI used by ≥2 pillars."
- Rules 17–18 enforce a **structural allowlist** of subtrees, not the **semantic shared-ness** of files inside those subtrees.
- Result: a barrel like `src/components/cards/index.ts` is allowed to re-export 10 platform-sita-branded cards (`AdvisorCard`, `ProofCard`, `QueueCard`…) without anyone proving they are conceptually shared rather than just centrally reachable.
- Result: `src/components/launcher/PillarRail.tsx` imports `TRUST_LAYER` from `@/platform/trust` and hard-codes the four pillar IDs — it is shell-runtime semantic, not a generic primitive.
- Result: three `Needs*Explainer.tsx` files in `primitives/feedback/` carry admin-board ("no signals fired in window") semantics.

### Concrete semantic violations found (10 platform imports from `src/components/`)
```
src/components/launcher/PillarRail.tsx                          → @/platform/trust (TRUST_LAYER)
src/components/cards/index.ts                                   → @/platform/sita/...   (×10 cards)
src/components/shared/sita/index.ts                             → @/platform/sita/...   (×16 surfaces)
src/components/shared/ai/index.ts                               → @/platform/ai/...     (×3)
src/components/shared/status/index.ts                           → @/platform/cloud/...  (×1)
src/components/primitives/status/TrustBadge.tsx                 → @/platform/sita/...   (deprecated shim, self-marked)
src/components/primitives/feedback/EmptyState.tsx               → @/platform/sita/...   (deprecated shim, self-marked)
src/components/primitives/feedback/NeedsDataExplainer.tsx       → @/platform/sita/...
src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx → @/platform/sita/...
src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx → @/platform/sita/...
```

### Pre-existing assets we will reuse (do **not** rebuild)
- `docs/architecture/COMPONENT_CONSTITUTION.md` (PRIMITIVE / DOMAIN / SURFACE 3-class)
- `docs/architecture/COMPONENT_NAMING_POLICY.md`
- `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md`
- `scripts/architecture/check-components-allowlist.ts` (Wave 8 STRICT validator)
- `scripts/architecture/checks/check-component-classification.ts`
- `scripts/architecture/checks/check-primitive-purity.ts`
- `scripts/architecture/checks/check-shared-component-profile-pollution.ts` (admin-leakage)
- `scripts/architecture/audit-components.ts` (registry generator)
- `scripts/architecture/wave-7-component-reclassification.ts`
- The Wave 10 architectural attestation seal

We will **augment** these — not duplicate them.

---

## Wave 0.9 — Concept-Based Shared Component Hardening

Following the Wave 0.5–0.8 pattern: **install the enforcement substrate first, defer physical relocation** to a future wave so the Wave 10 attestation seal stays intact.

### Part 1 — Concept-based ownership model (NEW DOC)

Create `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md` defining the **3-test concept rule** that supersedes "used by ≥2 pillars":

A file is allowed under `src/components/**` only if it passes ALL three tests:

1. **Vocabulary test** — Component name + props use no pillar word (`business`, `concierge`, `finance`, `health`, `money`, `revenue`), no platform-subsystem word (`sita`, `advisor`, `boardroom`, `proof`, `receipt`, `governance`, `trust`, `observability`, `release`, `verification`, `admin`, `operator`, `cloud`, `oauth`, `connector`), and no operator-only phrase (`"signals fired"`, `"release window"`, `"approval queue"`).
2. **Dependency test** — File MUST NOT import from `@/modules/**`, `@/platform/**`, `@/admin/**`, or `@/pages/**` (the existing Rule 5 + Wave-8 spirit). The single forgivable case: a thin barrel that *only* re-exports from `@/platform/<system>/components/**` MUST instead live as a *barrel* under the owning system itself (e.g. `@/platform/sita/components/sita/cards/index.ts`) and consumers import from there.
3. **Portability test** — Component renders correctly given only props + shadcn `ui/` primitives + `cn()` utility. No `usePillarPriority`, no `TRUST_LAYER`, no SITA-specific design tokens beyond what's in `tailwind.config.ts`.

The doc explicitly enumerates the **target home for each violator class**:
- Pillar-semantic → `src/modules/<pillar>/components/<sub>/`
- Platform-subsystem-semantic → `src/platform/<system>/components/<sub>/`
- Admin/operator-semantic → `src/admin/modules/<domain>/components/`
- Shell-runtime / launcher / OS-chrome → `src/shell-runtime/` or `src/platform/sita/components/sita/shell/` (existing canonical home)

### Part 2 — Constitution amendments (Rules 36–38)

Append to `docs/architecture/REPOSITORY_CONSTITUTION.md`:

**Rule 36 — Concept-based shared component rule.** Files under `src/components/**` (excluding `ui/` shadcn library and `__tests__/`) MUST pass the 3-test concept rule (vocabulary, dependency, portability) defined in `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md`. Usage count is no longer the deciding criterion. Validator: `scripts/architecture/check-shared-component-concept-rule.ts` (foundation-tier, BLOCKING).

**Rule 37 — Shared-semantic violation ratchet.** Pre-existing files that fail the concept rule (the 10-import baseline plus the 3 Needs*Explainer files plus PillarRail; total ≈ N at Wave 0.9 seal) are baselined in `generated/manifests/shared-component-semantic-violation-baseline.json`. The count is monotone-decreasing — net-new violations BLOCK CI. Drained by the future Shared Component Relocation Wave (gated by Rules 19, 24).

**Rule 38 — Shared-component import direction.** `src/components/**` MUST NOT import from `@/modules/**`, `@/platform/**`, `@/admin/**`, or `@/pages/**`. The single permitted exception is a **type-only re-export** of a primitive type alias from `@/platform/sita/components/sita/<X>` *iff* the wrapper file is in the existing `compatibility-shim` ledger. All other current platform imports are baselined and decrease-only. Enforcer: same validator as Rule 36 (combined report).

### Part 3 — Classification engine (NEW SCRIPT)

`scripts/manifests/generate/generate-shared-component-ownership-map.ts`:
- Walks `src/components/**` (excluding `ui/`, `__tests__/`).
- For each file: parses imports, scans identifiers + JSX text for pillar/platform/admin vocabulary, classifies into one of:
  - `shared-clean` ✅
  - `pillar-semantic` (target: `@/modules/<pillar>/components/`)
  - `platform-semantic` (target: `@/platform/<system>/components/`)
  - `admin-semantic` (target: `@/admin/modules/<domain>/components/`)
  - `shell-runtime-semantic` (target: `@/shell-runtime/` or `@/platform/sita/components/sita/shell/`)
  - `barrel-only-reexport` (separate sub-classification — flagged for relocation)
  - `deprecated-shim` (already self-marked; tracked separately)
  - `wrapper-with-platform-import` (new bucket for the Needs*Explainer trio)
- Emits `generated/manifests/shared-component-ownership-map.json` with `{ file, classification, targetOwner, vocabularyHits[], importViolations[], relocationStatus }`.

### Part 4 — Blocking validator (NEW SCRIPT)

`scripts/architecture/check-shared-component-concept-rule.ts`:
- Loads `generated/manifests/shared-component-ownership-map.json`.
- Loads `generated/manifests/shared-component-semantic-violation-baseline.json` (sealed in this wave).
- BLOCKS when: live violation count > baseline count (monotone ratchet).
- BLOCKS when: any net-new file under `src/components/**` is classified as anything other than `shared-clean`.
- BLOCKS when: any baselined violator changes its `targetOwner` without an ADR.
- Emits `generated/shared-component-concept-rule-report.json` for advisory ingestion.

### Part 5 — Foundation tier wiring

1. Register the new validator in `src/lib/ci/validator-gate-map.ts` with classification `block`, consumer `release-readiness`, with rationale citing Rule 36.
2. Re-run `scripts/manifests/generate/generate-foundation-manifest-index.ts` (covered by Rule 25/26) so the new manifest is indexed and the foundation-tier validator set picks up the new entry.
3. Re-emit `generated/validator-gate-map.json`.
4. Add the validator step to `.github/workflows/foundation-gate.yml` immediately after `check-page-semantic-adapter`.

### Part 6 — Seal the baseline

Run the classifier once and freeze the result into `generated/manifests/shared-component-semantic-violation-baseline.json` with `sealedAt: 2026-04-25` and an explicit per-file inventory. Expected baseline size: ~14 files (10 platform-importing + 3 Needs*Explainer + PillarRail; the two self-marked deprecated shims are tracked in their own bucket so `audit-components.ts` continues to count them in `DEPRECATED_WRAPPER`).

### Part 7 — Targeted physical fixes (low-risk, Wave-10-safe)

These are the *only* file moves we perform in this wave. Each is a thin shim swap (1 file added, 1 file edited) that doesn't change the surface digest set monitored by Wave 10:

- **None.** All physical moves are deferred to the future Shared Component Relocation Wave per the same discipline used in Waves 0.5/0.6/0.7/0.8. The current wave installs the enforcement substrate only.

If the user prefers a more aggressive move within this wave, we can additionally:
- Move `src/components/cards/index.ts` → leave it as a tracked **deprecated barrel** with a directive `// @relocation-target: @/platform/sita/components/sita/cards/index.ts`, and create the new canonical barrel under platform.
- Move `src/components/shared/{sita,ai,status}/index.ts` → ditto.

But this would mean updating every consumer's import path (potentially hundreds), and would change the Wave 10 attestation digest, requiring a re-seal ADR. **Default plan keeps these as baselined-but-frozen barrels** to be drained in the relocation wave.

### Part 8 — Documentation & audit trail

- `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md` — the concept rule (NEW).
- `generated/audits/shared-component-ownership-hardening-report.md` — Wave 0.9 outcome (NEW).
- `generated/audits/repository-canonicalization-baseline.json` — add `{ sharedComponentConceptRuleInstalled: true, sharedComponentSemanticBaselineCount: <N> }`.
- `docs/architecture/REPOSITORY_CONSTITUTION.md` — append Rules 36–38.

### Part 9 — Update prior assets (cross-link, no duplication)

- Patch `docs/architecture/COMPONENT_CONSTITUTION.md` with a new "**Cross-reference: Concept-Based Shared Component Rule**" section pointing at the new model doc — no rule changes inside it.
- Patch the existing `check-components-allowlist.ts` header comment to cross-reference Rule 36 (so future contributors find both layers of enforcement).
- Patch the existing `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md` table to add a "Concept-rule status" column where each row's status comes from the new manifest.

---

## Verification (executed at the end of the wave)

1. `npx tsx scripts/manifests/generate/generate-shared-component-ownership-map.ts` produces a clean JSON with expected ~14 violators.
2. `npx tsx scripts/architecture/check-shared-component-concept-rule.ts` exits 0 against the sealed baseline.
3. `npx tsx scripts/architecture/check-components-allowlist.ts --strict` continues to exit 0 (no regression on Wave 8).
4. `npx tsx scripts/architecture/wave-10-check-attestation.ts` exits 0 (no surface digest changes — physical moves deferred).
5. `npx tsx scripts/manifests/generate/generate-foundation-manifest-index.ts` lists the new manifest.
6. `npx tsx scripts/manifests/generate/generate-validator-gate-map.ts` registers the new validator with classification `block`.
7. `tsc --noEmit` exits 0 (no source code touched, only docs + scripts + manifests).

---

## What this wave intentionally does NOT do (and why)

- **No bulk file moves.** Same discipline as Waves 0.5/0.6/0.7/0.8 — preserve Wave 10 attestation seal; physical relocation is a separate, ADR-gated wave.
- **No deletion of existing barrels** in `src/components/cards`, `shared/sita`, `shared/ai`, `shared/status`. They are baselined for monotone-decrease and stay structurally where consumers expect them.
- **No change to Component Constitution's PRIMITIVE/DOMAIN/SURFACE 3-class** model. The new concept rule is **orthogonal** — it answers "may this file live in `src/components/**`?", not "what class is this component?".
- **No new validator framework.** Built on top of `validator-gate-map.ts`, foundation manifest index, monotone ratchet, and the existing audit-components registry — exactly the Wave-0 pattern.

---

## Files this wave will create

```
docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md                                     [NEW]
generated/audits/shared-component-ownership-hardening-report.md                           [NEW]
generated/manifests/shared-component-ownership-map.json                                   [NEW — generated]
generated/manifests/shared-component-semantic-violation-baseline.json                     [NEW — sealed]
scripts/architecture/check-shared-component-concept-rule.ts                               [NEW — blocking validator]
scripts/architecture/checks/check-shared-component-concept-rule.ts                        [NEW — checks/ alias]
scripts/manifests/generate/generate-shared-component-ownership-map.ts                     [NEW — classifier]
```

## Files this wave will edit

```
docs/architecture/REPOSITORY_CONSTITUTION.md             (+Rules 36–38)
docs/architecture/COMPONENT_CONSTITUTION.md              (+cross-reference section, no rule change)
docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md         (+concept-rule status column)
.github/workflows/foundation-gate.yml                    (+1 step)
.lovable/plan.md                                         (Wave 0.9 entry)
scripts/architecture/check-components-allowlist.ts       (header cross-reference comment only)
scripts/manifests/generate/generate-foundation-manifest-index.ts  (register new manifest)
src/lib/ci/validator-gate-map.ts                         (+1 override entry)
generated/manifests/foundation-manifest-index.json       (regenerated)
generated/manifests/foundation-tier-validator-set.json   (regenerated)
generated/manifests/deprecated-shim-baseline.json        (refreshed timestamp)
generated/validator-gate-map.json                        (regenerated)
generated/audits/repository-canonicalization-baseline.json  (+sharedComponentConceptRuleInstalled flag)
```

**Total:** 7 new files, 13 edits. Zero source code touched. Wave 10 attestation seal preserved.

## Result

After Wave 0.9, the repository enforces **concept-based ownership** of `src/components/**`:
- Net-new files under `src/components/**` MUST pass the 3-test concept rule or CI blocks.
- The 14 grandfathered violators are sealed and may only decrease.
- "Used by ≥2 pillars" is removed as the deciding criterion.
- The semantic boundary between shared-clean / pillar-semantic / platform-semantic / admin-semantic / shell-runtime-semantic is encoded in code, validators, and CI.
- All prior validators (Wave 7/8 allowlist, profile pollution, primitive purity, classification) remain green and continue to enforce their existing layers.