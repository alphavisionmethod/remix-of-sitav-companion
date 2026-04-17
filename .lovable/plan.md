

## Fix C-009: Dashboard shows no real data — what's actually broken

### Live findings (much worse than the brief)

The brief points at `DailyPulse.tsx` and `DesktopPage.tsx`. I read both:

1. ✅ **`DailyPulse.tsx` is already live-wired** (verified — uses `usePulseLiveData`, queries `notifications` + `ai_workforce_approval_queue` + `ai_workforce_recommendations` + `cloud_files`, gated on `useDataMode().isDemoMode`). No fix needed here.

2. ✅ **`src/pages/Index.tsx` does not exist.** Root `/` redirects to `/desktop` via `<Navigate>`. No fix needed.

3. 🔴 **The real C-009 surface is the `DesktopPage` widget canvas — 12 of ~17 desktop widgets are 100% hardcoded constants.** Confirmed via grep. Every one is module-scoped `const` arrays with fake data. None query the DB:

| Widget | Hardcoded constant | Should query |
|---|---|---|
| `DesktopWhatMattersWidget` | `domains = [...]` (3 fake domain cards) | `notifications` + `ai_workforce_approval_queue` per-domain counts |
| `DesktopBusinessKPIWidget` | `KPIS = [...]` | `deals` (sum amount), `ai_workforce_approval_queue` count |
| `DesktopFinanceSnapshotWidget` | inline numbers | `holdings` (sum value), `cloud_files` (count) |
| `DesktopConciergeTasksWidget` | `TASKS = [...]` | `household_tasks` |
| `DesktopBoardroomBriefWidget` | inline | `boardroom_items` (active) + latest `boardroom_decision_receipts` |
| `DesktopCRMPipelineWidget` | `DEALS = [...]` | `deals` grouped by stage |
| `DesktopLeadsRecoveredWidget` | `STATS = [...]` | `leads` (status counts) |
| `DesktopInvestmentPulseWidget` | `HOLDINGS = [...]` | `holdings` |
| `DesktopCalendarTodayWidget` | `EVENTS = [...]` | `calendar_events` (today) |
| `DesktopAdvisorCouncilWidget` | `ADVISORS = [...]` | `advisor_profiles` + recent `advisor_board_recommendations` |
| `DesktopNotificationsFeedWidget` | `DEMO_ALERTS = [...]` | `notifications` (recent unread) |
| `DesktopNotificationsWidget` | `STOCKS = [...]` (mislabeled — actually a stock ticker) | `holdings` |
| `DesktopPortfolioMapWidget` | `SECTORS = [...]` | `holdings` (group by sector) |

This violates the **reality-mode-wiring** memory rule on the *primary post-login surface* — every widget is a stub, regardless of demo/live state.

### DB confirmed available (live query)

`notifications`, `ai_workforce_approval_queue`, `ai_workforce_recommendations`, `cloud_files`, `boardroom_items`, `boardroom_decision_receipts`, `calendar_events`, `holdings`, `deals`, `leads`, `household_tasks`, `advisor_profiles`, `advisor_board_recommendations` — all present with RLS.

### The fix — 4 changes

**1. New canonical data hook `src/hooks/useDesktopWidgetsData.ts`**
One `useQuery` per widget category, all gated on `enabled: !!user`, all return `{ data, isLoading, isEmpty }`. No silent fallbacks. In demo mode (`useDataMode().isDemoMode === true`), returns the existing hardcoded shapes so demo presentations stay identical. Live mode returns real DB rows.

Hooks exposed:
- `useWhatMattersData()` → counts per domain
- `useBusinessKPIData()` → pipeline value, approval count, revenue
- `useFinanceSnapshotData()` → portfolio total, file count
- `useConciergeTasksData()` → household tasks
- `useBoardroomBriefData()` → latest item + receipt
- `useCRMPipelineData()` → deals by stage
- `useLeadsRecoveredData()` → lead status counts
- `useInvestmentPulseData()` → holdings rows
- `useCalendarTodayData()` → today's events
- `useAdvisorCouncilData()` → advisor profiles + last recs
- `useNotificationsFeedData()` → recent unread notifications
- `usePortfolioMapData()` → holdings by sector

**2. Rewrite all 12 widget files** to:
- Import its hook
- Use `useDataMode()` to decide demo-vs-live (NO hardcoded `isDemoMode`)
- Render real data when live, demo constants when demo
- Render an honest `EmptyState` (already exists at `src/components/primitives/feedback/EmptyState.tsx`) when live + zero rows, with an action navigating to the relevant feature page (e.g., "Upload File", "Add Holding")
- Add `data-testid` matching the widget type for E2E

**3. Add a small `<DesktopWidgetSeedSampleButton>` in admin debug panel** (mirroring the C-007/C-008 seed pattern) that inserts one sample row into `deals`, `holdings`, `household_tasks`, `calendar_events`, `notifications` so admins can verify the live loop end-to-end without manual SQL. Lives at `src/components/sita/DesktopSeedSampleButton.tsx`, mounts inside the existing widget picker only for `useIsAdmin() === true && !isDemoMode`.

**4. Tests** — add `tests/e2e/desktop-widgets-live-vs-demo.spec.ts` smoke test asserting widgets render in both modes without crashing.

### Files

| File | Change |
|---|---|
| `src/hooks/useDesktopWidgetsData.ts` | NEW — 12 query hooks |
| 12 × `src/components/sita/shell/desktop/Desktop*Widget.tsx` | Rewrite to consume hooks + EmptyState; remove module-scoped constants |
| `src/components/sita/DesktopSeedSampleButton.tsx` | NEW — admin sample inserter |
| `src/components/sita/shell/desktop/WidgetPicker.tsx` | Mount seed button when admin + live |
| `tests/e2e/desktop-widgets-live-vs-demo.spec.ts` | NEW — smoke test |

### Acceptance

- New live user sees desktop with honest `EmptyState`s ("No deals yet", "No holdings yet", etc.) — never fake numbers
- Demo user sees identical visuals to today (no regression)
- Admin clicks "Seed sample" → 1 row inserted into each of 5 tables → widgets reflect within 30s (staleTime)
- Zero hardcoded constant arrays remain in any `Desktop*Widget.tsx`
- 0 TS errors, 0 silent error→mock fallbacks
- C-009 moves 🟠 DEMO-GOVERNED → ✅ RESOLVED, deployment-ready

