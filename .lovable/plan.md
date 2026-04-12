

# Connect Errands & Logistics to Database with CRUD

## Current State
- **Database**: `concierge_errands` table exists with columns: `id`, `user_id`, `title`, `location`, `priority`, `status`, `estimated_minutes`, `combinable`, `bundle_id`, `due_date`, `notes`, `created_at`, `updated_at`. RLS is active.
- **Read hook**: `useErrands()` in `use-concierge-data.ts` already fetches from DB.
- **Page**: `ErrandsLogistics.tsx` uses hardcoded `BUNDLES` and `TIMELINE` arrays — zero DB connection.

## Plan

### 1. Add mutation hooks for errands CRUD
**File: `src/hooks/use-concierge-data.ts`** — Add 3 new exports:
- `useCreateErrand()` — inserts into `concierge_errands`, invalidates `["concierge-errands"]`
- `useUpdateErrand()` — updates by id (status, priority, title, bundle_id, etc.)
- `useDeleteErrand()` — deletes by id

All mutations use `fromTable("concierge_errands")` and require authenticated `user_id`.

### 2. Create Add Errand dialog component
**New file: `src/components/concierge/AddErrandDialog.tsx`**
- Form with fields: title (required), location, priority (high/medium/low), estimated_minutes, combinable toggle, due_date, bundle_id (optional text), notes
- Uses `useCreateErrand()` on submit
- Triggered by a "+" button on the page header

### 3. Rewrite ErrandsLogistics.tsx to use live data
**File: `src/pages/concierge/ErrandsLogistics.tsx`**
- Replace hardcoded `BUNDLES` / `ALL_ERRANDS` / `TIMELINE` with `useErrands()` data
- Derive bundles by grouping errands on `bundle_id` (errands without a bundle_id go into an "Unbundled" group)
- Derive timeline from errands sorted by `due_date` with status mapping (`done`/`current`/`upcoming` based on errand `status`)
- KPIs computed from live data
- Add inline status toggle (mark done) via `useUpdateErrand()`
- Add delete button per errand via `useDeleteErrand()`
- Add "Add Errand" button in header opening the dialog
- Keep demo data as fallback only when in demo mode (use `useRealityProvider()`)
- Show `ConciergeEmptyState` domain="errands" when no errands exist in real mode

### 4. Enhance ErrandBundleCard with action callbacks
**File: `src/components/concierge/ErrandBundleCard.tsx`**
- Add optional `onToggleDone` and `onDelete` callback props per errand item
- Render a checkbox and delete icon when callbacks are provided

### Summary
- 1 new component (AddErrandDialog)
- 3 files modified (use-concierge-data.ts, ErrandsLogistics.tsx, ErrandBundleCard.tsx)
- No new tables or edge functions needed
- No schema changes — existing `concierge_errands` table covers all fields

