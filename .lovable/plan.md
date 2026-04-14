

# Money/Finance Merge — Final Wiring Check

## Current State: 95% Complete

The merge is already done correctly:
- **FinanceAppShell.tsx** has all 33 pages mapped and 6 sidebar groups
- **MoneyCenter.tsx** is a redirect shim dispatching `sita-open-finance` events
- **ShellLayout.tsx** listens for `sita-open-finance` and launches the windowed app with deep-linking
- **money-routes.tsx** routes all `/money/*` paths through MoneyCenter shim
- **External components** (CommandPalette, HoldKeyOverlay, DailyPulse, GlobalBoardroom) all use `openFinanceModule()` or direct event dispatch
- **MoneyOverview.tsx** uses `useFinanceNavigation()` for internal navigation

## One Fix Remaining

### `MoneyOnboarding.tsx` — line 8
Currently navigates to `/money` on completion, which triggers a full redirect loop (MoneyCenter shim → event → desktop). After onboarding completes, it should dispatch the finance event directly instead:

**Change**: Replace `navigate("/money")` with `openFinanceModule("overview")` so onboarding completion opens the windowed Finance app directly without the router roundtrip.

### File change
| File | Change |
|------|--------|
| `src/pages/MoneyOnboarding.tsx` | Import `openFinanceModule`, replace `navigate("/money")` with `openFinanceModule("overview")` |

That's the only remaining gap. Everything else is fully wired and correct.

