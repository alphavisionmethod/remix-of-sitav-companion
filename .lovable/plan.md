

# What's Still Missing — Full Gap Analysis

After reviewing the entire codebase across desktop and mobile, here are the remaining gaps:

## 1. "What Matters Now" Widget Is Not Clickable
`DesktopWhatMattersWidget` never received an `onLaunchApp` prop. Each domain card (Business, Finance, Concierge) inside it should click-to-launch its respective app, but currently does nothing.

## 2. Mobile "More" Menu Is Just Settings — No Way to Reach Other Pages
The "More" tab in `MobileTabBar` goes directly to `/mobile/settings`. There is no "More" hub page that links to Boardroom, Approvals, Alerts, Proof Log, Device Trust, Emergency Actions, Quick Capture, or Investment. Users on mobile have no way to reach these pages except by typing the URL.

**Fix**: Create a `MobileMore.tsx` page with a grid/list of all secondary features, and route the "More" tab to it. Keep Settings as one item inside that page.

## 3. Missing Mobile Pages for Key Domains
- **Investment** — no `/mobile/investment` page or route exists. Desktop has a full Investment Office app, but mobile users cannot access it.
- **Files** — no `/mobile/files` page. Desktop has Finder but mobile has no equivalent.

## 4. Sign Out Button Does Nothing on Mobile
`MobileSettings.tsx` renders a "Sign Out" `NavRow` but it has no `onClick` handler — clicking it does nothing.

## 5. "What Matters Now" Widget Items Not Clickable on Desktop  
Each domain summary card inside the widget should launch its corresponding app when clicked.

## 6. Mobile Route Map Incomplete
`MOBILE_ROUTE_MAP` in `App.tsx` only covers `/desktop`, `/business`, `/money`, `/concierge`, `/boardroom`, `/settings`. Missing:
- `/files` → `/mobile/files`
- `/investment` → `/mobile/investment`
- `/approvals` → `/mobile/approvals`

---

## Plan

### Step 1: Create Mobile "More" Hub Page
- New file: `src/pages/mobile/MobileMore.tsx`
- Grid of links to: Boardroom, Approvals, Alerts, Proof Log, Investment, Files, Device Trust, Emergency, Settings, Quick Capture
- Update `MobileTabBar` "More" path from `/mobile/settings` to `/mobile/more`
- Add route in `MobileRoutes.tsx`

### Step 2: Create Missing Mobile Pages
- `src/pages/mobile/MobileInvestment.tsx` — portfolio summary, holdings, performance
- `src/pages/mobile/MobileFiles.tsx` — recent files list, folders
- Add routes for both in `MobileRoutes.tsx`

### Step 3: Wire Sign Out on Mobile
- Import `useAuth` in `MobileSettings.tsx`
- Add `signOut()` call to the Sign Out `NavRow`

### Step 4: Make "What Matters Now" Widget Clickable
- Add `onLaunchApp` prop to `DesktopWhatMattersWidget`
- Each domain card clicks to launch its app (business, finance, concierge)
- Pass `onLaunchApp` from `renderWidget` in `DesktopSurface.tsx`

### Step 5: Expand Mobile Route Map
- Add `/files`, `/investment`, `/approvals` entries to `MOBILE_ROUTE_MAP` in `App.tsx`

### Files to Create
- `src/pages/mobile/MobileMore.tsx`
- `src/pages/mobile/MobileInvestment.tsx`
- `src/pages/mobile/MobileFiles.tsx`

### Files to Modify
- `src/components/mobile/MobileTabBar.tsx` — point More to `/mobile/more`
- `src/routes/MobileRoutes.tsx` — add 3 new routes
- `src/pages/mobile/MobileSettings.tsx` — wire sign out
- `src/components/sita/shell/desktop/DesktopWhatMattersWidget.tsx` — add onLaunchApp
- `src/components/sita/shell/DesktopSurface.tsx` — pass onLaunchApp to WhatMatters
- `src/App.tsx` — expand MOBILE_ROUTE_MAP

No database changes.

