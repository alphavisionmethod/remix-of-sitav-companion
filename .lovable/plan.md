

# Phase 8: True App Isolation & Native Window Shells

## Problem
Launching apps currently navigates via React Router, destroying the desktop and showing the global sidebar. Apps must instead open as self-contained windows within the OS compositor, with working close/minimize/maximize controls.

## Changes

### 1. Create standalone app shell components (3 new files)

**`src/components/sita/apps/finance/FinanceAppShell.tsx`**
Self-contained Finance OS with internal `useState`-based navigation. Sidebar with modules: Overview, Spending Pulse, Bills & Subs, Approvals. Each module renders a styled placeholder canvas. Uses emerald accent color scheme. No React Router.

**`src/components/sita/apps/business/BusinessAppShell.tsx`**
Self-contained Business OS with internal navigation. Modules: CRM, Leads Pipeline, Quotes, Operations. Uses blue accent color scheme. Matches the reference screenshot layout (stat cards, money flow chart, recent activity). No React Router.

**`src/components/sita/apps/concierge/ConciergeAppShell.tsx`**
Self-contained Concierge with internal navigation. Modules: Overview, Calendar, Tasks, Errands. Uses purple accent color scheme. No React Router.

Each shell follows this structure:
- Left sidebar (~200px) with module list, active state highlight with accent inset border
- Top toolbar showing current module name
- Main content area with placeholder canvas
- Full height, fills the window body

### 2. Register apps in the window launcher (`ShellWindowLayer.tsx`)

Add imports for all 3 shells and register them in `APP_REGISTRY`:
- `"finance"` / `"money"` → FinanceAppShell, 1200px wide
- `"business"` → BusinessAppShell, 1200px wide  
- `"concierge"` → ConciergeAppShell, 1200px wide

This ensures clicking dock icons spawns windowed apps instead of navigating.

### 3. Prevent dock from routing (`DesktopDock.tsx`)

Update click handlers for business/finance/concierge dock items to call `onLaunchApp` with `e.preventDefault()` and `e.stopPropagation()` instead of `navigate()`. Ensure buttons use `type="button"`.

### 4. Dock auto-hide behavior (`DesktopDock.tsx`)

Add auto-hide mode: dock slides down off-screen after 3s of inactivity, reappears on mouse hover near bottom edge. Store preference in localStorage. Add a small settings toggle in the dock for "Always show" vs "Auto-hide".

## Files

| File | Action |
|------|--------|
| `src/components/sita/apps/finance/FinanceAppShell.tsx` | **New** |
| `src/components/sita/apps/business/BusinessAppShell.tsx` | **New** |
| `src/components/sita/apps/concierge/ConciergeAppShell.tsx` | **New** |
| `src/components/sita/shell/ShellWindowLayer.tsx` | Add 3 app registrations |
| `src/components/sita/DesktopDock.tsx` | Prevent routing for core apps, add auto-hide |

