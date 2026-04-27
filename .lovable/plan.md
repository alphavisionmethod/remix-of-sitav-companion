# SITA OS — Module Information Architecture Cleanup

## Background — What's actually in the repo

I audited the real surfaces. Three facts shape this plan:

1. **`/business/*`, `/concierge/*`, `/money/*` are SHIM ROUTES**, not real pages. Every business route currently renders `BusinessCenter`, which dispatches a `sita-open-business` event with a `module` slug, and redirects to `/desktop`. The actual pages live inside windowed app shells (`BusinessAppShell`, `ConciergeAppShell`, `FinanceAppShell`) that switch on the slug. So "shell-internal vs route-level" is not a binary — it is **(a) is the slug deep-linkable from a route?** and **(b) is the slug exposed in the in-app sidebar?**
2. **A canonical IA layer already exists**: DB-backed `module_registry` + `route_ownership` (read via `src/platform/registry/module-registry.ts`), plus `src/routes/redirects/user-redirect-map.ts` already redirecting plural `/investments/*` → singular `/investment/*`. Both are under-populated and under-enforced. We will **extend**, not replace.
3. **Page-role taxonomy does NOT exist**. The `_config/*.config.ts` files are per-page constants only. We must create one canonical role system.

The mess is real and confirmed:
- Business sidebar shows three rooms doing one job: **Revenue Autopilot** (id `revenue-autopilot`), **Autopilot Hub** (id `autopilot-hub`), and **Revenue Impact** (id `revenue-impact`) — all in the "Growth" / "Intelligence" groups.
- Business has **two opportunity surfaces**: the deep-linked `OpportunitiesCenter` (page) and `OpportunityEngine` (a service the page calls). The service is fine; the issue is the *page* is also called "Center" while the *engine* (service) name leaks into nav vocabulary.
- Concierge has overlapping rooms: `ConciergeCenter`, `LifeAdminCenter`, `HouseholdCommandCenter`, `LifeDashboard`, `PersonalLifeWorkspace` — only some are wired into the shell's `PAGE_COMPONENTS` (LifeDashboard and PersonalLifeWorkspace are NOT mounted = orphans).
- Finance route consolidation is **partially done** (`/investments/*` → `/investment/*` redirects are in place for ~30 routes), but legacy `/investments/*` declarations still exist in `experimental-routes.tsx` and `BusinessOverview.tsx` lives in two folders (`src/modules/business/pages/BusinessOverview.tsx` and `src/pages/business/BusinessOverview.tsx`).
- Existing route-truth artifact at `generated/historical/architecture-remediation/route-truth-map.json` is in `historical/` and stale.

## Canonical Role Taxonomy (adopted across all modules)

| Role | Meaning | Naming suffix | Route-deep-linkable? | In sidebar? |
|---|---|---|---|---|
| `overview` | Module landing — "the dashboard" | `Overview` | Yes | Yes (top) |
| `workspace` | Operator daily surface — list/work view | `Workspace` / domain noun | Yes | Yes |
| `engine` | Stateful automation/decision surface — *user faces it*, service still named `*Engine` underneath | `Autopilot` / `Engine` | Yes | Yes |
| `control-plane` | Configures rules/policies for an engine | `Console` (was: Hub) | Yes | Yes |
| `boardroom` | Multi-advisor council surface | `Boardroom` | Yes | Yes |
| `proof` | Evidence / continuity / receipts | `Proof` | Yes | Yes |
| `settings` | Module preferences | `Settings` | Yes | Yes (bottom) |
| `room` | Single-purpose deep work surface (Deal Room, War Room) | `Room` | Yes | Yes |
| `internal` | Shell-internal — reachable from sub-tabs of another page only | n/a | **No route** | No |
| `labs` | Experimental — flag-gated, hidden from default sidebar | n/a | Behind `feature_flag` | Conditional |
| `archived` | Deprecated — file kept for diff history, removed from registry/shell | n/a | **No route** | No |

`Center` / `Hub` / `Office` are deprecated as IA suffixes — they are the **primary source of confusion**. They will survive only as legacy *display strings* where rebranding is too risky for one release.

---

## Phase 1 — Page-Role Registry foundation
**Outcome:** A single typed registry that every module shell, sidebar, route shim, command palette, and validator reads. Phase only ships when it (a) compiles, (b) is consumed by at least one app shell, and (c) is covered by a validator test.

- New: `src/platform/ia/page-role.ts` exporting `PageRole` enum + `PageDescriptor` type (id, role, label, route, sidebarVisible, status, replacedBy?).
- New: `src/platform/ia/module-ia-manifest.ts` — three exports `BUSINESS_IA`, `CONCIERGE_IA`, `FINANCE_IA`. Each is a `PageDescriptor[]` with the cleaned-up names from Phases 2–4.
- New: `src/__tests__/ia/page-role-manifest.test.ts` — asserts every BusinessAppShell / ConciergeAppShell / FinanceAppShell `PAGE_COMPONENTS` key is in the manifest, and every manifest descriptor maps to a real component import.
- Validator script: `scripts/architecture/checks/check-ia-manifest-coverage.ts`, wired into the existing `check-ia-coherence.ts` aggregate.

## Phase 2 — Business IA cleanup
**Outcome:** No two surfaces share a role. All three "autopilot" rooms collapse into a clear hierarchy. Sidebar groups reflect the role taxonomy.

| Old surface | Action | New canonical |
|---|---|---|
| `RevenueAutopilot` (page, slug `revenue-autopilot`) | **Keep** — this is the **engine** surface (live runs, status). | `RevenueAutopilot` (role: `engine`, label "Revenue Autopilot") |
| `AutopilotHub` (page, slug `autopilot-hub`) | **Rename** → `RevenueAutopilotConsole`. This is the **control-plane** for Autopilot — rules, policies, kill-switches. | slug `revenue-autopilot-console`, label "Autopilot Console" |
| `RevenueImpactDashboard` (page, slug `revenue-impact`) | **Demote** to internal tab inside `RevenueOpsHome` (it is the impact analytics view, not a top-level destination). Removed from sidebar; route slug kept as 301-style internal redirect → `/business/revenue-home?tab=impact`. | role: `internal` |
| `OpportunitiesCenter` (page, slug `opportunities`) | **Rename** file & component → `OpportunitiesWorkspace`. Slug stays `opportunities`. Service `OpportunityEngine` is unchanged (not a page). | role: `workspace`, label "Opportunities" |
| `CollectionsCommandCenter` (page, slug `collections`) | **Rename** → `CollectionsWorkspace`. | role: `workspace`, label "Collections" |
| `CustomerSupportCenter` | **Rename** → `SupportWorkspace`. | role: `workspace`, label "Support" |
| `BackgroundTaskCenter` | **Rename** → `BackgroundTasks`. | role: `internal` (kept in System group) |
| `FollowThroughCenter` | **Rename** → `FollowThroughWorkspace`. | role: `workspace` |
| `CRMImportCenter` | **Rename** → `CRMImport`. | role: `workspace` |
| `CRMIntegrationHub` | **Rename** → `CRMIntegrations`. | role: `workspace` |
| `LifeAdminCenter` (concierge — handled in Phase 3) | — | — |
| `BusinessCenter` shim file | **Keep** — it is the route shim, not a destination. Add file-header comment explaining role. | role: `internal` |
| `BusinessOverview` duplicate at `src/pages/business/BusinessOverview.tsx` | **Delete duplicate**, keep canonical at `src/modules/business/pages/BusinessOverview.tsx`. | — |

**Files touched (Phase 2 — wiring):**
- `src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx` — rename imports, `pages` map keys, sidebar labels.
- `src/modules/business/pages/BusinessCenter.tsx` — update `subpageFromPath` slugs (add `revenue-autopilot-console`).
- `src/routes/families/business-routes.tsx` — replace `autopilot-hub` route with `revenue-autopilot-console`; remove `revenue-impact` route (replaced by redirect entry).
- `src/routes/redirects/user-redirect-map.ts` — add 3 new redirects: `/business/autopilot-hub` → `/business/revenue-autopilot-console`, `/business/revenue-impact` → `/business/revenue-home`.
- `src/lib/business-launcher.ts` — update sidebar slug constants.
- All `import` callsites of renamed components.
- `src/platform/ia/module-ia-manifest.ts` — populate `BUSINESS_IA`.

Phase ships only when `bunx vitest run src/__tests__/business-os/` and `tsc --noEmit` are clean and the `check-ia-manifest-coverage` validator passes for Business.

## Phase 3 — Concierge IA cleanup
**Outcome:** Five overlapping "life" surfaces reduced to a clear three-tier hierarchy.

| Old surface | Action | New canonical |
|---|---|---|
| `ConciergeOverview` (slug `overview`) | **Keep** as overview. | role: `overview` |
| `LifeDashboard` (page file, **NOT mounted** in shell) | **Archive** — duplicate of Overview. Move file to `src/modules/concierge/pages/_archived/LifeDashboard.tsx`. | role: `archived` |
| `PersonalLifeWorkspace` (page file, **NOT mounted** in shell) | **Archive** — superseded by Overview + per-area workspaces. | role: `archived` |
| `HouseholdCommandCenter` (slug `household`) | **Rename** → `HouseholdWorkspace`. | role: `workspace`, label "Household" |
| `LifeAdminCenter` (slug `life-admin`) | **Rename** → `LifeAdminWorkspace`. | role: `workspace`, label "Life Admin" |
| `ConciergeCenter` shim file | **Keep** — route shim. Header comment added. | role: `internal` |
| `ConciergeBoardroom` vs `FamilyBoardroom` | Shell mounts `FamilyBoardroom` for slug `boardroom`; `ConciergeBoardroom` is unused. **Archive** `ConciergeBoardroom`. | `FamilyBoardroom` is canonical. |

**Files touched (Phase 3 — wiring):**
- `src/platform/sita/components/sita/apps/concierge/ConciergeAppShell.tsx` — rename imports, sidebar labels.
- `src/modules/concierge/pages/ConciergeCenter.tsx` — keep slug map (no slug renames; only file/component renames).
- `src/modules/concierge/pages/index.ts` (if it re-exports) — drop archived names.
- Move 3 files into `_archived/`.
- `src/platform/ia/module-ia-manifest.ts` — populate `CONCIERGE_IA`.

Phase ships only when concierge tests pass and grep shows zero non-archived imports of `LifeDashboard` / `PersonalLifeWorkspace` / `ConciergeBoardroom`.

## Phase 4 — Finance IA cleanup + `/investment/*` final consolidation
**Outcome:** `/investment/*` is the **only** route namespace. `/investments/*` exists exclusively in `user-redirect-map.ts`. Money-vs-Investment hierarchy is explicit.

- Audit `src/routes/families/experimental-routes.tsx` — remove any remaining `Route path="/investments/..."` declarations (stale per file-header comment but possibly still active). Migrate any unique routes into `investment-office-routes.tsx`.
- `MoneyCenter` (slug `money` shim) → role `internal` (header comment).
- `WealthCommandCenter` (page) → currently file-only. Verify mount in `FinanceAppShell` — if mounted, **rename** → `WealthWorkspace`; if orphaned, archive.
- `InvestmentShellPage` → audit. If it is a wrapper used by routes, keep but document role; if it's another shim, mark `internal`.
- `CapitalAllocationPage` → 8 references. If reachable from `/money/*`, give it canonical slug `capital-allocation` (currently maybe ambiguous); else archive.
- `MoneyApprovals` (slug `approvals`) → keep as `workspace`.
- `MoneyOnboarding` → keep as `workspace` but mark `sidebarVisible: false` (only shown via onboarding flow).
- Add 4 missing `/investments/*` → `/investment/*` redirects identified by audit (any `experimental-routes.tsx` paths not yet in the redirect map).
- Add **one consolidated audit** test: `src/__tests__/architecture/finance-investment-singular-namespace.test.ts` — extends existing `investment-route-namespace.test.ts` to also check `experimental-routes.tsx` and the `MoneyCenter` slug map.

**Files touched (Phase 4):**
- `src/routes/families/experimental-routes.tsx` — strip plural routes.
- `src/routes/families/investment-office-routes.tsx` — absorb any unique routes.
- `src/routes/redirects/user-redirect-map.ts` — close the gap.
- `src/platform/sita/components/sita/apps/finance/FinanceAppShell.tsx` — rename labels.
- `src/platform/ia/module-ia-manifest.ts` — populate `FINANCE_IA`.

Phase ships only when `rg "/investments/" src/routes/` returns zero non-redirect-map matches and `investment-route-namespace.test.ts` + new finance test pass.

## Phase 5 — Shell-vs-Route boundary rules (codified, not just documented)
**Outcome:** Mechanical rule, enforced by validator, for whether a slug gets a route shim.

Rule (encoded in `PageDescriptor`):
- `role` ∈ {`overview`, `workspace`, `engine`, `control-plane`, `boardroom`, `proof`, `settings`, `room`} ⇒ **must** have a route shim entry in the corresponding family file.
- `role` ∈ {`internal`} ⇒ **must not** have a route shim. Reachable only via in-app sub-nav.
- `role` ∈ {`labs`} ⇒ shim allowed only if `feature_flag` is set.
- `role` ∈ {`archived`} ⇒ no shim, no shell mount, no sidebar.

Validator: `scripts/architecture/checks/check-shell-route-boundary.ts`. Reads the manifest, the route-family files, and each `*AppShell` page map; fails on any mismatch.

Test: `src/__tests__/ia/shell-route-boundary.test.ts` invokes the validator script.

Phase ships only when the validator returns zero violations.

## Phase 6 — Hide / archive weak / orphaned pages
**Outcome:** No mounted page lacks a clear role.

- Survey output of grep for every page file under `src/modules/{business,concierge,finance}/pages/**`. For each: confirm (a) imported by an app shell, (b) reachable via slug, (c) listed in a sidebar group.
- For pages failing (a) or (b): move to `_archived/` under the module's `pages/` folder (single canonical location, per Concierge precedent).
- For pages reachable but not in a sidebar (intentional `internal` role): set `sidebarVisible: false` in the manifest.
- Update `module_registry` DB rows: insert/update for each canonical page, set `lifecycle = 'legacy'` for archived ones (nightly job already supports this enum). Migration via `supabase--migration`.

Phase ships only when every file in `pages/` is either (manifest entry with role) OR (in `_archived/`).

## Phase 7 — Naming normalization sweep
**Outcome:** `Center` / `Hub` / `Office` removed as **suffixes** for non-canonical surfaces. Surviving usages are documented exceptions.

- Codemod: in component file names + class names + sidebar `label` strings, apply renames table from Phases 2–4.
- Documented exceptions (kept by intent, with rationale in manifest comment):
  - `InvestmentOffice` route slug (industry term — wealth-management vocabulary).
  - `FamilyOffice`, `RiskOffice`, `PortfolioOffice` (same reason — these are real wealth-management terms).
  - `WarRoom`, `CatalystWarRoom` (intentional "Room" vocabulary for crisis surfaces).
- Add a **naming-grammar lint**: `scripts/architecture/checks/check-page-naming-grammar.ts` — bans `Center` / `Hub` suffix in any page-component class name **unless** the manifest descriptor for that page has `legacyNameAllowed: true`.

Phase ships only when the grammar validator passes.

## Phase 8 — Truth Map + cleanup report + cumulative validation
**Outcome:** A single, authoritative, machine-generated route+nav truth map plus a human-readable cleanup report.

- New: `scripts/architecture/build-route-nav-truth-map.ts` — reads the manifest + route families + redirects + `module_registry` table, emits:
  - `generated/route-and-navigation-truth-map.json` (machine — used by validators).
  - `generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md` (human — module → canonical route → page name → role → route-level/internal → sidebar visibility → redirects → notes).
- New: `generated/audits/SITA_OS_MODULE_INFORMATION_ARCHITECTURE_CLEANUP_REPORT.md` — sections 1–12 from the request, populated from real diff output (old name, new name, files changed, role, validator that protects it).
- Cumulative test: `src/__tests__/ia/ia-truth-map.test.ts` — asserts the JSON truth map matches the live state of routes + manifest + shells (no drift).
- Final run: full `bunx vitest run src/__tests__/ia/ src/__tests__/architecture/` + `tsc --noEmit` + all four IA validator scripts.

Phase ships only when **all** of: every IA test green, validators green, type-check clean, no orphaned imports, redirect map covers every renamed slug.

---

## Per-change discipline applied to every rename in Phases 2–4

For each renamed/moved/hidden surface, the diff will show:
1. **Old problem** (e.g., "two pages claim 'autopilot' role")
2. **New canonical name + role** (e.g., "RevenueAutopilotConsole, role=control-plane")
3. **Files changed** (component file, app shell, route family, redirect map, business launcher, manifest, tests)
4. **Duplication-avoidance check** (confirmed only by extending `module-registry`/`user-redirect-map`/`module-ia-manifest`, never by introducing a parallel registry)
5. **Protecting validator** (which test in Phase 1/5/7/8 will fail if this regresses)

## Order of execution & ship gate

Phases run **strictly sequentially**. A phase is "100% complete and deployment-ready" when:
- All listed files are modified.
- `tsc --noEmit` is clean.
- The phase-specific test suite is green.
- The phase's named validator script returns zero errors.
- Grep checks listed in the phase's "Phase ships only when..." line return the expected empty/full result.

Only then does the next phase begin. No interleaving, no stub files, no parallel IA structures.

## Files NOT touched (and why)

- `src/integrations/supabase/client.ts`, `types.ts`, `.env`, `supabase/config.toml` (auto-generated / project-config).
- `module_registry` & `route_ownership` table **schemas** (extend rows, not columns).
- `BoardroomAppShell`, `MissionControlAppShell`, `AppStoreAppShell` — out of scope for this pass (admin/owner surfaces have their own IA report at `docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md`).
- Mobile / Health / Trust modules — not flagged in the request and have far less drift; revisit in a follow-up if Phase 8's truth map exposes problems.

## Expected final deliverables

- 1 page-role taxonomy (`src/platform/ia/page-role.ts`).
- 1 module-IA manifest (`src/platform/ia/module-ia-manifest.ts`).
- 4 validator scripts under `scripts/architecture/checks/`.
- 1 truth-map builder under `scripts/architecture/`.
- 2 generated audit reports under `generated/audits/`.
- 5+ vitest suites under `src/__tests__/ia/`.
- ~15–20 page-component renames + ~3 archives in `_archived/` folders.
- ~6 new redirect entries in `user-redirect-map.ts`.
- 0 new route registries, 0 new nav systems, 0 parallel IA structures.