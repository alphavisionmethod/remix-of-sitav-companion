

# Self-Contained Website Demo Package

## Summary

Create a standalone `src/website-demo/` folder containing a fully self-contained, zero-dependency (no auth, no Supabase, no real data) interactive SITA OS desktop demo. Visitors click desktop icons, open glassmorphic floating windows with mock app content, interact with the dock, and explore Business, Finance, Concierge, Boardroom, Investment, and utility apps -- all purely visual with hardcoded mock data.

## What Changes

### Part 1 -- Demo Entry Point and Shell

**New file: `src/website-demo/WebsiteDemo.tsx`**

A single top-level component that renders the full demo experience:
- Dark gradient wallpaper with SITA branding (reuses the ambient background style from `ShellAmbientBackground`)
- Desktop icon grid (8 app icons: Business, Finance, Concierge, Boardroom, Investment, Files, Notes, Settings)
- Bottom dock bar with pinned apps and running-app indicators
- Top menu bar showing "SITA OS" branding, clock, and status icons
- Built-in lightweight window manager (local state, no context providers needed)
- All interactions are self-contained -- no `useNavigate`, no `useAuth`, no Supabase calls

### Part 2 -- Lightweight Demo Window Manager

**New file: `src/website-demo/DemoWindowManager.tsx`**

Simplified floating window system (inspired by `FloatingWindow.tsx` but ~200 lines instead of 887):
- Draggable windows with traffic-light close/minimize/maximize buttons
- Glassmorphic window chrome using the same `MATERIALS` tokens
- Z-index stacking on focus
- Window state managed via `useState` array -- no external context
- Supports opening multiple windows simultaneously
- Smooth open/close animations via Framer Motion

### Part 3 -- Mock App Content Panels

**New files in `src/website-demo/apps/`:**

Each is a static visual panel with hardcoded mock data:

- **`DemoBusinessApp.tsx`** -- Dashboard with mock KPI cards (Revenue $284k, Leads 47, Pipeline $1.2M), mini bar chart, recent activity list, sidebar nav showing available sections
- **`DemoFinanceApp.tsx`** -- Peace Score gauge (78/100), monthly spending breakdown, bill reminders, account balances, budget progress bars
- **`DemoConciergApp.tsx`** -- Today's schedule (5 items), upcoming tasks list, family calendar preview, household task cards
- **`DemoBoardroomApp.tsx`** -- Advisor council view with 6 advisor portraits (using the generated PNGs), consensus gauge, active debate preview
- **`DemoInvestmentApp.tsx`** -- Portfolio summary (mock positions), watchlist, performance sparklines, allocation donut chart
- **`DemoFilesApp.tsx`** -- Finder-style file browser with folder tree and file grid
- **`DemoNotesApp.tsx`** -- Notes list with preview pane, folder sidebar
- **`DemoSettingsApp.tsx`** -- Settings categories list with toggle switches

### Part 4 -- Demo Dock

**New file: `src/website-demo/DemoDock.tsx`**

Simplified dock bar:
- 8 app icons with magnification effect on hover (CSS scale transform)
- Running-app dot indicator for open windows
- Click to open/focus app window
- Glassmorphic bar material matching the real dock
- App launcher button (+) that shows all available apps

### Part 5 -- Demo Menu Bar

**New file: `src/website-demo/DemoMenuBar.tsx`**

Top status bar:
- Left: Apple-style SITA logo, app name of focused window
- Right: Live clock, Wi-Fi icon, battery icon, notification bell
- Glassmorphic material from `MATERIALS.menuBar`

### Part 6 -- Demo Desktop Icons

**New file: `src/website-demo/DemoDesktopIcons.tsx`**

Grid of double-clickable desktop icons:
- macOS-style icon rendering (gradient square with rounded corners + label)
- Single click selects (blue highlight), double click opens app window
- Icons for all 8 apps with proper domain gradients

### Part 7 -- Shared Demo Primitives

**New file: `src/website-demo/demo-primitives.tsx`**

Reusable building blocks for mock app content:
- `MockCard` -- Glassmorphic stat card with label, value, trend indicator
- `MockChart` -- Simple SVG sparkline/bar chart with hardcoded data
- `MockTable` -- Styled table rows for lists
- `MockGauge` -- Circular progress ring (used for Peace Score, consensus)
- `MockSidebar` -- App sidebar with nav items and active state
- `MockAvatar` -- Uses the real advisor portrait PNGs

### Part 8 -- Demo Data

**New file: `src/website-demo/demo-data.ts`**

All mock data in one file:
- Business KPIs, pipeline deals, lead list
- Finance accounts, bills, spending categories
- Concierge schedule, tasks, calendar events
- Investment portfolio positions, watchlist
- Advisor profiles with portrait image imports
- File/folder tree structure
- Notes list

### Part 9 -- Integration Export

**New file: `src/website-demo/index.ts`**

Clean barrel export:
```typescript
export { WebsiteDemo } from './WebsiteDemo';
```

The component is designed to be dropped into any page:
```tsx
<WebsiteDemo />
```

It renders as a full-viewport interactive desktop experience with no external dependencies beyond React, Framer Motion, Lucide icons, and Tailwind CSS (all already in the project).

## Technical Details

- Zero auth/Supabase dependencies -- all imports stay within `website-demo/` or use `@/lib/utils`, `lucide-react`, `framer-motion`, and Tailwind
- Advisor portraits imported from `@/assets/advisors/` (the generated PNGs)
- Design tokens (gradients, materials, depth layers) are duplicated as local constants to avoid coupling to the OS runtime
- Window manager uses `useReducer` with actions: `OPEN`, `CLOSE`, `FOCUS`, `MINIMIZE`, `MAXIMIZE`, `MOVE`
- All animations use Framer Motion spring physics matching the real OS feel
- Responsive: works at 1024px+ (shows "Best viewed on desktop" message below 1024px)
- Total estimated size: ~15 files, ~2500 lines

## Files Created
- `src/website-demo/index.ts`
- `src/website-demo/WebsiteDemo.tsx`
- `src/website-demo/DemoWindowManager.tsx`
- `src/website-demo/DemoDock.tsx`
- `src/website-demo/DemoMenuBar.tsx`
- `src/website-demo/DemoDesktopIcons.tsx`
- `src/website-demo/demo-primitives.tsx`
- `src/website-demo/demo-data.ts`
- `src/website-demo/apps/DemoBusinessApp.tsx`
- `src/website-demo/apps/DemoFinanceApp.tsx`
- `src/website-demo/apps/DemoConciergeApp.tsx`
- `src/website-demo/apps/DemoBoardroomApp.tsx`
- `src/website-demo/apps/DemoInvestmentApp.tsx`
- `src/website-demo/apps/DemoFilesApp.tsx`
- `src/website-demo/apps/DemoNotesApp.tsx`
- `src/website-demo/apps/DemoSettingsApp.tsx`

## Files Modified
- None -- fully additive

