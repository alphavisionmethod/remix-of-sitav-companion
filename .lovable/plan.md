

## Fix C-020: No Seed Data for New Users — actual state

### Live findings

1. ✅ `supabase/functions/seed-user-data/index.ts` exists and is comprehensive (22 tables, ~80 rows). Idempotent: skips when `leads` count > 0.
2. ⚠️ `AuthContext.triggerAutoSeed()` fires on every `SIGNED_IN`/`TOKEN_REFRESHED` — burns a function call on every page reload (session-flag only protects in-memory).
3. 🔴 Skip-detection uses **only `leads` count** — if a user deletes their leads, the function re-seeds **all 22 tables** → silent duplicate fixtures everywhere.
4. 🔴 **No persisted "seeded" marker** on the profile — frontend has no cheap way to skip.
5. 🔴 Demo session bypass: `signInAsDemo()` never calls the seeder, so demo users see whatever was seeded for the canonical demo UID `00000000-…`.
6. 🔴 No telemetry: no audit row when seed runs, fails, or skips. Hard to verify "did this user actually get seeded?"

### The fix — 4 surgical changes

**1. Persist a durable `seeded_at` marker on `profiles.preferences`**

In the edge function, after a successful seed, write:
```ts
await admin.from("profiles").update({
  preferences: { ...(prev.preferences ?? {}), seeded_at: iso, seed_version: 1 }
}).eq("user_id", uid);
```
Switch the skip check to: `preferences.seeded_at` set → return `{ skipped: true, reason: "already_seeded" }`. Replaces the brittle `leads count > 0` check.

**2. Add seed receipts table for verifiability (extends C-014 audit fabric)**

New table `user_seed_runs` (id, user_id, status `seeded|skipped|failed`, seed_version, tables_count, rows_count, error_summary, created_at, expires_at +180d). RLS: owner SELECT, service-role INSERT only. Indexed on `(user_id, created_at desc)`. Function inserts a row on every run.

**3. Frontend gate: only invoke when profile says it's needed**

In `AuthContext.triggerAutoSeed`:
- Pull `profiles.preferences` for the current user first.
- If `preferences.seeded_at` is set → bail without invoking (saves an edge-function call per load).
- Otherwise invoke the function; on success, the function persists the marker, and the next reload won't re-invoke.
- Also gate by `localStorage.setItem('sita-seed-attempted', user.id)` to prevent double-fire across hot reloads in the same session.

**4. Demo-mode parity — surface the same fixtures**

Demo session uses the canonical UID `00000000-0000-0000-0000-000000000000`. Add a one-time migration that calls the seed routine for that UID server-side (idempotent; survives any DB reset). Then demo users see the same realistic fixtures as fresh signups.

### Files

| File | Change |
|---|---|
| `supabase/migrations/<ts>_user_seed_receipts.sql` | NEW — `user_seed_runs` table with RLS + indexes; one-time `INSERT` for the demo UID's seed marker on `profiles` so demo users get fixtures via the next demo seed run |
| `supabase/functions/seed-user-data/index.ts` | Replace leads-count check with `preferences.seeded_at` check; persist marker on success; insert `user_seed_runs` row on every run (seeded/skipped/failed); honor `seed_version` for future re-seeds |
| `src/contexts/AuthContext.tsx` | Pre-flight read of `profiles.preferences.seeded_at`; skip invoke if already seeded; persist `localStorage` "attempted" guard scoped to user id |
| `src/pages/admin/UserSeedHealth.tsx` | NEW — admin view showing last 100 seed runs, status breakdown, retry button (calls seed function with `force: true`) |
| `src/routes/AdminRoutes.tsx` | Register `/admin/user-seed-health` |

### Acceptance

- New signup → first page load triggers seed → profile gets `preferences.seeded_at` → 22 tables populated → notifications/leads/invoices/etc. show real fixtures
- Second page load → frontend reads `seeded_at` → does NOT invoke the function (verified in network tab: 0 calls)
- Manually deleting `leads` does NOT trigger a re-seed (marker still set)
- Demo user (`signInAsDemo`) sees realistic fixtures from the canonical demo UID seed
- Every seed attempt writes one row to `user_seed_runs` (status `seeded`, `skipped`, or `failed`)
- Admin dashboard at `/admin/user-seed-health` shows the receipts
- 0 TS errors, 0 silent failures
- C-020 moves ❌ ABSENT → ✅ RESOLVED, deployment-ready

