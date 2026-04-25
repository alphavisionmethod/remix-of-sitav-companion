# Wave G — Route Topology Canonicalization & Governance Hardening

## Audit Findings (from real repo inspection)

The `src/routes/` layer is **functional but under-governed**. Concrete defects found:

| # | Defect | Evidence |
|---|---|---|
| 1 | **Naming drift** — mixed PascalCase/kebab-case for files of identical role | `AdminRoutes.tsx`, `OwnerRoutes.tsx`, `MobileRoutes.tsx` (PascalCase) vs `business-routes.tsx`, `os-routes.tsx`, …14 others (kebab-case). All export `getXRoutes()` factories — they are siblings semantically but not by name. |
| 2 | **`experimental-routes.tsx` is a dumping ground** (284 LOC, 5 distinct concepts) | Contains Investment Office (44 routes), Revenue Office (~42 routes inside `<RevenueOfficeModeProvider>`), Digital Presence (19 routes), Pack Store (10 routes), App Platform shim, Digital Twins/Scenario/AI Economics. The name "experimental" no longer reflects content. |
| 3 | **`os-routes.tsx` conflates 4 surface kinds** (259 LOC) | Mixes: shell/system pages (`/desktop`, `/system`), Personal Brain (24 routes), Workspaces (`/calendar`, `/notes`…), Built-in apps (`/apps/email`…), Intelligence Layer (`/intelligence/*`), and overlapping `/settings/*` aliases also defined in `settings-routes.tsx`. |
| 4 | **Redirects split across two sibling-equivalent locations** | `src/routes/redirects/user-redirect-map.ts` (8 user redirects) AND `src/admin/redirects/admin-redirect-map.ts` re-exporting from `src/platform/architecture/admin-redirect-map.ts`. No single `src/routes/redirects/` index. |
| 5 | **No route-family metadata system** | No file declares: family kind (module/platform/admin/app/os), surface kind, profile visibility, canonical page family, deprecated/alias status. `route-adapter-semantic-map.json` covers `src/pages/**` adapters but not `src/routes/**` family files. |
| 6 | **Hidden composition logic** — `experimental-routes.tsx` mounts `<RevenueOfficeModeLayout>` (a `<RevenueOfficeModeProvider><Outlet/></RevenueOfficeProvider>` wrapper). This is shell-mounting logic embedded in a route family file. Acceptable per Rule 35 (`shell-mount`), but undeclared. |
| 7 | **`AdminRootLanding.tsx` is a page body, not a route family** — but lives in `src/routes/` alongside route family registries. Misclassified. |
| 8 | **Settings overlap** — `os-routes.tsx` lines 144–152 register `/settings/*` routes already owned by `settings-routes.tsx`. Source of registry collision. |
| 9 | **No central composer file** — `App.tsx` imports 16 route-family factories individually and calls them inline. There is no `src/routes/index.ts` or `compose-routes.tsx` to centralize the topology. |
| 10 | **No validator covers `src/routes/**` itself** — 25 route validators exist, but none audits the route-family layer for naming convention, metadata presence, surface classification, or hidden logic. |

**What is already good (preserve):** Rule 45 profile-visibility manifest, Rule 50 page-ownership ratchet, `app-route-profile-map.json` (673 routes), 25 existing route validators, plane-coverage check, admin redirect system.

---

## Strategy: 4-Tier Hardening

This wave is **metadata-first, move-second, governance-third** to minimize risk. No routing behavior changes. All `App.tsx` imports continue to resolve via shims for any renamed file.

### TIER 1 — Foundation (types + registry + composer) — additive only

Create:
- **`src/routes/types/route-family-types.ts`** — TypeScript types for `RouteFamilyKind` (`"module" | "platform" | "admin" | "app-runtime" | "os-shell" | "mobile-runtime"`), `RouteSurfaceKind` (`"user-product" | "operator" | "shared-shell" | "owner"`), `ProfileVisibility` (`"user" | "operator" | "both"`), `RouteFamilyDescriptor` (id, name, kind, surface, profiles, canonicalPageOwner glob, factory ref).
- **`src/routes/registry/route-family-registry.ts`** — typed, hand-curated registry of all 16 current route families. Single source of truth for naming, classification, and metadata.
- **`src/routes/compose-routes.tsx`** — exports `composeRoutes({ ProtectedRoute })` that returns the shell-tier route children currently inlined in `App.tsx` lines 287–314. Pure re-composition, byte-equivalent JSX output.
- **`src/routes/index.ts`** — barrel exposing `composeRoutes`, `ROUTE_FAMILY_REGISTRY`, types, and the redirect maps.

### TIER 2 — Physical moves (proven safe; shim where consumers exist)

| Move | From | To | Reason |
|---|---|---|---|
| Misclassified page body | `src/routes/AdminRootLanding.tsx` | `src/admin/modules/landing/views/AdminRootLanding.tsx` | It's a page body (Rule 50). Leave shim; only consumer is `src/routes/AdminRoutes.tsx`. |
| Naming consistency | `src/routes/AdminRoutes.tsx` | `src/routes/families/admin-routes.tsx` | Sibling normalization. Re-export shim at original path; `App.tsx` import unchanged. |
| Naming consistency | `src/routes/OwnerRoutes.tsx` | `src/routes/families/owner-routes.tsx` | Same. Shim retained. |
| Naming consistency | `src/routes/MobileRoutes.tsx` | `src/routes/families/mobile-routes.tsx` | Same. Shim retained (preserves the named export `MobileRoutes`). |
| Family grouping | `src/routes/{advisor,apps,boardroom,business,business-advisor,communications,concierge,files,health,investment,money,os,settings,trust}-routes.tsx` (14 files) | `src/routes/families/<name>.tsx` | Move into single `families/` folder. Re-export shims at all 14 original paths; `App.tsx` imports unchanged. |
| Redirect consolidation | `src/routes/redirects/user-redirect-map.ts` (stays) + add `src/routes/redirects/admin-redirect-map.ts` re-exporting `@/platform/architecture/admin-redirect-map` + `src/routes/redirects/index.ts` | n/a (additive) | Single canonical redirect index. Original `src/admin/redirects/admin-redirect-map.ts` already a shim — no change there. |

**Splitting `experimental-routes.tsx` (284 LOC, 5 concepts) — done in Tier 2 with shims:**

| New file | Concept | Routes |
|---|---|---|
| `src/routes/families/investment-office-routes.tsx` | Investment Office | 44 |
| `src/routes/families/revenue-office-routes.tsx` | Revenue Office (incl. `<RevenueOfficeModeLayout>` shell-mount, declared) | 42 |
| `src/routes/families/digital-presence-routes.tsx` | Digital Presence | 19 |
| `src/routes/families/pack-store-routes.tsx` | Pack Store + App Platform shim | 11 |
| `src/routes/families/digital-twins-routes.tsx` | Digital Twins / Scenario / AI Economics | 7 |
| `src/routes/experimental-routes.tsx` | **shim** — composes the 5 above and re-exports `getExperimentalRoutes()` byte-equivalent | n/a |

`App.tsx` continues to call `getExperimentalRoutes()` — zero behavioral change. New families are also individually exported for the registry.

**`os-routes.tsx` is NOT split in this wave** (deferred — it's risky, has 100+ routes, and the 4 sub-concepts share imports). Instead, it gets a top-of-file `// @route-family:` directive and is registered as `kind: "os-shell"` with mixed sub-concepts noted in the registry. Splitting deferred to Wave H with explicit task ticket in the report.

**Settings overlap (defect #8):** `os-routes.tsx` lines 144–152 already render the same components as `settings-routes.tsx`. React Router will use the first-registered match. Inspection shows `settings-routes.tsx` is registered AFTER `os-routes.tsx` in `App.tsx`, so the `os-routes.tsx` versions are dead. Remove the 9 dead `/settings/*` lines from `os-routes.tsx` (Rule 24 safe-change: grep proof — no consumers reference these duplicate registrations specifically).

### TIER 3 — Metadata directives on every family file

Add a top-of-file machine-readable comment block to all 16 + 5-new family files:

```ts
// @route-family: investment-office
// @kind: module
// @surface: user-product
// @profiles: user
// @canonical-page-owner: src/pages/investment-office/**
// @owns: topology-only
```

Validator parses these and cross-checks against the registry.

### TIER 4 — Governance + Validators + Constitution

Create:
- **`docs/architecture/ROUTE_TOPOLOGY_GOVERNANCE_MODEL.md`** — full model: directory structure, family-kind taxonomy, surface-kind taxonomy, profile-visibility rules, the "topology-only" rule (no page bodies in `src/routes/**`), redirect governance, app-vs-OS separation, app-vs-admin separation, registry contract.
- **`generated/manifests/route-family-registry.json`** — generated mirror of `src/routes/registry/route-family-registry.ts` for tooling/CI.
- **`generated/manifests/route-family-ownership-map.json`** — per-file: path, family id, kind, surface, profiles, canonical page owner, declared directives, validator status.
- **`generated/audits/route-topology-hardening-report.md`** — final report (gap summary, model adopted, moves performed, rewiring proof, future protections).
- **`generated/baselines/route-family-governance-baseline.json`** — sealed at 0 for unclassified families, missing directives, hidden bodies in `src/routes/**`.

Validators (NEW, all wired into `src/lib/ci/validator-gate-map.ts`):

1. **`scripts/architecture/checks/check-route-family-classification.ts`** (BLOCK) — every file in `src/routes/**` (excluding shims, types, registry, redirects, index) must be in `src/routes/families/` AND have a complete `@route-family/@kind/@surface/@profiles` directive block AND appear in the registry.
2. **`scripts/architecture/checks/check-route-family-no-page-bodies.ts`** (BLOCK) — files in `src/routes/**` may not contain JSX components longer than ~30 lines (heuristic for page bodies). Allowed: `Route`, `Navigate`, `Outlet`, lazy bindings, simple shell-mount wrappers (declared via `@owns: shell-mount`). Reuses `check-frontend-page-canonical-ownership.ts` patterns.
3. **`scripts/architecture/checks/check-route-family-app-vs-os-separation.ts`** (BLOCK) — a family declared `kind: "module"` or `kind: "platform"` may not import from `@/admin/**` (admin leakage). A family declared `kind: "admin"` may not be composed into the user shell tree. Cross-checks `compose-routes.tsx` shape.
4. **`scripts/architecture/checks/check-route-family-registry-completeness.ts`** (BLOCK) — every factory imported in `compose-routes.tsx` must appear in the registry; every registry entry must resolve to a real family file.

**Generator:** `scripts/architecture/generate/generate-route-family-registry.ts` — emits `generated/manifests/route-family-registry.json` from the typed source.

**Constitution amendment:**
- **Rule 51 — Route Topology Governance Law (BLOCKING).** Codifies: `src/routes/**` owns route topology and metadata only. Every route-family file lives under `src/routes/families/` with `@route-family` directive and registry entry. Module/platform/admin/app-runtime/os-shell/mobile-runtime kinds are mutually exclusive. App and OS surfaces remain compositionally separate. Redirects centralized under `src/routes/redirects/`. Page bodies in `src/routes/**` are forbidden (cross-references Rule 50). Pinned baseline: 0. Validators: the 4 above + existing 25 route validators retained.

### Hidden-logic handling

`<RevenueOfficeModeLayout>` (the `<RevenueOfficeModeProvider><Outlet/></RevenueOfficeModeProvider>` wrapper at line 84 of `experimental-routes.tsx`) is preserved as-is in the new `revenue-office-routes.tsx` and declared via `@owns: shell-mount` directive. Validator #2 explicitly allows this pattern.

---

## Files Edited / Created (full list)

**New (~30 files):**
- `src/routes/types/route-family-types.ts`
- `src/routes/registry/route-family-registry.ts`
- `src/routes/compose-routes.tsx`
- `src/routes/index.ts`
- `src/routes/redirects/admin-redirect-map.ts` (re-export shim)
- `src/routes/redirects/index.ts`
- `src/routes/families/admin-routes.tsx` (moved + directive)
- `src/routes/families/owner-routes.tsx` (moved + directive)
- `src/routes/families/mobile-routes.tsx` (moved + directive)
- `src/routes/families/{advisor,apps,boardroom,business,business-advisor,communications,concierge,files,health,investment,money,os,settings,trust}-routes.tsx` (14 moved + directives)
- `src/routes/families/investment-office-routes.tsx` (split from experimental)
- `src/routes/families/revenue-office-routes.tsx` (split from experimental)
- `src/routes/families/digital-presence-routes.tsx` (split from experimental)
- `src/routes/families/pack-store-routes.tsx` (split from experimental)
- `src/routes/families/digital-twins-routes.tsx` (split from experimental)
- `src/admin/modules/landing/views/AdminRootLanding.tsx` (moved page body)
- `docs/architecture/ROUTE_TOPOLOGY_GOVERNANCE_MODEL.md`
- `scripts/architecture/checks/check-route-family-classification.ts`
- `scripts/architecture/checks/check-route-family-no-page-bodies.ts`
- `scripts/architecture/checks/check-route-family-app-vs-os-separation.ts`
- `scripts/architecture/checks/check-route-family-registry-completeness.ts`
- `scripts/architecture/generate/generate-route-family-registry.ts`
- `generated/manifests/route-family-registry.json`
- `generated/manifests/route-family-ownership-map.json`
- `generated/baselines/route-family-governance-baseline.json`
- `generated/audits/route-topology-hardening-report.md`

**Edited:**
- `src/routes/AdminRoutes.tsx` → 1-line shim re-exporting from `families/admin-routes.tsx`
- `src/routes/OwnerRoutes.tsx` → 1-line shim
- `src/routes/MobileRoutes.tsx` → 1-line shim (re-exporting named `MobileRoutes`)
- `src/routes/{advisor,apps,boardroom,business,business-advisor,communications,concierge,files,health,investment,money,os,settings,trust}-routes.tsx` → 1-line shims (14 files)
- `src/routes/experimental-routes.tsx` → composes the 5 new sub-families and re-exports `getExperimentalRoutes()`
- `src/routes/AdminRootLanding.tsx` → 1-line re-export shim from new admin location
- `src/routes/os-routes.tsx` → directive added; 9 dead `/settings/*` duplicate lines removed (grep-proven dead)
- `src/lib/ci/validator-gate-map.ts` → register 4 new validators with rationales linking to Rule 51
- `docs/architecture/REPOSITORY_CONSTITUTION.md` → append Rule 51 section
- `src/admin/MANIFEST.md` → note new `landing/views/AdminRootLanding.tsx`

**NOT edited (deliberately):**
- `src/App.tsx` — all imports continue to resolve via shims. Zero touch on the orchestrator.
- All 25 existing route validators — preserved as-is.
- `src/admin/redirects/admin-redirect-map.ts` — already a shim, untouched.
- `src/platform/architecture/admin-redirect-map.ts` — canonical body, untouched.
- All `src/pages/**` — Wave F territory, untouched.

---

## Safety Discipline Applied

- **Reverse-dependency proof for every move:** `rg "from ['\"]@/routes/<oldname>" src/ tests/ docs/ generated/ scripts/ .github/` — every move retains a re-export shim so all 28+ existing import sites continue to resolve unchanged.
- **No-logic / no-UI / no-API change rule:** All factories return JSX byte-equivalent to today. `experimental-routes.tsx` shim composes 5 fragments in identical order. `RevenueOfficeModeLayout` preserved.
- **Canonical destination proof per moved file:** every move has exactly one new canonical path; the registry asserts uniqueness.
- **Old-path removal verification gate:** none — shims retained for every move (no old paths removed in this wave). A future Wave H may purge shims after a release.
- **Smoke tests for multi-consumer moves:** `src/__tests__/routes/route-page-alignment.test.ts`, `src/__tests__/routes/route-family-completeness.test.ts`, `src/__tests__/route-truth.test.ts` re-run via `tsc --noEmit` + ripgrep import resolution.
- **Attestation resealing:** `route-family-governance-baseline.json` sealed at 0 only via `generate-route-family-registry.ts` (canonical generator).
- **Strict Rule 24 safe-change compliance** for the 9 dead `/settings/*` lines removed from `os-routes.tsx` — grep proof of zero direct callers (they were registry-shadowed dead routes).

## Verification Plan

1. `bunx tsc --noEmit` clean
2. New 4 validators all PASS at baseline 0
3. All 25 existing route validators continue to PASS unchanged
4. Manual route smoke: `App.tsx` imports unchanged → `composeRoutes` not yet wired into App.tsx (additive only this wave; App.tsx adoption is opt-in for Wave H)
5. `route-adapter-semantic-map.json` regeneration unchanged (we touch no `src/pages/**` files)
6. `frontend-page-ownership-map.json` regeneration unchanged

## Future Protections Installed

- Future contributors cannot create a new file in `src/routes/**` outside `families/` without the validator failing.
- Future contributors cannot omit the `@route-family` directive — BLOCK.
- Future contributors cannot put a page body in `src/routes/**` — BLOCK (and Rule 50 already blocks page bodies in `src/pages/**`).
- Future contributors cannot create app↔admin or app↔OS leakage in route families — BLOCK.
- Future route additions to `compose-routes.tsx` MUST appear in the registry — BLOCK.

## Deferred to Wave H (documented, not orphaned)

- Splitting `os-routes.tsx` into `personal-brain-routes.tsx`, `built-in-apps-routes.tsx`, `intelligence-routes.tsx`, `os-shell-routes.tsx` (high risk, deferred with explicit ticket in the audit report).
- Migrating `App.tsx` to call `composeRoutes()` instead of inline factory calls (additive next wave; current wave keeps `App.tsx` untouched).
- Removing the 21 path shims after one release cycle of soak.
