# Page Surface Audit
> Generated: 2026-04-18T11:33:37.229Z
> Source: `scripts/architecture/audits/page-consolidation-audit.ts`
> Status: **read-only audit** (Phase 0). Zero code/route changes.

## Summary

| Metric | Value |
|---|---|
| Total pages on disk (`src/pages/**`) | **1042** |
| Total mounted routes | **661** |
| Admin pages | 539 |
| User-domain pages | 130 |
| Internal / owner pages | 325 |
| Dev / experimental pages | 48 |

## Admin pages by canonical domain

| Domain | Page count | Hub path |
|---|---:|---|
| Overview | 19 | `/admin/overview` |
| Alerts | 7 | `/admin/alerts` |
| Approvals | 5 | `/admin/approvals` |
| Environments | 10 | `/admin/environments` |
| AI Runtime | 105 | `/admin/ai-runtime` |
| Integrations | 82 | `/admin/integrations` |
| Trust & Security | 40 | `/admin/trust-security` |
| Health | 73 | `/admin/health` |
| Releases | 53 | `/admin/releases` |
| Verification | 101 | `/admin/verification` |
| Config | 10 | `/admin/config` |
| Support | 34 | `/admin/support` |

## Admin pages by classification

| Class | Count |
|---|---:|
| DETAIL_EXPLORER | 501 |
| SECONDARY_SUBVIEW | 14 |
| DUPLICATE_MERGE_REQUIRED | 13 |
| PRIMARY_DOMAIN_ENTRY | 8 |
| WORKFLOW_TOOL | 3 |

## User-domain page counts

| Domain | Page count |
|---|---:|
| business | 49 |
| money | 34 |
| concierge | 21 |
| files | 9 |
| settings | 9 |
| apps | 6 |
| boardroom | 2 |

## Mounted routes by family

| Route family | Routes |
|---|---:|
| AdminRoutes | 190 |
| experimental-routes | 120 |
| os-routes | 107 |
| business-routes | 46 |
| OwnerRoutes | 37 |
| money-routes | 37 |
| MobileRoutes | 25 |
| boardroom-routes | 25 |
| concierge-routes | 20 |
| files-routes | 18 |
| investment-routes | 18 |
| advisor-routes | 12 |
| apps-routes | 2 |
| communications-routes | 2 |
| settings-routes | 2 |
| AdminRootLanding | 0 |

## Thin pages (LOC < 80) — strong merge candidates

**67 thin admin pages identified.** These are top candidates for conversion to embedded views (Phase 5).

- `src/pages/admin/AIT04ActivityFeedPage.tsx` (3 LOC) → /admin/ai-runtime/activity-feed
- `src/pages/admin/AIT06RecommendationsPage.tsx` (3 LOC) → /admin/ai-runtime/recommendations
- `src/pages/admin/AIT07ApprovalQueuePage.tsx` (5 LOC) → /admin/approvals/ai-team
- `src/pages/admin/AIT08LaunchTruthPage.tsx` (3 LOC) → /admin/ai-runtime/launch-truth
- `src/pages/admin/AdminRunbookViewerPage.tsx` (13 LOC) → /admin/overview/dmin-runbook-viewer
- `src/pages/admin/CAI04ContinuityCenter.tsx` (49 LOC) → /admin/ai-runtime/continuity
- `src/pages/admin/CAI05TrustActionsBoard.tsx` (55 LOC) → /admin/ai-runtime/trust-actions-board
- `src/pages/admin/CAI06ChiefOfStaffCenter.tsx` (79 LOC) → /admin/ai-runtime/chief-of-staff
- `src/pages/admin/CAI07TimingStudio.tsx` (53 LOC) → /admin/ai-runtime/timing-studio
- `src/pages/admin/CAI08RelationshipCenter.tsx` (60 LOC) → /admin/ai-runtime/relationship
- `src/pages/admin/CAI10ModesCenter.tsx` (70 LOC) → /admin/ai-runtime/modes
- `src/pages/admin/CAI11InterfaceProfiler.tsx` (65 LOC) → /admin/ai-runtime/interface-profiler
- `src/pages/admin/CAI12OpportunityBoard.tsx` (64 LOC) → /admin/ai-runtime/opportunity-board
- `src/pages/admin/CAI14BoundaryControl.tsx` (53 LOC) → /admin/ai-runtime/boundary-control
- `src/pages/admin/CN02ConnectorRegistryConsole.tsx` (72 LOC) → /admin/integrations/connector-registry-console
- `src/pages/admin/CN03AccountLinkageBoard.tsx` (70 LOC) → /admin/integrations/account-linkage-board
- `src/pages/admin/CompositorDebugPage.tsx` (18 LOC) → /admin/verification/ompositor-debug
- `src/pages/admin/DRS02ModeRegistryConsole.tsx` (69 LOC) → /admin/health/mode-registry-console
- `src/pages/admin/DRS03ScenarioLibrary.tsx` (70 LOC) → /admin/health/scenario-library
- `src/pages/admin/DRS05ProviderConsole.tsx` (71 LOC) → /admin/health/provider-console
- `src/pages/admin/DRS07DemoAIControl.tsx` (70 LOC) → /admin/health/demo-a-i-control
- `src/pages/admin/DRS08AnalyticsSegregation.tsx` (67 LOC) → /admin/health/analytics-segregation
- `src/pages/admin/DRS09TruthLabeling.tsx` (77 LOC) → /admin/health/truth-labeling
- `src/pages/admin/DependencyMapViewer.tsx` (76 LOC) → /admin/verification/ependency-map-viewer
- `src/pages/admin/DeploymentUnitExplorer.tsx` (69 LOC) → /admin/releases/eployment-unit-explorer

…and 42 more (see `page-surface-map.json`)
