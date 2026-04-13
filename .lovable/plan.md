

# Wow-Factor Frontend Polish + Admin/User Separation + Multi-Tenancy

## Current State

- **Business OS** just got the app-window shell treatment. Money Center and Concierge Center still use the old `CenterPageShell` + flat `SitaTabs` pattern -- visually inconsistent.
- **Admin routes** (~280 routes under `/admin/*`) are wrapped in `AdminShellLayout` which renders `AdminShell` (trust ribbon, rollout banner, density toggle). But there is **no role gate** -- any authenticated user can navigate to `/admin/*` and see everything. The `useRequireAdmin` hook exists but is not used in `AdminShellLayout` or the route wrapper.
- **Sidebar** (`AppSidebar`) shows "Control Room" (`/owner`) to every user. No admin-only items are hidden.
- **Multi-tenancy** is not wired -- `user_roles` and `has_role()` exist in the DB, but no `tenant_id` / `organization_id` column exists on any table.

## Plan

### Part 1: Admin/User Separation (Critical)

**Step 1: Create `AdminRoute` guard component**
Create `src/components/auth/AdminRoute.tsx` that wraps children with `useRequireAdmin`. If the user is not an admin, redirect to `/home`. Show a loading spinner while checking. Use this instead of bare `AdminShellLayout` in `App.tsx`.

**Step 2: Gate all admin routes**
In `App.tsx`, wrap the three `<Route element={<AdminShellLayout />}>` blocks inside `<AdminRoute>` so non-admin users cannot access any `/admin/*` route.

**Step 3: Conditionally show admin sidebar items**
In `AppSidebar.tsx`, add a `useIsAdmin` check (lightweight version of `useRequireAdmin` without redirect). Hide "Control Room" (`/owner`) from non-admin users. Add a new "Mission Control" (`/admin`) link visible only to admins.

**Step 4: Hide admin command palette for non-admins**
The `AdminCommandPaletteWrapper` and `AdminKeyboardShortcutsWrapper` in `ShellLayout.tsx` should only render for admin users.

### Part 2: Multi-Tenancy Foundation

**Step 5: Add `organizations` and `org_members` tables**
Database migration to create:
- `organizations` (id, name, slug, owner_id, created_at)
- `org_members` (id, org_id, user_id, role, invited_at, joined_at)
- RLS: members can read their own org, owners can manage members
- Add `org_id` column to key tables (profiles, leads, customers, invoices, opportunities) with nullable default for backward compat

**Step 6: Create `useCurrentOrg` hook**
`src/hooks/useCurrentOrg.ts` — reads the user's active organization from `org_members`, stores selection in localStorage. All data queries will eventually filter by `org_id`.

### Part 3: Wow-Factor Visual Upgrades

**Step 7: Give Money Center the app-window shell treatment**
Create `src/components/money/MoneyAppShell.tsx` — same pattern as `BusinessAppShell` but with emerald/green accent (`from-[hsl(152_55%_48%)] to-[hsl(165_50%_42%)]`). Replace `CenterPageShell` + `SitaTabs` in `MoneyCenter.tsx` with the new shell. Add "Money OS" to `DesktopIconGrid`.

**Step 8: Give Concierge Center the app-window shell treatment**
Create `src/components/concierge/ConciergeAppShell.tsx` — purple/fuchsia accent (`from-[hsl(285_55%_55%)] to-[hsl(310_50%_48%)]`). Replace `CenterPageShell` + `SitaTabs` in `ConciergeCenter.tsx`. Add "Concierge" to `DesktopIconGrid`.

**Step 9: Unified app-open animation**
Create `src/components/sita/shell/AppOpenTransition.tsx` — a shared scale+fade animation wrapper that plays when navigating to any domain app (Business, Money, Concierge). Uses the same spring curve as FloatingWindow open.

**Step 10: Enhanced desktop widget glassmorphism**
Polish `DesktopSurface` widgets with:
- Stronger inner glow borders (`inset 0 0.5px 0 rgba(255,255,255,0.12)`)
- Hover state with accent-colored radial glow
- Micro-interaction: subtle scale(1.02) on hover with 200ms spring

## Files Changed

- **Create**: `src/components/auth/AdminRoute.tsx` (~30 lines)
- **Create**: `src/hooks/useIsAdmin.ts` (~25 lines)
- **Create**: `src/components/money/MoneyAppShell.tsx` (~180 lines)
- **Create**: `src/components/concierge/ConciergeAppShell.tsx` (~180 lines)
- **Create**: `src/components/sita/shell/AppOpenTransition.tsx` (~40 lines)
- **Create**: `src/hooks/useCurrentOrg.ts` (~40 lines)
- **Edit**: `src/App.tsx` (wrap admin routes with AdminRoute guard)
- **Edit**: `src/components/sita/AppSidebar.tsx` (conditional admin nav items)
- **Edit**: `src/components/sita/ShellLayout.tsx` (conditional admin palette)
- **Edit**: `src/pages/MoneyCenter.tsx` (use MoneyAppShell)
- **Edit**: `src/pages/ConciergeCenter.tsx` (use ConciergeAppShell)
- **Edit**: `src/components/sita/shell/DesktopIconGrid.tsx` (add Money OS + Concierge icons)
- **Edit**: `src/lib/design-system/app-window-system.ts` (add money-os + concierge accents)
- **Migration**: `organizations` + `org_members` tables with RLS

## Execution Order

1. Admin/User separation (Steps 1-4) — security first
2. Multi-tenancy tables (Steps 5-6) — foundation
3. Visual upgrades (Steps 7-10) — wow factor

