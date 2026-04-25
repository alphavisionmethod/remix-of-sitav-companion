
# Wave 1.2 — Contract Layer Ownership Hardening

## Audit findings (real, from this repo)

A semantic walk of `src/contracts/`, `src/domains/**`, `src/packages/**`, and `src/platform/**` shows the current state is **mostly clean but underspecified** — exactly the latent ambiguity you flagged. Concrete facts:

1. **`src/contracts/`** is a 2-line barrel (`export * from "@/packages/contracts"`) plus `packages.ts` with named family namespaces. Its `types/` and `constants/` subfolders are empty (`export {}`) Wave-1 placeholders. **Zero direct consumers** repo-wide (`rg "@/contracts"` → only the barrel files themselves). The constitution promises this is "Public contracts — stable cross-layer types", but the rule is not enforced and the path is unused.
2. **`src/domains/`** has 18 subfolders. Most pillar-named ones (`business/`, `concierge/`, `finance/`, `mission-control/`, `boardroom/`, `delivery/`, `apps/`, `setup/`, `shared/`, `ai-workforce/`, `strategic-intelligence/`, `ux-trust/`) are **empty Wave-1 barrel placeholders** (`export {}`). Real domain code lives in `customer-journey/`, `engines/`, `simulation/`, `investment/`, `advisors/`, `types/`. **210 files** consume `@/domains/*` — the populated ones are real and load-bearing.
3. **`src/domains/types/`** is a 19-file aggregated type bucket (admin-view-models, advisor-orchestration, digital-twin, dwe, entity-graph, mission-control, os-unified, policy-depth, replay-recovery, revenue-engine, token-governance, etc.). It is wrapped through `src/lib/types/index` (legacy `@lovable:migrated-wrapper`). These are **domain-native types**, correctly located; nothing to move, but the boundary needs a guard.
4. **`src/platform/contracts/`** has exactly 2 files (`pillar-contract.ts`, `decision-queue.ts`). They are imported by 8 consumers and `pillar-contract.ts` already has a deprecation shim at `src/modules/_shared/pillar-contract.ts` pointing here. **`pillar-contract.ts` is conceptually app-wide cross-layer** (consumed by launcher, nav, validator, blueprint generator, all 4 pillar barrels). It is *misclassified* as platform-local. `decision-queue.ts` is also cross-pillar (it references `PillarId` from `@/modules`) — same status.
5. **`src/packages/`** is the actual canonical contract home (38 sub-packages: `ai-contracts`, `business-contracts`, `finance-contracts`, `concierge-contracts`, `policy-contracts`, `proof-model`, `enterprise-contracts`, `boardroom-contracts`, `audit-contracts`, `telemetry`, `workflow-primitives`, `event-types`, `feature-flags`, `entitlements`, `window-contracts`, etc.). 314 consumers. This is correct and load-bearing.
6. **Existing validators** already cover: `check-contract-topology.ts` (named-family drift outside `src/contracts/` + `src/packages/`, BLOCK at 0), `check-contract-family-completeness.ts`, `check-contract-registry.ts`, `check-domain-purity.ts`, `check-misplaced-domain-logic.ts` (warn-level), `check-route-page-contract-layer-usage.ts`. **No validator currently asserts**: (a) `src/contracts/` stays a stable public barrel with zero implementation imports, (b) duplicate type names across `src/domains/types/`, `src/contracts/`, `src/platform/contracts/`, and `src/packages/`, or (c) `src/domains/**` purity against `react`, `@/integrations/supabase`, `@/lib/services/**`.

## Conclusion

The risk is **not 1000 misplaced files** — it's 2 truly cross-layer files in `src/platform/contracts/` and the absence of guards. A surgical, low-risk wave fixes it now, before further drift compounds.

---

## Target contract ownership model (constitutional)

| Layer | What it owns | What it forbids |
|---|---|---|
| `src/contracts/` | Curated public re-export barrel of cross-layer stable contracts. Implementation-free. May only `export ... from "@/packages/*"` or `from "@/platform/contracts/*"` after promotion. | Implementation code, React, Supabase, services, hooks, runtime singletons. |
| `src/packages/<family>-contracts/` | Canonical physical home for every contract family (ai, business, finance, concierge, policy, audit, enterprise, telemetry, workflow, etc.). Pure type & enum files. | Side effects, React imports, runtime DI, persistence. |
| `src/domains/**` | Domain-native models, entities, value objects, pure engines, FSMs, scoring, formulas. Domain-local types live alongside their engines. `src/domains/types/` is a domain-native type aggregate. | UI imports (`@/components`, `@/pages`), service imports (`@/lib/services`, `@/integrations/supabase`), React. |
| `src/platform/<system>/contracts/` *(optional, system-local only)* | Types whose vocabulary is internal to one platform system (e.g. one daemon's internal contract). | Cross-system / app-wide vocabulary. The moment a type is imported from outside its owning platform system, it must be promoted to `src/packages/<family>-contracts/` and re-exported via `src/contracts/`. |

**The Promotion Rule:** A type is *app-wide public* iff it is imported by ≥2 distinct top-level layers (e.g. `pages` + `modules`, or `platform/A` + `platform/B`). Such types **must** live in `src/packages/<family>-contracts/` and be re-exported through `src/contracts/`.

**The Duplication Rule:** No exported type identifier may exist in more than one of {`src/contracts/`, `src/domains/types/`, `src/packages/<family>-contracts/`, `src/platform/<system>/contracts/`}. The single canonical home is determined by the Promotion Rule above.

---

## Concrete moves (3 surgical relocations only)

### Move 1 — `src/platform/contracts/pillar-contract.ts` → `src/packages/contracts/pillar-contract.ts`
- **Why:** Imported by `src/modules/{business,concierge,finance,health}/index.ts`, `src/platform/trust/pages/TrustDecisions.tsx`, and the deprecation shim at `src/modules/_shared/pillar-contract.ts`. That's **3 distinct top-level layers** (`modules`, `platform`, deprecated-shim). It is the canonical cross-pillar shape — definitionally an app-wide public contract.
- **Action:**
  - Create `src/packages/contracts/pillar-contract.ts` with the full canonical body.
  - Replace `src/platform/contracts/pillar-contract.ts` with a 2-line `@deprecated Wave 1.2` re-export from the new canonical path.
  - Re-export from `src/contracts/index.ts` (which already cascades through `@/packages/contracts`).
  - Update the 9 consumer files to import from `@/contracts` (the public barrel) instead of `@/platform/contracts/pillar-contract` or `@/modules/_shared/pillar-contract`.
  - Keep both old shims (`src/platform/contracts/pillar-contract.ts` and `src/modules/_shared/pillar-contract.ts`) as deprecated re-exports for one wave.

### Move 2 — `src/platform/contracts/decision-queue.ts` → `src/packages/contracts/decision-queue.ts`
- **Why:** Same pattern. Imported by all 4 pillar barrels + `_shared/decision-queue.ts`. Cross-pillar by definition.
- **Action:** Mirror Move 1 (canonical body in `src/packages/contracts/`, deprecated re-export at old path, update consumers to `@/contracts`).
- **Note:** This file imports `PillarId` from `@/modules`. That's a `packages → modules` direction which violates the layer rule. We fix this by inlining `PillarId` (it's a simple union of 4 string literals) directly in `decision-queue.ts`, removing the `@/modules` dependency. `src/modules` can then re-export `PillarId` from `@/contracts` if needed.

### Move 3 — `src/platform/contracts/` becomes a deprecated shim folder (no new content)
- After Moves 1–2, `src/platform/contracts/` contains only the two `@deprecated Wave 1.2` re-export shims. Future contracts go to `src/packages/<family>-contracts/`. We add a `MANIFEST.md` in this folder documenting that no new files may be added here.

**No moves to `src/contracts/types/` or `src/contracts/constants/`.** These stay as empty placeholders so the constitution can later promote curated types into them without breaking the existing barrel.

**No moves out of `src/domains/types/`.** Its 19 files are domain-native types and are correctly located; only the import-purity guard is added.

---

## Constitution amendments (`docs/architecture/REPOSITORY_CONSTITUTION.md`)

Add **Rules 39–42** under a new section "**Contract layer ownership (Wave 1.2 — STRICT, BLOCKING)**":

- **Rule 39 — Single canonical home.** Every exported type/interface/enum identifier may exist in exactly one of `{src/contracts/**, src/packages/**, src/domains/types/**, src/platform/<system>/contracts/**}`. Validator: `check-contract-duplicate-identifiers.ts` (BLOCK).
- **Rule 40 — `src/contracts/` is a pure public barrel.** Files under `src/contracts/**` MAY only contain `export ... from "@/packages/*"` or `export ... from "@/platform/<system>/contracts/*"` re-exports. They MUST NOT contain interface/type/class/function bodies, React imports, Supabase imports, or `@/lib/services/**` imports. Validator: `check-public-contract-barrel-purity.ts` (BLOCK).
- **Rule 41 — Domain purity (extended).** Files under `src/domains/**` MUST NOT import from `react`, `react-dom`, `@/components/**`, `@/pages/**`, `@/integrations/supabase`, or `@/lib/services/**`. (Already partially asserted by `check-domain-purity.ts` against `pages` and `surfaces`; this rule extends and graduates it to BLOCK level.)
- **Rule 42 — Platform-local contracts are local.** `src/platform/<A>/contracts/**` MUST NOT be imported from `src/platform/<B>/**` (B ≠ A), `src/modules/**`, or `src/pages/**`. The moment such an import is needed, the contract must be promoted to `src/packages/<family>-contracts/` and re-exported via `src/contracts/`. Validator: `check-platform-local-contract-scope.ts` (BLOCK after Wave 1.2 baseline).

Document the **Promotion Rule** and **Duplication Rule** verbatim in a new doc: `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md`.

---

## New validators (3 blocking, all wired into `validator-gate-map.ts`)

1. **`scripts/architecture/checks/check-public-contract-barrel-purity.ts`** — walks `src/contracts/**`, fails on any non-re-export statement, any `import` from `react`/`@/integrations`/`@/lib/services`/`@/components`/`@/pages`/`@/hooks`/`@/contexts`. Baseline: 0.
2. **`scripts/architecture/checks/check-contract-duplicate-identifiers.ts`** — extracts every exported identifier across `src/contracts/**`, `src/packages/**`, `src/domains/types/**`, `src/platform/*/contracts/**`. Reports any name appearing in ≥2 of these scopes. Emits `generated/manifests/contract-ownership-map.json` (the manifest you specified) and `generated/audits/duplicate-contract-family-report.json`. Baseline: seal current count, decrease-only.
3. **`scripts/architecture/checks/check-platform-local-contract-scope.ts`** — for each `src/platform/<X>/contracts/**` file, scans the whole repo for cross-system importers; fails if any importer is outside `src/platform/<X>/**`. Baseline: after Wave 1.2 moves, the only platform-local contract files are the two deprecation shims, which are exempted by frontmatter `@deprecated`.

Wire all three into `src/lib/ci/validator-gate-map.ts` and `.github/workflows/foundation-gate.yml`. Register them in `scripts/manifests/generate/generate-foundation-manifest-index.ts`.

Also extend the existing **`check-domain-purity.ts`** with the additional forbidden imports from Rule 41 (`react`, `@/integrations/supabase`, `@/lib/services/**`, `@/components/**`).

---

## New / modified manifests

- **`generated/manifests/contract-ownership-map.json`** — every exported contract identifier with `{ name, kind, canonicalPath, layer: "public-barrel"|"package"|"domain-native"|"platform-local"|"deprecated-shim", consumerCount, consumerLayers[] }`.
- **`generated/audits/duplicate-contract-family-report.json`** — duplicates report from validator 2.
- **`generated/audits/contract-layer-hardening-report.md`** — final wave report (the deliverable you specified).
- Update `generated/manifests/foundation-manifest-index.json` and `foundation-tier-validator-set.json` to include the 3 new validators + the new manifest.

---

## Files I will create / modify

**Create:**
- `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md`
- `src/packages/contracts/pillar-contract.ts` (canonical body, moved from platform)
- `src/packages/contracts/decision-queue.ts` (canonical body, moved from platform, `PillarId` inlined)
- `src/platform/contracts/MANIFEST.md` (declares folder is deprecated-shim-only)
- `scripts/architecture/checks/check-public-contract-barrel-purity.ts`
- `scripts/architecture/checks/check-contract-duplicate-identifiers.ts`
- `scripts/architecture/checks/check-platform-local-contract-scope.ts`
- `scripts/manifests/generate/generate-contract-ownership-map.ts`
- `generated/manifests/contract-ownership-map.json` (initial seal)
- `generated/audits/duplicate-contract-family-report.json` (initial seal, 0 dupes after moves)
- `generated/audits/contract-layer-hardening-report.md`

**Modify (replace with deprecated re-export shims):**
- `src/platform/contracts/pillar-contract.ts` → 2-line `@deprecated Wave 1.2` shim → `@/packages/contracts/pillar-contract`
- `src/platform/contracts/decision-queue.ts` → 2-line `@deprecated Wave 1.2` shim → `@/packages/contracts/decision-queue`
- `src/modules/_shared/pillar-contract.ts` → already a shim; retarget to `@/packages/contracts/pillar-contract`
- `src/modules/_shared/decision-queue.ts` → if it exists as content file, replace with shim; if shim, retarget

**Modify (rewire imports to `@/contracts`):**
- `src/modules/business/index.ts`
- `src/modules/concierge/index.ts`
- `src/modules/finance/index.ts`
- `src/modules/health/index.ts`
- `src/modules/_shared/index.ts`
- `src/platform/trust/pages/TrustDecisions.tsx`
- (any other consumer found by `rg "@/platform/contracts/(pillar-contract|decision-queue)"` and `rg "@/modules/_shared/(pillar-contract|decision-queue)"`)

**Modify (constitution + gates):**
- `docs/architecture/REPOSITORY_CONSTITUTION.md` — add Rules 39–42 and link to new doc
- `scripts/architecture/checks/check-domain-purity.ts` — extend with Rule 41 forbidden imports
- `src/lib/ci/validator-gate-map.ts` — register 3 new blocking validators
- `.github/workflows/foundation-gate.yml` — wire 3 new validators
- `scripts/manifests/generate/generate-foundation-manifest-index.ts` — include new manifest + validators

---

## Safety posture

- **No physical moves** of any `src/domains/**` file. The 18 domain folders, 19 type files, and ~217 consumers stay exactly where they are.
- **No physical moves** of any `src/packages/**` file. All 38 contract sub-packages stay exactly where they are.
- **Exactly 2 small file moves** (`pillar-contract.ts`, `decision-queue.ts` from `src/platform/contracts/` → `src/packages/contracts/`). Both are ≤120 lines, pure type modules, with deprecated shims left at the old paths so any missed consumer still resolves.
- **One trivial inlining** of the `PillarId` literal union in `decision-queue.ts` to remove the `packages → modules` upward import (currently a layer-rule violation that nobody noticed).
- **No logic, UI, route, or API changes.** No runtime behavior changes.
- **Zero `as any`** introduced.
- **Wave 10 attestation re-seal** required: digest covers `src/platform/contracts`, `src/packages/contracts`, `src/modules/*/index.ts` — recomputed by the canonical generator script, recorded in `wave-10-architectural-attestation.json` with an explicit "Wave 1.2 contract relocation" entry.

## Verification I will run before declaring done

- `npx tsc --noEmit` → 0 errors.
- `npx tsx scripts/manifests/generate/generate-contract-ownership-map.ts` → emits manifest.
- `npx tsx scripts/architecture/checks/check-public-contract-barrel-purity.ts` → exits 0.
- `npx tsx scripts/architecture/checks/check-contract-duplicate-identifiers.ts` → exits 0 (0 dupes).
- `npx tsx scripts/architecture/checks/check-platform-local-contract-scope.ts` → exits 0.
- `npx tsx scripts/architecture/checks/check-contract-topology.ts` → still exits 0 (existing BLOCK gate at 0).
- `npx tsx scripts/architecture/checks/check-domain-purity.ts` (extended) → exits 0.
- `rg "from ['\"]@/platform/contracts/(pillar-contract|decision-queue)['\"]"` → returns only the deprecation shims themselves.
- `rg "from ['\"]@/modules/_shared/(pillar-contract|decision-queue)['\"]"` → returns only the deprecation shims themselves.
- Spot-check that `src/modules/business/index.ts` (and the other 3 pillar barrels) now imports `PillarManifest` etc. from `@/contracts`.
- Spot-check that `src/contracts/index.ts` re-exports `PillarManifest`, `PillarCapability`, `DECISION_QUEUE`, `DecisionEntry`, `SurfaceOwner` through the `@/packages/contracts` barrel cascade.

## What this wave deliberately does NOT do

- Does NOT move any `src/domains/**` file (already correctly placed).
- Does NOT move any `src/packages/**` file (already canonical).
- Does NOT promote `src/contracts/types/` or `src/contracts/constants/` placeholders out of empty state — those stay reserved for future curated public types.
- Does NOT touch `src/lib/types/**` (the 19 domain-native files reachable through `src/domains/types/index.ts` via the legacy wrapper).
- Does NOT change pillar boundaries, route registries, or any runtime behavior.
- Does NOT introduce a second contract taxonomy. `src/packages/<family>-contracts/` remains the only physical contract home; `src/contracts/` is purely the public re-export face.

The result is a fully-defined, machine-enforced contract ownership model with the only two architecturally-misclassified contract files relocated to their canonical home, two new BLOCK-level validators preventing future drift, the constitution amended with Rules 39–42, and a sealed ownership map ready to ratchet.
