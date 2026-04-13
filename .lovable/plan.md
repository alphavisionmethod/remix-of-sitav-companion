

# SITA OS — Remaining Phases: Full Completion Plan

## Current State

- **Build**: Clean (0 TypeScript errors)
- **Phase 1-4** (Domain migrations): Complete for Business, Money, Concierge, Files core pages
- **Phase 5** (CrossAppAction): Component built but only wired into 1 page (CollectionsCommandCenter)
- **Phase 6** (Universal State Coverage): Not started
- **138 pages** still import legacy components (`SitaPageHeader`, `DemoModeBadge`, `LiveAdvisorCard`)

## Plan

### Phase A — Wire CrossAppAction into 7 remaining key pages
Phase 5 created the infrastructure but only connected 1 of the planned 8 pages.

| Page | CrossAppAction links to add |
|------|-----------------------------|
| `InvoicesCollections.tsx` | → Money/Receivables, → Business/CRM customer |
| `ReceivablesObligations.tsx` | → Business/Invoices, → Business/Collections |
| `CustomersPage.tsx` | → Concierge/Appointments, → Business/Quotes |
| `QuotesWorkspace.tsx` | → Business/Invoices |
| `TravelPlanning.tsx` | → Files/Search (travel docs) |
| `BillsWorkspace.tsx` | → Money/Approvals |
| `BusinessSupport.tsx` | → Business/CRM customer |

### Phase B — Batch legacy purge (138 pages)
Automated script to replace legacy imports across all remaining pages:

1. Remove `SitaPageHeader` component usage (shell handles headers)
2. Remove `DemoModeBadge` → replace with `PageTruthBanner`
3. Remove `LiveAdvisorCard` → replace with `ModuleAdvisorInsight` where contextually appropriate
4. Fix any resulting unused import warnings

Organized in sub-batches:
- **B1**: Core pages (50 files: ActivityStream through WorkflowsCenter)
- **B2**: Admin pages (45 files: AR01 through strategic/)
- **B3**: Domain-specific stragglers (25 files: atlas, advisors, boardroom, owner, revenue-office)
- **B4**: Remaining (18 files: store, workspace, enterprise, mission, investment-office leftovers)

### Phase C — Universal State Coverage audit
Ensure all 74 primary domain pages handle 6 states:

| State | Component |
|-------|-----------|
| First use | `PremiumEmptyState` variant="first-use" |
| Empty (filtered) | `PremiumEmptyState` variant="no-results" |
| Loading | `SectionSkeleton` |
| Degraded | `PageTruthBanner` mode="degraded" |
| Demo/Preview | `PageTruthBanner` mode="demo" |
| Live | `PageTruthBanner` mode="live" |

Audit the 29 migrated domain pages + 45 newly migrated pages for missing states and add them.

### Phase D — Build verification & regression fix
- Run `tsc --noEmit` after each batch
- Fix any broken imports, prop mismatches, or duplicate attributes
- Verify no runtime console errors

## Technical Approach

For Phase B, the migration script will:
1. Remove `SitaPageHeader` from imports and JSX
2. Replace `DemoModeBadge` import → `PageTruthBanner` import
3. Replace `<DemoModeBadge ... />` JSX → `<PageTruthBanner />`
4. Remove `LiveAdvisorCard` imports and JSX blocks
5. Remove orphaned `useDataMode` if only used for badge

Each file verified individually for edge cases (some pages use `SitaCard` legitimately as a container — those are kept but the header/badge/advisor patterns are standardized).

## Estimated Scope

| Phase | Files | Description |
|-------|-------|-------------|
| A | 7 edits | CrossAppAction wiring |
| B | 138 edits | Legacy purge |
| C | ~30 edits | State coverage gaps |
| D | 0 new files | Verification pass |

