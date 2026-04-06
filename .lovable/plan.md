

# SITA OS — Final Push to True 95% Deployment-Ready

## Current State (Honest)

Everything from Steps 1–25 is complete. The system is structurally sound. Here's what remains:

| Area | Status | Gap |
|------|--------|-----|
| Security scanner | 1 stale warning | `system_config` finding is stale — migration already applied, scanner needs re-run + finding dismissed |
| Leaked password | Ignored (correct) | Operator action only |
| Mock data in pages | 22 pages still import `MOCK_*` | Most are admin/specialized pages — acceptable for v1 |
| NotificationSettings | Local state only | Preferences don't persist to DB |
| Boardroom | Uses mock enrichment | `useBoardroomData()` already wired; mock advisors are presentation chrome |
| InvestmentOffice | Fully mock | Uses `MOCK_CAPITAL_BUCKETS`, `MOCK_POSITIONS`, `MOCK_THESES` — no DB tables for investments |
| File upload | Wired to Supabase Storage | Already functional via `FileUploader.tsx` |
| Error boundaries | 6 domain layouts wrapped | Already done |
| Skeletons | 26+ pages have loading states | Good coverage |

## 5 Steps to 95%

### Step 1 — Clear stale security finding
The `system_config` permissive policy was already dropped in migration `20260406121456`. The scanner result is stale. Re-run the security scan and dismiss the finding using `manage_security_finding`.

**Action**: Delete or update the `system_config_public_read` finding to reflect reality.

### Step 2 — Persist notification preferences
`NotificationSettingsPage.tsx` has category toggles, quiet hours, and channel preferences — all local `useState`. Save to `profiles.preferences` (same JSONB column used by SettingsPage). Load on mount.

**File**: `src/pages/NotificationSettingsPage.tsx`

### Step 3 — Wire DailyPulse empty states
DailyPulse is the landing page. When DB tables are empty (before seed), it should show clear "Seed your data" CTAs instead of blank cards. Add a prominent CTA that calls `seed-user-data` when no data is detected.

**File**: `src/pages/DailyPulse.tsx`

### Step 4 — Add loading/error states to 3 remaining key pages
These pages query DB but lack proper loading/error handling:
- `MoneyCenter` subpages (`MoneyOverview`, `CashTiming`)
- `ConnectorHub` (has `isLoading` but no error state with retry)

Add `SectionSkeleton` for loading and `EmptyState` with retry for errors.

**Files**: `src/pages/money/MoneyOverview.tsx`, `src/pages/ConnectorHub.tsx`

### Step 5 — Update plan.md and final documentation
- Add Steps 26–30 to `.lovable/plan.md`
- Update score table to reflect 95% deployment readiness
- Document remaining v2 items (InvestmentOffice DB tables, full Boardroom live data)

## What's Explicitly NOT in Scope (v2)

These are real gaps but acceptable for a 95% deployment milestone:
- InvestmentOffice DB tables (positions, theses, capital buckets) — requires new schema design
- Full Boardroom live aggregation — requires complex cross-table queries
- 22 admin pages with mock data — admin-only, not user-facing
- Workflow step-by-step execution visualization

## Expected Outcome

| Area | Before | After |
|------|--------|-------|
| Security findings | 1 stale warning | 0 actionable |
| Notification prefs | Local state | Persisted |
| DailyPulse empty state | Blank cards | Seed CTA |
| Loading/error coverage | 26 pages | 29 pages |
| Deployment readiness | ~90% | ~95% |

## Files Summary
- 1 security operation: dismiss stale `system_config_public_read` finding
- 1 page edit: `NotificationSettingsPage.tsx` (persist to profiles.preferences)
- 1 page edit: `DailyPulse.tsx` (seed CTA when empty)
- 2 page edits: `MoneyOverview.tsx`, `ConnectorHub.tsx` (error states)
- 1 doc update: `.lovable/plan.md`

