

# SITA OS — Admin & Frontend Pages: 100% Implementation Plan

## Current State Summary

| Category | Total | Live Data | Static/Mock | % Complete |
|----------|-------|-----------|-------------|------------|
| Admin (root) | 215 | 132 | 83 | 61% |
| Admin (subdirs) | 82 | 3 | 79 | 4% |
| **Admin Total** | **297** | **135** | **162** | **45%** |
| Revenue Office | 39 | 0 | 39 | 0% |
| Digital Presence | ~19 | 0 | 19 | 0% |
| Concierge (sub-pages) | ~16 | 3 | 13 | 19% |
| Apps | 6 | 0 | 6 | 0% |
| Top-level pages | 71 | 30 | 41 | 42% |

**Key finding:** The hook files (`use-revenue-office.ts`, `use-investment-office.ts`, etc.) were created but **zero pages actually import them**. The hooks exist, the tables exist, but the pages still render hardcoded arrays.

## What Needs to Happen

### Track A: Wire All User-Facing Pages to Live Hooks (highest impact)

Every page that has inline `const DATA = [...]` needs to:
1. Import the relevant hook from `src/hooks/use-*.ts`
2. Import `useDataMode` to check `isDemoMode`
3. Keep the existing hardcoded array as `DEMO_*` fallback
4. Use `const data = isDemoMode ? DEMO_DATA : (liveData ?? [])` pattern
5. Add loading skeleton when `isLoading && !isDemoMode`
6. Add empty state when `!isDemoMode && data.length === 0`

**Files to update:**

| Module | Pages | Hook File |
|--------|-------|-----------|
| Revenue Office | 39 pages | `use-revenue-office.ts` |
| Digital Presence | 19 pages | `use-digital-presence.ts` |
| Concierge | 13 pages | `use-concierge-data.ts` |
| Apps | 6 pages | `use-apps-data.ts` |
| Money sub-pages | 10 pages | `use-money-data.ts` |
| Top-level static pages | ~30 pages | Various existing hooks |
| **Subtotal** | **~117 pages** | |

### Track B: Wire Admin Pages (162 static)

Admin pages are operator/diagnostic tools. They should query system tables (audit_logs, incidents, ai_usage_ledger, workflow_runs, etc.) rather than domain-specific user tables.

**Approach:** Create `src/hooks/use-admin-data.ts` with ~20 hooks querying existing system tables. Then update 162 admin pages to use isDemoMode gate.

| Admin Domain | Pages | Tables to Query |
|--------------|-------|----------------|
| AI Agent suite (Debate, Fix, Healing, etc.) | 19 | `ai_usage_ledger`, `incidents`, `audit_logs` |
| AI Gateway (AIG01-09) | 9 | `ai_usage_ledger`, `user_ai_budgets`, `ai_budget_policies` |
| AI Team (AIT01-08) | 8 | `ai_usage_ledger`, `agent_signals` |
| Connectors (CN01-07) | 7 | `connected_accounts` |
| Dual Reality (DRS01-10) | 10 | `feature_flags`, system config |
| Automation (AR01-09) | 9 | `workflow_definitions`, `workflow_runs` |
| Apple/Android (APL, AND) | 11 | Platform readiness tables |
| Customer Journey (CJ01-09) | 9 | `route_verification_results` |
| FIP (14 pages) | 14 | `feature_flags`, capabilities |
| Security (SEC01-06) | 6 | `audit_logs`, `incidents` |
| Strategic (12 dashboards) | 12 | Aggregate from multiple tables |
| Verification (V01-07) | 7 | `route_verification_results` |
| Architecture, Launch, Frontend, Intelligence, SAG | ~41 | Mixed system tables |
| **Subtotal** | **162 pages** | |

### Track C: UI/UX Polish Pass

All pages already use the SITA design system (Cards, Badges, Progress, Tabs, motion animations). Quality is generally high. Specific improvements needed:

1. **Empty states** — Currently no pages show a meaningful empty state when the user has no data. Need a reusable `<EmptyState icon={...} title="..." action="..." />` component.
2. **Loading skeletons** — `PageSkeleton` exists but most pages don't use it for data loading states.
3. **Error boundaries** — `GlobalErrorBoundary` exists but isn't wrapped around all page-level components.
4. **Responsive polish** — Some admin pages use `grid-cols-6` without responsive breakpoints, breaking on mobile.
5. **Accessibility** — Missing aria-labels on icon-only buttons in several admin pages.

## Implementation Order

### Phase 1: Shared Infrastructure (1 step)
- Create `<EmptyState>` component
- Create `src/hooks/use-admin-data.ts` with system-level hooks
- Add `<PageSkeleton>` usage to page template

### Phase 2: Wire User-Facing Pages (~117 pages, 6 batches)
Wire in order: Revenue Office → Digital Presence → Concierge → Apps → Money → Top-level pages. Each batch: import hook, rename hardcoded array to `DEMO_*`, add isDemoMode gate, add loading/empty states.

### Phase 3: Wire Admin Pages (~162 pages, 8 batches)
Wire in order: AI Gateway → AI Team → Connectors → Customer Journey → Verification → Security → Strategic → Remaining. Each batch: import admin hook, add isDemoMode gate.

### Phase 4: UI Polish Pass
- Add responsive breakpoints to all grid layouts
- Add aria-labels to icon-only buttons
- Wrap all page exports in GlobalErrorBoundary
- Verify all pages have proper loading/error/empty states

## Scope

- **~280 page files updated** with live data wiring
- **2 new files** (EmptyState component, admin hooks)
- **0 new tables** (all tables already created in previous migration)
- **0 new edge functions**

This is a very large implementation. I recommend starting with Phase 1 + Phase 2 (Revenue Office batch) in the first message, then continuing in subsequent messages.

