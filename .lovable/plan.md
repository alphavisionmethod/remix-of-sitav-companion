

# SITA OS — Final 95% Deployment-Ready Plan

## Honest Current State

**Critical blocker: ALL 15 core tables still have 0 rows.** The auto-seed code exists in `AuthContext.tsx` but has never fired because no user has logged in since it was added. Every "live mode" page shows empty.

| Area | Status |
|------|--------|
| **Data** | 0 rows in leads, customers, invoices, bills, tasks, workflows, approval_queue, notifications_queue, deals, events, policies, user_memory, incidents, bookings, budgets |
| **CRUD hooks** | ApprovalsCenter has approve/reject mutations (wired). Bills, Leads, Policies, Workflows have CRUD. |
| **ApprovalChamber** | Fully hardcoded mock data — not wired to DB at all |
| **Boardroom** | `useBoardroomData` queries DB but falls back to mocks when empty. Also imports `mockAdvisors` etc. |
| **AdvisorWorkspace** | Chat tab works. Council/Priorities/Compare/Simulations/Approvals/Memory/Proof tabs all use mock imports |
| **GDPR/Sovereign Export** | Page exists with buttons but neither calls `gdpr-export` or `gdpr-delete` edge functions |
| **File Upload** | FileUploader component exists and is wired to Supabase Storage — functional |
| **Settings** | Full preferences persistence to JSONB column — functional |

## 6 Steps to 95%

### Step 1 — Force-seed data via edge function call
The seed-user-data function requires auth. We need to ensure it reliably fires on login. 
- Add a manual "Seed Demo Data" button to Settings or DailyPulse as a fallback trigger
- Call `supabase.functions.invoke('seed-user-data')` directly
- Once data exists, all read-only pages immediately light up

### Step 2 — Wire ApprovalChamber to DB
Replace `MOCK_APPROVALS` array with `useApprovals()` or `useApprovalQueue()` from existing hooks. Map DB fields to the `ApprovalItem` interface. Add approve/reject mutations using the existing `useApprovalQueue().approve/reject` methods.

**File**: `src/pages/ApprovalChamber.tsx`

### Step 3 — Wire GDPR buttons on SovereignExportPage
- "Export All Data" button calls `supabase.functions.invoke('gdpr-export')` and downloads the response as JSON
- "Request Deletion" button shows confirmation dialog, then calls `supabase.functions.invoke('gdpr-delete')`
- Replace hardcoded `EXPORTABLE_TABLES` with actual table counts from DB

**File**: `src/pages/SovereignExportPage.tsx`

### Step 4 — Replace AdvisorWorkspace mock tabs with DB queries
For the Council tab: query `advisor_configs` table. For Memory tab: query `user_memory` table. For Approvals tab: use `useApprovalQueue()`. Keep Simulations/Compare/Proof as enriched demo UI (acceptable for v1).

**File**: `src/pages/advisors/AdvisorWorkspace.tsx`

### Step 5 — Clean Boardroom mock imports
Boardroom already has `useBoardroomData()` pulling from DB with mock fallbacks. Remove the direct `mockAdvisors`, `mockRecommendations`, `mockSynthesis`, `mockApprovals`, `mockProofHistory` imports and replace with DB-backed data or the existing hook data. This ensures live mode shows real data once seeded.

**File**: `src/pages/Boardroom.tsx`

### Step 6 — Update documentation
- Update `.lovable/plan.md` with Steps 22-27
- Update `FINAL_ARQ_REPORT_v3.md` with accurate completion state

## Expected Outcome

| Area | Before | After |
|------|--------|-------|
| Core tables with data | 0/15 | 15/15 (via seed button) |
| ApprovalChamber | Hardcoded mocks | Live DB + mutations |
| GDPR export/delete | Buttons do nothing | Call edge functions |
| AdvisorWorkspace live tabs | 1/8 | 4/8 |
| Boardroom mock imports | 5 mock imports | 0 (DB-backed) |
| Deployment readiness | ~80% | ~95% |

## Files Summary
- 1 page edit + seed button: `DailyPulse.tsx` or `SettingsPage.tsx`
- 1 page rewrite: `ApprovalChamber.tsx` (wire to DB)
- 1 page edit: `SovereignExportPage.tsx` (wire GDPR functions)
- 1 page edit: `AdvisorWorkspace.tsx` (replace 3 mock tabs)
- 1 page edit: `Boardroom.tsx` (remove mock imports)
- 2 doc updates: `plan.md`, `FINAL_ARQ_REPORT_v3.md`

