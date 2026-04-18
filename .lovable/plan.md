

# SITA OS — Page & Route Surface Consolidation (Phased Plan)

## Audit Findings (the real numbers)

| Metric | Value |
|---|---|
| Pages on disk (`src/pages/**`) | **1,042** |
| Admin pages | 539 (319 flat at `src/pages/admin/*.tsx` + 220 in subdirs) |
| Mounted routes (generated manifest) | **811** |
| AdminRoutes.tsx routes | 190 |
| experimental-routes.tsx routes | 121 |
| os-routes.tsx routes | 107 |
| Owner workflow `platform-admin` routes | **353** |
| Existing consolidation map coverage | 27 / 539 admin pages (5%) |
| Existing redirects in route families | only 16 in AdminRoutes; 0 in user-domain families |

**Existing assets to reuse (do not rebuild):**
- `src/platform/architecture/admin-route-registry.ts` (12-domain IA, page classes)
- `src/platform/architecture/admin-page-consolidation-map.ts` (sparse — must be completed)
- `src/platform/architecture/route-plane-map.ts`, `route-registry.ts`
- 17 CI checks under `scripts/architecture/checks/` already gating `check-admin-domain-budget`, `check-admin-page-classification-coverage`, `check-admin-route-coherence`, etc.

**Real risks identified:**
1. AdminRoutes is a 446-line "museum" with one route per page.
2. 121 investment-office pages mounted as flat routes under `experimental-routes.tsx`.
3. User domain route families have zero redirects — moves will break bookmarks.
4. No `generated/page-consolidation/` outputs exist yet.
5. `src/admin/modules/` directory exists but is empty of canonical module pages.

---

## Phase 0 — Truth Baseline (read-only, deploy-safe)

**Goal:** establish ground truth before any code moves.

1. Generate `generated/page-consolidation/PAGE_SURFACE_AUDIT.md` + `page-surface-map.json` by extending `scripts/architecture/checks/check-page-registry-completeness.ts` to emit a full classification table.
2. Auto-classify every page by:
   - filename prefix (matches existing `CLUSTER_DOMAIN_MAP`)
   - import graph (is it referenced by a `<Route>`? by nav? by command palette?)
   - LOC + dependency count (thin pages are merge candidates)
3. Write 4 base outputs: `PAGE_CURRENT_TO_TARGET_MAP.md`, `DUPLICATE_AND_OVERLAPPING_PAGES.md`, `EXPERIMENTAL_AND_PHASED_SURFACES.md`, `CANONICAL_ROUTE_OWNERSHIP.md`.
4. **Zero code changes. Zero route changes.** Build passes unchanged.

**Deployable:** ✅ Pure additive artifacts.

---

## Phase 1 — Complete the Admin Consolidation Map (governance only)

**Goal:** every one of the 539 admin pages has a registry entry so CI gate `check-admin-page-classification-coverage` covers 100% (currently 5%).

1. Bulk-populate `admin-page-consolidation-map.ts` using the auto-classifier from Phase 0 — one entry per page with `targetDomain`, `targetRoute`, `pageClass`, `mergeInto`.
2. Hand-curate the ~50 ambiguous entries (AIG/AIT/MC/SAG clusters with overlapping domains).
3. Emit `ADMIN_SURFACE_CONSOLIDATION.md` showing: which 12 stay as `PRIMARY_DOMAIN_ENTRY`, which become `SECONDARY_SUBVIEW`, which become `DETAIL_EXPLORER`, which become `DUPLICATE_MERGE_REQUIRED`.
4. **No file moves. No route changes.** Only the registry grows.

**Deployable:** ✅ Registry-only change.

---

## Phase 2 — Redirect & Alias Layer (zero-deletion bookmark safety)

**Goal:** make every legacy admin route URL resolve to its canonical target *before* any page moves.

1. Create `src/admin/redirects/admin-redirect-map.ts` — generated from `admin-page-consolidation-map.ts` where `pageClass ∈ {DUPLICATE_MERGE_REQUIRED, DEPRECATE_WITH_REDIRECT}`.
2. In `AdminRoutes.tsx`, mount these as `<Route path={old} element={<Navigate to={canonical} replace />} />` *alongside* (not replacing) existing routes.
3. Same pattern for user domains: add `src/routes/redirects/user-redirect-map.ts` mounted in each route family.
4. Emit `REDIRECT_AND_ALIAS_MAP.md` + `redirect-alias-map.json`.
5. Add CI gate `check-redirect-coverage.ts` ensuring every consolidation-map entry marked deprecated has a live redirect.

**Deployable:** ✅ Both old and new URLs work; nothing broken; bookmarks safe forever.

---

## Phase 3 — Canonical Admin Module Pages (12 hubs)

**Goal:** mount the 12 canonical `PRIMARY_DOMAIN_ENTRY` pages as proper hubs at `/admin/<domain>`.

1. For each of the 12 domains (overview, alerts, approvals, environments, ai-runtime, integrations, trust-security, health, releases, verification, config, support):
   - Use existing hub page if classified `PRIMARY_DOMAIN_ENTRY`, else create `src/admin/modules/<domain>/<Domain>HubPage.tsx`.
   - Hub composes existing pages as **lazy-loaded subview tabs** via existing `DomainHubLayout` + `WorkflowStepStub` components (already in `src/components/admin/hubs/`).
2. Subviews are rendered via `<Outlet />` so `/admin/ai-runtime/providers` still deep-links.
3. Existing flat routes remain mounted (Phase 2 redirects already point them here).
4. Run `check-admin-domain-budget` (≤12) + `check-admin-shell-consistency`.

**Deployable:** ✅ Hubs ship; legacy routes still work via redirects from Phase 2.

---

## Phase 4 — User Domain Shell Pages

**Goal:** apply the same shell+views pattern to user domains where sprawl is highest (investment-office: 121 routes, business: 46, money: 37, concierge: 20).

1. **Investment Office (highest priority):** create `src/features/investment-office/pages/InvestmentShellPage.tsx`. Most of the 41 listed pages (BeginnerMode, AdvancedMode, OperatingModes, etc.) become tabs/views under `/investment` with deep-linkable sub-routes; only 8–10 remain as standalone pages (Boardroom, MarketExplorer, PortfolioOffice, ExecutionDesk, RiskOffice, ResearchLibrary, FamilyOffice, KnowledgeGraph).
2. Repeat lighter consolidation for `business`, `money`, `concierge`, `files`, `boardroom`.
3. Emit `USER_DOMAIN_SURFACE_CONSOLIDATION.md`.
4. Wire all old paths through Phase 2 redirect map.

**Deployable:** ✅ Each domain ships independently; nothing forces all-or-nothing.

---

## Phase 5 — Convert Thin Pages to Embedded Views

**Goal:** physically relocate pages classified `SECONDARY_SUBVIEW` / `DETAIL_EXPLORER` from `src/pages/**` into their owning hub's `views/` directory.

1. Move file (no logic changes, only path).
2. Update import in the hub.
3. Remove the standalone `<Route>` entry (the Phase 2 redirect now becomes the only public path).
4. Strict per-domain batches (one PR-sized wave per domain) so each wave is independently revertible.
5. Run full CI per wave: `check-admin-route-coherence`, `check-page-registry-completeness`, `check-route-page-contract-layer-usage`, `check-surface-ownership`, build, type-check, route-coverage.test.ts.

**Deployable:** ✅ Each wave ships green; redirects keep deep links alive.

---

## Phase 6 — Experimental & Flag-Gated Surfaces

**Goal:** correctly classify surfaces that exist but should not count as launch surfaces.

1. Walk `src/routes/experimental-routes.tsx` — flag every entry as either `live` (move to canonical family) or `experimental` (gate behind `check-launch-honesty-rules`).
2. Emit `EXPERIMENTAL_AND_PHASED_SURFACES.md`.
3. Add CI gate `check-experimental-isolation.ts` — experimental routes must not appear in launcher, command palette, or default nav.

**Deployable:** ✅ Pure governance/gating change.

---

## Phase 7 — Final Verification & Cleanup

**Goal:** prove zero regressions and tighten the bundle.

1. Generate `PAGE_VERIFICATION_RESULTS.md` + `page-verification-results.json` covering: route integrity, build integrity, import integrity, redirect integrity, admin nav integrity, command palette integrity, route manifest integrity.
2. Add lazy boundaries per domain shell (manualChunks in `vite.config.ts` keyed by plane).
3. Only after CI green for two waves: process `REMOVE_AFTER_SAFE_MIGRATION` entries (still preserves the redirect — only the duplicate physical file leaves).

**Deployable:** ✅ Final state — same functionality, materially fewer canonical routes, every old URL still resolves.

---

## What is *not* in this plan (explicit)

- ❌ No mass page deletion.
- ❌ No removal of any operator workflow.
- ❌ No collapse of investment-office into one mega-page.
- ❌ No breaking of `/admin/<legacy>` URLs — every one is redirected.
- ❌ No edits to the user/operator profile model or plane registry.

## Files / artifacts produced

```text
generated/page-consolidation/
├─ PAGE_SURFACE_AUDIT.md
├─ PAGE_CURRENT_TO_TARGET_MAP.md
├─ CANONICAL_ROUTE_OWNERSHIP.md
├─ REDIRECT_AND_ALIAS_MAP.md
├─ ADMIN_SURFACE_CONSOLIDATION.md
├─ USER_DOMAIN_SURFACE_CONSOLIDATION.md
├─ DUPLICATE_AND_OVERLAPPING_PAGES.md
├─ EXPERIMENTAL_AND_PHASED_SURFACES.md
├─ PAGE_VERIFICATION_RESULTS.md
├─ page-surface-map.json
├─ canonical-route-map.json
├─ redirect-alias-map.json
├─ duplicate-page-map.json
└─ page-verification-results.json

src/admin/redirects/admin-redirect-map.ts            (Phase 2)
src/routes/redirects/user-redirect-map.ts            (Phase 2)
src/admin/modules/<12 domains>/<Domain>HubPage.tsx   (Phase 3)
src/features/<domain>/pages/<Domain>ShellPage.tsx    (Phase 4)
scripts/architecture/checks/check-redirect-coverage.ts        (new)
scripts/architecture/checks/check-experimental-isolation.ts   (new)
```

## Phase ship order (each independently deploy-ready)

```text
P0 audit  →  P1 registry  →  P2 redirects  →  P3 admin hubs
        ↘                                  ↘
         P6 experimental gating             P4 user shells  →  P5 view migration  →  P7 verify
```

After approval I'll start with **Phase 0 + Phase 1** in the same wave (lowest risk, biggest visibility win).

