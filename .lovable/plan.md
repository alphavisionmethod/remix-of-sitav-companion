

# Migration Plan: Unify Business into the Windowed App

## Problem

Two separate Business experiences exist:
- **BusinessAppShell** (the windowed OS app you see when clicking the Business icon) — has 7 sidebar items, most show placeholder "DATA CANVAS" text
- **BusinessCenter** (React Router `/business/*` pages) — has 40+ fully built sub-pages including the entire CRM system, sales tools, growth tools, intelligence, and office functions

The windowed app should be the **only** Business experience, containing everything.

## Architecture

The windowed `BusinessAppShell` at `src/components/sita/apps/business/BusinessAppShell.tsx` will be rebuilt to:
1. Import all 40+ page components currently used by `BusinessCenter`
2. Replicate the same sidebar navigation groups (CRM, Core, Sales, Growth, Intelligence, Office)
3. Render the correct page component based on `activeModule` state
4. Keep the existing Boardroom bridge, advisor board, and pipeline health views

## What Changes

### 1. Rebuild `BusinessAppShell` (major rewrite)
**File:** `src/components/sita/apps/business/BusinessAppShell.tsx`

- Expand `MODULES` from 7 items to the full sidebar structure (6 groups, 40+ items) matching the `TAB_GROUPS` from `BusinessCenter.tsx`
- Import all page components (CRMHome, CRMContacts, CRMCompanies, CRMPipeline, BusinessOverview, LeadsInbox, QuotesWorkspace, etc.)
- Replace the "DATA CANVAS" placeholder with a `pages` map that renders the correct component for each `activeModule` value
- Add collapsible sidebar groups matching the current design (CRM, Core, Sales, Growth, Intelligence, Office)
- Keep the existing Boardroom status strip, advisor board, and pipeline health views as they are
- Preserve the glassmorphic dark sidebar aesthetic already in place

### 2. Update `BusinessCenter` to redirect into the windowed app
**File:** `src/pages/BusinessCenter.tsx`

- Instead of rendering its own `DomainAppShell`, it will open the Business window via the Window Manager and close/redirect
- This ensures any legacy `/business/*` route links still work by triggering the windowed app with the correct sub-page

### 3. Wire route-to-module mapping
**File:** `src/components/sita/shell/ShellWindowLayer.tsx`

- Update the business window entry to accept an optional `initialModule` prop so links/routes can deep-link into a specific CRM page inside the windowed app

### 4. Update CRM pages to remove `useNavigate` router dependencies
**Files:** ~10 CRM page files that use `useNavigate` for internal CRM navigation

- Replace `navigate("/business/crm-contacts")` calls with a callback prop or context-based navigation that sets `activeModule` inside the shell
- Create a `BusinessNavigationContext` that the shell provides, so any child page can call `navigateTo("crm-contacts")` without depending on React Router

### 5. Fix cross-references from other domains
**Files:** Any component outside Business that links to `/business/*`

- These will trigger the Window Manager to open Business with the correct initial module, rather than navigating via router

## Files Modified Summary

| File | Change |
|------|--------|
| `src/components/sita/apps/business/BusinessAppShell.tsx` | Major rewrite — full sidebar, all pages, navigation context |
| `src/pages/BusinessCenter.tsx` | Convert to window-opener redirect |
| `src/components/sita/shell/ShellWindowLayer.tsx` | Add initialModule support for business window |
| New: `src/contexts/BusinessNavigationContext.tsx` | Internal navigation context replacing useNavigate |
| ~10 CRM/business page files | Replace `useNavigate` with context-based navigation |
| `src/routes/business-routes.tsx` | Simplify — most routes become window-open triggers |

## What Stays the Same

- All 22 CRM components in `src/components/business/crm/` — untouched
- All page component logic and UI — untouched (they just render inside the window instead of the router)
- Database tables, hooks, data layer — untouched
- The windowed app's visual style (dark glassmorphic sidebar) — preserved and extended

## Estimated Scope

~6 file modifications, 1 new file, no database changes.

