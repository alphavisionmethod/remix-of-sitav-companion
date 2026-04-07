

# Fix Section 5: Wire or Remove 11 Unused Hooks

## Current State

The original audit listed 16 unused hooks. After investigation:
- **5 are already wired** (use-apps-data, use-concierge-data, use-digital-presence, use-investment-office, use-mobile) — imported by pages, no action needed
- **11 are truly unused** (0 imports anywhere in the codebase)

## The 11 Unused Hooks — Action Plan

### Group A: Wire into existing pages (2 hooks)

| Hook | Target pages | Action |
|------|-------------|--------|
| `use-money-data.ts` | `money/BillsWorkspace.tsx` and 5 other money pages that have inline `(supabase as any).from("bills")` queries | Replace inline queries with hook imports. BillsWorkspace already has inline CRUD — refactor to use `useBills()` for reads |
| `use-mission-data.ts` | `mission-control/MissionControlPage.tsx` | Wire `useMissionGoals()` into the mission overview section |

### Group B: Wire via barrel re-export (2 hooks)

| Hook | Action |
|------|--------|
| `use-calendar-data.ts` | Import in `DailyPulse.tsx` calendar section — it has `useCalendarEvents` ready for the calendar widget |
| `use-cai-data.ts` | Ready-to-use hooks for 23 CAI tables. No CAI pages exist yet — create a barrel `src/hooks/cai.ts` re-export and add a single import in `AgentActivityDashboard.tsx` for `useCaiAgentSnapshots` |

### Group C: Infrastructure hooks — keep, add single integration point (4 hooks)

These are platform-level hooks for future capabilities. They should NOT be deleted — they're part of the sovereign OS architecture.

| Hook | Action |
|------|--------|
| `use-agent-fleet-live.ts` (179 lines) | Wire into `AgentActivityDashboard.tsx` — replace mock data with `useAgentFleetLive()` |
| `use-domain-projections.ts` (264 lines) | Wire into `DailyPulse.tsx` — its `useFinanceProjection` and `useBusinessProjection` hooks power the daily overview |
| `useElectronBridge.ts` (105 lines) | Add import in `src/App.tsx` or a layout — call `useElectronBridge()` with graceful no-op when not in Electron |
| `useOfflineStore.ts` (129 lines) | Add import in `src/App.tsx` layout — initialize offline sync manager on mount |

### Group D: Delete dead re-export stubs (3 hooks)

These add zero value — they're thin wrappers or re-exports of things that are already imported directly elsewhere.

| Hook | Lines | Why delete |
|------|-------|-----------|
| `use-workspace-data.ts` | 6 | Just re-exports 3 functions from `use-domain-data` — consumers already import from `use-domain-data` directly |
| `useDomainMockData.ts` | 20 | Re-exports mock data types/constants — consumers import from `@/lib/mock-data/*` directly |
| `useFileSystemBridge.ts` | 86 | Requires Electron IPC that doesn't exist in web — `useElectronBridge` already covers file ops via its `writeFile`/`readFile` methods |

## Implementation Steps

1. **Delete 3 stub files** (use-workspace-data, useDomainMockData, useFileSystemBridge)
2. **Wire use-money-data** into BillsWorkspace, CashTiming, SubscriptionsWaste, TaxEstimator, ReservesSavings, InvestmentOffice — replace inline `(supabase as any)` queries with hook imports
3. **Wire use-mission-data** into MissionControlPage
4. **Wire use-calendar-data** into DailyPulse
5. **Wire use-cai-data** into AgentActivityDashboard
6. **Wire use-agent-fleet-live** into AgentActivityDashboard
7. **Wire use-domain-projections** into DailyPulse
8. **Add useElectronBridge + useOfflineStore** initialization in App.tsx layout
9. **Verify**: `npx tsc --noEmit` — 0 errors, build clean

## Files Changed

- 3 files deleted
- ~10 page files updated with new hook imports
- 1 App.tsx updated with infrastructure hook initialization
- Total: ~14 files

