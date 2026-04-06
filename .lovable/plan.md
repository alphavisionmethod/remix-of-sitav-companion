

# UX Trust Index → 100/100 — Full Implementation Plan

## What This Means (Non-Technical)
The UX trust system has all the building blocks (confirmation dialogs, data freshness badges, contextual empty states, undo support, optimistic mutations) but they're sitting on a shelf — only 1 out of 571 pages actually uses them. Getting to 100 means wiring these trust patterns into every page that needs them so users always know: what's real, what's stale, what's destructible, and what's empty.

## Current Gaps

| Trust Pattern | Built? | Used? | Gap |
|---|---|---|---|
| DemoModeBadge | Yes | 571 pages | Done |
| ConfirmationDialog | Yes | 1 page (TeamManagement) | 15+ pages with destructive actions use `window.confirm()` |
| DataFreshnessBadge | Yes | 0 pages | Every DB-backed page should show data age |
| Contextual Empty States | Yes (10 domains) | 0 pages | Every domain landing should use these |
| useOptimisticMutation | Yes | 0 pages | CRUD pages should use for instant feedback |
| ActionFeedbackStack | Yes | 0 pages | Mutation-heavy pages should show success/error stacks |
| NetworkStatusBar | Yes | 0 pages | Should be in app shell (global) |
| UndoToastStack | Yes | 0 pages | Delete actions should support undo |

## Plan

### 1. Global: Wire NetworkStatusBar into App Shell
Add `NetworkStatusBar` to the root layout so all pages get offline/degraded indicators automatically. One file change.

**File**: `src/App.tsx` or `src/components/shells/UserAppShell.tsx`

### 2. Global: Wire ActionFeedbackStack + UndoToastStack into App Shell
These are global stacks — mount once, available everywhere.

**File**: `src/App.tsx` or root layout

### 3. Replace all `window.confirm()` with `useConfirmation` + `ConfirmationDialog`
Pages currently using `if (confirm("Delete..."))`:
- `BillsWorkspace.tsx`
- `SubscriptionsWaste.tsx`
- `ReservesSavings.tsx`
- Every other page with delete buttons (scan all pages with `confirm(` pattern)

Each gets: `const { confirmation, confirm } = useConfirmation();` + `<ConfirmationDialog state={confirmation} />`

### 4. Add DataFreshnessBadge to all DB-backed pages
Every page using `useQuery` / `useModeData` with real DB fetching should show a freshness badge in its header area. This means tracking `dataUpdatedAt` from React Query and passing it to `DataFreshnessBadge`.

Key pages: MoneyOverview, BillsWorkspace, SubscriptionsWaste, ReservesSavings, CustomersPage, InboxCapture, ApprovalChamber, ProofCenter, ReportingWorkspace, and ~20 more.

**Approach**: Create a small wrapper `useFreshnessFromQuery(queryResult)` that extracts `dataUpdatedAt` and returns props for `DataFreshnessBadge`. Then add the badge to each page header.

### 5. Add Contextual Empty States to domain landing pages
When a DB-backed page has zero data in live mode, instead of showing a blank table, show the domain-specific empty state from `getContextualEmptyState()`.

Key pages: MoneyOverview (money), CustomersPage (customers), BillsWorkspace (money), InboxCapture (concierge), ReportingWorkspace (reports), and all other domain roots.

**Pattern**:
```tsx
if (!isDemoMode && data.length === 0) {
  const empty = getContextualEmptyState("money");
  return <ContextualEmptyState config={empty} />;
}
```

Need a new component: `ContextualEmptyState` that renders the config with icon, title, description, tip, and action buttons.

### 6. Add optimistic mutations to key CRUD pages
Pages with create/edit/delete should use `useOptimisticMutation` for instant UI response:
- BillsWorkspace (toggle paid status, delete)
- SubscriptionsWaste (cancel, delete)
- ReservesSavings (update progress, delete)
- MoneySettings (toggle policies)
- TeamManagement (role changes)

### 7. Create UX Trust Score Calculator
A runtime function that audits which trust patterns are active on the current page and reports the score. This powers the "80/100" metric and proves when it hits 100.

**File**: `src/lib/ux-trust/ux-trust-score.ts`

Checks:
- DemoModeBadge present? (+10)
- NetworkStatusBar mounted? (+10)
- ConfirmationDialog on destructive pages? (+15)
- DataFreshnessBadge on DB pages? (+15)
- Contextual empty states on domain pages? (+15)
- Optimistic mutations on CRUD pages? (+10)
- ActionFeedback on mutation pages? (+10)
- UndoToast on delete actions? (+15)

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` or root layout | Mount NetworkStatusBar, ActionFeedbackStack, UndoToastStack globally |
| `src/components/sita/ContextualEmptyState.tsx` | **New** — renders empty state configs |
| `src/hooks/use-query-freshness.ts` | **New** — extracts freshness from React Query results |
| `src/lib/ux-trust/ux-trust-score.ts` | **New** — runtime trust score calculator |
| `src/pages/money/BillsWorkspace.tsx` | Replace `confirm()` → `useConfirmation`, add DataFreshnessBadge, add empty state |
| `src/pages/money/SubscriptionsWaste.tsx` | Same as above |
| `src/pages/money/ReservesSavings.tsx` | Same as above |
| `src/pages/money/MoneyOverview.tsx` | Add DataFreshnessBadge, contextual empty state |
| `src/pages/money/MoneySettings.tsx` | Add confirmation for policy changes |
| `src/pages/business/CustomersPage.tsx` | Add DataFreshnessBadge, empty state, confirmation |
| `src/pages/InboxCapture.tsx` | Add DataFreshnessBadge, empty state |
| `src/pages/ApprovalChamber.tsx` | Add DataFreshnessBadge, confirmation |
| `src/pages/ProofCenter.tsx` | Add DataFreshnessBadge |
| `src/pages/ReportingWorkspace.tsx` | Add DataFreshnessBadge, empty state |
| `src/pages/OwnerCenter.tsx` | Add DataFreshnessBadge |
| All other pages with `confirm(` calls | Replace with ConfirmationDialog (~10-15 pages) |
| All other DB-backed pages | Add DataFreshnessBadge (~20 pages) |

## Estimated Scope
- 3 new files (component, hook, score calculator)
- ~35 page files modified (mostly mechanical: add imports + 3-5 lines each)
- 0 database changes needed

