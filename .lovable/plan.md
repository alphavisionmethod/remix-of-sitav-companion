

# SITA OS — Database Tables Creation for Recommendation-to-Execution System

## Problem

All front-end code (14 admin boards, services, hooks) is fully implemented and wired. However, **none of the required database tables exist**. The database only has 11 basic concierge/lifestyle tables. All 641 CREATE TABLE statements across 100+ migrations have failed to apply — likely because early migrations reference tables that didn't exist yet (e.g., `ALTER TABLE public.launch_gates` runs before `launch_gates` is created).

The code uses `fromDynamicTable()` which bypasses TypeScript type checking, so the app compiles fine but every database operation will fail at runtime.

## What's Already Correct (No Changes Needed)

- All 14 admin pages (REX01-05, SERV01-06, FL01-03) exist and are routed
- `recommendation-loop-service.ts` (332 lines) — full lifecycle state machine
- `flagship-loop-service.ts` — 5 loops seeded with truth scoring
- `route-to-service-inventory.ts` (734 lines) — full action-level mapping
- Service ownership registry — 12 domains
- SubNav components (REX, SERV, FL) — all created
- AdminCommandPalette — all 14 entries wired
- Architecture boundary system — fully operational

## What Must Be Created — Single Consolidated Migration

One new migration that creates all tables the recommendation-to-execution system needs, in correct dependency order, using `CREATE TABLE IF NOT EXISTS` throughout. No ALTER TABLE on non-existent tables.

### Tables to create (in order):

**Tier 1 — No dependencies on other new tables:**
1. `ai_workforce_roles` — AI role registry
2. `ai_workforce_task_types` — task type definitions
3. `ai_workforce_budget_classes` — budget tiers
4. `flagship_loops` — with all columns (base + extensions merged)
5. `remediation_programs` — with all columns (base + extensions merged)

**Tier 2 — Depends on Tier 1:**
6. `ai_workforce_invocations` — AI invocation log
7. `ai_workforce_recommendations` — with all columns including lifecycle_status, flagship_loop_key, execution fields
8. `ai_workforce_approval_queue` — with recommendation_id reference
9. `ai_workforce_cached_outputs` — cache layer
10. `remediation_tasks` — references remediation_programs

**Tier 3 — Depends on Tier 2:**
11. `ai_workforce_outputs` — invocation outputs
12. `ai_workforce_recommendation_scores` — scoring dimensions
13. `ai_workforce_role_task_permissions` — role-task matrix
14. `ai_workforce_role_health` — role health metrics
15. `ai_workforce_launch_honesty` — launch truth per role
16. `recommendation_execution_bindings` — binds recommendations to execution
17. `outcome_verifications` — legacy table referenced by some code

**Tier 4 — Depends on Tier 3:**
18. `recommendation_execution_events` — execution event log
19. `recommendation_outcome_verifications` — outcome verification records
20. `recommendation_learning_signals` — learning feedback signals

### For each table:
- `CREATE TABLE IF NOT EXISTS` (idempotent)
- RLS enabled with user_id-based policies
- `updated_at` triggers where applicable
- All indexes from original migrations
- All columns merged (base + extension columns combined)

### Views to create:
- `v_recommendation_closure_summary`
- `v_remediation_program_summary`
- `v_recommendation_execution_pipeline`
- `v_outcome_verification_summary`

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Create (migration) | New SQL migration | All 20 tables + 4 views + RLS + indexes + triggers |

## What Does NOT Change
- No front-end code changes — everything is already wired
- No service changes — all services use `fromDynamicTable()` correctly
- No route changes — all 14 boards are routed
- No architecture changes — boundary system is complete

## Risk Notes
- This migration only creates the tables the recommendation/execution/flagship system needs
- The other ~600 tables from failed migrations are NOT in scope — they serve other features and should be addressed separately
- All tables use `user_id` with RLS, matching the existing pattern

