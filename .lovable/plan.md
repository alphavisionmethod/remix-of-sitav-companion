
# Desktop Quick Actions Grid — Full Wiring + Investment & Boardroom Apps

## What We're Building

The 8-icon grid widget on the desktop (shown in your screenshot) becomes the permanent "quick launch" surface. Every icon launches the correct OS window — no React Router navigation. We replace "Trust" with "Investment Office" and create two new self-contained app shells.

## Changes

### 1. Create `InvestmentAppShell.tsx` (new file)

`src/components/sita/apps/investment/InvestmentAppShell.tsx`

Self-contained Investment Office app with internal `useState` navigation. Modules: Portfolio, Risk Office, Thesis Journal, Trading Floor, Market Explorer, Advisor Council. Uses gold/amber accent. Same structural pattern as Finance/Business shells but with more modules matching the existing investment-office pages.

### 2. Create `BoardroomAppShell.tsx` (new file)

`src/components/sita/apps/boardroom/BoardroomAppShell.tsx`

The cross-domain "big brain" decision center. Modules: Executive Review, Business Pulse, Finance Pulse, Concierge Pulse, Advisor Synthesis, Action Tracker. Uses fuchsia/purple accent. This is where all domain advisors converge for strategic decisions — distinct from each app's individual advisor board.

### 3. Update `DesktopQuickActionsWidget.tsx`

- Replace "Trust" with "Investment" (icon: `TrendingUp` or `LineChart`, gold gradient)
- Accept `onLaunchApp` prop instead of using `navigate()`
- Every icon calls `onLaunchApp(appId)` — mapped as:
  - Business → `"business"`
  - Finance → `"finance"`
  - Concierge → `"concierge"`
  - Files → `"finder"`
  - Boardroom → `"boardroom"`
  - Investment → `"investment"`
  - Settings → `"settings"`
  - Search → still calls `onOpenCommand()` for command palette

### 4. Register new apps in `ShellWindowLayer.tsx`

Add to `APP_REGISTRY`:
- `"investment"` → InvestmentAppShell, 1200×800
- `"boardroom"` → BoardroomAppShell, 1200×800

### 5. Update `DesktopDock.tsx`

Add `"investment"` and `"boardroom"` to the `OS_WINDOW_APPS` set so dock clicks also spawn windows.

### 6. Wire `onLaunchApp` through to the widget

In `DesktopSurface.tsx`, pass `onLaunchApp` into `renderWidget` for the `quick-actions` case so the grid can launch OS windows.

## Files

| File | Action |
|------|--------|
| `src/components/sita/apps/investment/InvestmentAppShell.tsx` | **New** — Self-contained Investment Office |
| `src/components/sita/apps/boardroom/BoardroomAppShell.tsx` | **New** — Cross-domain Boardroom |
| `src/components/sita/shell/desktop/DesktopQuickActionsWidget.tsx` | Replace Trust→Investment, use `onLaunchApp` instead of `navigate` |
| `src/components/sita/shell/ShellWindowLayer.tsx` | Register investment + boardroom |
| `src/components/sita/DesktopDock.tsx` | Add investment + boardroom to OS_WINDOW_APPS |
| `src/components/sita/shell/DesktopSurface.tsx` | Pass `onLaunchApp` to quick-actions widget renderer |
