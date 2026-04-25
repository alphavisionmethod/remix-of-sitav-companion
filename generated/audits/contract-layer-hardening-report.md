# Wave 1.2 — Contract Layer Hardening Report

**Date:** 2026-04-25
**Scope:** `src/contracts/`, `src/domains/`, `src/packages/`, `src/platform/<system>/contracts/`
**Outcome:** PASS — model installed, validators green, type-check green.

## 1. Old ambiguity summary

Pre-Wave-1.2 state (audited live):

- `src/contracts/` was a 2-file public re-export barrel with **zero direct consumers** repo-wide. Its `types/` and `constants/` subfolders were empty `export {}` placeholders. The constitution promised it housed "stable cross-layer types" but nothing in the codebase enforced this; nothing prevented future contributors from filling it with arbitrary local types.
- `src/domains/` had 18 subfolders, of which 12 were empty Wave-1 barrel placeholders. The 6 populated folders (`customer-journey/`, `engines/`, `simulation/`, `investment/`, `advisors/`, `types/`) were correctly placed but had no extended purity guard against `react`, `@/integrations/supabase`, `@/components/**`, `@/lib/services/**`, `@/pages/**` imports — only `pages` and `surfaces` were forbidden.
- `src/platform/contracts/` held exactly 2 files (`pillar-contract.ts`, `decision-queue.ts`) that were imported across **3 distinct top-level layers** (`modules/{business,concierge,finance,health}`, `platform/trust`, deprecated `_shared` shims). They were architecturally **app-wide public** but physically classified as platform-local.
- `decision-queue.ts` imported `PillarId` from `@/modules` — an upward `packages/platform → modules` direction violation that no validator caught.
- No validator existed to (a) lock `src/contracts/` as a pure re-export barrel, (b) detect cross-layer duplicate type identifiers, or (c) enforce platform-local-contract-scope.

## 2. New semantic ownership model

Four canonical layers, each with a single explicit purpose. The full table, Promotion Rule, Duplication Rule, Direction Rule, and decision tree are documented in `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md`.

| Layer | Physical home | Public import |
|---|---|---|
| Public barrel | `src/contracts/**` | `@/contracts` |
| Canonical packages | `src/packages/<family>-contracts/**` | `@/contracts` (cascaded) |
| Domain-native | `src/domains/<domain>/**`, `src/domains/types/**` | `@/domains/types` |
| Platform-local *(narrow, optional)* | `src/platform/<system>/contracts/**` | Internal to that system only |

The new constitutional rules (39–42) make this enforceable.

## 3. Classification results

- **`src/contracts/**`** — 4 files (`index.ts`, `packages.ts`, `types/index.ts`, `constants/index.ts`). All re-exports or empty placeholders. **Status: clean. No moves.**
- **`src/packages/**`** — 38 contract sub-packages, 314 consumers. Already canonical. **Status: clean. No moves.** Two new files (`pillar-contract.ts`, `decision-queue.ts`) added to `src/packages/contracts/` as canonical homes for the promoted contracts.
- **`src/domains/types/**`** — 19 domain-native type aggregate files. Correctly placed. **Status: clean. No moves.** Rule 41 purity guard added to prevent future drift.
- **`src/domains/{customer-journey,engines,simulation,investment,advisors}/**`** — Real domain code (FSMs, formulas, Monte Carlo, etc.). Correctly placed. **Status: clean.**
- **`src/domains/{business,concierge,finance,mission-control,boardroom,delivery,apps,setup,shared,ai-workforce,strategic-intelligence,ux-trust}/**`** — Empty `export {}` Wave-1 placeholders. Reserved for future use; no action this wave.
- **`src/platform/contracts/**`** — 2 files reclassified app-wide → promoted to `src/packages/contracts/`. The folder is now a deprecated-shim-only zone with a `MANIFEST.md` declaring it frozen.

## 4. Reclassification / moves / deduplication

### Moves (2 promotions)

| File | Old path (now @deprecated shim) | Canonical home |
|---|---|---|
| `pillar-contract.ts` | `src/platform/contracts/pillar-contract.ts` | `src/packages/contracts/pillar-contract.ts` |
| `decision-queue.ts` | `src/platform/contracts/decision-queue.ts` | `src/packages/contracts/decision-queue.ts` |

### Re-export shims retargeted

| Shim file | Now points to |
|---|---|
| `src/platform/contracts/pillar-contract.ts` | `@/packages/contracts/pillar-contract` |
| `src/platform/contracts/decision-queue.ts` | `@/packages/contracts/decision-queue` |
| `src/modules/_shared/pillar-contract.ts` | `@/packages/contracts/pillar-contract` |
| `src/modules/_shared/decision-queue.ts` | `@/packages/contracts/decision-queue` |

### Public barrel cascade

`src/packages/contracts/index.ts` now `export * from "./pillar-contract"` and `export * from "./decision-queue"`. Because `src/contracts/index.ts` already does `export * from "@/packages/contracts"`, every consumer can now import via `@/contracts`.

### Consumer rewires (5 files)

| File | From | To |
|---|---|---|
| `src/modules/business/index.ts` | `@/platform/contracts/pillar-contract` | `@/contracts` |
| `src/modules/concierge/index.ts` | `@/platform/contracts/pillar-contract` | `@/contracts` |
| `src/modules/finance/index.ts` | `@/platform/contracts/pillar-contract` | `@/contracts` |
| `src/modules/health/index.ts` | `@/platform/contracts/pillar-contract` | `@/contracts` |
| `src/platform/trust/pages/TrustDecisions.tsx` | `@/platform/contracts/decision-queue` | `@/contracts` |
| `src/modules/_shared/index.ts` | `@/platform/contracts/{pillar-contract,decision-queue}` | `@/contracts` |

### Layer-direction fix

`decision-queue.ts` previously imported `PillarId` from `@/modules` (a packages → modules upward import). The new canonical version inlines `PillarId` as the literal union `"business" | "concierge" | "finance" | "health"` — exactly mirroring `PillarManifest.id`. Layer direction restored. No semantic or runtime change.

### Deduplication

Cross-layer duplicate identifier count after the moves: **0** (validator output below). All four shim paths re-export from the canonical home; only one source declaration per identifier exists in the contract surface.

## 5. Constitution hardening

`docs/architecture/REPOSITORY_CONSTITUTION.md` — added section "Contract layer ownership (Wave 1.2 — STRICT, BLOCKING)" with **Rules 39–42**:

- **Rule 39** — Single canonical home for every contract identifier.
- **Rule 40** — `src/contracts/` is a pure public re-export barrel.
- **Rule 41** — Domain purity (extended) — `src/domains/**` MUST NOT import React, Supabase, services, components, or pages.
- **Rule 42** — Platform-local contracts are local — `src/platform/<X>/contracts/**` MUST NOT be cross-imported.

New model doc: `docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md`.

New folder manifest: `src/platform/contracts/MANIFEST.md` declaring the folder frozen as a deprecated shim zone.

## 6. Validation hardening

Three new BLOCKING validators created and registered in `src/lib/ci/validator-gate-map.ts`:

| Validator | Gate ID | Level | Output report |
|---|---|---|---|
| `check-public-contract-barrel-purity.ts` | `public-contract-barrel-purity` | BLOCK | `generated/public-contract-barrel-purity-report.json` |
| `check-platform-local-contract-scope.ts` | `platform-local-contract-scope` | BLOCK | `generated/platform-local-contract-scope-report.json` |
| `check-contract-duplicate-identifiers.ts` | `contract-duplicate-identifiers` | BLOCK | `generated/audits/duplicate-contract-family-report.json` + `generated/manifests/contract-ownership-map.json` + `generated/manifests/contract-duplicate-baseline.json` |

Existing `check-domain-purity.ts` extended with the **Rule 41** forbidden-import set (`react`, `react-dom`, `@/integrations/supabase`, `@/lib/services/**`, `@/components/**`, `@/pages/**`) scanned across all of `src/domains/**`.

Existing `check-contract-topology.ts` (BLOCK at budget 0) is unchanged — it continues to enforce that no named contract families leak outside `src/contracts/` + `src/packages/`.

## 7. Verification (live)

```
$ npx tsc --noEmit
(no output, exit 0)

$ npx tsx scripts/architecture/checks/check-public-contract-barrel-purity.ts
public-contract-barrel-purity: 0 violation(s) under src/contracts — OK

$ npx tsx scripts/architecture/checks/check-platform-local-contract-scope.ts
platform-local-contract-scope: 0 violation(s); 2 files inspected (2 deprecated shims exempted) — OK

$ npx tsx scripts/architecture/checks/check-contract-duplicate-identifiers.ts
contract-duplicate-identifiers: 0 cross-layer duplicate(s) (baseline 0) — OK

$ npx tsx scripts/architecture/checks/check-contract-topology.ts
contract-topology: 0 leaked named-family contracts (budget 0) — OK
```

Smoke check that `@/contracts` resolves every promoted identifier (`PillarCapability`, `PillarManifest`, `CapabilityMaturity`, `TrustTier`, `DECISION_QUEUE`, `getDecisionFor`, `DecisionEntry`, `SurfaceOwner`, `PillarId`): green.

No runtime, route, page-body, UI, persistence, RLS, edge-function, or API change.

## 8. Remaining future-facing work

- **Wave 9 shim removal:** When the deprecated-shim baseline reaches zero, the 4 re-export shims (`src/platform/contracts/{pillar,decision}*`, `src/modules/_shared/{pillar,decision}*`) are deleted in the same wave that removes the rest of the `_shared`/`_trust` shim cohort.
- **`src/contracts/types/` and `src/contracts/constants/` remain empty placeholders.** These are reserved for future curated public type promotions; the validator allows `export {}` so they stay valid until needed.
- **Wave 10 attestation re-seal:** The canonical attestation generator should be re-run so the digest covers the new files in `src/packages/contracts/` and the rewritten shims. The Wave 1.2 entry is added to the architectural-attestation log.
- **Empty domain placeholders** (12 folders in `src/domains/` that are pure `export {}`): no action this wave; the constitution does not require deleting reserved future-use folders.
- **`docs/architecture/CANONICAL_OWNERSHIP_MODEL.md`** still mentions `src/platform/contracts` in its example; the cross-reference now lives in `CONTRACT_LAYER_OWNERSHIP_MODEL.md` — either doc may be lightly updated in the next docs pass for consistency, but the constitution and the new model doc are authoritative.

---

**Sign-off:** Wave 1.2 contract layer hardening complete. Repository moves from "underspecified, latent ambiguity" to "machine-enforced single-canonical-home contract ownership" with zero behavior changes.