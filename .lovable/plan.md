

## Fix C-014: No Data Retention/TTL Policies — what's actually broken

### Live findings

I queried the live DB and the existing edge functions:

1. ✅ **16 tables already have `expires_at`** (admin_sessions, advisor_board_memory, ai_workforce_cached_outputs, cloud_import_export_jobs, cloud_shares, connector_oauth_tokens, connector_tokens, device_attestations, dual_authority_challenges, licenses, mobile_push_tokens, os_elevation_tokens, quotes, support_access_grants, webauthn_challenges) — and `cloud_trash` has `deleted_at`.

2. 🔴 **The 3 high-volume tables in the brief still need `expires_at`**: `notifications`, `ai_workforce_invocations`. (`ai_workforce_cached_outputs` already has it.)

3. 🔴 **No `data-cleanup` edge function exists.** Only `gdpr-delete` and `gdpr-export` exist in `supabase/functions/`.

4. 🔴 **No pg_cron job exists for cleanup.** `pg_cron` + `pg_net` extensions ARE enabled, but no scheduled cleanup job is registered.

5. 🟠 **`gdpr-delete` covers only ~36 tables but the DB has 222 user-scoped tables.** Major omissions confirmed: `notifications`, `appointments`, `concierge_*`, `crm_*`, `boardroom_*`, `ai_workforce_*`, `calendar_events`, `deals`, `bills`, `bookings`, `cloud_files`, `cloud_folders`, `connector_*`, `family_members`, etc. Also storage bucket is `documents` but the actual project bucket is `user-files`.

6. 🟠 **No retention dashboard / no cleanup receipts table** for audit trail of what was purged.

### The fix — 5 surgical changes

**1. DB migration** (`supabase/migrations/`): 
- `ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMPTZ` (default `now() + interval '90 days'`)
- `ALTER TABLE ai_workforce_invocations ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')`
- `ALTER TABLE ai_workforce_outputs ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '180 days')`
- `ALTER TABLE ai_inference_receipts ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '365 days')` (audit retention)
- `ALTER TABLE audit_logs ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '730 days')` (2yr per security policy)
- `ALTER TABLE error_events ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')`
- `ALTER TABLE cloud_activity_journal ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '180 days')`
- Indexes on `(expires_at)` for each
- New table `public.data_retention_runs` (id, ran_at, table_name, rows_deleted, duration_ms, error) with admin-only RLS — for proof/audit
- New canonical view of retention policies sourced from `security/policies/security-policies.md`

**2. New edge function `supabase/functions/data-cleanup/index.ts`**:
- `verify_jwt = false` (cron-callable) but requires `x-cleanup-secret` header matching a new secret `DATA_CLEANUP_SECRET` (we'll add via `add_secret`)
- Iterates a typed list of `{ table, mode: 'expires_at' | 'created_at_cutoff', cutoffDays? }` entries (covers all 16 existing `expires_at` tables + the 7 new ones above)
- Uses service role; deletes in batches of 500 to avoid long locks
- Writes one row per table to `data_retention_runs`
- Returns `{ status, totalDeleted, perTable: {...} }`
- Fully typed, Zod-validated body for manual admin runs (`{ dryRun?: boolean, only?: string[] }`)

**3. pg_cron schedule** (insert-tool, not migration, since it contains the function URL + anon key per project rules):
- Daily at 03:17 UTC, calls `data-cleanup` via `net.http_post` with the cleanup secret header

**4. Rewrite `supabase/functions/gdpr-delete/index.ts`**:
- Replace the hand-curated 36-table list with a complete list of all 222 user-scoped tables (generated once and committed inline, grouped by domain with comments for maintainability)
- Fix storage bucket: `documents` → `user-files` (matches actual bucket per `<storage-buckets>`)
- Recursively list & delete all files under `${userId}/` prefix in `user-files`
- Add deletion summary row into `data_retention_runs` with `table_name = '__gdpr_user_<id>'`
- Keep R5 policy gate, rate limit, Zod confirmation — no regression

**5. Admin UI surface** `src/pages/admin/DataRetentionDashboard.tsx` + route `/admin/data-retention`:
- Reads `data_retention_runs` (last 30 days)
- Shows per-table retention policy + last-run + rows-purged
- "Run cleanup now (dry-run)" button (admin-only) → invokes `data-cleanup` with `{ dryRun: true }`
- Mounted in `AdminControlPlaneShell` Privacy/Compliance section

### Files

| File | Change |
|---|---|
| `supabase/migrations/<ts>_data_retention_ttl.sql` | NEW — add `expires_at` to 7 tables, indexes, `data_retention_runs` table + RLS |
| `supabase/functions/data-cleanup/index.ts` | NEW — batch cleanup runner with secret gate + receipts |
| `supabase/functions/gdpr-delete/index.ts` | Rewrite — full 222-table coverage, fix bucket, write receipt |
| `supabase/config.toml` | Add `[functions.data-cleanup] verify_jwt = false` |
| pg_cron job (insert tool) | NEW — daily 03:17 UTC trigger |
| `DATA_CLEANUP_SECRET` (add_secret) | NEW — shared secret between cron and function |
| `src/pages/admin/DataRetentionDashboard.tsx` | NEW — admin visibility + dry-run button |
| `src/routes/admin-routes.tsx` (or equiv) | Register route |
| `src/components/admin/AdminControlPlaneShell.tsx` | Add nav entry under Privacy |
| `tests/integration/data-retention.test.ts` | NEW — verify cleanup deletes only expired rows + dry-run mode |

### Acceptance

- All 7 high-volume tables get `expires_at` with sane defaults aligned to `security-policies.md` retention rules (audit 2y, AI logs 1y, sync 90d)
- `data-cleanup` callable only with secret header; dry-run reports counts without deleting
- pg_cron job visibly registered and runs nightly; receipts land in `data_retention_runs`
- `gdpr-delete` deletes from all 222 user-scoped tables + all `user-files` storage objects under `${userId}/`
- Admin dashboard shows last 30 days of cleanup runs with row counts per table
- 0 TS errors, 0 silent fallbacks, RLS preserved on new table
- C-014 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready

