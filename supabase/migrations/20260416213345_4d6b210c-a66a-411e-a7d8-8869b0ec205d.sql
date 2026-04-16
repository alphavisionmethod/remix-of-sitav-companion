-- ═══════════════════════════════════════════════════════════════
-- SITA OS — DB Truth Snapshot RPC (admin-only introspection)
-- Used by db-truth-introspect edge function for the DbTruthExplorer
-- admin page. Reads only system catalogs; no data mutation.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_db_truth_snapshot(_op text DEFAULT 'summary')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Admin gate enforced inside the function itself
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  IF _op = 'schema' THEN
    SELECT jsonb_build_object(
      'tables', COALESCE(jsonb_agg(
        jsonb_build_object(
          'tablename', tablename,
          'rowsecurity', rowsecurity,
          'hasindexes', hasindexes,
          'hastriggers', hastriggers
        ) ORDER BY tablename
      ), '[]'::jsonb),
      'count', COUNT(*)
    )
    INTO result
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public';

  ELSIF _op = 'policies' THEN
    SELECT jsonb_build_object(
      'policies', COALESCE(jsonb_agg(
        jsonb_build_object(
          'tablename', tablename,
          'policyname', policyname,
          'permissive', permissive,
          'roles', roles,
          'cmd', cmd
        ) ORDER BY tablename, policyname
      ), '[]'::jsonb),
      'count', COUNT(*)
    )
    INTO result
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public';

  ELSIF _op = 'drift' THEN
    -- Tables with RLS enabled but no policies (high-risk drift)
    WITH no_policy_tables AS (
      SELECT t.tablename
      FROM pg_catalog.pg_tables t
      WHERE t.schemaname = 'public'
        AND t.rowsecurity = true
        AND NOT EXISTS (
          SELECT 1 FROM pg_catalog.pg_policies p
          WHERE p.schemaname = 'public' AND p.tablename = t.tablename
        )
    ),
    no_rls_tables AS (
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' AND rowsecurity = false
    )
    SELECT jsonb_build_object(
      'rls_enabled_no_policies', COALESCE((SELECT jsonb_agg(tablename ORDER BY tablename) FROM no_policy_tables), '[]'::jsonb),
      'rls_disabled', COALESCE((SELECT jsonb_agg(tablename ORDER BY tablename) FROM no_rls_tables), '[]'::jsonb),
      'rls_enabled_no_policies_count', (SELECT COUNT(*) FROM no_policy_tables),
      'rls_disabled_count', (SELECT COUNT(*) FROM no_rls_tables)
    )
    INTO result;

  ELSE
    -- 'summary' (default): aggregate counts only
    SELECT jsonb_build_object(
      'totalTables', (SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public'),
      'tablesWithRls', (SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND rowsecurity = true),
      'totalPolicies', (SELECT COUNT(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public'),
      'tablesWithPolicies', (SELECT COUNT(DISTINCT tablename) FROM pg_catalog.pg_policies WHERE schemaname = 'public'),
      'generatedAt', now()
    )
    INTO result;
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_db_truth_snapshot(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_db_truth_snapshot(text) TO authenticated;