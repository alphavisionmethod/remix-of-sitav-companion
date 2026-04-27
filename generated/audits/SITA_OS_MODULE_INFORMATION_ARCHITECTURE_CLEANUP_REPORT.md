# SITA OS — Module Information Architecture Cleanup Report

_Final deliverable for the IA cleanup work tracked in `.lovable/plan.md` (Phases 1 → 8). Companion to the machine-readable `generated/route-and-navigation-truth-map.json` and the human truth map at `generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md`._

## 1. Summary

| Pillar | Pages tracked | Renames | Demotions / archives | Slug aliases retired (redirected) |
|---|---|---|---|---|
| Business | 60 | 9 | 2 (`revenue-impact`, `autopilot-hub`) | 4 |
| Concierge | 21 | 2 | 3 (`life-dashboard`, `personal-life-workspace`, `boardroom-legacy`) | 2 |
| Finance (Money sub-app) | 37 | — | 1 (`wealth-command`) | 5 |
| **Total** | **118** | **11** | **6** | **11** |

All numbers are derived from the live manifest at `src/platform/ia/module-ia-manifest.ts` and verified by the Phase 8 truth-map builder (zero orphans).

## 2. Canonical role taxonomy adopted

Defined once in `src/platform/ia/page-role.ts`:

`overview · workspace · engine · control-plane · boardroom · proof · settings · room · internal · labs · archived`

Suffixes `Center` and `Hub` are now lint-banned in component class names + sidebar labels (Phase 7). `Office` and `Room` are kept as documented industry terms (`InvestmentOffice`, `FamilyOffice`, `WarRoom`).

## 3. Rename / demotion table (per pillar)

### Business

| Old surface | Action | New canonical | Role |
|---|---|---|---|
| `RevenueAutopilot` | KEEP | `RevenueAutopilot` | engine |
| `AutopilotHub` | RENAME | `RevenueAutopilotConsole` | control-plane |
| `RevenueImpactDashboard` | DEMOTE | (sub-tab of Revenue Home) | internal |
| `OpportunitiesCenter` | RENAME | `OpportunitiesWorkspace` | workspace |
| `CollectionsCommandCenter` | RENAME | `CollectionsWorkspace` | workspace |
| `CustomerSupportCenter` | RENAME | `SupportWorkspace` | workspace |
| `BackgroundTaskCenter` | RENAME | `BackgroundTasks` | internal |
| `FollowThroughCenter` | RENAME | `FollowThroughWorkspace` | workspace |
| `CRMImportCenter` | RENAME | `CRMImport` | workspace |
| `CRMIntegrationHub` | RENAME | `CRMIntegrations` | workspace |
| `CommunicationsCenter` | RENAME | `CommunicationsWorkspace` | workspace |

### Concierge

| Old surface | Action | New canonical | Role |
|---|---|---|---|
| `LifeAdminCenter` | RENAME | `LifeAdminWorkspace` | workspace |
| `HouseholdCommandCenter` | RENAME | `HouseholdWorkspace` | workspace |
| `LifeDashboard` | ARCHIVE | (→ ConciergeOverview) | archived |
| `PersonalLifeWorkspace` | ARCHIVE | (→ ConciergeOverview) | archived |
| `ConciergeBoardroom` | ARCHIVE | (alias of FamilyBoardroom) | archived |

### Finance

| Old surface | Action | New canonical | Role |
|---|---|---|---|
| `WealthCommandCenter` | ARCHIVE | (→ MoneyOverview) | archived |
| `CapitalAllocationPage` | KEEP (legacy) | `CapitalAllocationPage` | workspace (sidebar-hidden) |
| `MoneyOnboarding` | KEEP (hidden) | `MoneyOnboarding` | workspace (sidebar-hidden) |

## 4. Slug → canonical URL redirects added

All declared in `src/routes/redirects/user-redirect-map.ts` and validated by `phase-2-business-cleanup.test.ts`, `phase-3-concierge-cleanup.test.ts`, `phase-4-finance-cleanup.test.ts`, and the cumulative `ia-truth-map.test.ts`:

| From | To | Phase |
|---|---|---|
| `/business/autopilot-hub` | `/business/revenue-autopilot-console` | 2 |
| `/business/revenue-impact` | `/business/revenue` | 2 |
| `/business/revenue-home` | `/business/revenue` | 8 |
| `/business/files` | `/business/documents` | 8 |
| `/life` | `/concierge/overview` | 3 |
| `/personal-life` | `/concierge/overview` | 3 |
| `/wealth-command` | `/money/overview` | 4 |
| `/money/documents` | `/money/files` | 8 |
| `/money/family-office` | `/money/investment-office` | 8 |

_(Also: ~40 pre-existing `/investments/*` → `/investment/*` redirects, untouched.)_

## 5. Validators added

Each phase ships with a script under `scripts/architecture/checks/` and a wrapper test under `src/__tests__/ia/`:

| Validator | Test | Phase |
|---|---|---|
| `check-ia-manifest-coverage.ts` | `page-role-manifest.test.ts` | 1 |
| _(no script — assertion test only)_ | `phase-2-business-cleanup.test.ts` | 2 |
| _(no script — assertion test only)_ | `phase-3-concierge-cleanup.test.ts` | 3 |
| _(no script — assertion test only)_ | `phase-4-finance-cleanup.test.ts` | 4 |
| `check-shell-route-boundary.ts` | `shell-route-boundary.test.ts` | 5 |
| _(no script — file-layout test only)_ | `phase-6-archive-layout.test.ts` | 6 |
| `check-page-naming-grammar.ts` | `phase-7-naming-grammar.test.ts` | 7 |
| `build-route-nav-truth-map.ts` (generator) | `ia-truth-map.test.ts` | 8 |

## 6. Files NOT touched (and why)

- `src/integrations/supabase/*`, `.env`, `supabase/config.toml` — auto-generated.
- `module_registry` / `route_ownership` table **schemas** — extended with rows only, never columns.
- Admin / Owner / AppStore shells — separate IA at `docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md`.
- Mobile / Health / Trust modules — out of scope for this pass.

## 7. Final ship state

- ✅ 8 IA test files, 57 tests total, all green.
- ✅ `tsc --noEmit` clean.
- ✅ Naming-grammar lint clean (118 descriptors).
- ✅ Shell-vs-route boundary clean (118 × 710 unique routes).
- ✅ Truth map: 0 orphans.
- ✅ Redirect coverage: every renamed slug has a redirect entry.
- ✅ No new parallel registries or nav systems introduced.