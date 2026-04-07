
-- Bulk reassign all public-schema RLS policies from 'public' role to 'authenticated' role.
-- This is a defense-in-depth hardening: the USING/WITH CHECK clauses are unchanged,
-- but unauthenticated callers are now rejected before RLS evaluation.

DO $$
DECLARE
  r RECORD;
  sql_drop TEXT;
  sql_create TEXT;
  using_clause TEXT;
  check_clause TEXT;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND 'public' = ANY(roles)
    ORDER BY tablename, policyname
  LOOP
    -- Build USING clause
    IF r.qual IS NOT NULL THEN
      using_clause := ' USING (' || r.qual || ')';
    ELSE
      using_clause := '';
    END IF;

    -- Build WITH CHECK clause
    IF r.with_check IS NOT NULL THEN
      check_clause := ' WITH CHECK (' || r.with_check || ')';
    ELSE
      check_clause := '';
    END IF;

    -- Drop existing policy
    sql_drop := format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    EXECUTE sql_drop;

    -- Recreate with authenticated role
    sql_create := format('CREATE POLICY %I ON %I.%I FOR %s TO authenticated', r.policyname, r.schemaname, r.tablename, r.cmd)
      || using_clause
      || check_clause;
    EXECUTE sql_create;
  END LOOP;
END;
$$;
