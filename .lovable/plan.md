
# SITA OS — Repository Tree Canonicalization Plan

## Audit findings (what's actually true today)

| Area | Files | Reality |
|---|---|---|
| `src/pages/` | 1,148 | Currently the **de-facto owner** of nearly all product surfaces. ~97 root-level pages + 36 subdirs. |
| `src/modules/` | 61 | Thin identity layer — only manifests, capability registries, and 8 recent re-export wrappers. **Not** the real owner yet. |
| `src/platform/` | 296 across 41 subdirs | Real platform code, but with several **duplicate folder pairs**: `ai/` + `ai-gateway/`, `nova-sdk/` + `nova-runtime-sdk/`, `policy/` + `policies/`, `sync/` + `sync-engine/`, `core/` + `core-services/`, `os-services/` + `core-services/`. Also has a `services-unclassified/` folder (anti-pattern). |
| `src/admin/` (41) + `src/pages/admin/` (583) | 624 | **Two parallel admin trees**. Major duplicate-ownership risk. |
| `src/routes/*-routes.tsx` | 17 | Routes mostly point to **`Center` shells** (`BusinessCenter`, `MoneyCenter`, etc.), **not** to individual page files. The 1,148 page files are windowed sub-views composed inside Centers — moving them does not break routes. |
| `generated/` (top-level) + `public/generated/` | 2 trees | Both exist with overlapping artifact families. No clear lifecycle separation. |
| `src/lib/services/` | ~150+ subdirs | Side-effect layer, generally well-placed but pillar-specific service folders (`business-os/`, `concierge-os/`, etc.) belong adjacent to their modules logically. |
| Cross-pillar imports | 0 violations | The existing `check-module-ownership.ts` validator is green because pillars are nearly empty. |
| Pillar-specific consumers of `@/pages/{business,money,concierge}` outside the page tree | 0 | **Migration is mechanically much safer than it looks** — the page tree is a leaf. |

### Hidden landmines
- **`BusinessCenter.tsx` and similar shells are routed for ~30+ URLs each** — they internally switch on `useLocation()`. Moving the *Center shells* requires care; moving the *sub-pages they import* is safe.
- **Lazy imports in `App.tsx`** reference 11 root-level page files directly (LandingPage, DesktopPage, Onboarding, etc.).
- **`supabase/functions/`** import nothing from `src/`, so they're isolated.
- **`scripts/architecture/check-module-ownership.ts`** already enforces pillar boundaries — extending it is the right validator pattern.
- **`src/integrations/supabase/types.ts` is auto-generated** — do not touch.
- **Phase 8–11 manifests** (`public/generated/phase-*-manifest.json`) and CI gates are in place — must be preserved through the migration.

## Why this MUST be wave-based, not big-bang

Moving 1,148 files in one pass would:
1. Force every CI gate (Phase 8/9/10/11, knowledge-spine, semantic-spine, live-cortex, memory-provenance) to be re-validated simultaneously, masking which move broke what.
2. Create a 1,000-file diff that no human can review, defeating the "no integration mistakes" requirement.
3. Risk breaking the lazy-import wiring in `App.tsx` and the `Center` shells.
4. Touch route registries, admin trees, generated artifacts, and validators in the same commit — exactly the integration-issue surface you asked me to avoid.

The plan below executes in **9 numbered waves**, each independently shippable, each with its own validator and rollback story.

---

## Target canonical tree (the destination)

```
src/
  app/                    Bootstrap, route assembly, top-level shells/launchers (currently 1 file — fill it)
  modules/                THE owner of user-facing product pillars
    business/             { pages, components, services-facade, manifest, index }
    concierge/            { pages, components, services-facade, manifest, index }
    finance/              { pages, components, services-facade, manifest, index }
    health/               { pages, components, services-facade, manifest, index }
    _shared/              Cross-module reusable UI/services available to pillars only
    _trust/               Trust platform consumed by pillars (kept as alias to src/platform/trust)
  platform/               THE owner of cross-pillar systems
    trust/                (canonical home — _trust becomes alias)
    ai/                   (consolidates ai/ + ai-gateway/)
    nova-sdk/             (consolidates nova-sdk/ + nova-runtime-sdk/)
    policy/               (consolidates policy/ + policies/)
    sync/                 (consolidates sync/ + sync-engine/)
    core-services/        (consolidates core/ + core-services/ + os-services/)
    knowledge/            (lifted from modules/_shared/knowledge — Phase 6–11 work)
    notifications/  files/  owner/  mission-control/  atlas/  tenant/  enterprise/  personal-brain/
    runtime/  integration/  observability/  search/  security/  governance/  …
    (delete services-unclassified/ — classify each file)
  domains/                Pure contracts/models/engines (already correctly scoped)
  lib/services/           Side effects, persistence, integrations (kept; pillar-named subfolders relocate)
  runtimes/               Runtime/host/deployability abstractions (already correctly scoped)
  pages/                  THIN route adapters only — re-export from modules/platform
  components/             Shared reusable presentation (pillar-specific moves into modules/<x>/components)
  routes/                 Route registries (already correctly scoped)
  admin/                  Canonical admin tree (src/pages/admin/ becomes thin adapters)
  contexts/  hooks/  contracts/  integrations/  layouts/  features/  data/  test/  __tests__/  i18n/  types/  assets/  packages/  shell-runtime/  website-demo/  planes/

generated/                Machine-owned outputs only
  manifests/  proof/  readiness/  audits/  historical/

public/generated/         Publish-safe surfaced artifacts only (subset of generated/)

docs/
  architecture/  adr/  runbooks/  reference/
```

---

## WAVE 1 — Repository constitution + validators (no code moves)
**Goal:** Lock the rules in place before any file moves so every subsequent wave is self-validating.

1. Write `docs/architecture/REPOSITORY_CONSTITUTION.md` — the human-readable version of the target tree, ownership rules, and forbidden patterns.
2. Strengthen `scripts/architecture/check-module-ownership.ts` to also enforce:
   - `src/platform/**` MUST NOT import from `src/modules/<pillar>/**`
   - `src/components/**` MUST NOT import from `src/pages/**` or `src/modules/**`
   - `src/domains/**` MUST be side-effect free (no `from "@/lib/services/"`, no `supabase`)
3. Add `scripts/architecture/check-pages-thin-adapter.ts` — flags `src/pages/<pillar>/**` files >40 lines that are not pure re-exports (warn-only initially; becomes blocking in Wave 4).
4. Add `scripts/architecture/check-no-duplicate-platform.ts` — flags duplicate platform folder pairs.
5. Add `scripts/architecture/check-generated-vs-docs.ts` — flags hand-edited files inside `generated/`.
6. Wire all 4 new checks into `.github/workflows/deployment-readiness-gate.yml` as a single `architecture-canonicalization` step (warn-only for Wave 1, becomes blocking after each subsequent wave it covers).
7. Emit `generated/audits/repository-canonicalization-baseline.json` capturing today's file counts per ownership zone (will be the "before" snapshot for the final report).

**Risk:** None — read-only validators + docs.
**Rollback:** Revert one PR.

---

## WAVE 2 — Platform deduplication (no semantic changes)
**Goal:** Collapse the 5 duplicate platform folder pairs without changing what the code does.

For each duplicate pair, do a **content audit first**, then merge with import rewriting:

| Keep | Merge from | Strategy |
|---|---|---|
| `src/platform/ai/` | `src/platform/ai-gateway/` | Move `ai-gateway/*` → `ai/gateway/*`, rewrite imports. |
| `src/platform/nova-sdk/` | `src/platform/nova-runtime-sdk/` | Audit overlap; nova-runtime-sdk appears smaller — fold into `nova-sdk/runtime/`. |
| `src/platform/policy/` | `src/platform/policies/` | Merge into `policy/` (singular, matches existing `src/lib/policy/`). |
| `src/platform/sync/` | `src/platform/sync-engine/` | Move `sync-engine/*` → `sync/engine/*`. |
| `src/platform/core-services/` | `src/platform/core/`, `src/platform/os-services/` | Audit each; consolidate under `core-services/` with subfolders `os/`, `kernel/`. |

Then **classify `src/platform/services-unclassified/`** file-by-file into the proper subsystem. Delete the folder when empty.

For each merge:
- Use a single migration script `scripts/architecture/wave-2-platform-dedup.ts` that moves files + rewrites all imports across the repo (codemod).
- Validate with TypeScript compile + `bunx vitest run` smoke tests.
- Update any `public/generated/*.json` that references old paths.

**Risk:** Medium — touches platform foundations.
**Rollback:** Revert single PR; codemod is reversible.
**Validators added/flipped to blocking:** `check-no-duplicate-platform.ts`.

---

## WAVE 3 — Lift cross-pillar systems out of `src/modules/_shared` and `src/modules/_trust`
**Goal:** Make `src/platform/` the real cross-pillar home; keep `_shared`/`_trust` only as **thin alias barrels** for transition.

Move:
- `src/modules/_shared/knowledge/` → `src/platform/knowledge/` (this is the Phase 6–11 spine — high-value, must be done atomically with import rewriting).
- `src/modules/_shared/ai/` → `src/platform/ai/shared-ui/` (or merge into existing platform/ai).
- `src/modules/_shared/registry/` → `src/platform/registry/`.
- `src/modules/_shared/workspace/` → `src/platform/tenant/workspace/`.
- `src/modules/_trust/` → `src/platform/trust/` (registry, authority, ui).

Leave behind in `src/modules/_shared/index.ts` and `src/modules/_trust/index.ts` **pure re-export barrels** so existing pillar imports keep working with zero changes:
```ts
// src/modules/_shared/knowledge/index.ts (transitional)
export * from "@/platform/knowledge";
```

Update Phase 8–11 manifests + CI gates to point at the new canonical paths (additive — manifest entries list both old + new during transition, then drop old in Wave 9).

**Risk:** Medium-high — touches the live knowledge/federation/voice spine just shipped in Phase 11.
**Rollback:** Each subsystem move is its own PR; revert independently.
**Validators added:** Extend `check-module-ownership.ts` to flag direct imports of moved files via the *old* paths after grace period (warn first).

---

## WAVE 4 — Pillar product page migration (Business + Concierge + Finance + Health)
**Goal:** Make `src/modules/<pillar>/` the real owner of product pages.

For each pillar, move pages **as a single atomic PR per pillar** in this order (smallest first to de-risk):

### Wave 4a — Health (9 pages, smallest blast radius)
- Move `src/pages/health/*` → `src/modules/health/pages/*`.
- Replace `src/pages/health/<X>.tsx` with one-line re-export: `export { default } from "@/modules/health/pages/<X>";`.
- Update `src/routes/health-routes.tsx` to import from `@/modules/health/pages/*`.
- Move pillar-specific components from `src/components/health/**` → `src/modules/health/components/**`, leave shared ones.
- Update `MANIFEST.md`.

### Wave 4b — Concierge (21 pages)
Same pattern. Includes resolving the `TravelPlanning.tsx` already-migrated case (currently in both `src/pages/concierge/` as re-export and `src/modules/concierge/pages/`).

### Wave 4c — Finance (34 money + 42 investment-office = 76 pages) — **Finance reconciliation**
- Move `src/pages/money/*` → `src/modules/finance/pages/money/*`.
- Move `src/pages/investment-office/*` → `src/modules/finance/pages/investment-office/*`.
- Keep `/money/*` and `/finance/*` URL aliases (URL stability) — both routes hit the same module pages.
- Add `src/routes/redirects/finance-aliases.ts` to make `/finance/*` ↔ `/money/*` interchangeable.
- Update `MoneyCenter.tsx` shell to import sub-pages from `@/modules/finance/pages/`.
- Leave thin re-exports in old `src/pages/money/` and `src/pages/investment-office/` paths for any straggler import.

### Wave 4d — Business (49 business + 69 revenue-office + 20 digital-presence = 138 pages) — **Business reconciliation**
- Move `src/pages/business/*` → `src/modules/business/pages/*`.
- Move `src/pages/revenue-office/*` → `src/modules/business/pages/revenue/*` (revenue is a Business sub-domain).
- Audit `src/pages/digital-presence/*` page-by-page:
  - Business-owned (websites, brand, ecommerce ops) → `src/modules/business/pages/digital-presence/*`.
  - Cross-pillar marketing → `src/platform/marketing/` if any.
- Update `BusinessCenter.tsx` and `src/routes/business-routes.tsx` accordingly.
- Update `MANIFEST.md` to reflect revenue-office is now an internal Business sub-domain.

For every move in Wave 4: keep a 1-line re-export wrapper in `src/pages/<old-path>` so any forgotten import still works. These wrappers are tracked in `generated/audits/wave-4-compatibility-wrappers.json` and removed in Wave 9 once the no-direct-import validator is green for two CI runs.

**Validators flipped to blocking:** `check-pages-thin-adapter.ts` for migrated pillars.
**Risk:** High due to volume; mitigated by pillar-by-pillar PRs and the re-export safety net.

---

## WAVE 5 — Cross-pillar root-level pages classification
**Goal:** Each of these root-level page families gets a canonical home.

| Current path | Canonical home | Reason |
|---|---|---|
| `src/pages/personal-brain/` (19) | `src/platform/personal-brain/pages/` | Cross-pillar memory layer |
| `src/pages/trust/` (8) | `src/platform/trust/pages/` | Cross-pillar trust UI |
| `src/pages/owner/` (10) + `src/pages/owner-mode/` | `src/platform/owner/pages/` | Operator-only |
| `src/pages/mission-control/` + `src/pages/mission/` (8) | `src/platform/mission-control/pages/` | Operator-only |
| `src/pages/atlas/` (12) | `src/platform/atlas/pages/` | Cross-pillar map |
| `src/pages/files/` (9) | `src/platform/files/pages/` | Cross-pillar file platform |
| `src/pages/integrations/` | `src/platform/integration/pages/` | Cross-pillar |
| `src/pages/intelligence/` | `src/platform/ai/pages/` | Cross-pillar AI |
| `src/pages/app-platform/` (17) + `src/pages/store/` (6) + `src/pages/apps/` | `src/platform/app-platform/pages/` | App platform |
| `src/pages/tenant/` + `src/pages/enterprise/` | `src/platform/tenant/pages/` and `src/platform/enterprise/pages/` | Tenancy/enterprise |
| `src/pages/workspace/` | `src/platform/tenant/workspace/pages/` | Tenant workspace |
| `src/pages/boardroom/` | `src/platform/ai/boardroom/pages/` | Boardroom is AI/advisor surface |
| `src/pages/advisors/` + `src/pages/business-advisors/` | `src/platform/ai/advisors/pages/` and (business advisors stay under `src/modules/business/pages/advisors/`) | |
| `src/pages/sita/` | `src/platform/personal-brain/sita/pages/` | Sita HUD/voice |
| `src/pages/mobile/` (27) | `src/platform/runtime/mobile/pages/` | Runtime-specific |
| `src/pages/marketing/` | Decision: keep as `src/pages/marketing/` (pure adapter, no canonical product surface) **or** move to `src/website-demo/pages/`. Decide at wave start. |
| `src/pages/settings/` | `src/platform/setup/settings/pages/` (settings is platform-owned) | |
| `src/pages/auth/` | Stays at `src/pages/auth/` — auth is route-entry by definition. |

Each move follows the same "move + thin re-export wrapper" pattern as Wave 4.

**Risk:** Medium per family.
**Rollback:** Per-family PRs.

---

## WAVE 6 — Admin tree consolidation (`src/pages/admin/` ↔ `src/admin/`)
**Goal:** Eliminate the parallel admin tree.

`src/admin/` is already structured as a proper module (with `pages/`, `modules/`, `routes/`, `shell/`, `state/`, `navigation/`). `src/pages/admin/` (583 files) is the older, larger surface.

1. Audit which `src/admin/` files duplicate `src/pages/admin/` (likely many of the recent admin pages).
2. Decide canonical: **`src/admin/` becomes the single owner** (already correctly structured).
3. Move missing pages from `src/pages/admin/<area>/` → `src/admin/pages/<area>/` per area (ai-runtime, alerts, approvals, architecture, cloud, … 29 areas).
4. Replace `src/pages/admin/**` with thin re-export wrappers (or delete if not referenced).
5. Update `src/routes/AdminRoutes.tsx` to import from `@/admin/pages/`.
6. Update `src/admin/redirects/` to handle any URL changes.

**Risk:** High — admin is operationally critical (Mission Control surfaces).
**Rollback:** Per-area PRs (29 areas = 29 small PRs).
**Pre-flight:** Ensure `npm run lint` and `npx tsx scripts/architecture/check-module-ownership.ts` are green before each area PR.

---

## WAVE 7 — Component, domain, and lib/services normalization
**Goal:** Fix the underlying ownership layers so they don't re-create the problem.

1. **`src/components/`**: Audit pillar-specific component folders (`src/components/business/`, `src/components/money/`, `src/components/concierge/`, `src/components/health/`, `src/components/business-advisors/`, `src/components/revenue/`, `src/components/operations/`, `src/components/digital-presence/`, etc.) and move them into `src/modules/<owner>/components/`. Components used by ≥2 pillars stay in `src/components/`.
2. **`src/domains/`**: Verify side-effect-free purity. Add `check-domains-purity.ts` validator. Move any side-effecting code into `src/lib/services/`.
3. **`src/lib/services/`**: Pillar-named subfolders (`business-os/`, `concierge-os/`, `finance-os/`?, `health-*/`?) are kept here (this is the side-effects layer per the constitution), but each gets a `MANIFEST.md` declaring its owning pillar. Add `check-service-ownership.ts` to flag any cross-pillar service imports.
4. **`src/services/`**: This is just a 1-file re-export façade — leave it; document its role in the constitution.
5. **`src/features/`**: Audit each — most likely belong under modules or platform. Migrate or document why they remain.

**Risk:** Medium — high file-touch count but each move is local.

---

## WAVE 8 — Generated artifacts + docs lifecycle governance
**Goal:** Stop `generated/` from acting like a competing architecture source.

1. Reorganize `generated/` (top-level) into:
   ```
   generated/
     manifests/      ← *.json registry truth
     proof/          ← evidence reports
     readiness/      ← deployment readiness
     audits/         ← one-time audit outputs
     historical/     ← archive (date-stamped)
   ```
   Move each existing file into the right bucket. Use a single `scripts/architecture/wave-8-generated-reorg.ts` codemod that updates every `*.json` cross-reference.
2. Reorganize `public/generated/` to contain ONLY publish-safe surfaced artifacts (subset of `generated/`). Add `scripts/architecture/check-public-generated-allowlist.ts` to enforce.
3. Reorganize `docs/`:
   ```
   docs/
     architecture/   ← REPOSITORY_CONSTITUTION + ADRs index + diagrams
     adr/            ← numbered ADRs (one per major decision)
     runbooks/       ← operational
     reference/      ← API/connector reference
   ```
4. Move stale or duplicated `.md` files in repo root and other locations under `docs/historical/` or delete after archiving.
5. Add `check-generated-vs-docs.ts` validator to blocking.
6. Emit one ADR per wave: ADR-001 (Constitution), ADR-002 (Platform dedup), ADR-003 (Pillar migration), ADR-004 (Admin consolidation), ADR-005 (Generated reorg).

**Risk:** Low — these are non-runtime files. Mostly mechanical.

---

## WAVE 9 — Compatibility wrapper sweep + final hardening
**Goal:** Remove the temporary re-export wrappers from Waves 3–6 once the validators have been green for ≥2 CI runs.

1. Run `scripts/architecture/find-stale-wrappers.ts` to list every 1-line `export { default } from ...` wrapper in `src/pages/`, `src/modules/_shared/`, `src/modules/_trust/`.
2. For each wrapper, run `rg "@/pages/<old-path>"` across the repo. If zero usages → delete. If non-zero → fix the importer to use the canonical path, then delete.
3. Remove transitional barrel exports in `src/modules/_shared/` and `src/modules/_trust/` (they become empty `index.ts` re-exporting from `@/platform/`).
4. Optionally rename `src/modules/_trust/` → `src/modules/trust-bridge/` (or delete entirely) — decide based on remaining usage.
5. Flip every Wave 1–8 validator to blocking in CI.
6. Emit final reports:
   - `SITA_OS_REPOSITORY_TREE_CANONICAL_OWNERSHIP_MAP.md`
   - `SITA_OS_MODULE_PLATFORM_PAGE_OWNERSHIP_MATRIX.md`
   - `SITA_OS_ROUTE_WRAPPER_AND_CANONICAL_PAGE_MAP.md`
   - `SITA_OS_GENERATED_DOCS_ARTIFACT_LIFECYCLE_MAP.md`
   - `SITA_OS_FULL_TREE_CANONICALIZATION_REPORT.md` (the master summary with before/after counts, debt log, and rollback log)

---

## Wave dependency graph
```
Wave 1 (constitution + validators)       [can ship immediately]
   ↓
Wave 2 (platform dedup)                  [unlocks Wave 3]
   ↓
Wave 3 (_shared/_trust → platform)       [unlocks Wave 4]
   ↓
Wave 4 (pillar pages: 4a→4b→4c→4d)       [parallel-safe per pillar]
   ↓
Wave 5 (cross-pillar pages)              [parallel-safe per family]
   ↓
Wave 6 (admin consolidation)             [parallel-safe per area]
   ↓
Wave 7 (components/domains/lib normalize)
   ↓
Wave 8 (generated/docs lifecycle)
   ↓
Wave 9 (wrapper sweep + final reports)
```

## What I will NOT do (explicit non-goals to avoid integration issues)

1. **Will not** move all 1,148 pages in one PR.
2. **Will not** edit `src/integrations/supabase/types.ts` or `src/integrations/supabase/client.ts`.
3. **Will not** modify `supabase/config.toml` project-level settings.
4. **Will not** rename routes (URL stability preserved). All moves keep existing URLs alive via wrappers or the `src/routes/redirects/` map.
5. **Will not** delete the Phase 8–11 manifests or knowledge spine — those move atomically in Wave 3 with their CI gates updated in the same PR.
6. **Will not** touch `src/runtimes/`, `src/contexts/`, `src/hooks/`, `src/integrations/`, `src/data/`, `src/i18n/`, `src/test/`, `src/__tests__/`, `src/contracts/`, `src/layouts/`, `src/packages/`, `src/website-demo/`, `src/shell-runtime/`, `src/types/`, `src/assets/`, `src/planes/` — they're already correctly scoped.
7. **Will not** introduce a parallel architecture; every move *replaces* the old location with a thin wrapper, never duplicates.
8. **Will not** stop after analysis — each wave ends in shipped code + green CI.

## Approval scope

When you approve this plan, I will execute **Wave 1 first** (validators + constitution + baseline snapshot, ~15 files, zero runtime changes). After Wave 1 lands and CI is green, I'll ask before proceeding to Wave 2, and so on. This gives you a checkpoint after each wave with no risk of mid-flight integration breakage.

If you'd rather I bundle multiple waves into one delivery, say "execute Waves 1–3 together" (or any combination) and I'll batch them.
