

# SITA OS — 100/100 Deployment Fix Plan

## Issues Found (3 actionable)

### 1. SECURITY: Profiles table publicly readable (ERROR)
The `profiles` SELECT policy uses `true` for the `public` role, exposing all user data to unauthenticated requests.

**Fix**: Drop the public SELECT policy, replace with authenticated-only scoped to `auth.uid() = user_id`.

### 2. BUG: `intelligence-api` uses `getClaims()` — non-existent method
Line 26 calls `client.auth.getClaims(token)` which does not exist in supabase-js v2. Every other edge function uses `getUser()`. This will throw at runtime.

**Fix**: Replace with `client.auth.getUser()` pattern, then redeploy.

### 3. MISSING: `public/health.json` for local dev
The Dockerfile and Vite plugin generate it at build time, but local dev/preview has no health endpoint.

**Fix**: Add a static `public/health.json` placeholder.

## Already Passing
- TypeScript: 0 errors
- DB linter: 0 issues  
- DB triggers: `on_auth_user_created` present and correct
- Realtime: `notifications` published (channel-level auth is a Supabase platform limitation — row-level RLS already filters by `user_id`)
- All edge functions have CORS via shared module
- PWA manifest and icons present

## Implementation Steps

### Step 1: DB Migration — Fix profiles RLS
```sql
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Step 2: Fix `intelligence-api` auth
Replace lines 19-28 in `supabase/functions/intelligence-api/index.ts`:
```typescript
async function requireAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? "" };
}
```
Then redeploy the `intelligence-api` function.

### Step 3: Add `public/health.json`
```json
{
  "service": "sita-os",
  "version": "dev",
  "status": "healthy"
}
```

### Step 4: Acknowledge Realtime finding
The Realtime channel authorization finding is a known Supabase platform limitation. Row-level RLS on `notifications` already filters data by `user_id`. Mark as acknowledged via security tool.

