

# Fix C-005: Profile Auto-Creation Trigger

## Problem
When new users sign up, no `profiles` row is created automatically. This means queries against `profiles` return nothing until the user manually creates one, breaking any UI that depends on profile data.

## Solution
Create a database trigger function that fires `AFTER INSERT ON auth.users` and automatically inserts a row into `public.profiles` with the new user's ID and metadata.

## Technical Details

**Single migration** that creates:

1. **Function** `public.handle_new_user()` — a `SECURITY DEFINER` function (owned by postgres, bypasses RLS) that inserts into `profiles`:
   - `user_id` ← `NEW.id`
   - `display_name` ← `NEW.raw_user_metadata->>'full_name'` (falls back to email prefix)
   - `avatar_url` ← `NEW.raw_user_metadata->>'avatar_url'` (for OAuth)

2. **Trigger** `on_auth_user_created` on `auth.users` — fires `AFTER INSERT FOR EACH ROW`, calling the function above.

**Important**: The function uses `SECURITY DEFINER` with `search_path = public` so it can insert into `profiles` despite RLS policies requiring `auth.uid() = user_id` (since there's no active session during the trigger execution).

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_metadata->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

No code file changes needed — this is a single DB migration.

