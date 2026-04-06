

# SITA OS — Deploy CI, Seed Data & Update ARQ Files

## What This Plan Does

1. **Deploy edge functions** — Deploy `seed-user-data` and all other edge functions so they're live
2. **Call seed-user-data** — Trigger the seed function to populate demo data for the logged-in user
3. **Update ARQ files** — Refresh `FINAL_ARQ_REPORT_v3.md` and `plan.md` with deployment status and seed data confirmation

## 3 Steps

### Step 1 — Deploy All Edge Functions
Deploy all 34 edge functions using the Supabase deploy tool. Key functions:
- `seed-user-data` — populates 22 tables with demo data
- `cost-alert`, `connector-health` — new functions from latest remediation
- All others — ensure latest auth/Zod/security changes are live

### Step 2 — Call seed-user-data
Use `curl_edge_functions` to invoke `seed-user-data` (POST) for the current user. This seeds: leads (7), customers (5), events (6), bills (5), invoices (5), subscriptions (6), reserves (3), quotes (3), deals (3), opportunities (3), tasks (6), household_tasks (3), policies (3), workflows (3), notifications (5), bookings (2), goals (3), approval_queue (2), audit_logs (4), connector_configs (4), communications (3), budgets (3).

Note: The function requires admin role. If the current user lacks admin role, we'll adjust the function to use `requireAuth` instead, or seed via the service role key.

### Step 3 — Update Documentation Files
Update both files with:
- **`FINAL_ARQ_REPORT_v3.md`**: Add "Deployment Status" section confirming all 34 functions deployed, seed data live, CI pipeline active
- **`.lovable/plan.md`**: Add Step 13 — "Deployed all edge functions and seeded demo data"

## Technical Details
- Edge functions auto-deploy on save in Lovable — the deploy tool confirms they're live
- `seed-user-data` checks if data already exists (idempotent via leads count check)
- No database schema changes needed — all tables already exist

