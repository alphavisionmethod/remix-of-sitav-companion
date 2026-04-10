

# Cron / Scheduler / Automation Reality — Gap Fix Plan

## What Already Exists (Fully Built)
- **Database**: `scheduled_jobs`, `job_executions`, `automation_kill_switches` tables with RLS, indexes, triggers
- **pg_cron**: Active, calling `scheduler-dispatch` every minute
- **scheduler-dispatch**: 270-line edge function — kill switch check, due job finder, edge function dispatcher, execution recorder, next-run calculator, retry/degradation logic
- **9 AR admin pages** (AR01–AR09): All wired to real Supabase tables, fully functional
- **Routes**: All 9 at `/admin/automation/*`
- **Edge functions**: `self-healing`, `agent-scheduler`, `agent-heartbeat`, `system-updates` deployed

## Gaps Found (3 Issues)

### Gap 1: No ARSubNav
AR pages lack the sub-navigation bar that SAG and AIG pages have. Users can't navigate between AR01–AR09 without knowing URLs.

**Fix**: Create `src/components/admin/ARSubNav.tsx` (same pattern as SAGSubNav/AIGSubNav) and inject it into all 9 AR pages.

### Gap 2: No Command Palette Entries
AR pages are not discoverable via Cmd+K. SAG has 12 entries, AIG has 9 — AR has zero.

**Fix**: Add 9 entries to `UniversalCommandSurface.tsx` under an "Automation Reality" group.

### Gap 3: Seed Data Schema Mismatch
`scheduledJobRows()` in `ecosystem-master-seeder.ts` uses wrong column names (`job_key`, `display_name`, `schedule`, `enabled`, `job_type`, `config`) that don't match the actual `scheduled_jobs` table schema (`name`, `cron_expression`, `target_function`, `state`, `job_class`, `domain`). This means seeding fails silently.

**Fix**: Rewrite `scheduledJobRows()` with correct columns and expand to include all 14 job classes from Part 7 (health_check, self_heal, agent_heartbeat, agent_execution, maintenance, cleanup, consistency_check, projection_rebuild, scheduled_notification, scheduled_verification, scheduled_sync, budget_enforcement, policy_audit, digest_generation). Each job should reference a real edge function target.

## Implementation Steps

1. **Create ARSubNav** — `src/components/admin/ARSubNav.tsx` with 9 navigation links matching `/admin/automation/*` routes
2. **Inject ARSubNav** into all 9 AR pages (AR01–AR09) — add import + render at top of each page
3. **Add 9 Command Palette entries** to `UniversalCommandSurface.tsx` for all AR pages
4. **Fix seed data** — rewrite `scheduledJobRows()` with correct schema and 14+ canonical job definitions covering all required job classes
5. **Build verification** — confirm clean TypeScript build

### Technical Details
- ARSubNav: ~50 lines, follows exact SAGSubNav pattern
- 9 page edits: ~3 lines each (import + render)
- Command palette: ~20 lines for 9 entries
- Seed rewrite: ~60 lines for 14 canonical jobs with correct column mapping
- No new tables, edge functions, or migrations needed — everything else is already fully implemented

