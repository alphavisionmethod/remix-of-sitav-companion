

# Merge Finance OS into Single Windowed App

## Current State
- `FinanceAppShell.tsx` has only 7 sidebar items and shows "DATA CANVAS" placeholders for most modules
- `MoneyCenter.tsx` (router-based) has all 33 fully-built sub-pages with 6 sidebar groups
- All `/money/*` routes render `MoneyCenter` as a standalone page, not inside the window

## Plan

### 1. Create `FinanceNavigationContext.tsx`
Mirror of `BusinessNavigationContext` — provides `navigateTo(module)` and `activeModule` for internal navigation without React Router.

### 2. Rewrite `FinanceAppShell.tsx` (major)
- Import all 33 page components from `src/pages/money/`
- Replicate the 6 sidebar groups from `MoneyCenter.tsx` (Core, Wealth, Flow, Insights, Lifestyle, Office)
- Build a `pages` map identical to `MoneyCenter`'s
- Render the active page component based on `activeModule` state
- Keep the existing Boardroom status strip, advisor board, and pipeline health views
- Wrap children in `FinanceNavigationContext.Provider`
- Listen for `sita-finance-navigate` event for deep-linking
- Preserve the dark glassmorphic sidebar aesthetic with finance-green accent

### 3. Convert `MoneyCenter.tsx` to redirect shim
Same pattern as `BusinessCenter.tsx`:
- On mount, dispatch `sita-open-finance` event with the correct module extracted from path
- Navigate to `/desktop`

### 4. Create `openFinanceModule()` launcher utility
Add to `src/lib/finance-launcher.ts` — dispatches `sita-open-finance` event, used by external components.

### 5. Add `sita-open-finance` listener in `ShellLayout.tsx`
Mirror the `sita-open-business` listener — catches the event, calls `doLaunchApp("finance")`, then dispatches `sita-finance-navigate` with the module.

### 6. Update external `navigate("/money/...")` calls
- `CommandPalette.tsx` — use `openFinanceModule()` for bills, cash, subscriptions
- `HoldKeyOverlay.tsx` — use `openFinanceModule()` for money shortcuts
- `GlobalBoardroom.tsx` — use `openFinanceModule("boardroom")`

### 7. Update internal `navigate()` calls in money pages
- `MoneyOverview.tsx` — replace `navigate("/money/bills")` etc. with `useFinanceNavigation().navigateTo("bills")`

### 8. Update `money-routes.tsx`
All routes except onboarding redirect through the `MoneyCenter` shim (which now just fires the event).

## Files

| File | Change |
|------|--------|
| New: `src/contexts/FinanceNavigationContext.tsx` | Navigation context for Finance |
| New: `src/lib/finance-launcher.ts` | `openFinanceModule()` helper |
| `src/components/sita/apps/finance/FinanceAppShell.tsx` | Full rewrite — 33 pages, 6 groups |
| `src/pages/MoneyCenter.tsx` | Convert to redirect shim |
| `src/components/sita/ShellLayout.tsx` | Add `sita-open-finance` listener |
| `src/components/sita/CommandPalette.tsx` | Use `openFinanceModule` |
| `src/components/sita/shell/HoldKeyOverlay.tsx` | Use `openFinanceModule` |
| `src/pages/GlobalBoardroom.tsx` | Use `openFinanceModule` |
| `src/pages/money/MoneyOverview.tsx` | Use `useFinanceNavigation` |

No database changes needed.

