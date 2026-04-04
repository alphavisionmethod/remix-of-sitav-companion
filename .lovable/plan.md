

# Full Database Schema + Triggers + RLS + Edge Functions Deployment

## Current State

The database is **completely empty** — 0 tables, 0 functions, 0 triggers. However, **25 migration files** already exist with all table definitions, RLS policies, and the profile auto-creation trigger. The migrations just haven't been applied yet.

All 14 edge functions have complete code in `supabase/functions/`.

## What's Needed

### 1. Apply All Existing Migrations (CRITICAL)

Run a single consolidated migration that applies all the schema in the correct order. The existing 25 migration files define:

- **48+ tables** with RLS enabled on every one
- **`has_role()` SECURITY DEFINER function** for role-based access
- **`on_auth_user_created` trigger** for auto-creating profiles
- **`audit_sensitive_change()` trigger** on approval_queue, connector_credentials, policies, user_roles
- **`update_updated_at_column()` trigger** on 20+ tables

### 2. Add Missing Triggers (NEW)

Three triggers referenced in the spec don't exist in any migration:

| Trigger | On Table | Action |
|---------|----------|--------|
| `on_incident_created` | `incidents` | Auto-insert into `notifications_queue` with urgency based on severity |
| `on_approval_status_changed` | `approval_queue` | Auto-notify requester when status changes from `pending` |
| `on_workflow_run_failed` | `workflow_runs` | Auto-create incident when a workflow fails |

### 3. Edge Function Deployment

All 14 functions are already coded. They will auto-deploy via Lovable Cloud. No code changes needed — they already reference the correct tables.

## Implementation Plan

### Step 1: Create a single new migration with the 3 missing triggers

```sql
-- on_incident_created → auto-notify
CREATE OR REPLACE FUNCTION public.notify_on_incident()
RETURNS TRIGGER AS $$ ... $$;
CREATE TRIGGER on_incident_created AFTER INSERT ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_incident();

-- on_approval_status_changed → auto-notify requester  
CREATE OR REPLACE FUNCTION public.notify_on_approval_change()
RETURNS TRIGGER AS $$ ... $$;
CREATE TRIGGER on_approval_status_changed AFTER UPDATE OF status ON public.approval_queue
  FOR EACH ROW WHEN (OLD.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.notify_on_approval_change();

-- on_workflow_run_failed → auto-create incident
CREATE OR REPLACE FUNCTION public.incident_on_workflow_failure()
RETURNS TRIGGER AS $$ ... $$;
CREATE TRIGGER on_workflow_run_failed AFTER UPDATE OF status ON public.workflow_runs
  FOR EACH ROW WHEN (NEW.status = 'failed' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.incident_on_workflow_failure();
```

### Step 2: Deploy all 14 edge functions

Use `supabase--deploy_edge_functions` for all 14 functions to ensure they're live.

### Step 3: Verify

- Run security scan to confirm RLS coverage
- Run linter to check for issues
- Verify edge function logs

## Technical Details

- All trigger functions use `SECURITY DEFINER` so they can insert into notification/incident tables regardless of the invoking user's RLS
- `search_path = public` is set on all SECURITY DEFINER functions to prevent search_path attacks
- Notification urgency is mapped from incident severity: critical→critical, high→high, medium→normal, low→low
- Edge functions already exist and auto-deploy — the only database gap is the 3 missing triggers

