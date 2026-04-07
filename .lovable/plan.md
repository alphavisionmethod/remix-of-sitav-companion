

# Fix Section 8: Expand 3 Stub/Minimal Pages

## Investigation Results

After scanning ALL 657 pages, only the 3 reported files have ≤15 lines. No additional stubs exist (next smallest is 23 lines — a test file).

**Root cause analysis:**
- `CustomerHealthPage.tsx` (15 lines) — wraps `CustomerHealthDashboard` which has **zero DB wiring** (463 lines of hardcoded demo data, no `fromTable`, no `isDemoMode` switching). This is the real problem.
- `OnboardingWrapper.tsx` (7 lines) — wraps `OSSetupExperience` (992 lines, already has Supabase integration). Unused `useDataMode` import. Legitimate thin wrapper — just needs cleanup.
- `BusinessOnboarding.tsx` (8 lines) — wraps `FormationShell` (175 lines, no DB wiring but has 20 screen components). Unused `isDemoMode`. Legitimate thin wrapper — just needs cleanup.

## Plan

### 1. CustomerHealthPage.tsx — Expand with DB-backed data switching

This is the only real stub. The page and its dashboard need isDemoMode switching with live data from the `customers` and `digital_twins` tables.

**Changes:**
- Add `useDataMode` + `isDemoMode` gate to `CustomerHealthDashboard.tsx`
- In live mode: query `customers` table (has `health_score`, `status`, `lifetime_revenue`) and `digital_twins` table (has `churn_probability`, `health_score`, `trend`, `segment`)
- In demo mode: keep existing hardcoded demo data
- Expand page file to pass isDemoMode down and add proper page-level metadata

### 2. OnboardingWrapper.tsx — Clean up dead import

- Remove unused `useDataMode` import (the wrapped `OSSetupExperience` already handles its own persistence)
- Add a brief comment explaining this is an intentional route-entry wrapper

### 3. BusinessOnboarding.tsx — Clean up unused isDemoMode

- Remove unused `isDemoMode` destructure (or wire it into `FormationShell` as a prop if FormationShell can use it)
- Remove unused `useDataMode` import if not needed

## Files Changed
- `src/components/business/CustomerHealthDashboard.tsx` — Add `fromTable` queries for `customers` + `digital_twins`, isDemoMode switching
- `src/pages/CustomerHealthPage.tsx` — Pass data mode context to dashboard
- `src/pages/OnboardingWrapper.tsx` — Remove dead import
- `src/pages/revenue-office/BusinessOnboarding.tsx` — Remove dead import/variable

