
## Diagnosis

User wants the **first-use re-entry persistence** gap closed in the real project, not just documented.

Current state on disk:
- `onboarding_branch_events` table exists + `onboarding-branch-tracker` edge function exists + `check-onboarding-branch-telemetry.ts` gate exists (verified in skill context).
- The gate only validates: table present, RLS owner-insert policy present, edge function file present, branch enum is `quick|balanced|deep`, expected 29 screens.
- **Gap**: nothing persists *resume tokens* / *re-entry checkpoints*. If a user drops off at screen 14 of the 29-screen ceremony, there's no row that says "resume here, with this profile snapshot, this depth, this conditional-branch state". The persistence-audit script (`generate-persistence-audit.ts`) explicitly lists `setup_checkpoints` as required and matches on `/setup/`, `/onboard/`, `/checkpoint/` patterns — currently only `onboarding_branch_events` matches, which is event telemetry, not a resume checkpoint.

This is a real schema + edge-function + validator gap.

## Strategy — additive, zero behavior change to live onboarding

### Step 1 — DB: `onboarding_resume_checkpoints` table
- Columns: `id uuid PK`, `user_id uuid NOT NULL`, `session_id text NOT NULL`, `current_screen smallint NOT NULL` (1–29), `branch text NOT NULL` (quick|balanced|deep), `profile_snapshot jsonb NOT NULL DEFAULT '{}'`, `conditional_state jsonb NOT NULL DEFAULT '{}'` (household/work/money/comms toggles), `last_completed_screen smallint`, `resume_token text NOT NULL UNIQUE`, `expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'`, `created_at`, `updated_at`.
- Unique `(user_id, session_id)` so one active checkpoint per session.
- Trigger: auto-bump `updated_at`; validation trigger ensures `current_screen BETWEEN 1 AND 29` and `branch IN ('quick','balanced','deep')` (validation trigger, not CHECK, per project rules).
- RLS enabled. Policies:
  - `users_select_own_resume_checkpoint` (authenticated, `auth.uid() = user_id`)
  - `users_insert_own_resume_checkpoint`
  - `users_update_own_resume_checkpoint`
  - No delete policy (append-friendly; expiry handles cleanup).
- Index on `(user_id, expires_at)` for fast active-resume lookups.

### Step 2 — Edge function: `onboarding-resume-checkpoint`
- POST: upsert checkpoint by `(user_id, session_id)` — accepts `current_screen`, `branch`, `profile_snapshot`, `conditional_state`. Returns `{ resume_token, expires_at }`.
- GET (`?resume_token=...`): returns full checkpoint row if not expired and `auth.uid() = user_id`.
- `verify_jwt = true` (default; do NOT set to false — this is identity-bound).
- Uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (already provisioned by Lovable Cloud).

### Step 3 — Strengthen the existing telemetry gate
- Extend `scripts/architecture/checks/check-onboarding-branch-telemetry.ts` with three new assertions (kept BLOCK-tier — gate already wired into the 21):
  1. `onboarding_resume_checkpoints` table declared in migrations.
  2. Owner-scoped RLS policies present (`users_select_own_resume_checkpoint`, `users_insert_own_resume_checkpoint`, `users_update_own_resume_checkpoint`).
  3. `supabase/functions/onboarding-resume-checkpoint/index.ts` exists.
- Bump report shape: add `resumePersistence: { tablePresent, rlsComplete, edgeFunctionPresent }`.

### Step 4 — Persistence-audit upgrade
- The existing `generate-persistence-audit.ts` already pattern-matches `/checkpoint/` — the new table will auto-promote `setup_checkpoints` domain from `thin`/`missing` to `covered`. No script change needed; just re-run.

### Step 5 — Audit reconciliation
Mark in all 4 mirrors (`MISSING_AUDIT.md` ×2, `MISSING_AUDIT_v2.md` ×2):
- "First-use telemetry — resume/re-entry persistence partial" → **RESOLVED 2026-04-20** with file refs (migration name, edge function path, gate assertions).
- Bump audit timestamps; preserve byte-identical mirror parity (`md5sum` checks).

## What this does NOT touch
- Zero changes to the live 29-screen onboarding UI (`src/pages/onboarding/**`) — this is purely a backend persistence substrate the UI can opt into later.
- No changes to existing `onboarding_branch_events` table or `onboarding-branch-tracker` edge function.
- No changes to the 21 BLOCK gates list (gate #11 stays the same id, just gets stricter assertions internally).
- No DB migrations against reserved schemas (`auth`, `storage`, `realtime`, `supabase_functions`, `vault`).
- No CHECK constraints — validation triggers only.
- No client/types file edits.

## Files touched

**New (3):**
- `supabase/migrations/<timestamp>_onboarding_resume_checkpoints.sql` (table + triggers + RLS)
- `supabase/functions/onboarding-resume-checkpoint/index.ts` (POST upsert + GET retrieve)
- (no new validator — extending existing gate)

**Modified (5):**
- `scripts/architecture/checks/check-onboarding-branch-telemetry.ts` (+3 assertions, extended report shape)
- `public/generated/MISSING_AUDIT.md` + `/mnt/documents/MISSING_AUDIT.md` (RESOLVED markers)
- `public/generated/MISSING_AUDIT_v2.md` + `/mnt/documents/MISSING_AUDIT_v2.md` (RESOLVED markers)

**Auto-regenerated (2):**
- `generated/onboarding-branch-telemetry-report.json`
- `generated/persistence-audit.json` (setup_checkpoints flips to `covered`)

## Verification after approval

```bash
# Migration applied + table queryable
psql -c "select count(*) from onboarding_resume_checkpoints;"   # 0, no error

# RLS policies present
psql -c "select policyname from pg_policies where tablename='onboarding_resume_checkpoints';"  # 3 rows

# Edge function deployed
ls supabase/functions/onboarding-resume-checkpoint/index.ts     # exists

# Strengthened gate passes
npx tsx scripts/architecture/checks/check-onboarding-branch-telemetry.ts   # 0 errors

# Persistence audit shows setup_checkpoints covered
npx tsx scripts/db/generate/generate-persistence-audit.ts
jq '.data.domains[] | select(.key=="setup_checkpoints")' generated/persistence-audit.json   # status: "covered"

# Master readiness still green
npm run release:readiness                                       # 21/21 BLOCK GREEN
npx tsc --noEmit                                                # 0 errors

# Audit mirror parity
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md           # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md     # identical
```

Result: real resume-token persistence exists in the DB with owner-scoped RLS, an authenticated edge function reads/writes it, the existing BLOCK gate now enforces its presence, the persistence-audit auto-promotes `setup_checkpoints` to `covered`, and all four audit mirrors record RESOLVED — without touching the live onboarding UI or the 21-gate roster.
