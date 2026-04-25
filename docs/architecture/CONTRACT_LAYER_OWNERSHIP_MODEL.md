# SITA OS — Contract Layer Ownership Model

> **Status:** Adopted (Wave 1.2 — Contract Layer Hardening).
> **Authority:** This document, together with Rules 39–42 of `REPOSITORY_CONSTITUTION.md`, defines where every contract / type / interface / enum identifier may physically live in this repository. Validators in `scripts/architecture/checks/check-public-contract-barrel-purity.ts`, `check-contract-duplicate-identifiers.ts`, and `check-platform-local-contract-scope.ts` enforce this model in CI at BLOCK level.

## The four contract layers

| Layer | Physical home | Owns | Forbids |
|---|---|---|---|
| **Public barrel** | `src/contracts/**` | Curated public re-exports of cross-layer stable contracts. **Implementation-free.** Files MAY only contain `export ... from "@/packages/*"` or (after explicit promotion) `from "@/platform/<system>/contracts/*"`. | Interface/type/class/function bodies, React imports, Supabase imports, `@/lib/services/**` imports, `@/components/**`, `@/pages/**`, `@/hooks/**`, `@/contexts/**`. |
| **Canonical packages** | `src/packages/<family>-contracts/**` (and `src/packages/contracts/**`) | The single physical home for every contract family (`ai-contracts`, `business-contracts`, `finance-contracts`, `concierge-contracts`, `policy-contracts`, `audit-contracts`, `enterprise-contracts`, `boardroom-contracts`, `telemetry`, `workflow-primitives`, `event-types`, `feature-flags`, `entitlements`, `window-contracts`, etc.). Pure type & enum & const files. | Side effects, React imports, runtime DI, persistence, `@/integrations/supabase`, upward imports into `@/modules/**` or `@/pages/**`. |
| **Domain-native** | `src/domains/**` (engines + types) and `src/domains/types/**` (domain-aggregate types) | Domain-native models, entities, value objects, pure engines, FSMs, scoring, formulas. Domain-local types that are intrinsic to one domain's vocabulary. | UI imports (`@/components/**`, `@/pages/**`), React imports, service imports (`@/lib/services/**`, `@/integrations/supabase`). |
| **Platform-local** *(narrow, optional)* | `src/platform/<system>/contracts/**` | Types whose vocabulary is internal to **one** platform system (e.g. one daemon's internal contract). | Cross-system / app-wide vocabulary. The moment a type is imported from outside its owning platform system, it must be promoted to `src/packages/<family>-contracts/` and re-exported via `src/contracts/`. |

## The Promotion Rule

A type is **app-wide public** iff it is imported by **≥2 distinct top-level layers** (e.g. `pages` + `modules`, or `platform/A` + `platform/B`, or `modules/<pillar>` + `platform/<system>`).

Such types **must**:
1. Live in `src/packages/<family>-contracts/` (canonical home), and
2. Be re-exported through `src/contracts/` (public barrel) via the cascading `src/packages/contracts` root barrel.

## The Duplication Rule

No exported type / interface / enum / const identifier may exist in more than **one** of:
- `src/contracts/**`
- `src/packages/**`
- `src/domains/types/**`
- `src/platform/<system>/contracts/**`

The single canonical home is determined by the Promotion Rule above. Validator: `check-contract-duplicate-identifiers.ts` (BLOCK).

## The Direction Rule

- `src/packages/**` MUST NOT import from `src/modules/**`, `src/pages/**`, `src/components/**`, `src/lib/services/**`, or `src/integrations/supabase`.
- `src/contracts/**` MUST NOT import from anything except `src/packages/**` and (after explicit promotion) `src/platform/<system>/contracts/**`.
- `src/domains/**` MUST NOT import from `react`, `react-dom`, `@/components/**`, `@/pages/**`, `@/integrations/supabase`, or `@/lib/services/**`.
- `src/platform/<X>/contracts/**` MUST NOT be imported by `src/platform/<Y>/**` (Y ≠ X), `src/modules/**`, or `src/pages/**`.

## How to add a new contract (decision tree)

1. **Is the type intrinsic to one domain's vocabulary?** → Add it next to its engine in `src/domains/<domain>/` or in `src/domains/types/<domain>.types.ts`. Stop.
2. **Is the type used only inside one platform system?** → Add it to `src/platform/<system>/contracts/` (or co-locate with the system's code). Stop.
3. **Is the type imported across ≥2 top-level layers?** → It is app-wide public.
   1. Place the canonical body in `src/packages/<family>-contracts/` (create the family package if no existing family fits, but prefer reusing `src/packages/contracts/` for cross-pillar shapes).
   2. Add a `export * from "./<file>"` line to that family's `index.ts`.
   3. Verify it now reaches consumers via `@/contracts`.
   4. Consumers must import from `@/contracts`, not from the deep package path.

## Wave 1.2 baseline

Two files were promoted from `src/platform/contracts/` (platform-local) to `src/packages/contracts/` (canonical app-wide), because they were each imported by ≥2 top-level layers (`modules/{business,concierge,finance,health}` + `platform/trust`):

| Old (deprecated shim, removed Wave 9) | Canonical home | Public import |
|---|---|---|
| `@/platform/contracts/pillar-contract` | `src/packages/contracts/pillar-contract.ts` | `@/contracts` |
| `@/platform/contracts/decision-queue` | `src/packages/contracts/decision-queue.ts` | `@/contracts` |
| `@/modules/_shared/pillar-contract` | `src/packages/contracts/pillar-contract.ts` | `@/contracts` |
| `@/modules/_shared/decision-queue` | `src/packages/contracts/decision-queue.ts` | `@/contracts` |

`PillarId` (previously imported upward from `@/modules` into `decision-queue.ts`, a layer-rule violation) is now inlined as the literal union `"business" | "concierge" | "finance" | "health"` — mirroring `PillarManifest.id`. Layer direction restored.

No other contract / type files were moved. The 19 files in `src/domains/types/` and the 38 sub-packages in `src/packages/` remain in their canonical homes.

## Enforcement

| Validator | Level | What it checks |
|---|---|---|
| `scripts/architecture/checks/check-public-contract-barrel-purity.ts` | **BLOCK** | `src/contracts/**` contains only re-exports; no implementation, no React/Supabase/services imports. |
| `scripts/architecture/checks/check-contract-duplicate-identifiers.ts` | **BLOCK** | No exported identifier appears in ≥2 of {public-barrel, packages, domains/types, platform-local}. |
| `scripts/architecture/checks/check-platform-local-contract-scope.ts` | **BLOCK** | `src/platform/<X>/contracts/**` is imported only from inside `src/platform/<X>/**` (deprecated shims exempted by frontmatter). |
| `scripts/architecture/checks/check-contract-topology.ts` (existing) | **BLOCK** | No named contract families outside `src/contracts/` + `src/packages/`. |
| `scripts/architecture/checks/check-domain-purity.ts` (extended Wave 1.2) | **BLOCK** | `src/domains/**` does not import React, Supabase, services, components, or pages. |

## Generated artifacts

- `generated/manifests/contract-ownership-map.json` — every exported contract identifier with its layer, canonical path, consumer count, and consumer layers.
- `generated/audits/duplicate-contract-family-report.json` — duplicates report (must be empty in steady state).
- `generated/audits/contract-layer-hardening-report.md` — Wave 1.2 hardening report.