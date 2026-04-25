# Primary Concept Uniqueness Model

> **Status:** Adopted (Wave D §D.2 — Constitution Rule 46)
> **Registry:** `src/platform/architecture/primary-concept-registry.ts`
> **Manifest:** `generated/manifests/primary-concept-ownership-map.json`
> **Validator (BLOCK):** `scripts/architecture/checks/check-primary-concept-uniqueness.ts`

## Why this exists

Per-domain admin uniqueness is already enforced
(`check-no-duplicate-primary-concept.ts` over `ADMIN_ROUTE_REGISTRY`).
But cross-cutting **primary product / platform concepts** (Business OS,
Boardroom, Trust, Personal Brain, Mission Control, Files, Atlas, Owner Mode,
Concierge, Money / Finance OS, Health OS, Admin Plane) had no equivalent
registry. Wave D installs that registry and elevates the rule to constitutional
status.

## Definition

A **primary concept** is a top-level user-perceivable surface that:

- has its own front-door route family (e.g. `/business`, `/boardroom`),
- corresponds to a distinct mental model in the product (not a sub-feature),
- and is referenced by humans, navigation, marketing, and docs as a unit.

## Hard rules

1. **Exactly one canonical owner.** Each concept has exactly one `ownerPath`
   (`src/modules/<pillar>` or `src/platform/<system>` or `src/admin`).
2. **Exactly one canonical route family.** Each concept has exactly one
   `canonicalRouteFamily` prefix.
3. **Exactly one canonical page family.** Each concept has exactly one
   `canonicalPageFamily` directory.
4. **Aliases are compatibility devices only.** Aliases listed in the registry
   MUST NOT host net-new logic and MUST remain re-exports / redirects.
5. **No second front door.** Adding a second route family or page family for an
   existing concept BLOCKS CI unless the registry is updated via ADR.
6. **Duplicate-risk is monotone-decreasing.** Pre-existing duplicates (2 at
   Wave D seal: `finance-front-door`, `files`) are baselined; new duplicates
   FAIL CI.

## Sealed baseline (Wave D)

| Concept | Status | Reason | Drain plan |
|---|---|---|---|
| `finance-front-door` | duplicate-risk | both `money-routes.tsx` and `experimental-routes.tsx` host `/money/*` shells | merge experimental into canonical (future Finance Consolidation Wave) |
| `files` | duplicate-risk | `/files/*` is registered in both `files-routes.tsx` and `os-routes.tsx` | os-routes mount is a desktop launcher entry; reconcile in OS Shell Wave |

`health-front-door`, `mission-control`, and `atlas` are flagged `no-routes`
(informational; their owners exist but their route families are not yet wired
into the runtime route registry — tracked separately by `check-route-plane-coverage`).

## Relationship to existing rules

- **Per-domain admin uniqueness:** `check-no-duplicate-primary-concept.ts`
  enforces uniqueness *within* `ADMIN_ROUTE_REGISTRY` (12 admin domains).
  This rule (§D.2) enforces uniqueness *across* the 12 cross-cutting product /
  platform concepts.
- **UI Ownership Law (§C.1):** prevents a concept's UI from leaking into the
  shared `src/components/` tree.
- **Profile Visibility Law (§D.1):** ensures each concept's routes are bound
  to the correct profile.
- **Safe Retirement Law (§D.3):** governs how alias paths are removed.