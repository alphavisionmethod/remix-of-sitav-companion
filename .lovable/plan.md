

# SITA OS Application Platform — Completion Audit

## Current State: 95% Complete

All 24 spec screens (APS01–APS24) are implemented as pages, all wired to `AppPlatformContext`, with Supabase persistence + localStorage fallback. The catalog has 35+ apps across all required categories. 7 bundles cover all spec packs. 30+ reusable components exist in `AppStoreComponents.tsx`.

## Remaining Gaps (2 items)

### Gap 1: InstallSheet post-install buttons not wired
**File:** `src/components/sita/app-platform/AppStoreComponents.tsx` (lines 404–409)

The "Open" and "Pin to Dock" buttons in the `InstallSheet`'s installed state are plain buttons with no `onClick`. They should:
- **Open**: close the sheet (the app is already "open" in a web context)
- **Pin to Dock**: call `pinToDock(app.id)` via a new prop, then show a toast

**Fix:** Add `onPinToDock` and `onOpen` callback props to InstallSheet, wire them from all calling pages (AppStorePage, AppDetailPage, AppComparePage, etc.).

### Gap 2: No dedicated Receipt Detail view (APS23)
Receipts are shown inline on the `AppReceiptsPage`, but spec calls for a dedicated receipt detail page with:
- Full receipt metadata
- Source verification card
- Permission diff panel
- Action timeline
- Export receipt button

**Fix:** Create `src/pages/app-platform/AppReceiptDetailPage.tsx` with route `/app-store/receipt/:receiptId`. Make each receipt card in `AppReceiptsPage` clickable to navigate there.

## Files to Modify

1. **`src/components/sita/app-platform/AppStoreComponents.tsx`** — Add `onPinToDock`/`onOpen` props to InstallSheet's installed state buttons
2. **`src/pages/app-platform/AppStorePage.tsx`** — Pass pin/open handlers to InstallSheet
3. **`src/pages/app-platform/AppDetailPage.tsx`** — Pass pin/open handlers to InstallSheet
4. **`src/pages/app-platform/AppComparePage.tsx`** — Pass pin/open handlers to InstallSheet
5. **`src/pages/app-platform/AppReceiptDetailPage.tsx`** — New file: dedicated receipt detail view
6. **`src/pages/app-platform/AppReceiptsPage.tsx`** — Make receipt cards clickable → navigate to detail
7. **`src/App.tsx`** — Add route for `/app-store/receipt/:receiptId`

## What Is Already Complete (no changes needed)

All other spec requirements are fully implemented:
- 35+ apps across browsers, communication, productivity, dev tools, business, finance, security, household, utilities, entertainment
- 7 bundles with batch install + progress
- Full trust model (6 levels), source origins (8), sandbox levels (5), package types (6), update modes (5)
- Install Sheet with animated progress, scope selector, sandbox recommendations
- Permissions Center with domain-based views
- Default Apps + File + Protocol association managers
- Open With dialog
- Enterprise catalog with role-based access
- Developer tools catalog with category filters
- First Launch 3-step handoff flow
- External installer with verified/unknown source analysis
- Web app install with "Add to SITA" magic
- Compare view with feature/permission diff matrix
- All pages wired to reactive context with Supabase persistence
- Receipt generation on every lifecycle action

