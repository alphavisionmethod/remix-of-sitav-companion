
# SITA OS — Behavioral Truth Verification System

## Phase 1: Database Foundation
Create verification tables:
- `verification_surfaces` — full inventory of every route, action, button, form
- `verification_runs` — test execution records with pass/fail/mode/env
- `verification_evidence` — screenshots, logs, traces linked to runs
- `verification_blockers` — auto-computed launch blockers from failures
- RLS policies for all tables (user-scoped)

## Phase 2: Surface Inventory Registry
Create a TypeScript registry (`src/lib/verification/surface-registry.ts`) that maps every route, page, tab, action, button, form, and modal with:
- route key, path, shell, domain
- action type, label, test selector
- expected result, backend dependency
- supported modes, launch honesty class
- priority (P0/P1/P2)

Scan existing routes and components to build the initial inventory.

## Phase 3: Test ID Infrastructure
Add `data-testid` attributes to all P0 and P1 interactive elements across:
- Auth pages (login, signup)
- Navigation (sidebar, topbar)
- Files, Boardroom, AI Chat, Approvals
- Connectors, Admin OS pages
- Settings, Owner Center

## Phase 4: Admin Verification Dashboard
Build 7 admin boards as routes under `/admin/verification/`:
- V01: Surface Inventory Board
- V02: Interaction Coverage Board
- V03: P0 Journey Board
- V04: Mode Verification Board
- V05: Failure Triage Board
- V06: Evidence Explorer
- V07: Launch Blocker Board

## Phase 5: Playwright E2E Tests
Create Playwright test suites for all P0 journeys:
- Auth (sign in, sign out, session persistence)
- Files (upload, browse, manage)
- AI/Advisors (chat, response, degraded)
- Boardroom (load, refresh, mode)
- Approvals (action, state change)
- Connectors (connect flow, states)
- Admin OS (runtime truth, AI governance, approvals)
- Mode variants (real, demo, degraded)

## Phase 6: Verification Seeding & Evidence Pipeline
- Seed `verification_surfaces` from the TypeScript registry
- Create edge function for recording test results
- Wire admin boards to live DB data

## Files Changed
| Area | Files |
|---|---|
| Migration | New tables: verification_surfaces, verification_runs, verification_evidence, verification_blockers |
| Registry | `src/lib/verification/surface-registry.ts` |
| Test IDs | Multiple component files across src/pages and src/components |
| Admin UI | 7 new pages under `src/pages/admin/verification/` |
| Playwright | `tests/e2e/` directory with journey test files |
| Edge Function | `supabase/functions/verification-recorder/index.ts` |
