

# SITA OS — Information Architecture Compression & Page Consolidation

## Scale of Work

| Category | Current Count |
|----------|--------------|
| Total page files | 975 |
| Admin pages | 495 |
| Route definitions | ~588 |
| Route files | 11 |
| Top-level user destinations | ~40+ competing |
| Admin top-level domains | ~25+ competing |

## Strategy

This is NOT a delete-everything refactor. The existing system already uses a redirect-shim pattern (BusinessCenter, MoneyCenter, ConciergeCenter, AdminCenter all redirect to `/desktop` and open windowed apps). Most "pages" are already internal modules inside windowed app shells like MissionControlAppShell (872 lines, ~140 admin modules).

**The actual work is**: creating the canonical IA registries, route taxonomy, and consolidation maps -- then compressing navigation, adding redirect wrappers for deprecated routes, and normalizing naming.

## Phase 1 — Canonical Route Registry & Page Classification

Create two new architecture files:

### `src/lib/architecture/canonical-route-registry.ts`
- Define the canonical IA taxonomy for both user and admin surfaces
- Map every route to its canonical domain, page class (overview/board/console/workspace/explorer/settings/timeline/detail/studio), deprecation status, and redirect target
- ~10 user domains, ~10 admin domains as defined in the spec

### `src/lib/architecture/page-consolidation-map.ts`
- Classification of all 975 pages: KEEP_AS_PRIMARY, KEEP_AS_SUBVIEW, MERGE_INTO_OTHER_PAGE, REDIRECT_TO_CANONICAL_PAGE, DEPRECATE_WITH_WRAPPER
- Old route -> new route mapping
- Compatibility wrapper flags

## Phase 2 — Define Canonical IA Taxonomy

### User App (10 canonical top-level destinations)
```text
/desktop          — Home/Desktop
/boardroom/*      — Boardroom (today, at-risk, revenue, history, replay)
/business/*       — Business OS (CRM, leads, customers, invoices, operations)
/money/*          — Money OS (bills, cash, receivables, reserves, scenarios)
/concierge/*      — Concierge OS (household, calendar, errands, travel)
/files/*          — Files (explorer, search, processing, sensitive)
/investments/*    — Investment Office (markets, portfolio, strategy, risk)
/revenue-office/* — Revenue Office (pipeline, campaigns, retention)
/digital-presence/* — Digital Presence (builder, brand, analytics)
/settings/*       — Settings
```
Plus system utilities: /search, /notifications, /apps/*, /communications

### Admin Control Plane (10 canonical domains)
```text
/admin/overview              — Executive Overview (merge AdminDashboard + MissionControlHome + AdminOperationsHub)
/admin/users/*               — Users & Environments
/admin/ai-runtime/*          — Advisors, AI Team, Gateway, Models (merge AIG*, AIT*, CAI*, SAG*, advisor-board/*, intelligence/*)
/admin/integrations/*        — Connectors, OAuth, Sync (merge CN*, PFA*, ISA*)
/admin/trust-security/*      — Policies, Security, Proofs (merge SEC*, trust, security/*)
/admin/health/*              — Observability, Incidents, Fleet (merge health pages, fleet, incidents)
/admin/releases/*            — Deployments, Rings, Readiness (merge launch/*, releases)
/admin/verification/*        — Truth, Reality Audit, Conformance (merge ITC*, RCP*, V*, JVC*, CJ*)
/admin/config/*              — Flags, Manifests, Registries (merge PLE*, FIP*, feature flags)
/admin/support/*             — Cases, Diagnostics, Recovery
```
Plus internal planes: /admin/founder/*, /admin/engineering/*, /admin/mc/*, /admin/strategic/*

## Phase 3 — Admin Overlap Resolution

The biggest consolidation targets:

| Concept | Competing Pages | Resolution |
|---------|----------------|------------|
| Executive overview | AdminDashboard, MissionControlHome, AdminOperationsHub, PlatformTruthDashboard | AdminDashboard = primary; others redirect |
| Truth/verification | TruthIndexDashboard, GeneratedTruthDashboard, ITC01-14, RCP01-11, V01-07, JVC01-14, CJ01-09, LaunchHonestyBoard x2 | Keep ITC/RCP/V/JVC/CJ as subviews under /admin/verification; merge overlapping top-level truth dashboards |
| AI runtime | AIG01-09, AIT01-08, SAG01-12, CAI01-15, intelligence/* (12 pages), advisor-board/* (6), strategic/* (12) | Keep as subviews under /admin/ai-runtime; no top-level promotion |
| Security | SEC01-06, SecurityCommandCenter, MCTrustSecurity | SecurityCommandCenter = primary; SEC* as subviews |
| Devices/surfaces | DWE01-07, UAO01-08, MSA01-05, AND01-05, APL01-06, NOT01-05, NRC01-06, HRS01-06, NSS01-04 | Group under /admin/surfaces/* as subview families |
| Cloud admin | 47 Cloud* pages | Already scoped under /admin/cloud; keep as-is |
| Dual Reality | DRS01-10 | Keep under /admin/reality; already coherent |

## Phase 4 — User Surface Compression

| Domain | Competing Pages | Resolution |
|--------|----------------|------------|
| Boardroom | Boardroom, GlobalBoardroom, WeeklyBoardroom, BusinessBoardroom, FinanceBoardroom, MoneyBoardroom, ConciergeBoardroom, FamilyBoardroom, InvestmentBoardroom, GrowthBoardroom, PresenceBoardroom | /boardroom = unified entry; domain boardrooms become tabs/modes inside windowed app |
| Business | BusinessCenter (shim) → 48 pages via CRM + operations | Already well-structured via shim; keep |
| Money | MoneyCenter (shim) → 34 pages | Already well-structured; keep |
| Concierge | ConciergeCenter (shim) → 21 pages + HouseholdCommandCenter, LifeAdminCenter | Keep shim; merge HouseholdCommandCenter + LifeAdminCenter as concierge subviews |
| OS utilities | ~40 standalone pages (clipboard, print, network, etc.) | Keep as system utilities; no top-level nav promotion |

## Phase 5 — Create Compatibility Infrastructure

### Route redirect wrappers
For every deprecated route, add a redirect entry. The existing shim pattern (BusinessCenter dispatches event + redirects to /desktop) is the model. No pages are hard-deleted; they get redirect wrappers.

### Navigation compression
- Update the MissionControlAppShell sidebar groups to match the 10-domain admin IA
- Update Owner sidebar to point to canonical admin domains
- Ensure command palette/search still surfaces deep pages

## Phase 6 — Architecture Governance Files

### `src/lib/architecture/ia-governance.ts`
- Top-level route count guards (max 12 user, max 12 admin)
- Page class validation (every page must have a valid class)
- Duplicate concept detection rules
- Navigation coherence assertions

### Update existing files
- `src/lib/architecture/route-registry.ts` — add canonical domain + page class fields
- `scripts/generate-route-manifest.ts` — add IA domain + consolidation status to output

## Phase 7 — Tests

### `scripts/architecture/check-ia-coherence.ts`
- Assert admin top-level domains <= 12
- Assert user top-level domains <= 12
- Assert no deprecated routes in primary navigation
- Assert every page file has a route entry
- Assert page class naming conventions

## Files Created/Modified Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Architecture registries | 3 (canonical-route-registry, page-consolidation-map, ia-governance) | 2 (route-registry, generate-route-manifest) |
| Navigation updates | 0 | 1 (MissionControlAppShell sidebar groups) |
| CI enforcement | 1 (check-ia-coherence.ts) | 0 |
| Route redirect cleanup | 0 | ~4 route files (add redirects for merged routes) |
| **Total** | **4** | **~7** |

## What This Does NOT Do (And Why)

- **Does not delete any page files** — Pages stay as modules inside windowed apps; the shim architecture already isolates them
- **Does not restructure page directories** — Moving 975 files would create massive git churn with no user benefit
- **Does not change the windowed app architecture** — The App-in-OS model is correct; consolidation happens at the IA/navigation/registry level
- **Does not merge page component code** — Unique functionality stays in its file; consolidation is structural (routes + navigation + classification)

The result: one coherent IA taxonomy, enforced by registries and CI, with compressed navigation and zero breakage.

