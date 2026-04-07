

# Fix Section 7: Pages With Forms But No Mutation

## Current Status

| File | Status | Details |
|------|--------|---------|
| `auth/Login.tsx` | ✅ Already fixed | Calls `signIn()` → `supabase.auth.signInWithPassword()` |
| `auth/Signup.tsx` | ✅ Already fixed | Calls `signUp()` → `supabase.auth.signUp()` |
| `auth/ForgotPassword.tsx` | ✅ Already fixed | Calls `resetPassword()` → `supabase.auth.resetPasswordForEmail()` |
| `auth/ResetPassword.tsx` | ✅ Already fixed | Calls `updatePassword()` → `supabase.auth.updateUser()` |
| `admin/fip/FIPIntakeDesk.tsx` | ✅ Already fixed | Uses `useCreateIntake()` mutation hook |
| `owner/ConstitutionEditor.tsx` | ❌ Needs fix | Uses in-memory kernel compiler only — rules lost on refresh |

**5 of 6 files are already fully functional.** Only ConstitutionEditor needs work.

## Fix: ConstitutionEditor DB Persistence

### Step 1: Create `constitution_rules` table (migration)

```sql
CREATE TABLE public.constitution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  natural_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority INTEGER NOT NULL DEFAULT 50,
  enforcement_mode TEXT NOT NULL DEFAULT 'advisory',
  is_active BOOLEAN NOT NULL DEFAULT true,
  compiled_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.constitution_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rules"
  ON public.constitution_rules FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_constitution_rules_updated_at
  BEFORE UPDATE ON public.constitution_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Update ConstitutionEditor.tsx

- On mount: query `constitution_rules` for the current user and hydrate the in-memory compiler
- On `compileRule`: insert new rule into DB, then compile in-memory
- On `toggleRule`: update `is_active` in DB
- On `deleteRule`: delete from DB
- Remove the hardcoded seed defaults (replace with DB-loaded rules)
- Use `useAuth` to get `user.id` for queries

### Step 3: Verify

- `npx tsc --noEmit` — 0 errors
- Rules persist across page refreshes

## Files changed
- 1 migration (new `constitution_rules` table)
- 1 TypeScript file (`src/pages/owner/ConstitutionEditor.tsx`)

