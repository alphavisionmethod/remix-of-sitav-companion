

## Fix C-002: Profile Auto-Creation on Signup — make it actually work

### What's actually broken (live verification)

1. **Trigger exists but is silently broken.** `pg_trigger` confirms `on_auth_user_created` is bound to `auth.users` and enabled. But `pg_get_functiondef('public.handle_new_user')` shows the function reads `NEW.raw_user_metadata` — that column does **not** exist on `auth.users`. The real column is `raw_user_meta_data` (with underscores). Postgres raises an error inside the SECURITY DEFINER trigger, the signup transaction rolls back the trigger side-effect, and the row is never inserted. `SELECT count(*) FROM public.profiles` returns **0**, confirming no profile has ever been created.
2. **No `useProfile` hook.** Search across `src/**/*.{ts,tsx}` returns zero matches. Each consumer (`UserProfilePage`, `AccountSections`, `NotificationSettingsPage`, etc.) re-implements its own `from('profiles').select(...).eq('user_id', user.id)` ad-hoc query. This means even when the trigger is fixed, there is no canonical, cached, refresh-aware profile signal in the React tree.
3. **No backfill.** Any user that signed up before today has no profile row. Even after fixing the trigger, those users stay broken.

### The fix (3 atomic pieces)

#### 1. Migration — correct trigger function + backfill

Single new SQL migration that does:

- `CREATE OR REPLACE FUNCTION public.handle_new_user()` — replace `NEW.raw_user_metadata` → `NEW.raw_user_meta_data` in **both** the `full_name` and `avatar_url` reads. Keep `SECURITY DEFINER`, `SET search_path = public`, `ON CONFLICT (user_id) DO NOTHING`. Also fall back to `name` and `picture` keys (Google OAuth uses `name`/`picture`, email uses `full_name`/`avatar_url`).
- Recreate `on_auth_user_created` trigger as `AFTER INSERT ON auth.users FOR EACH ROW` (idempotent: `DROP TRIGGER IF EXISTS … ; CREATE TRIGGER …`).
- **Backfill** existing users: `INSERT INTO public.profiles (user_id, display_name, avatar_url) SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email,'@',1)), COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') FROM auth.users u LEFT JOIN public.profiles p ON p.user_id = u.id WHERE p.user_id IS NULL;`

#### 2. New `useProfile` React hook — canonical profile signal

Create `src/hooks/use-profile.ts`:

- Uses TanStack Query (already in the project), key `["profile", user?.id]`, `enabled: !!user && !isDemo`.
- Reads `display_name, avatar_url, bio, preferences` via `.maybeSingle()` (per project convention — never `.single()`).
- Returns `{ profile, isLoading, error, refresh, updateProfile }`. `updateProfile(patch)` performs an optimistic `UPDATE` then invalidates the query.
- For demo users, returns a synthetic profile derived from `DEMO_USER` so personalization still renders.
- **Self-heal fallback**: if the row is missing for a real authenticated user (older account that somehow still escaped backfill, or race during signup), the hook performs a one-time `INSERT … ON CONFLICT DO NOTHING` using the user's email-derived name, then refetches. This makes the system resilient even if the trigger fails for any future reason.

#### 3. Wire it into `AuthContext` consumers

- Refactor `UserProfilePage.tsx` to use `useProfile` for the read (keep its existing `useActionFn`-based save path).
- Refactor `AccountSections.tsx` to use `useProfile` (replace the local `useEffect` fetch).
- Leave the BFF/server-side files (`user-bff.ts`, `support-workflow.ts`, `admin-bff.ts`, mnemosyne assemblers) alone — they already use `.maybeSingle()` correctly and run server-side, not in React.

### Verification (post-deploy)

- Trigger function definition contains `raw_user_meta_data` (with underscores) — verifiable via `pg_get_functiondef`.
- After signup of a fresh test user, `SELECT count(*) FROM public.profiles WHERE user_id = '<new>'` returns 1.
- Backfill: `SELECT count(*) FROM auth.users u LEFT JOIN public.profiles p ON p.user_id = u.id WHERE p.user_id IS NULL` returns 0.
- `UserProfilePage` and Settings → Account both display the new user's display name without manual refresh.
- 0 TypeScript errors; existing `AuthContext.test.tsx` still passes.

### Files

| File | Change |
|---|---|
| `supabase/migrations/<new>.sql` | NEW — fix trigger function (correct column name, OAuth fallbacks), recreate trigger, backfill existing users |
| `src/hooks/use-profile.ts` | NEW — canonical TanStack-Query profile hook with self-heal |
| `src/pages/UserProfilePage.tsx` | Replace inline profile fetch with `useProfile` |
| `src/components/sita/shell/windows/settings/AccountSections.tsx` | Replace inline profile fetch with `useProfile` |

### Acceptance

- Profile row is auto-created for every new signup (real bug fix, not just structural)
- All historical users backfilled to have a profile row
- One canonical `useProfile` hook used by personalized UI surfaces
- C-002 moves from 🔴 BLOCKED → ✅ RESOLVED, fully wired and deployment-ready

